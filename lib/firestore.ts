import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { Employee, Payroll } from "@/types";

function empCol(userId: string) {
  return collection(db, "users", userId, "employees");
}
function payCol(userId: string) {
  return collection(db, "users", userId, "payrolls");
}

// ─── Employees ───────────────────────────────────────────────

export async function loadEmployees(userId: string): Promise<Employee[]> {
  const snap = await getDocs(empCol(userId));
  return snap.docs.map((d) => d.data() as Employee);
}

export async function loadEmployee(userId: string, id: string): Promise<Employee | null> {
  const snap = await getDoc(doc(empCol(userId), id));
  return snap.exists() ? (snap.data() as Employee) : null;
}

export async function saveEmployee(userId: string, employee: Employee): Promise<void> {
  await setDoc(doc(empCol(userId), employee.id), employee);
}

export async function deleteEmployee(userId: string, id: string): Promise<void> {
  await deleteDoc(doc(empCol(userId), id));
}

// ─── Payrolls ────────────────────────────────────────────────

export async function loadPayrolls(userId: string): Promise<Payroll[]> {
  const snap = await getDocs(payCol(userId));
  return snap.docs.map((d) => d.data() as Payroll);
}

export async function savePayroll(userId: string, payroll: Payroll): Promise<void> {
  await setDoc(doc(payCol(userId), payroll.id), payroll);
}

export async function loadPayroll(
  userId: string,
  employeeId: string,
  yearMonth: string
): Promise<Payroll | null> {
  const q = query(
    payCol(userId),
    where("employeeId", "==", employeeId),
    where("yearMonth", "==", yearMonth),
    where("isBonus", "==", false)
  );
  const snap = await getDocs(q);
  return snap.empty ? null : (snap.docs[0].data() as Payroll);
}

export async function loadPrevPayroll(
  userId: string,
  employeeId: string,
  yearMonth: string
): Promise<Payroll | null> {
  const [year, month] = yearMonth.split("-").map(Number);
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevYM = `${prevYear}-${String(prevMonth).padStart(2, "0")}`;
  return loadPayroll(userId, employeeId, prevYM);
}

export async function deletePayroll(userId: string, id: string): Promise<void> {
  await deleteDoc(doc(payCol(userId), id));
}
