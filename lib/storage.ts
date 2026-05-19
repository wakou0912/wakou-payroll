import { Employee, Payroll } from "@/types";

const EMPLOYEES_KEY = "wako_employees";
const PAYROLLS_KEY = "wako_payrolls";

export function loadEmployees(): Employee[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(EMPLOYEES_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveEmployees(employees: Employee[]): void {
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
}

export function loadEmployee(id: string): Employee | null {
  return loadEmployees().find((e) => e.id === id) ?? null;
}

export function saveEmployee(employee: Employee): void {
  const all = loadEmployees();
  const idx = all.findIndex((e) => e.id === employee.id);
  if (idx >= 0) {
    all[idx] = employee;
  } else {
    all.push(employee);
  }
  saveEmployees(all);
}

export function deleteEmployee(id: string): void {
  saveEmployees(loadEmployees().filter((e) => e.id !== id));
}

export function loadPayrolls(): Payroll[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(PAYROLLS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function savePayroll(payroll: Payroll): void {
  const all = loadPayrolls();
  const idx = all.findIndex((p) => p.id === payroll.id);
  if (idx >= 0) {
    all[idx] = payroll;
  } else {
    all.push(payroll);
  }
  localStorage.setItem(PAYROLLS_KEY, JSON.stringify(all));
}

export function loadPayroll(employeeId: string, yearMonth: string): Payroll | null {
  return (
    loadPayrolls().find(
      (p) => p.employeeId === employeeId && p.yearMonth === yearMonth && !p.isBonus
    ) ?? null
  );
}

export function loadPrevPayroll(employeeId: string, yearMonth: string): Payroll | null {
  const [year, month] = yearMonth.split("-").map(Number);
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevYM = `${prevYear}-${String(prevMonth).padStart(2, "0")}`;
  return loadPayroll(employeeId, prevYM);
}

export function deletePayroll(id: string): void {
  const all = loadPayrolls().filter((p) => p.id !== id);
  localStorage.setItem(PAYROLLS_KEY, JSON.stringify(all));
}

export function exportAllData(): void {
  const data = {
    exportedAt: new Date().toISOString(),
    employees: loadEmployees(),
    payrolls: loadPayrolls(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `wako-payroll-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
