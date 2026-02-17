import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import type { 
    View, Employee, AttendanceRecord, LeaveRequest, Announcement, Holiday, AuditLog, Task, 
    Shift, ShiftAssignment, CompanyProfile, ThemeSettings, PayrollRecord, Vehicle, Branch,
    EmployeeDocument, DisciplinaryRecord, ExpenseClaim, CustomForm, FormSubmission, Applicant,
    BusinessLicense, Car, JobPosition, PayrollInput, ExitRecord, VehiclePermit, PayrollSettings, PayrollItem,
    AttendanceReport, ReportLog, DocumentReminder, WorkPermitReminder, EmployeeDocumentReminder, WorkingHoursSettings, NotificationSettings, OvertimeSettings, VehicleDocument,
    WorkPermit, VehicleExpense, BusinessProfile, InventoryItem, SaleRecord, Supplier, HeldSale
} from '../types';
import { AttendanceStatus } from '../types';
import { cloudDB, authDB } from '../services/supabase';

const TARGET_ADMIN_EMAIL = 'ndabanattyhlojeng@gmail.com';

const mapEmployee = (dbEmp: any): Employee => {
    if (!dbEmp) return null as any;
    const email = dbEmp.email || '';
    let userRole = dbEmp.user_role || dbEmp.userRole || 'employee';
    
    if (email.toLowerCase().trim() === TARGET_ADMIN_EMAIL.toLowerCase().trim()) {
        userRole = 'super-admin';
    }
    
    return {
        id: dbEmp.id,
        employeeId: dbEmp.employee_id || dbEmp.employeeId || `EMP-${dbEmp.id?.slice(0, 4)}`,
        firstName: dbEmp.first_name || dbEmp.firstName || 'User',
        surname: dbEmp.surname || dbEmp.surname || 'Member',
        email: email,
        phone: dbEmp.phone || '',
        role: dbEmp.role || 'Staff',
        department: dbEmp.department || 'General',
        photoUrl: dbEmp.photo_url || dbEmp.photoUrl || `https://ui-avatars.com/api/?name=${dbEmp.first_name || 'U'}+${dbEmp.surname || 'M'}&background=random`,
        status: dbEmp.status || 'active',
        userRole: userRole,
        leaveBalance: dbEmp.leave_balance ?? dbEmp.leaveBalance ?? 12,
        monthlySalary: dbEmp.monthly_salary || dbEmp.monthlySalary || 0,
        housingAllowance: dbEmp.housing_allowance || dbEmp.housingAllowance || 0,
        transportAllowance: dbEmp.transport_allowance || dbEmp.transportAllowance || 0,
        authUid: dbEmp.id,
        branchId: dbEmp.branch_id || dbEmp.branchId || 'main-branch',
        dateOfEmployment: dbEmp.date_of_employment || dbEmp.dateOfEmployment || new Date().toISOString().split('T')[0],
        onboardingSteps: dbEmp.onboarding_steps || dbEmp.onboardingSteps || [],
        achievements: dbEmp.achievements || [],
        trainings: dbEmp.trainings || [],
        disciplinaryRecords: dbEmp.disciplinary_records || dbEmp.disciplinaryRecords || [],
        points: dbEmp.points || 0,
        badges: dbEmp.badges || [],
        reportsTo: dbEmp.reports_to || dbEmp.reportsTo,
        bankName: dbEmp.bank_name || '',
        bankAccount: dbEmp.bank_account || ''
    };
};

const mapEmployeeToDb = (emp: any) => {
    return {
        id: emp.id,
        employee_id: emp.employeeId,
        first_name: emp.firstName,
        surname: emp.surname,
        email: emp.email,
        phone: emp.phone,
        role: emp.role,
        department: emp.department,
        photo_url: emp.photoUrl,
        status: emp.status,
        user_role: emp.userRole,
        leave_balance: emp.leaveBalance,
        monthly_salary: emp.monthlySalary,
        housing_allowance: emp.housingAllowance,
        transport_allowance: emp.transportAllowance,
        branch_id: emp.branchId,
        date_of_employment: emp.dateOfEmployment,
        bank_name: emp.bankName,
        bank_account: emp.bankAccount,
        points: emp.points,
        badges: emp.badges,
        reports_to: emp.reportsTo
    };
};

const mapAttendanceFromDb = (dbRec: any): AttendanceRecord => ({
    id: dbRec.id,
    employeeId: dbRec.employee_id,
    date: dbRec.date,
    status: dbRec.status as AttendanceStatus,
    checkInTime: dbRec.check_in_time,
    checkOutTime: dbRec.check_out_time,
    overtimeHours: parseFloat(dbRec.overtime_hours) || 0,
    notes: dbRec.notes,
    lunchBreakMinutes: dbRec.lunch_break_minutes
});

const mapLeaveRequestFromDb = (dbReq: any): LeaveRequest => ({
    id: dbReq.id,
    employeeId: dbReq.employee_id,
    startDate: dbReq.start_date,
    endDate: dbReq.end_date,
    reason: dbReq.reason,
    status: dbReq.status,
    type: dbReq.type,
    requestedAt: dbReq.requested_at
});

