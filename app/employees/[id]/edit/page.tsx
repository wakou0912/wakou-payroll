"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Employee } from "@/types";
import { loadEmployee } from "@/lib/firestore";
import { useAuth } from "@/contexts/AuthContext";
import EmployeeForm from "@/components/EmployeeForm";

export default function EditEmployeePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadEmployee(user.uid, id).then((emp) => {
      setEmployee(emp);
      setLoading(false);
    });
  }, [id, user]);

  if (loading) return <p className="text-gray-400">読み込み中...</p>;
  if (!employee) return <p className="text-red-500">従業員が見つかりません</p>;

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-4">従業員を編集</h1>
      <EmployeeForm initial={employee} />
    </div>
  );
}
