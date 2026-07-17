"use client";

import { useRouter } from "next/navigation";
import { saveEmployee } from "@/lib/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { Employee } from "@/types";

const INITIAL_EMPLOYEES: Omit<Employee, "id">[] = [
  {
    name: "高橋 凌",
    baseSalary: 350000,
    communicationAllowance: 0,
    transportAllowance: 0,
    housingAllowance: 0,
    standardMonthlyRemuneration: 380000,
    needsLongTermCareInsurance: false,
    municipalTax: 0,
    juneMunicipalTax: 0,
    isOfficer: false,
    dependents: 0,
  },
  {
    name: "安藤 薫",
    baseSalary: 280000,
    communicationAllowance: 0,
    transportAllowance: 0,
    housingAllowance: 0,
    standardMonthlyRemuneration: 280000,
    needsLongTermCareInsurance: false,
    municipalTax: 0,
    juneMunicipalTax: 0,
    isOfficer: false,
    dependents: 0,
  },
  {
    name: "羽田野 了",
    baseSalary: 500000,
    communicationAllowance: 0,
    transportAllowance: 0,
    housingAllowance: 0,
    standardMonthlyRemuneration: 560000,
    needsLongTermCareInsurance: true,
    municipalTax: 0,
    juneMunicipalTax: 0,
    isOfficer: false,
    dependents: 0,
  },
  {
    name: "高橋 奏",
    baseSalary: 180000,
    communicationAllowance: 0,
    transportAllowance: 0,
    housingAllowance: 0,
    standardMonthlyRemuneration: 180000,
    needsLongTermCareInsurance: false,
    municipalTax: 0,
    juneMunicipalTax: 0,
    isOfficer: false,
    dependents: 0,
  },
  {
    name: "落合 和磨",
    baseSalary: 260000,
    communicationAllowance: 0,
    transportAllowance: 0,
    housingAllowance: 0,
    standardMonthlyRemuneration: 260000,
    needsLongTermCareInsurance: false,
    municipalTax: 0,
    juneMunicipalTax: 0,
    isOfficer: false,
    dependents: 0,
  },
];

export default function SetupPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleSetup = async () => {
    if (!user) return;
    await Promise.all(
      INITIAL_EMPLOYEES.map((emp) =>
        saveEmployee(user.uid, { id: crypto.randomUUID(), ...emp })
      )
    );
    alert("5名の従業員を登録しました");
    router.push("/");
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-3">初期セットアップ</h1>
        <p className="text-sm text-gray-600 mb-4">
          以下の5名を従業員として登録します。基本給は後から個別に編集できます。
        </p>
        <ul className="text-sm space-y-1 mb-5 text-gray-700">
          {INITIAL_EMPLOYEES.map((e) => (
            <li key={e.name} className="flex justify-between">
              <span>{e.name}</span>
              <span className="text-gray-500">基本給 {e.baseSalary.toLocaleString("ja-JP")} 円（仮）</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-gray-400 mb-4">
          ※ 基本給・手当・住民税は実際の金額に合わせて従業員編集から修正してください
        </p>
        <button
          onClick={handleSetup}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
        >
          登録する
        </button>
      </div>
    </div>
  );
}
