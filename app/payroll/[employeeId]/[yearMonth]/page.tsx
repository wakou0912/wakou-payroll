"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Employee, Payroll } from "@/types";
import {
  loadEmployee,
  loadPayroll,
  loadPrevPayroll,
  savePayroll,
} from "@/lib/firestore";
import {
  buildInitialPayroll,
  autoCalcDeductions,
  calcTotalPayment,
  calcTotalDeduction,
  calcNetPay,
  defaultWorkingPeriod,
} from "@/lib/calculations";
import { useAuth } from "@/contexts/AuthContext";
import PayrollRow from "@/components/PayrollRow";
import NumberInput from "@/components/NumberInput";

function monthLabel(ym: string): string {
  const [y, m] = ym.split("-");
  return `${y}年${parseInt(m)}月`;
}

export default function PayrollPage() {
  const { employeeId, yearMonth } = useParams<{
    employeeId: string;
    yearMonth: string;
  }>();
  const router = useRouter();
  const { user } = useAuth();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [payroll, setPayroll] = useState<Payroll | null>(null);
  const [saving, setSaving] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const emp = await loadEmployee(user.uid, employeeId);
      if (!emp) return;
      setEmployee(emp);
      const existing = await loadPayroll(user.uid, employeeId, yearMonth);
      if (existing) {
        setPayroll(existing);
      } else {
        setPayroll(buildInitialPayroll(emp, yearMonth));
      }
    })();
  }, [employeeId, yearMonth, user]);

  const recalcDeductions = useCallback((p: Payroll, emp: Employee) => {
    const deductions = autoCalcDeductions(emp, p);
    return { ...p, ...deductions };
  }, []);

  const setField = (key: keyof Payroll, value: number | string | boolean | null) => {
    setPayroll((prev) => {
      if (!prev || !employee) return prev;
      const next = { ...prev, [key]: value };
      const paymentKeys: (keyof Payroll)[] = [
        "baseSalary", "overtimeAllowance", "communicationAllowance",
        "transportAllowance", "housingAllowance", "advanceExpense",
        "yearEndAdjustment",
      ];
      if (paymentKeys.includes(key)) {
        return recalcDeductions(next, employee);
      }
      return next;
    });
  };

  const handleCopyPrev = async () => {
    if (!employee || !user) return;
    const prev = await loadPrevPayroll(user.uid, employeeId, yearMonth);
    if (!prev) {
      alert("前月の明細が見つかりません");
      return;
    }
    const copied: Payroll = {
      ...prev,
      id: payroll?.id ?? crypto.randomUUID(),
      yearMonth,
      advanceExpense: 0,
      workingPeriod: defaultWorkingPeriod(yearMonth),
      workingDays: null,
    };
    const deductions = autoCalcDeductions(employee, copied);
    setPayroll({ ...copied, ...deductions });
  };

  const handleSave = async () => {
    if (!payroll || !user) return;
    setSaving(true);
    try {
      console.log("[保存開始]", { userId: user.uid, payrollId: payroll.id });
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("タイムアウト（15秒）: Firestoreに接続できません")), 15000)
      );
      await Promise.race([savePayroll(user.uid, payroll), timeout]);
      console.log("[保存完了]");
      alert("保存しました");
    } catch (e) {
      console.error("[保存エラー]", e);
      alert("保存に失敗しました: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setSaving(false);
    }
  };

  const handlePDF = async (mode: "download" | "preview" = "download") => {
    if (!payroll || !employee) return;
    const previewWindow = mode === "preview" ? window.open("", "_blank") : null;
    setPdfLoading(true);
    try {
      const { generatePayrollPDF } = await import("@/lib/pdf");
      await generatePayrollPDF(employee, payroll, mode, previewWindow);
    } catch (e) {
      console.error(e);
      previewWindow?.close();
      alert("PDF生成に失敗しました");
    } finally {
      setPdfLoading(false);
    }
  };

  if (!employee || !payroll) {
    return <p className="text-gray-400">読み込み中...</p>;
  }

  const totalPayment = calcTotalPayment(payroll);
  const totalDeduction = calcTotalDeduction(payroll);
  const netPay = calcNetPay(payroll);

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{employee.name}</h1>
          <p className="text-sm text-gray-500">{monthLabel(yearMonth)} 給与明細</p>
        </div>
        <button
          onClick={handleCopyPrev}
          className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded text-sm hover:bg-gray-50"
        >
          前月コピー
        </button>
      </div>

      {/* 労働期間・日数 */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">労働期間</label>
            <input
              type="text"
              value={payroll.workingPeriod}
              onChange={(e) => setField("workingPeriod", e.target.value)}
              className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="例: 5/1〜5/31"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">労働日数</label>
            <div className="flex items-center gap-1">
              <NumberInput
                value={payroll.workingDays ?? 0}
                onChange={(v) => setField("workingDays", v || null)}
                placeholder="0"
                className="text-sm"
              />
              <span className="text-sm text-gray-500">日</span>
            </div>
          </div>
        </div>
      </div>

      {/* 支給欄 */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-4">
        <div className="px-4 py-2 border-b border-gray-100 bg-blue-50 rounded-t-lg">
          <span className="text-sm font-semibold text-blue-800">支給</span>
        </div>
        <div className="px-2 py-1 space-y-0.5">
          <PayrollRow label="基本給" value={payroll.baseSalary} onChange={(v) => setField("baseSalary", v)} />
          <PayrollRow label="残業手当" value={payroll.overtimeAllowance} onChange={(v) => setField("overtimeAllowance", v)} />
          <PayrollRow label="通信費" value={payroll.communicationAllowance} onChange={(v) => setField("communicationAllowance", v)} />
          <PayrollRow label="交通手当" value={payroll.transportAllowance} onChange={(v) => setField("transportAllowance", v)} />
          <PayrollRow label="家賃補助" value={payroll.housingAllowance} onChange={(v) => setField("housingAllowance", v)} />
          <PayrollRow label="立替経費" value={payroll.advanceExpense} onChange={(v) => setField("advanceExpense", v)} tag="非課税" />
          <PayrollRow label="年末調整" value={payroll.yearEndAdjustment} onChange={(v) => setField("yearEndAdjustment", v)} allowNegative />
        </div>
        <div className="px-4 py-2 border-t border-gray-100 flex justify-between items-center bg-gray-50">
          <span className="text-sm font-semibold text-gray-700">支給合計</span>
          <span className="text-base font-bold text-gray-900">
            {totalPayment.toLocaleString("ja-JP")} 円
          </span>
        </div>
      </div>

      {/* 控除欄 */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-4">
        <div className="px-4 py-2 border-b border-gray-100 bg-orange-50 rounded-t-lg">
          <span className="text-sm font-semibold text-orange-800">控除</span>
          <span className="text-xs text-orange-500 ml-2">（自動計算・手動修正可）</span>
        </div>
        <div className="px-2 py-1 space-y-0.5">
          <PayrollRow label="雇用保険料" value={payroll.employmentInsurance} onChange={(v) => setField("employmentInsurance", v)} />
          <PayrollRow label="健康保険料" value={payroll.healthInsurance} onChange={(v) => setField("healthInsurance", v)} />
          <PayrollRow label="介護保険料" value={payroll.longTermCareInsurance} onChange={(v) => setField("longTermCareInsurance", v)} />
          <PayrollRow label="子育て支援金" value={payroll.childcareSupport} onChange={(v) => setField("childcareSupport", v)} />
          <PayrollRow label="厚生年金保険料" value={payroll.welfarePension} onChange={(v) => setField("welfarePension", v)} />
          <PayrollRow label="源泉税" value={payroll.incomeTax} onChange={(v) => setField("incomeTax", v)} />
          <PayrollRow label="住民税" value={payroll.municipalTax} onChange={(v) => setField("municipalTax", v)} />
          <PayrollRow label="前払金" value={payroll.prepayment} onChange={(v) => setField("prepayment", v)} />
        </div>
        <div className="px-4 py-2 border-t border-gray-100 flex justify-between items-center bg-gray-50">
          <span className="text-sm font-semibold text-gray-700">控除合計</span>
          <span className="text-base font-bold text-gray-900">
            {totalDeduction.toLocaleString("ja-JP")} 円
          </span>
        </div>
      </div>

      {/* 備考 */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
        <label className="block text-xs text-gray-500 mb-1">備考</label>
        <textarea
          value={payroll.remarks ?? ""}
          onChange={(e) => setField("remarks", e.target.value)}
          rows={3}
          className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          placeholder="PDFの備考欄に印刷されます"
        />
      </div>

      {/* 差引支給額 */}
      <div className="bg-blue-600 text-white rounded-lg p-4 mb-6 flex justify-between items-center">
        <span className="text-base font-semibold">差引支給額</span>
        <span className="text-3xl font-bold">
          {netPay.toLocaleString("ja-JP")} 円
        </span>
      </div>

      {/* ボタン */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-2.5 bg-green-600 text-white rounded font-medium hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存"}
        </button>
        <button
          onClick={() => handlePDF("preview")}
          disabled={pdfLoading}
          className="flex-1 py-2.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {pdfLoading ? "生成中..." : "プレビュー"}
        </button>
        <button
          onClick={() => handlePDF("download")}
          disabled={pdfLoading}
          className="flex-1 py-2.5 bg-gray-700 text-white rounded font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {pdfLoading ? "生成中..." : "PDF出力"}
        </button>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2.5 border border-gray-300 text-gray-600 rounded hover:bg-gray-50"
        >
          戻る
        </button>
      </div>
    </div>
  );
}
