import EmployeeForm from "@/components/EmployeeForm";

export default function NewEmployeePage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-4">従業員を追加</h1>
      <EmployeeForm />
    </div>
  );
}