interface AppContextType {
  currentUser: Employee | null;
  allEmployees: Employee[];
  employees: Employee[];
  isAuthLoading: boolean;
  isDataRefreshing: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  signup: (email: string, pass: string, details: any) => Promise<{ success: boolean; message: string }>;
  employeeLogin: (surname: string, phone: string) => Promise<{ success: boolean; message: string }>;
  changePassword: (newPass: string) => Promise<{ success: boolean; message: string }>;
  resetEmployeePassword: (email: string) => Promise<void>;
  view: View;
  setView: (view: View) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  attendanceRecords: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  announcements: Announcement[];
  applicants: Applicant[];
  jobPositions: JobPosition[];
  expenseClaims: ExpenseClaim[];
  tasks: Task[];
  shifts: Shift[];
  shiftAssignments: ShiftAssignment[];
  payrollHistory: PayrollRecord[];
  payrollInputs: PayrollInput[];
  branches: Branch[];
  vehicles: Vehicle[];
  vehicleExpenses: VehicleExpense[];
  workPermits: WorkPermit[];
  businessLicenses: BusinessLicense[];
  cars: Car[];
  vehiclePermits: VehiclePermit[];
  attendanceReports: AttendanceReport[];
  reportLogs: ReportLog[];
  exitRecords: ExitRecord[];
  customForms: CustomForm[];
  formSubmissions: FormSubmission[];
  disciplinaryRecords: DisciplinaryRecord[];
  employeeDocuments: EmployeeDocument[];
  auditLogs: AuditLog[];
  payrollSettings: PayrollSettings;
  companyProfile: CompanyProfile;
  workingHoursSettings: WorkingHoursSettings;
  overtimeSettings: OvertimeSettings;
  notificationSettings: NotificationSettings;
  businessProfile: BusinessProfile | null;
  inventory: InventoryItem[];
  suppliers: Supplier[];
  salesHistory: SaleRecord[];
  heldSales: HeldSale[];
  updateBusinessProfile: (profile: Omit<BusinessProfile, 'id' | 'registeredAt'>) => Promise<void>;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  recordSale: (sale: Omit<SaleRecord, 'id' | 'date'>) => Promise<void>;
  bulkAddInventoryItems: (items: Omit<InventoryItem, 'id'>[]) => Promise<void>;
  holdSale: (heldSale: Omit<HeldSale, 'id' | 'date'>) => Promise<void>;
  deleteHeldSale: (id: string) => Promise<void>;
  selectedEmployeeForJourney: Employee | null;
  setSelectedEmployeeForJourney: (emp: Employee | null) => void;
  preselectedEmployeeIdForReport: string | null;
  setPreselectedEmployeeIdForReport: (id: string | null) => void;
  preselectedEmployeeForAttendance: string | null;
  setPreselectedEmployeeForAttendance: (id: string | null) => void;
  selectedFormId: string | null;
  setSelectedFormId: (id: string | null) => void;
  activeBranchId: string;
  setActiveBranchId: (id: string) => void;
  isEmployeeModalOpen: boolean;
  employeeToEdit: Employee | null;
  openAddEmployeeModal: () => void;
  openEditEmployeeModal: (emp: Employee) => void;
  closeEmployeeModal: () => void;
  isChangePasswordModalOpen: boolean;
  openChangePasswordModal: () => void;
  closeChangePasswordModal: () => void;
  isConfirmModalOpen: boolean;
  confirmModalContent: { title: string, message: string, onConfirm: () => void };
  openConfirmModal: (title: string, message: string, onConfirm: () => void) => void;
  closeConfirmModal: () => void;
  isTaskModalOpen: boolean;
  taskToEdit: Task | null;
  initialAssigneeIdForTaskModal: string | null;
  openAddTaskModal: (assigneeId?: string) => void;
  openTaskModal: (task: Task) => void;
  closeTaskModal: () => void;
  isTaskDetailPanelOpen: boolean;
  taskForDetailPanel: string | null;
  openTaskDetailPanel: (taskId: string) => void;
  closeTaskDetailPanel: () => void;
  isShiftModalOpen: boolean;
  shiftToEdit: Shift | null;
  openAddShiftModal: () => void;
  openEditShiftModal: (shift: Shift) => void;
  closeShiftModal: () => void;
  isShiftAssignmentModalOpen: boolean;
  shiftAssignmentContext: { date: string, employeeId: string, assignment: ShiftAssignment | null } | null;
  openShiftAssignmentModal: (ctx: { date: string, employeeId: string, assignment: ShiftAssignment | null }) => void;
  closeShiftAssignmentModal: () => void;
  isSickLeaveModalOpen: boolean;
  sickLeaveModalContext: { employeeId: string, date: string } | null;
  openSickLeaveModal: (empId: string, date: string) => void;
  closeSickLeaveModal: () => void;
  isTimeLogModalOpen: boolean;
  timeLogModalContext: { employeeId: string, date: string } | null;
  openTimeLogModal: (empId: string, date: string) => void;
  closeTimeLogModal: () => void;
  isVehicleModalOpen: boolean;
  vehicleToEdit: Vehicle | null;
  openVehicleModal: (v: Vehicle | null) => void;
  closeVehicleModal: () => void;
  isVehicleExpenseModalOpen: boolean;
  vehicleExpenseToEdit: VehicleExpense | null;
  openVehicleExpenseModal: (exp: VehicleExpense | null) => void;
  closeVehicleExpenseModal: () => void;
  isDocumentModalOpen: boolean;
  documentModalVehicleId: string | null;
  openDocumentModal: (vehicleId: string) => void;
  closeDocumentModal: () => void;
  isWorkPermitModalOpen: boolean;
  workPermitToEdit: WorkPermit | null;
  openWorkPermitModal: (p: WorkPermit | null) => void;
  closeWorkPermitModal: () => void;
  isBusinessLicenseModalOpen: boolean;
  businessLicenseToEdit: BusinessLicense | null;
  openBusinessLicenseModal: (l: BusinessLicense | null) => void;
  closeBusinessLicenseModal: () => void;
  isCarModalOpen: boolean;
  carToEdit: Car | null;
  openCarModal: (c: Car | null) => void;
  closeCarModal: () => void;
  isBackupRestoreModalOpen: boolean;
  openBackupRestoreModal: () => void;
  closeBackupRestoreModal: () => void;
  isApplicantModalOpen: boolean;
  applicantToEdit: Applicant | null;
  openApplicantModal: (a?: Applicant | null) => void;
  closeApplicantModal: () => void;
  isJobPositionModalOpen: boolean;
  jobPositionToEdit: JobPosition | null;
  openJobPositionModal: (p: JobPosition | null) => void;
  closeJobPositionModal: () => void;
  isExpenseModalOpen: boolean;
  expenseToEdit: ExpenseClaim | null;
  openExpenseModal: (e: ExpenseClaim | null) => void;
  closeExpenseModal: () => void;
  isDocumentCenterModalOpen: boolean;
  documentToEdit: EmployeeDocument | null;
  openDocumentCenterModal: (d: EmployeeDocument | null) => void;
  closeDocumentCenterModal: () => void;
  isSignatureModalOpen: boolean;
  documentToSignId: string | null;
  openSignatureModal: (docId: string) => void;
  closeSignatureModal: () => void;
  isJourneyEventModalOpen: boolean;
  journeyEventContext: { employeeId: string, type: 'achievement' | 'training' } | null;
  openJourneyEventModal: (empId: string, type: 'achievement' | 'training') => void;
  closeJourneyEventModal: () => void;
  isDisciplinaryModalOpen: boolean;
  disciplinaryModalContext: { employeeId: string } | null;
  disciplinaryRecordToEdit: DisciplinaryRecord | null;
  openDisciplinaryModal: (id: string, record?: DisciplinaryRecord) => void;
  closeDisciplinaryModal: () => void;
  isDisciplinaryUpdateModalOpen: boolean;
  disciplinaryUpdateContext: { employeeId: string, recordId: string } | null;
  openDisciplinaryUpdateModal: (empId: string, recId: string) => void;
  closeDisciplinaryUpdateModal: () => void;
  isAttendancePreselectionModalOpen: boolean;
  preselectionModalContext: { employeeId: string } | null;
  openAttendancePreselectionModal: (empId: string) => void;
  closeAttendancePreselectionModal: () => void;
  isGlobalSearchOpen: boolean;
  openGlobalSearch: () => void;
  closeGlobalSearch: () => void;
  isSettingsMenuOpen: boolean;
  openSettingsMenu: () => void;
  closeSettingsMenu: () => void;
  isRequestSubmittedModalOpen: boolean;
  requestSubmittedModalContent: { title: string, message: string };
  openRequestSubmittedModal: (title: string, message: string) => void;
  closeRequestSubmittedModal: () => void;
  isPayslipModalOpen: boolean;
  payslipData: { record: PayrollRecord, employee: Employee } | null;
  openPayslipModal: (data: { record: PayrollRecord, employee: Employee }) => void;
  closePayslipModal: () => void;
  refreshData: (authUserId?: string) => Promise<void>;
  addEmployee: (emp: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (id: string, emp: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  updateAttendance: (empId: string, date: string, status: AttendanceStatus, details?: any) => Promise<void>;
  checkIn: (empId: string) => Promise<void>;
  checkOut: (empId: string) => Promise<void>;
  bulkUpdateAttendance: (empIds: string[], start: string, end: string, status: AttendanceStatus, options?: any) => Promise<void>;
  addLeaveRequest: (req: Omit<LeaveRequest, 'id' | 'status' | 'requestedAt'>) => Promise<void>;
  updateLeaveRequestStatus: (id: string, status: LeaveRequest['status']) => Promise<void>;
  addAnnouncement: (ann: Omit<Announcement, 'id' | 'date'>) => Promise<void>;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addShift: (shift: Omit<Shift, 'id'>) => Promise<void>;
  updateShift: (id: string, shift: Partial<Shift>) => Promise<void>;
  deleteShift: (id: string) => Promise<void>;
  assignOrUpdateShift: (assignment: Omit<ShiftAssignment, 'id'>) => Promise<void>;
  unassignShift: (id: string) => Promise<void>;
  calculateEmployeePayroll: (empId: string, year: number, month: number, overrideInput?: PayrollInput) => PayrollRecord | null;
  generatePayroll: (year: number, month: number) => Promise<void>;
  lockPayrollRecord: (recordId: string) => Promise<void>;
  lockAllPayrollRecordsForMonth: (year: number, month: number) => Promise<void>;
  updatePayrollSettings: (sets: PayrollSettings) => Promise<void>;
  updateCompanyProfile: (profile: CompanyProfile) => Promise<void>;
  holidays: Holiday[];
  documentReminders: DocumentReminder[];
  workPermitReminders: WorkPermitReminder[];
  employeeDocumentReminders: EmployeeDocumentReminder[];
  updateWorkingHoursSettings: (s: WorkingHoursSettings) => Promise<void>;
  updateNotificationSettings: (s: NotificationSettings) => Promise<void>;
  addVehicle: (v: Omit<Vehicle, 'id'>) => Promise<void>;
  updateVehicle: (id: string, v: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  addDocument: (d: Omit<VehicleDocument, 'id'>) => Promise<void>;
  updateDocument: (id: string, d: Partial<VehicleDocument>) => Promise<void>;
  addCar: (c: Omit<Car, 'id'>) => Promise<void>;
  updateCar: (id: string, c: Partial<Car>) => Promise<void>;
  deleteCar: (id: string) => Promise<void>;
  addVehiclePermit: (p: Omit<VehiclePermit, 'id'>) => Promise<void>;
  updateVehiclePermit: (id: string, p: Partial<VehiclePermit>) => Promise<void>;
  deleteVehiclePermit: (id: string) => Promise<void>;
  addVehicleExpense: (e: Omit<VehicleExpense, 'id'>) => Promise<void>;
  updateVehicleExpense: (id: string, e: Partial<VehicleExpense>) => Promise<void>;
  deleteVehicleExpense: (id: string) => Promise<void>;
  addWorkPermit: (p: Omit<WorkPermit, 'id'>) => Promise<void>;
  updateWorkPermit: (id: string, p: Partial<WorkPermit>) => Promise<void>;
  deleteWorkPermit: (id: string) => Promise<void>;
  addBusinessLicense: (l: Omit<BusinessLicense, 'id'>) => Promise<void>;
  updateBusinessLicense: (id: string, l: Partial<BusinessLicense>) => Promise<void>;
  deleteBusinessLicense: (id: string) => Promise<void>;
  addJobPosition: (p: Omit<JobPosition, 'id'>) => Promise<void>;
  updateJobPosition: (id: string, p: Partial<JobPosition>) => Promise<void>;
  deleteJobPosition: (id: string) => Promise<void>;
  addApplicant: (a: Omit<Applicant, 'id'>) => Promise<void>;
  updateApplicant: (id: string, a: Partial<Applicant>) => Promise<void>;
  deleteApplicant: (id: string) => Promise<void>;
  updateExpenseClaimStatus: (id: string, status: ExpenseClaim['status']) => Promise<void>;
  addExpenseClaim: (e: Omit<ExpenseClaim, 'id' | 'status'>) => Promise<void>;
  addJourneyEvent: (empId: string, type: 'achievement' | 'training', data: any) => Promise<void>;
  addDisciplinaryRecord: (empId: string, record: Omit<DisciplinaryRecord, 'id' | 'employeeId'>) => Promise<void>;
  addDisciplinaryUpdate: (empId: string, recordId: string, update: any) => Promise<void>;
  addExitRecord: (r: Omit<ExitRecord, 'id' | 'status'>) => Promise<void>;
  updateExitRecord: (id: string, r: Partial<ExitRecord>) => Promise<void>;
  addCustomForm: (f: Omit<CustomForm, 'id'>) => Promise<void>;
  updateCustomForm: (id: string, f: Partial<CustomForm>) => Promise<void>;
  deleteCustomForm: (id: string) => Promise<void>;
  addFormSubmission: (s: Omit<FormSubmission, 'id' | 'submittedAt'>) => Promise<void>;
  addEmployeeDocument: (d: Omit<EmployeeDocument, 'id' | 'signature'>) => Promise<void>;
  updateEmployeeDocument: (id: string, d: Partial<EmployeeDocument>) => Promise<void>;
  signDocument: (id: string, signature: string) => Promise<void>;
  processBiometricData: (data: string) => Promise<any>;
  bulkGenerateReports: (year: number, month: number) => Promise<void>;
  bulkSendReports: (year: number, month: number) => Promise<void>;
  sendReport: (id: string) => Promise<void>;
  generateMonthlyReport: (empId: string, year: number, month: number) => Promise<void>;
  restoreData: (data: any) => Promise<void>;
  dismissDocumentReminder: (id: string) => void;
  dismissWorkPermitReminder: (id: string) => void;
  dismissEmployeeDocumentReminder: (id: string) => void;
  openVehicleDetail: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useAppContext must be used within an AppContextProvider');
    return context;
};

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<Employee | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [isDataRefreshing, setIsDataRefreshing] = useState(false);
    const [view, setView] = useState<View>('dashboard');
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [shiftAssignments, setShiftAssignments] = useState<ShiftAssignment[]>([]);
    const [payrollHistory, setPayrollHistory] = useState<PayrollRecord[]>([]);
    const [payrollInputs, setPayrollInputs] = useState<PayrollInput[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [vehicleExpenses, setVehicleExpenses] = useState<VehicleExpense[]>([]);
    const [workPermits, setWorkPermits] = useState<WorkPermit[]>([]);
    const [businessLicenses, setBusinessLicenses] = useState<BusinessLicense[]>([]);
    const [cars, setCars] = useState<Car[]>([]);
    const [vehiclePermits, setVehiclePermits] = useState<VehiclePermit[]>([]);
    const [attendanceReports, setAttendanceReports] = useState<AttendanceReport[]>([]);
    const [reportLogs, setReportLogs] = useState<ReportLog[]>([]);
    const [exitRecords, setExitRecords] = useState<ExitRecord[]>([]);
    const [customForms, setCustomForms] = useState<CustomForm[]>([]);
    const [formSubmissions, setFormSubmissions] = useState<FormSubmission[]>([]);
    const [disciplinaryRecords, setDisciplinaryRecords] = useState<DisciplinaryRecord[]>([]);
    const [employeeDocuments, setEmployeeDocuments] = useState<EmployeeDocument[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [salesHistory, setSalesHistory] = useState<SaleRecord[]>([]);
    const [heldSales, setHeldSales] = useState<HeldSale[]>([]);

    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [jobPositions, setJobPositions] = useState<JobPosition[]>([]);
    const [expenseClaims, setExpenseClaims] = useState<ExpenseClaim[]>([]);
    const [documentReminders, setDocumentReminders] = useState<DocumentReminder[]>([]);
    const [workPermitReminders, setWorkPermitReminders] = useState<WorkPermitReminder[]>([]);
    const [employeeDocumentReminders, setEmployeeDocumentReminders] = useState<EmployeeDocumentReminder[]>([]);

    const [payrollSettings, setPayrollSettings] = useState<PayrollSettings>({ 
        workingDaysPerMonth: 22, 
        workingHoursPerDay: 8, 
        overtimeMultiplier: 1.5, 
        currency: 'LSL', 
        pensionEnabled: true, 
        pensionPercentage: 5, 
        payeEnabled: true, 
        taxCreditMonthly: 880,
        roundingDecimals: 2,
        taxBrackets: [
            { min: 0, max: 4400, rate: 20 },
            { min: 4400, max: null, rate: 30 }
        ]
    });
    const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({ name: 'Natty Solutions', address: 'Maseru, Lesotho', contact: '+266 5800 8512', logoUrl: '' });
    const [workingHoursSettings, setWorkingHoursSettings] = useState<WorkingHoursSettings>({ id: 1, startTime: '09:00', endTime: '17:00', workingDays: [1,2,3,4,5], allowedLunchMinutes: 60 });
    const [overtimeSettings, setOvertimeSettings] = useState<OvertimeSettings>({ id: 1, normalHoursPerWeek: 40, averageWorkDaysPerMonth: 22, overtimeMultiplier: 1.5, holidayMultiplier: 2 });
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({ id: 1, documentExpiry: { enabled: true, daysBefore: 30 }, workPermitExpiry: { enabled: true, daysBefore: 30 } });
    
    const [selectedEmployeeForJourney, setSelectedEmployeeForJourney] = useState<Employee | null>(null);
    const [preselectedEmployeeIdForReport, setPreselectedEmployeeIdForReport] = useState<string | null>(null);
    const [preselectedEmployeeForAttendance, setPreselectedEmployeeForAttendance] = useState<string | null>(null);
    const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
    const [activeBranchId, activeBranchIdSet] = useState<string>('all');
    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
    const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmModalContent, setConfirmModalContent] = useState({ title: '', message: '', onConfirm: () => {} });
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [initialAssigneeIdForTaskModal, setInitialAssigneeIdForTaskModal] = useState<string | null>(null);
    const [isTaskDetailPanelOpen, setIsTaskDetailPanelOpen] = useState(false);
    const [taskForDetailPanel, setTaskForDetailPanel] = useState<string | null>(null);
    const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
    const [shiftToEdit, setShiftToEdit] = useState<Shift | null>(null);
    const [isShiftAssignmentModalOpen, setIsShiftAssignmentModalOpen] = useState(false);
    const [shiftAssignmentContext, setShiftAssignmentContext] = useState<{ date: string, employeeId: string, assignment: ShiftAssignment | null } | null>(null);
    const [isSickLeaveModalOpen, setIsSickLeaveModalOpen] = useState(false);
    const [sickLeaveModalContext, setSickLeaveModalContext] = useState<{ employeeId: string, date: string } | null>(null);
    const [isTimeLogModalOpen, setIsTimeLogModalOpen] = useState(false);
    const [timeLogModalContext, setTimeLogModalContext] = useState<{ employeeId: string, date: string } | null>(null);
    const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
    const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);
    const [isVehicleExpenseModalOpen, setIsVehicleExpenseModalOpen] = useState(false);
    const [vehicleExpenseToEdit, setVehicleExpenseToEdit] = useState<VehicleExpense | null>(null);
    const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
    const [documentModalVehicleId, setDocumentModalVehicleId] = useState<string | null>(null);
    const [isWorkPermitModalOpen, setIsWorkPermitModalOpen] = useState(false);
    const [workPermitToEdit, setWorkPermitToEdit] = useState<WorkPermit | null>(null);
    const [isBusinessLicenseModalOpen, setIsBusinessLicenseModalOpen] = useState(false);
    const [businessLicenseToEdit, setBusinessLicenseToEdit] = useState<BusinessLicense | null>(null);
    const [isCarModalOpen, setIsCarModalOpen] = useState(false);
    const [carToEdit, setCarToEdit] = useState<Car | null>(null);
    const [isBackupRestoreModalOpen, setIsBackupRestoreModalOpen] = useState(false);
    const [isApplicantModalOpen, setIsApplicantModalOpen] = useState(false);
    const [applicantToEdit, setApplicantToEdit] = useState<Applicant | null>(null);
    const [isJobPositionModalOpen, setIsJobPositionModalOpen] = useState(false);
    const [jobPositionToEdit, setJobPositionToEdit] = useState<JobPosition | null>(null);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [expenseToEdit, setExpenseToEdit] = useState<ExpenseClaim | null>(null);
    const [isDocumentCenterModalOpen, setIsDocumentCenterModalOpen] = useState(false);
    const [documentToEdit, setDocumentToEdit] = useState<EmployeeDocument | null>(null);
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
    const [documentToSignId, setDocumentToSignId] = useState<string | null>(null);
    const [isJourneyEventModalOpen, setIsJourneyEventModalOpen] = useState(false);
    const [journeyEventContext, setJourneyEventContext] = useState<{ employeeId: string, type: 'achievement' | 'training' } | null>(null);
    const [isDisciplinaryModalOpen, setIsDisciplinaryModalOpen] = useState(false);
    const [disciplinaryModalContext, setDisciplinaryModalContext] = useState<{ employeeId: string } | null>(null);
    const [disciplinaryRecordToEdit, setDisciplinaryRecordToEdit] = useState<DisciplinaryRecord | null>(null);
    const [isDisciplinaryUpdateModalOpen, setIsDisciplinaryUpdateModalOpen] = useState(false);
    const [disciplinaryUpdateContext, setDisciplinaryUpdateContext] = useState<{ employeeId: string, recordId: string } | null>(null);
    const [isAttendancePreselectionModalOpen, setIsAttendancePreselectionModalOpen] = useState(false);
    const [preselectionModalContext, setPreselectionModalContext] = useState<{ employeeId: string } | null>(null);
    const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
    const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
    const [isRequestSubmittedModalOpen, setIsRequestSubmittedModalOpen] = useState(false);
    const [requestSubmittedModalContent, setRequestSubmittedModalContent] = useState({ title: '', message: '' });
    const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
    const [payslipData, setPayslipData] = useState<{ record: PayrollRecord, employee: Employee } | null>(null);

    const isRefreshingRef = useRef(false);

    const refreshData = useCallback(async (authUserId?: string) => {
        if (isRefreshingRef.current) return;
        isRefreshingRef.current = true;
        setIsDataRefreshing(true);

        const safeFetch = async (tableName: string) => {
            try {
                return await cloudDB.fetch(tableName);
            } catch (err: any) {
                // Log detailed error for debugging but don't break the app
                const errorMsg = err?.message || err?.toString() || 'Unknown error';
                const errorCode = err?.code || 'NO_CODE';
                console.warn(`Soft Fail: Table [${tableName}] - ${errorCode}: ${errorMsg}`);
                // Return empty array for graceful degradation
                return [];
            }
        };

        try {
            // STEP 1: PRIORITY HANDSHAKE (Fetch Current Identity Only)
            if (authUserId) {
                const userProfile = await cloudDB.get('employees', authUserId).catch(() => null);
                
                if (userProfile) {
                    setCurrentUser(mapEmployee(userProfile));
                    setIsAuthLoading(false); // UI UNLOCKED IMMEDIATELY
                } else {
                    // EMERGENCY PROTOCOL: Super Admin direct verification via email
                    const { data: { session } } = await authDB.getSession();
                    if (session?.user?.email?.toLowerCase() === TARGET_ADMIN_EMAIL.toLowerCase()) {
                        // Attempt to resolve valid branch for master admin
                        const branchesList = await safeFetch('branches');
                        let branchId = branchesList?.[0]?.id || 'hq-node';
                        
                        if (branchesList.length === 0) {
                            await cloudDB.upsert('branches', { id: 'hq-node', name: 'Master Registry Node', location: 'Maseru' });
                        }

                        const masterAdmin = {
                            id: authUserId,
                            employee_id: 'SYSTEM-ROOT',
                            first_name: 'Proprietor',
                            surname: 'Developer',
                            email: TARGET_ADMIN_EMAIL,
                            user_role: 'super-admin',
                            status: 'active',
                            branch_id: branchId
                        };
                        await cloudDB.upsert('employees', masterAdmin);
                        setCurrentUser(mapEmployee(masterAdmin));
                        setIsAuthLoading(false); 
                    } else {
                        setIsAuthLoading(false); 
                    }
                }
            } else {
                setIsAuthLoading(false); 
            }

            // STEP 2: BACKGROUND REGISTRY SYNC (Non-blocking)
            const syncSecondaryData = async () => {
                const results = await Promise.all([
                    safeFetch('employees'),
                    safeFetch('attendance_records'),
                    safeFetch('leave_requests'),
                    safeFetch('payroll_history'),
                    safeFetch('payroll_settings'),
                    safeFetch('working_hours_settings'),
                    safeFetch('overtime_settings'),
                    safeFetch('notification_settings'),
                    safeFetch('tasks'),
                    safeFetch('inventory'),
                    safeFetch('sales'),
                    safeFetch('suppliers'),
                    safeFetch('branches'),
                    safeFetch('vehicles'),
                    safeFetch('vehicle_permits'),
                    safeFetch('work_permits'),
                    safeFetch('business_licenses'),
                    safeFetch('custom_forms'),
                    safeFetch('disciplinary_records')
                ]);

                setAllEmployees((results[0] || []).map(mapEmployee));
                setAttendanceRecords((results[1] || []).map(mapAttendanceFromDb));
                setLeaveRequests((results[2] || []).map(mapLeaveRequestFromDb));
                setPayrollHistory(results[3] || []);
                if (results[4]?.[0]) setPayrollSettings(results[4][0]);
                if (results[5]?.[0]) setWorkingHoursSettings(results[5][0]);
                if (results[6]?.[0]) setOvertimeSettings(results[6][0]);
                if (results[7]?.[0]) setNotificationSettings(results[7][0]);
                setTasks(results[8] || []);
                setInventory(results[9] || []);
                setSalesHistory(results[10] || []);
                setSuppliers(results[11] || []);
                setBranches(results[12] || []);
                setVehicles(results[13] || []);
                setVehiclePermits(results[14] || []);
                setWorkPermits(results[15] || []);
                setBusinessLicenses(results[16] || []);
                setCustomForms(results[17] || []);
                setDisciplinaryRecords(results[18] || []);
            };

            syncSecondaryData();

        } catch (error) {
            console.error("Registry Sync Failure:", error);
            setIsAuthLoading(false); 
        } finally {
            isRefreshingRef.current = false;
            setIsDataRefreshing(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        const checkInitialSession = async () => {
            try {
                const { data: { session } } = await authDB.getSession();
                if (session?.user && isMounted) await refreshData(session.user.id);
                else if (isMounted) setIsAuthLoading(false);
            } catch (e) {
                if (isMounted) setIsAuthLoading(false);
            }
        };
        checkInitialSession();
        const { data: { subscription } } = authDB.onAuthStateChange(async (_event: string, session: any) => {
            if (session?.user && isMounted) await refreshData(session.user.id);
            else if (isMounted) { setCurrentUser(null); setIsAuthLoading(false); }
        });
        return () => { isMounted = false; subscription.unsubscribe(); };
    }, [refreshData]);

    const calculateEmployeePayroll = useCallback((employeeId: string, year: number, month: number, overrideInput?: PayrollInput): PayrollRecord | null => {
        const employee = allEmployees.find(e => e.id === employeeId);
        if (!employee || !employee.monthlySalary) return null;
        
        const inputId = `${employeeId}-${year}-${month}`;
        const input = overrideInput || payrollInputs.find(i => i.id === inputId);
        
        const baseSalary = employee.monthlySalary;
        const housingAllowance = employee.housingAllowance || 0;
        const transportAllowance = employee.transportAllowance || 0;

        const dailyRate = baseSalary / (payrollSettings.workingDaysPerMonth || 22);
        const hourlyRate = dailyRate / (payrollSettings.workingHoursPerDay || 8);
        
        const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
        const monthRecords = attendanceRecords.filter(r => r.employeeId === employeeId && r.date.startsWith(monthPrefix));
        
        const unpaidDays = monthRecords.filter(r => r.status === AttendanceStatus.Absent || r.status === AttendanceStatus.Off).length;
        const absenceDeduction = unpaidDays * dailyRate;
        
        const [sh, sm] = (workingHoursSettings.startTime || '09:00').split(':').map(Number);
        const scheduledStartMinutes = (sh * 60 + sm) || 540;
        let lateArrivalMinutes = 0;
        monthRecords.forEach(r => {
            if (r.checkInTime && (r.status === AttendanceStatus.Present || r.status === AttendanceStatus.Remote)) {
                const [h, m] = r.checkInTime.split(':').map(Number);
                const actualStartMinutes = h * 60 + m;
                if (actualStartMinutes > scheduledStartMinutes) lateArrivalMinutes += (actualStartMinutes - scheduledStartMinutes);
            }
        });
        const lateArrivalDeduction = (lateArrivalMinutes / 60) * hourlyRate;
        
        const totalOtHours = monthRecords.reduce((sum, r) => sum + (r.overtimeHours || 0), 0) + (input?.manualOvertimeHours || 0);
        const overtimePay = totalOtHours * hourlyRate * (payrollSettings.overtimeMultiplier || 1.5);
        
        const totalAdditions = (input?.manualAdditions || []).reduce((sum, i) => sum + i.amount, 0) + housingAllowance + transportAllowance;
        const totalManualDeductions = (input?.manualDeductions || []).reduce((sum, i) => sum + i.amount, 0);
        
        const grossEarnings = baseSalary + overtimePay + totalAdditions;
        const pensionAmount = payrollSettings.pensionEnabled ? (baseSalary * (payrollSettings.pensionPercentage / 100)) : 0;
        
        const taxableEarnings = Math.max(0, grossEarnings - pensionAmount);
        
        let payeAmount = 0;
        if (payrollSettings.payeEnabled) {
            let tempTax = 0;
            (payrollSettings.taxBrackets || []).forEach(bracket => {
                if (taxableEarnings > bracket.min) {
                    const applicable = bracket.max ? Math.min(taxableEarnings, bracket.max) - bracket.min : taxableEarnings - bracket.min;
                    tempTax += applicable * (bracket.rate / 100);
                }
            });
            payeAmount = Math.max(0, tempTax - (payrollSettings.taxCreditMonthly || 880));
        }
        
        const totalDeductions = totalManualDeductions + absenceDeduction + lateArrivalDeduction + pensionAmount + payeAmount;
        
        return {
            id: inputId, 
            employeeId, 
            year, 
            month, 
            baseSalary, 
            housingAllowance,
            transportAllowance,
            dailyRate, 
            hourlyRate, 
            overtimeHours: totalOtHours, 
            overtimePay, 
            absentDays: unpaidDays, 
            absenceDeduction, 
            lateArrivalMinutes, 
            lateArrivalDeduction, 
            additions: input?.manualAdditions || [], 
            totalAdditions, 
            deductions: input?.manualDeductions || [], 
            totalManualDeductions, 
            totalDeductions, 
            grossEarnings, 
            pensionAmount, 
            taxableEarnings, 
            payeAmount, 
            netSalary: Math.max(0, grossEarnings - totalDeductions), 
            isLocked: false, 
            generatedAt: new Date().toISOString()
        };
    }, [allEmployees, payrollSettings, attendanceRecords, payrollInputs, workingHoursSettings]);

    const value: AppContextType = {
        currentUser, allEmployees, employees: allEmployees, isAuthLoading, isDataRefreshing, view, setView, isSidebarOpen, 
        toggleSidebar: () => setIsSidebarOpen(p => !p), theme, toggleTheme: () => setTheme(p => p === 'light' ? 'dark' : 'light'),
        attendanceRecords, leaveRequests, announcements, tasks, shifts, shiftAssignments, payrollHistory, payrollInputs, branches,
        vehicles, vehicleExpenses, workPermits, businessLicenses, cars, vehiclePermits, attendanceReports, exitRecords, customForms, 
        formSubmissions, disciplinaryRecords, employeeDocuments, auditLogs, payrollSettings, companyProfile, workingHoursSettings, 
        overtimeSettings, notificationSettings, businessProfile, inventory, suppliers, salesHistory, heldSales,
        applicants, jobPositions, expenseClaims, reportLogs, holidays,
        documentReminders, workPermitReminders, employeeDocumentReminders,
        login: async (e, p) => { 
            try {
                const { data, error } = await authDB.signIn(e, p); 
                if (error) return { success: false, message: error.message };
                if (data.session) {
                    await refreshData(data.session.user.id);
                }
                return { success: true, message: '' }; 
            } catch (err: any) {
                return { success: false, message: err.message || 'Verification rejected by registry.' };
            }
        },
        logout: () => { authDB.signOut(); setCurrentUser(null); setView('dashboard'); },
        signup: async (e, p, d) => { 
            try {
                const { data, error } = await authDB.signUp(e, p); 
                if (error) return { success: false, message: error.message };
                
                if (data.user) {
                    // ATOMIC BRANCH RESOLUTION: Fetch existing or create one to satisfy FK constraint
                    const existingBranches = await cloudDB.fetch('branches').catch(() => []);
                    let validBranchId = existingBranches.length > 0 ? existingBranches[0].id : 'main-registry';
                    
                    if (existingBranches.length === 0) {
                        try {
                            await cloudDB.upsert('branches', { id: 'main-registry', name: 'Main Branch', location: 'Maseru' });
                        } catch(e) { 
                           console.error("RLS Restriction: Branch creation failed. Ensure public branches exist."); 
                        }
                    }

                    const tempId = `EMP-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
                    const dbProfile = mapEmployeeToDb({ 
                        ...d, 
                        id: data.user.id, 
                        employeeId: tempId,
                        email: e, 
                        status: 'active', 
                        userRole: 'employee',
                        phone: '',
                        role: 'Authorized Member',
                        department: 'General Operations',
                        photoUrl: `https://ui-avatars.com/api/?name=${d.firstName}+${d.surname}&background=random`,
                        branchId: validBranchId,
                        dateOfEmployment: new Date().toISOString().split('T')[0],
                        bankName: '',
                        bankAccount: '',
                        points: 0,
                        badges: [],
                        onboardingSteps: [],
                        achievements: [],
                        trainings: [],
                        disciplinaryRecords: []
                    });
                    
                    await cloudDB.upsert('employees', dbProfile); 
                    return { success: true, message: 'Registry Established. Authentication node active.' };
                } 
                return { success: true, message: 'Registry Entry Initiated.' };
            } catch (err: any) {
                let msg = err.message || "Infrastructure Node provisioning failed.";
                if (msg.includes('foreign key constraint')) {
                   msg = "Registry Violation: Organization branches must be initialized by an administrator first.";
                }
                return { success: false, message: msg };
            }
        },
        employeeLogin: async (s, ph) => { const emp = allEmployees.find(e => e.surname.toLowerCase() === s.toLowerCase() && e.phone === ph); if (emp) { setCurrentUser(emp); return { success: true, message: '' }; } return { success: false, message: 'Not found' }; },
        changePassword: async (n) => ({ success: true, message: 'Updated' }),
        resetEmployeePassword: async (e) => {},
        updateBusinessProfile: async (p) => { await cloudDB.upsert('business_profile', { ...p, id: 1 }); await refreshData(); },
        addInventoryItem: async (i) => { await cloudDB.upsert('inventory', { ...i, id: crypto.randomUUID() }); await refreshData(); },
        updateInventoryItem: async (id, i) => { await cloudDB.upsert('inventory', { ...i, id }); await refreshData(); },
        deleteInventoryItem: async (id) => { await cloudDB.delete('inventory', id); await refreshData(); },
        addSupplier: async (s) => { await cloudDB.upsert('suppliers', { ...s, id: crypto.randomUUID() }); await refreshData(); },
        updateSupplier: async (id, s) => { await cloudDB.upsert('suppliers', { ...s, id }); await refreshData(); },
        deleteSupplier: async (id) => { await cloudDB.delete('suppliers', id); await refreshData(); },
        recordSale: async (s) => { await cloudDB.upsert('sales', { ...s, id: crypto.randomUUID(), date: new Date().toISOString() }); await refreshData(); },
        bulkAddInventoryItems: async (items) => { await cloudDB.bulkUpsert('inventory', items.map(i => ({ ...i, id: crypto.randomUUID() }))); await refreshData(); },
        holdSale: async (h) => { await cloudDB.upsert('held_sales', { ...h, id: crypto.randomUUID(), date: new Date().toISOString() }); await refreshData(); },
        deleteHeldSale: async (id) => { await cloudDB.delete('held_sales', id); await refreshData(); },
        selectedEmployeeForJourney, setSelectedEmployeeForJourney,
        preselectedEmployeeIdForReport, setPreselectedEmployeeIdForReport,
        preselectedEmployeeForAttendance, setPreselectedEmployeeForAttendance,
        selectedFormId, setSelectedFormId, activeBranchId, setActiveBranchId: (id) => activeBranchIdSet(id),
        isEmployeeModalOpen, employeeToEdit,
        openAddEmployeeModal: () => { setEmployeeToEdit(null); setIsEmployeeModalOpen(true); },
        openEditEmployeeModal: (e) => { setEmployeeToEdit(e); setIsEmployeeModalOpen(true); },
        closeEmployeeModal: () => setIsEmployeeModalOpen(false),
        isChangePasswordModalOpen, openChangePasswordModal: () => setIsChangePasswordModalOpen(true),
        closeChangePasswordModal: () => setIsChangePasswordModalOpen(false),
        isConfirmModalOpen, confirmModalContent,
        openConfirmModal: (t, m, c) => { setConfirmModalContent({ title: t, message: m, onConfirm: c }); setIsConfirmModalOpen(true); },
        closeConfirmModal: () => setIsConfirmModalOpen(false),
        isTaskModalOpen, taskToEdit, initialAssigneeIdForTaskModal,
        openAddTaskModal: (id) => { setTaskToEdit(null); setInitialAssigneeIdForTaskModal(id || null); setIsTaskModalOpen(true); },
        openTaskModal: (t) => { setTaskToEdit(t); setIsTaskModalOpen(true); },
        closeTaskModal: () => setIsTaskModalOpen(false),
        isTaskDetailPanelOpen, taskForDetailPanel,
        openTaskDetailPanel: (id) => { setTaskForDetailPanel(id); setIsTaskDetailPanelOpen(true); },
        closeTaskDetailPanel: () => setIsTaskDetailPanelOpen(false),
        isShiftModalOpen, shiftToEdit,
        openAddShiftModal: () => { setShiftToEdit(null); setIsShiftModalOpen(true); },
        openEditShiftModal: (s) => { setShiftToEdit(s); setIsShiftModalOpen(true); },
        closeShiftModal: () => setIsShiftModalOpen(false),
        isShiftAssignmentModalOpen, shiftAssignmentContext,
        openShiftAssignmentModal: (c) => { setShiftAssignmentContext(c); setIsShiftAssignmentModalOpen(true); },
        closeShiftAssignmentModal: () => setIsShiftAssignmentModalOpen(false),
        isSickLeaveModalOpen, sickLeaveModalContext,
        openSickLeaveModal: (id, d) => { setSickLeaveModalContext({ employeeId: id, date: d }); setIsSickLeaveModalOpen(true); },
        closeSickLeaveModal: () => setIsSickLeaveModalOpen(false),
        isTimeLogModalOpen, timeLogModalContext,
        openTimeLogModal: (id, d) => { setTimeLogModalContext({ employeeId: id, date: d }); setIsTimeLogModalOpen(true); },
        closeTimeLogModal: () => setIsTimeLogModalOpen(false),
        isVehicleModalOpen, vehicleToEdit,
        openVehicleModal: (v) => { setVehicleToEdit(v); setIsVehicleModalOpen(true); },
        closeVehicleModal: () => setIsVehicleModalOpen(false),
        isVehicleExpenseModalOpen, vehicleExpenseToEdit,
        openVehicleExpenseModal: (e) => { setVehicleExpenseToEdit(e); setIsVehicleExpenseModalOpen(true); },
        closeVehicleExpenseModal: () => setIsVehicleExpenseModalOpen(false),
        isDocumentModalOpen, documentModalVehicleId,
        openDocumentModal: (id) => { setDocumentModalVehicleId(id); setIsDocumentModalOpen(true); },
        closeDocumentModal: () => setIsDocumentModalOpen(false),
        isWorkPermitModalOpen, workPermitToEdit,
        openWorkPermitModal: (p) => { setWorkPermitToEdit(p); setIsWorkPermitModalOpen(true); },
        closeWorkPermitModal: () => setIsWorkPermitModalOpen(false),
        isBusinessLicenseModalOpen, businessLicenseToEdit,
        openBusinessLicenseModal: (l) => { setBusinessLicenseToEdit(l); setIsBusinessLicenseModalOpen(true); },
        closeBusinessLicenseModal: () => setIsBusinessLicenseModalOpen(false),
        isCarModalOpen, carToEdit,
        openCarModal: (c) => { setCarToEdit(c); setIsCarModalOpen(true); },
        closeCarModal: () => setIsCarModalOpen(false),
        isBackupRestoreModalOpen, openBackupRestoreModal: () => setIsBackupRestoreModalOpen(true),
        closeBackupRestoreModal: () => setIsBackupRestoreModalOpen(false),
        isApplicantModalOpen, applicantToEdit,
        openApplicantModal: (a) => { setApplicantToEdit(a || null); setIsApplicantModalOpen(true); },
        closeApplicantModal: () => setIsApplicantModalOpen(false),
        isJobPositionModalOpen, jobPositionToEdit,
        openJobPositionModal: (p) => { setJobPositionToEdit(p); setIsJobPositionModalOpen(true); },
        closeJobPositionModal: () => setIsJobPositionModalOpen(false),
        isExpenseModalOpen, expenseToEdit,
        openExpenseModal: (e) => { setExpenseToEdit(e); setIsExpenseModalOpen(true); },
        closeExpenseModal: () => setIsExpenseModalOpen(false),
        isDocumentCenterModalOpen, documentToEdit,
        openDocumentCenterModal: (d) => { setDocumentToEdit(d); setIsDocumentCenterModalOpen(true); },
        closeDocumentCenterModal: () => setIsDocumentCenterModalOpen(false),
        isSignatureModalOpen, documentToSignId,
        openSignatureModal: (docId) => { setDocumentToSignId(docId); setIsSignatureModalOpen(true); },
        closeSignatureModal: () => setIsSignatureModalOpen(false),
        isJourneyEventModalOpen, journeyEventContext,
        openJourneyEventModal: (id, t) => { setJourneyEventContext({ employeeId: id, type: t }); setIsJourneyEventModalOpen(true); },
        closeJourneyEventModal: () => setIsJourneyEventModalOpen(false),
        isDisciplinaryModalOpen, disciplinaryModalContext, disciplinaryRecordToEdit,
        openDisciplinaryModal: (id, r) => { setDisciplinaryModalContext({ employeeId: id }); setDisciplinaryRecordToEdit(r || null); setIsDisciplinaryModalOpen(true); },
        closeDisciplinaryModal: () => setIsDisciplinaryModalOpen(false),
        isDisciplinaryUpdateModalOpen, disciplinaryUpdateContext,
        openDisciplinaryUpdateModal: (id, rid) => { setDisciplinaryUpdateContext({ employeeId: id, recordId: rid }); setIsDisciplinaryUpdateModalOpen(true); },
        closeDisciplinaryUpdateModal: () => setIsDisciplinaryUpdateModalOpen(false),
        isAttendancePreselectionModalOpen, preselectionModalContext,
        openAttendancePreselectionModal: (id) => { setPreselectionModalContext({ employeeId: id }); setIsAttendancePreselectionModalOpen(true); },
        closeAttendancePreselectionModal: () => setIsAttendancePreselectionModalOpen(false),
        isGlobalSearchOpen, openGlobalSearch: () => setIsGlobalSearchOpen(true),
        closeGlobalSearch: () => setIsGlobalSearchOpen(false),
        isSettingsMenuOpen, openSettingsMenu: () => setIsSettingsMenuOpen(true),
        closeSettingsMenu: () => setIsSettingsMenuOpen(false),
        isRequestSubmittedModalOpen, requestSubmittedModalContent,
        openRequestSubmittedModal: (t, m) => { setRequestSubmittedModalContent({ title: t, message: m }); setIsRequestSubmittedModalOpen(true); },
        closeRequestSubmittedModal: () => setIsRequestSubmittedModalOpen(false),
        isPayslipModalOpen, payslipData,
        openPayslipModal: (d) => { setPayslipData(d); setIsPayslipModalOpen(true); },
        closePayslipModal: () => setIsPayslipModalOpen(false),
        refreshData,
        addEmployee: async (e) => { await cloudDB.upsert('employees', mapEmployeeToDb({ ...e, id: crypto.randomUUID() })); await refreshData(); },
        updateEmployee: async (id, e) => { await cloudDB.upsert('employees', mapEmployeeToDb({ ...e, id })); await refreshData(); },
        deleteEmployee: async (id) => { await cloudDB.delete('employees', id); await refreshData(); },
        updateAttendance: async (id, d, s, det) => { 
            await cloudDB.upsert('attendance_records', { 
                id: `${id}-${d}`, 
                employee_id: id, 
                date: d, 
                status: s, 
                check_in_time: det?.checkInTime, 
                check_out_time: det?.checkOutTime, 
                overtime_hours: det?.overtimeHours, 
                notes: det?.notes,
                updated_at: new Date().toISOString()
            }); 
            await refreshData(); 
        },
        checkIn: async (id) => { await cloudDB.upsert('attendance_records', { employee_id: id, date: new Date().toISOString().split('T')[0], status: AttendanceStatus.Present, check_in_time: new Date().toLocaleTimeString(), id: `${id}-${new Date().toISOString().split('T')[0]}`, updated_at: new Date().toISOString() }); await refreshData(); },
        checkOut: async (id) => { await cloudDB.upsert('attendance_records', { employee_id: id, date: new Date().toISOString().split('T')[0], status: AttendanceStatus.Present, check_out_time: new Date().toLocaleTimeString(), id: `${id}-${new Date().toISOString().split('T')[0]}`, updated_at: new Date().toISOString() }); await refreshData(); },
        bulkUpdateAttendance: async (ids, s, e, st, o) => { for(const id of ids) await cloudDB.upsert('attendance_records', { employee_id: id, date: s, status: st, id: `${id}-${s}`, updated_at: new Date().toISOString() }); await refreshData(); },
        addLeaveRequest: async (r) => { await cloudDB.upsert('leave_requests', { employee_id: r.employeeId, start_date: r.startDate, end_date: r.endDate, reason: r.reason, type: r.type, status: 'pending' }); await refreshData(); },
        updateLeaveRequestStatus: async (id, s) => { await cloudDB.upsert('leave_requests', { id, status: s }); await refreshData(); },
        addAnnouncement: async (a) => { await cloudDB.upsert('announcements', { ...a, id: crypto.randomUUID(), date: new Date().toISOString().split('T')[0] }); await refreshData(); },
        addTask: async (t) => { await cloudDB.upsert('tasks', { ...t, id: crypto.randomUUID() }); await refreshData(); },
        updateTask: async (id, task) => { await cloudDB.upsert('tasks', { ...task, id }); await refreshData(); },
        deleteTask: async (id) => { await cloudDB.delete('tasks', id); await refreshData(); },
        addShift: async (s) => { await cloudDB.upsert('shifts', { ...s, id: crypto.randomUUID() }); await refreshData(); },
        updateShift: async (id, s) => { await cloudDB.upsert('shifts', { ...s, id }); await refreshData(); },
        deleteShift: async (id) => { await cloudDB.delete('shifts', id); await refreshData(); },
        assignOrUpdateShift: async (a) => { await cloudDB.upsert('shift_assignments', { ...a, id: `${a.employeeId}-${a.date}` }); await refreshData(); },
        unassignShift: async (id) => { await cloudDB.delete('shift_assignments', id); await refreshData(); },
        calculateEmployeePayroll,
        generatePayroll: async (y, m) => { const records: PayrollRecord[] = []; allEmployees.forEach(emp => { if (emp.status === 'active' && emp.monthlySalary) { const rec = calculateEmployeePayroll(emp.id, y, m); if (rec) records.push(rec); } }); await cloudDB.bulkUpsert('payroll_history', records); await refreshData(); },
        lockPayrollRecord: async (id) => { await cloudDB.upsert('payroll_history', { id, isLocked: true, lockedAt: new Date().toISOString() }); await refreshData(); },
        lockAllPayrollRecordsForMonth: async (year: number, month: number) => {
            const recordsToLock = payrollHistory.filter(r => r.year === year && r.month === month && !r.isLocked);
            if (recordsToLock.length === 0) return;
            const updated = recordsToLock.map(r => ({ ...r, isLocked: true, lockedAt: new Date().toISOString() }));
            await cloudDB.bulkUpsert('payroll_history', updated);
            await refreshData();
        },
        updatePayrollSettings: async (s) => { await cloudDB.upsert('payroll_settings', { ...s, id: 1 }); await refreshData(); },
        updateCompanyProfile: async (p) => { await cloudDB.upsert('company_profile', { ...p, id: 1 }); await refreshData(); },
        updateWorkingHoursSettings: async (s) => { await cloudDB.upsert('working_hours_settings', { ...s, id: 1 }); await refreshData(); },
        updateNotificationSettings: async (s) => { await cloudDB.upsert('notification_settings', { ...s, id: 1 }); await refreshData(); },
        addVehicle: async (v) => { await cloudDB.upsert('vehicles', { ...v, id: crypto.randomUUID() }); await refreshData(); },
        updateVehicle: async (id, v) => { await cloudDB.upsert('vehicles', { ...v, id }); await refreshData(); },
        deleteVehicle: async (id) => { await cloudDB.delete('employees', id); await refreshData(); },
        addDocument: async (d) => { await cloudDB.upsert('vehicle_documents', { ...d, id: crypto.randomUUID() }); await refreshData(); },
        updateDocument: async (id, d) => { await cloudDB.upsert('vehicle_documents', { ...d, id }); await refreshData(); },
        addCar: async (c) => { await cloudDB.upsert('cars', { ...c, id: crypto.randomUUID() }); await refreshData(); },
        updateCar: async (id, c) => { await cloudDB.upsert('cars', { ...c, id }); await refreshData(); },
        deleteCar: async (id) => { await cloudDB.delete('cars', id); await refreshData(); },
        addVehiclePermit: async (p) => { await cloudDB.upsert('vehicle_permits', { ...p, id: crypto.randomUUID() }); await refreshData(); },
        updateVehiclePermit: async (id, p) => { await cloudDB.upsert('vehicle_permits', { ...p, id }); await refreshData(); },
        deleteVehiclePermit: async (id) => { await cloudDB.delete('vehicle_permits', id); await refreshData(); },
        addVehicleExpense: async (e) => { await cloudDB.upsert('vehicle_expenses', { ...e, id: crypto.randomUUID() }); await refreshData(); },
        updateVehicleExpense: async (id, e) => { await cloudDB.upsert('vehicle_expenses', { ...e, id }); await refreshData(); },
        deleteVehicleExpense: async (id) => { await cloudDB.delete('vehicle_expenses', id); await refreshData(); },
        addWorkPermit: async (p) => { await cloudDB.upsert('work_permits', { ...p, id: crypto.randomUUID() }); await refreshData(); },
        updateWorkPermit: async (id, p) => { await cloudDB.upsert('work_permits', { ...p, id }); await refreshData(); },
        deleteWorkPermit: async (id) => { await cloudDB.delete('work_permits', id); await refreshData(); },
        addBusinessLicense: async (l) => { await cloudDB.upsert('business_licenses', { ...l, id: crypto.randomUUID() }); await refreshData(); },
        updateBusinessLicense: async (id, l) => { await cloudDB.upsert('business_licenses', { ...l, id }); await refreshData(); },
        deleteBusinessLicense: async (id) => { await cloudDB.delete('business_licenses', id); await refreshData(); },
        addJobPosition: async (p) => { await cloudDB.upsert('job_positions', { ...p, id: crypto.randomUUID() }); await refreshData(); },
        updateJobPosition: async (id, p) => { await cloudDB.upsert('job_positions', { ...p, id }); await refreshData(); },
        deleteJobPosition: async (id) => { await cloudDB.delete('job_positions', id); await refreshData(); },
        addApplicant: async (a) => { await cloudDB.upsert('applicants', { ...a, id: crypto.randomUUID() }); await refreshData(); },
        updateApplicant: async (id, a) => { await cloudDB.upsert('applicants', { ...a, id }); await refreshData(); },
        deleteApplicant: async (id) => { await cloudDB.delete('applicants', id); await refreshData(); },
        updateExpenseClaimStatus: async (id, status) => { await cloudDB.upsert('expense_claims', { id, status }); await refreshData(); },
        addExpenseClaim: async (e) => { await cloudDB.upsert('expense_claims', { ...e, id: crypto.randomUUID(), status: 'pending' }); await refreshData(); },
        addJourneyEvent: async (empId, type, data) => { await cloudDB.upsert('journey_events', { ...data, employee_id: empId, type, id: crypto.randomUUID() }); await refreshData(); },
        addDisciplinaryRecord: async (empId, record) => { await cloudDB.upsert('disciplinary_records', { ...record, employee_id: empId, id: crypto.randomUUID() }); await refreshData(); },
        addDisciplinaryUpdate: async (empId, recordId, update) => {
            const record = disciplinaryRecords.find(r => r.id === recordId);
            if (record) {
                const updated = { ...record, updates: [...(record.updates || []), update] };
                await cloudDB.upsert('disciplinary_records', updated);
                await refreshData();
            }
        },
        addExitRecord: async (r) => { await cloudDB.upsert('exit_records', { ...r, id: crypto.randomUUID(), status: 'initiated' }); await refreshData(); },
        updateExitRecord: async (id, r) => { await cloudDB.upsert('exit_records', { ...r, id }); await refreshData(); },
        addCustomForm: async (f) => { await cloudDB.upsert('custom_forms', { ...f, id: crypto.randomUUID() }); await refreshData(); },
        updateCustomForm: async (id, f) => { await cloudDB.upsert('custom_forms', { ...f, id }); await refreshData(); },
        deleteCustomForm: async (id) => { await cloudDB.delete('custom_forms', id); await refreshData(); },
        addFormSubmission: async (s) => { await cloudDB.upsert('form_submissions', { ...s, id: crypto.randomUUID(), submitted_at: new Date().toISOString() }); await refreshData(); },
        addEmployeeDocument: async (d) => { await cloudDB.upsert('employee_documents', { ...d, id: crypto.randomUUID() }); await refreshData(); },
        updateEmployeeDocument: async (id, d) => { await cloudDB.upsert('employee_documents', { ...d, id }); await refreshData(); },
        signDocument: async (id, signature) => { await cloudDB.upsert('employee_documents', { id, signature }); await refreshData(); },
        processBiometricData: async (data) => { return { createdCount: 0, updatedCount: 0, skippedCount: 0, errorCount: 0, errors: [] }; },
        bulkGenerateReports: async (year, month) => { await refreshData(); },
        bulkSendReports: async (year, month) => { await refreshData(); },
        sendReport: async (id) => { await refreshData(); },
        generateMonthlyReport: async (empId, year, month) => { await refreshData(); },
        restoreData: async (data) => { await refreshData(); },
        dismissDocumentReminder: (id) => setDocumentReminders(prev => prev.filter(r => r.id !== id)),
        dismissWorkPermitReminder: (id) => setWorkPermitReminders(prev => prev.filter(r => r.id !== id)),
        dismissEmployeeDocumentReminder: (id) => setEmployeeDocumentReminders(prev => prev.filter(r => r.id !== id)),
        openVehicleDetail: (id) => setView('permits'),
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};