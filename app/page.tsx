"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Employee, Payroll } from "@/types";
import { loadEmployees, loadPayrolls } from "@/lib/firestore";
import { exportAllData } from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";

function currentYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(ym: string): string {
  const [y, m] = ym.split("-");
  return `${y}年${parseInt(m)}月`;
}

function prevYM(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return m === 1
    ? `${y - 1}-12`
    : `${y}-${String(m - 1).padStart(2, "0")}`;
}
function nextYM(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return m === 12
    ? `${y + 1}-01`
    : `${y}-${String(m + 1).padStart(2, "0")}`;
}

export default function TopPage() {
  const { user } = useAuth();
  const [yearMonth, setYearMonth] = useState(currentYearMonth());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);

  useEffect(() => {
    if (!user) return;
    loadEmployees(user.uid).then(setEmployees);
    loadPayrolls(user.uid).then(setPayrolls);
  }, [user]);

  const getPayroll = (empId: string) =>
    payrolls.find((p) => p.employeeId === empId && p.yearMonth === yearMonth && !p.isBonus);

  return (
    <div>
      {/* 年月セレクター */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">給与明細一覧</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setYearMonth(prevYM(yearMonth))}
            className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 text-sm"
          >
            ◀
          </button>
          <span className="text-base font-semibold w-24 text-center">{monthLabel(yearMonth)}</span>
          <button
            onClick={() => setYearMonth(nextYM(yearMonth))}
            className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 text-sm"
          >
            ▶
          </button>
        </div>
      </div>

      {/* 従業員カード一覧 */}
      {employees.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg mb-2">従業員が登録されていません</p>
          <p className="text-sm">下の「＋従業員を追加」から登録してください</p>
        </div>
      ) : (
        <div className="space-y-3">
          {employees.map((emp) => {
            const payroll = getPayroll(emp.id);
            return (
              <div
                key={emp.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="font-semibold text-gray-800">{emp.name}</div>
                    <div className="text-sm text-gray-500">
                      基本給 {emp.baseSalary.toLocaleString("ja-JP")} 円
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    {payroll ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        作成済み
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-400 px-2 py-1 rounded">
                        未作成
                      </span>
                    )}
                    <Link
                      href={`/payroll/${emp.id}/${yearMonth}`}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      {payroll ? "編集" : "作成"}
                    </Link>
                    <Link
                      href={`/employees/${emp.id}/edit`}
                      className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded text-sm hover:bg-gray-50"
                    >
                      従業員編集
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex gap-3 flex-wrap">
        <Link
          href="/employees/new"
          className="inline-block px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 text-sm"
        >
          ＋ 従業員を追加
        </Link>
        {employees.length === 0 && (
          <Link
            href="/setup"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            初期セットアップ（5名一括登録）
          </Link>
        )}
        <button
          onClick={() => exportAllData()}
          className="px-4 py-2 border border-gray-300 text-gray-600 rounded hover:bg-gray-50 text-sm"
        >
          データをエクスポート
        </button>
      </div>
    </div>
  );
}
