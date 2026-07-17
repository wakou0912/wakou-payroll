export interface Employee {
  id: string;
  name: string;
  baseSalary: number;
  communicationAllowance: number;
  transportAllowance: number;
  housingAllowance: number;
  standardMonthlyRemuneration: number;
  needsLongTermCareInsurance: boolean;
  municipalTax: number;
  juneMunicipalTax: number;
  isOfficer: boolean;
  dependents: number;
}

export interface Payroll {
  id: string;
  employeeId: string;
  yearMonth: string; // "2026-05"
  isBonus: boolean;
  bonusName: string | null;

  // 支給
  baseSalary: number;
  overtimeAllowance: number;
  communicationAllowance: number;
  transportAllowance: number;
  housingAllowance: number;
  advanceExpense: number; // 立替経費（非課税）
  prepayment: number; // 前払い額
  yearEndAdjustment: number; // 年末調整

  // 控除
  employmentInsurance: number;
  healthInsurance: number;
  longTermCareInsurance: number;
  childcareSupport: number;
  welfarePension: number;
  incomeTax: number;
  municipalTax: number;

  workingPeriod: string;
  workingDays: number | null;
  remarks: string; // 備考
}

export interface InsuranceRates {
  healthInsurance: number;
  longTermCareInsurance: number;
  childcareSupport: number;
  welfarePension: number;
}
