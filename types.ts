export type View =
  | 'dashboard'
  | 'employees'
  | 'attendance'
  | 'my_attendance'
  | 'leave_management'
  | 'tasks'
  | 'my_tasks'
  | 'reports'
  | 'monthly_reports'
  | 'settings'
  | 'help'
  | 'announcements'
  | 'audit_logs'
  | 'notifications'
  | 'data_analytics'
  | 'payroll'
  | 'my_payslips'
  | 'shifts'
  | 'shift_roster'
  | 'bulk_attendance'
  | 'permits'
  | 'cars_list'
  | 'install'
  | 'performance'
  | 'recruitment'
  | 'hr_hub'
  | 'employee_journey'
  | 'disciplinary'
  | 'exit_management'
  | 'hours_calculator'
  | 'policy_reports'
  | 'expense_management'
  | 'document_center'
  | 'custom_forms'
  | 'form_builder'
  | 'form_responses'
  | 'fill_form'
  | 'alerts'
  | 'org_chart'
  | 'incentives'
  | 'biometric_import'
  | 'calculation_rules'
  | 'payroll_settings'
  | 'business_hub'
  | 'sales_reporting';

export enum AttendanceStatus {
  Present = 'P',
  Absent = 'A',
  Leave = 'L',
  Sick = 'S',
  Holiday = 'H',
  Weekend = 'W',
  Remote = 'R',
  Off = 'O',
}

export type UserRole = 'employee' | 'admin' | 'super-admin' | 'HR Manager' | 'Finance Manager';

export interface TaxBracket {
    min: number;
    max: number | null;
    rate: number;
}

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  surname: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  photoUrl: string;
  status: 'active' | 'inactive' | 'on-leave' | 'terminated';
  userRole: UserRole;
  leaveBalance: number;
  monthlySalary?: number;
  housingAllowance?: number;
  transportAllowance?: number;
  authUid?: string | null;
  branchId: string;
  dateOfEmployment: string;
  onboardingSteps: any[];
  achievements: any[];
  trainings: any[];
  disciplinaryRecords: any[];
  points: number;
  badges: string[];
  reportsTo?: string;
  idCardUrl?: string;
  licenseUrl?: string;
  bankName?: string;
  bankAccount?: string;
}

export type LeaveType = 'Annual' | 'Sick' | 'Maternity' | 'Paternity' | 'Study' | 'Compassionate' | 'Other';

export interface LeaveRequest { 
  id: string; 
  employeeId: string; 
  startDate: string; 
  endDate: string; 
  reason: string; 
  status: 'pending' | 'approved' | 'rejected'; 
  type: LeaveType;
  requestedAt: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  overtimeHours?: number;
  notes?: string;
  lunchBreakMinutes?: number;
}

export interface PayrollSettings {
    id?: number;
    workingDaysPerMonth: number;
    workingHoursPerDay: number;
    overtimeMultiplier: number;
    currency: string;
    pensionEnabled: boolean;
    pensionPercentage: number;
    payeEnabled: boolean;
    taxCreditMonthly: number;
    roundingDecimals: number;
    taxBrackets: TaxBracket[];
}

export interface PayrollItem {
  id: string;
  name: string;
  amount: number;
  isTaxable: boolean;
  type: 'addition' | 'deduction';
}

export interface PayrollRecord {
    id: string; // employeeId-year-month
    employeeId: string;
    year: number;
    month: number;
    baseSalary: number;
    housingAllowance: number;
    transportAllowance: number;
    dailyRate: number;
    hourlyRate: number;
    overtimeHours: number;
    overtimePay: number;
    absentDays: number;
    absenceDeduction: number;
    lateArrivalMinutes: number;
    lateArrivalDeduction: number;
    additions: PayrollItem[];
    totalAdditions: number;
    deductions: PayrollItem[];
    totalManualDeductions: number;
    totalDeductions: number;
    grossEarnings: number;
    pensionAmount: number;
    taxableEarnings: number;
    payeAmount: number;
    netSalary: number;
    isLocked: boolean;
    generatedAt: string;
    lockedAt?: string;
}

export interface PayrollInput {
  id: string; // employeeId-year-month
  employeeId: string;
  year: number;
  month: number;
  manualAdditions: PayrollItem[];
  manualDeductions: PayrollItem[];
  manualOvertimeHours?: number;
}

