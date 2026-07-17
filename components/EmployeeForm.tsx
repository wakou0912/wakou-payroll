"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Employee } from "@/types";
import { saveEmployee, deleteEmployee } from "@/lib/firestore";
import { useAuth } from "@/contexts/AuthContext";
import NumberInput from "./NumberInput";

interface Props {
  initial?: Employee;
}

const blank: Omit<Employee, "id"> = {
  name: "",
  baseSalary: 0,
  communicationAllowance: 0,
  transportAllowance: 0,
  housingAllowance: 0,
  standardMonthlyRemuneration: 0,
  needsLongTermCareInsurance: false,
  municipalTax: 0,
  juneMunicipalTax: 0,
  dependents: 0,
};

export default function EmployeeForm({ initial }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = useState<Omit<Employee, "id">>(initial ?? blank);
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof form, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    if (!form.name.trim()) {
      alert("氏名を入力してください");
      return;
    }
    if (!user) return;
    setSaving(true);
    const employee: Employee = {
      id: initial?.id ?? crypto.randomUUID(),
      ...form,
    };
    await saveEmployee(user.uid, employee);
    router.push("/");
  };

  const handleDelete = async () => {
    if (!initial || !user) return;
    if (!confirm(`「${initial.name}」を削除しますか？`)) return;
    await deleteEmployee(user.uid, initial.id);
    router.push("/");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">氏名 *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="例: 山田 太郎"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">基本給（円）</label>
          <NumberInput value={form.baseSalary} onChange={(v) => set("baseSalary", v)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">通信費（円）</label>
          <NumberInput value={form.communicationAllowance} onChange={(v) => set("communicationAllowance", v)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">交通手当（円）</label>
          <NumberInput value={form.transportAllowance} onChange={(v) => set("transportAllowance", v)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">家賃補助（円）</label>
          <NumberInput value={form.housingAllowance} onChange={(v) => set("housingAllowance", v)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">住民税・月額（円）</label>
          <NumberInput value={form.municipalTax} onChange={(v) => set("municipalTax", v)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">住民税・6月（円）</label>
          <NumberInput value={form.juneMunicipalTax} onChange={(v) => set("juneMunicipalTax", v)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">扶養人数（人）</label>
          <input
            type="number"
            min={0}
            max={10}
            value={form.dependents}
            onChange={(e) => set("dependents", parseInt(e.target.value) || 0)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <p className="text-xs text-gray-500 mb-3">
          ※ 以下は登録済み5名以外の新規従業員に使用します（既存5名は料率テーブルが優先されます）
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            標準報酬月額（円）
          </label>
          <NumberInput
            value={form.standardMonthlyRemuneration}
            onChange={(v) => set("standardMonthlyRemuneration", v)}
          />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="checkbox"
            id="care"
            checked={form.needsLongTermCareInsurance}
            onChange={(e) => set("needsLongTermCareInsurance", e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="care" className="text-sm text-gray-700">
            介護保険対象（40歳以上）
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存"}
        </button>
        {initial && (
          <button
            onClick={handleDelete}
            className="px-4 py-2 border border-red-400 text-red-500 rounded hover:bg-red-50"
          >
            削除
          </button>
        )}
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 text-gray-600 rounded hover:bg-gray-50"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}
