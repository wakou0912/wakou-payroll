"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { saveEmployee, savePayroll } from "@/lib/firestore";
import { Employee, Payroll } from "@/types";

interface BackupData {
  exportedAt: string;
  employees: Employee[];
  payrolls: Payroll[];
}

export default function ImportPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [log, setLog] = useState<string[]>([]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setStatus("loading");
    setLog([]);

    try {
      const text = await file.text();
      const data: BackupData = JSON.parse(text);

      const logs: string[] = [];

      for (const emp of data.employees) {
        await saveEmployee(user.uid, emp);
        logs.push(`✓ 従業員: ${emp.name}`);
        setLog([...logs]);
      }

      for (const payroll of data.payrolls) {
        await savePayroll(user.uid, payroll);
        const emp = data.employees.find((e) => e.id === payroll.employeeId);
        logs.push(`✓ 明細: ${emp?.name ?? payroll.employeeId} / ${payroll.yearMonth}`);
        setLog([...logs]);
      }

      logs.push(`\n完了！ 従業員${data.employees.length}名・明細${data.payrolls.length}件を取り込みました`);
      setLog([...logs]);
      setStatus("done");
    } catch {
      setLog(["エラーが発生しました。JSONファイルを確認してください"]);
      setStatus("error");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-2">データインポート</h1>
        <p className="text-sm text-gray-500 mb-5">
          バックアップJSONファイルを選択すると、従業員と給与明細を一括で取り込みます。
        </p>

        <input
          type="file"
          accept=".json"
          onChange={handleFile}
          disabled={status === "loading"}
          className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
        />

        {log.length > 0 && (
          <div className="mt-4 bg-gray-50 rounded p-3 text-sm space-y-1 max-h-64 overflow-y-auto">
            {log.map((l, i) => (
              <p key={i} className={l.startsWith("✓") ? "text-green-700" : l.startsWith("\n") ? "text-blue-700 font-semibold pt-2" : "text-red-600"}>
                {l.replace(/^\n/, "")}
              </p>
            ))}
          </div>
        )}

        {status === "done" && (
          <button
            onClick={() => router.push("/")}
            className="mt-4 w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
          >
            トップへ戻る
          </button>
        )}
      </div>
    </div>
  );
}