export interface Announcement { id: string; title: string; content: string; date: string; }
export interface Task { id: string; title: string; description: string; assigneeId: string; dueDate: string; status: 'todo' | 'in-progress' | 'done'; priority: TaskPriority; reminderDateTime?: string; }
export interface Shift { id: string; name: string; startTime: string; endTime: string; color: string; }
export interface ShiftAssignment { id: string; employeeId: string; date: string; shiftId: string; }
export interface CompanyProfile { id?: number; name: string; address: string; contact: string; logoUrl: string; }
export interface WorkingHoursSettings { id?: number; startTime: string; endTime: string; workingDays: number[]; allowedLunchMinutes: number; }
export interface NotificationSettings { id?: number; documentExpiry: { enabled: boolean; daysBefore: number; }; workPermitExpiry: { enabled: boolean; daysBefore: number; }; }
export interface OvertimeSettings { id?: number; normalHoursPerWeek: number; averageWorkDaysPerMonth: number; overtimeMultiplier: number; holidayMultiplier: number; }
export interface Branch { id: string; name: string; location: string; }
export interface Vehicle { id: string; model: string; plateNumber: string; ownerName: string; department: string; vin?: string; assignedDriverId?: string; notes?: string; }
export interface VehicleDocument { id: string; vehicleId: string; documentType: string; licenseNumber: string; registryDate: string; renewalDate: string; renewalCost: number; fileName: string; fileType: string; fileUrl: string; }
export interface VehicleExpense { id: string; vehicleId: string; date: string; category: string; amount: number; description: string; }
export interface WorkPermit { id: string; employeeId: string; permitNumber: string; issueDate: string; expiryDate: string; fileName?: string; fileType?: string; fileUrl?: string; }
export interface BusinessLicense { id: string; licenseName: string; licenseNumber: string; issuingAuthority: string; issueDate: string; expiryDate: string; fileUrl?: string; fileName?: string; }
export interface Car { id: string; name: string; model: string; plateNumber: string; permit: string; permitCreatedDate: string; permitRenewalDate: string; }
export interface VehiclePermit { id: string; carId: string; permitName: string; establishedDate: string; expiryDate: string; }
export interface JobPosition { id: string; title: string; department: string; description: string; status: 'open' | 'filled'; }
export interface Applicant { id: string; firstName: string; surname: string; position: string; status: ApplicantStatus; applicationDate: string; email: string; phone: string; notes: string; }
export interface DisciplinaryRecord { id: string; employeeId: string; incidentDate: string; recordDate: string; type: string; reason: string; feedbackToEmployee: string; updates: any[]; }
export interface ExitRecord { id: string; employeeId: string; exitDate: string; type: 'Resignation' | 'Termination' | 'Retirement' | 'Other'; status: 'initiated' | 'in-progress' | 'completed'; clearanceStatus: any; reason: string; }
export interface EmployeeDocument { id: string; employeeId: string; title: string; category: DocumentCategory; uploadDate: string; expiryDate?: string; fileUrl: string; fileName: string; fileType?: string; uploadedBy?: string; isPrivate?: boolean; signature?: string; }
export interface ExpenseClaim { id: string; employeeId: string; date: string; category: ExpenseClaimCategory; description: string; amount: number; status: 'pending' | 'approved' | 'rejected'; receiptUrl?: string; receiptFileName?: string; }
export interface CustomForm { id: string; title: string; description: string; fields: FormField[]; createdAt: string; }
export interface FormSubmission { id: string; formId: string; employeeId: string; submittedAt: string; responses: any; }
export interface JourneyEvent { id: string; employeeId: string; date: string; type: 'achievement' | 'training'; title?: string; description?: string; courseName?: string; provider?: string; }
export interface AttendanceReport { id: string; employeeId: string; year: number; month: number; data: any; status: string; isLocked: boolean; generatedAt: string; }
export interface ReportLog { id: string; reportId: string; timestamp: string; action: string; status: string; recipientEmail: string; operatorId: string; }
export interface DocumentReminder { id: string; vehicleModel: string; plateNumber: string; docType: string; status: 'expiring' | 'overdue'; daysUntil: number; }
export interface WorkPermitReminder { id: string; employeeName: string; permitNumber: string; status: 'expiring' | 'overdue'; daysUntil: number; }
export interface EmployeeDocumentReminder { id: string; employeeName: string; docTitle: string; status: 'expiring' | 'overdue'; daysUntil: number; }
export interface BusinessProfile { id: string; businessName: string; address: string; shopCapacity: string; taxNumber?: string; registeredAt: string; vatRate: number; supplierInfo?: string; }
export interface InventoryItem { id: string; itemName: string; category: string; quantity: number; unit: string; expiryDate: string; costPrice: number; sellingPrice: number; markupPercent: number; sku?: string; minStockLevel: number; supplierId?: string; supplierName: string; }
export interface SaleRecord { id: string; date: string; items: SaleItem[]; subtotal: number; taxAmount: number; totalAmount: number; transactionDiscount: number; paymentMethod: string; processedById: string; cashReceived?: number; changeDue?: number; }
export interface Supplier { id: string; name: string; contactPerson: string; email: string; phone: string; address: string; rating: number; category: string; }
export interface HeldSale { id: string; date: string; items: SaleItem[]; customerName?: string; type: 'draft' | 'quotation'; total: number; }

export interface Holiday {
  id: string;
  name: string;
  date: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
}

export interface ThemeSettings {
  id: number;
  primaryColor: string;
}

export type TaskPriority = 'Low' | 'Medium' | 'High';
export type ApplicantStatus = 'pending' | 'interview' | 'offer' | 'hired' | 'rejected';
export type ExpenseClaimCategory = 'Travel' | 'Meals' | 'Supplies' | 'Training' | 'Other';
export type FormFieldType = 'text' | 'textarea' | 'number' | 'date' | 'dropdown' | 'checkbox';

export interface FormField {
  id: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  options?: string[];
}

export type DocumentCategory = 'Identity' | 'Contract' | 'Financial' | 'Permit' | 'Other';

export interface SaleItem {
  inventoryItemId: string;
  itemName: string;
  quantity: number;
  priceAtSale: number;
  discountAmount: number;
  total: number;
}