
import Dexie, { type Table } from 'dexie';
import type {
    Employee, AttendanceRecord, LeaveRequest, Announcement, Holiday, AuditLog, Task,
    Shift, ShiftAssignment, CompanyProfile, ThemeSettings, PayrollRecord, Vehicle, VehicleDocument,
    VehicleExpense, WorkPermit, WorkingHoursSettings, NotificationSettings, OvertimeSettings, Branch,
    EmployeeDocument, ExpenseClaim, CustomForm, FormSubmission, Applicant, JourneyEvent, BusinessLicense, Car,
    JobPosition,
    DisciplinaryRecord,
    PayrollInput,
    ExitRecord,
    VehiclePermit,
    PayrollSettings,
    AttendanceReport,
    ReportLog
} from '../types';

export class MySubClassedDexie extends Dexie {
    employees!: Table<Employee, string>;
    attendanceRecords!: Table<AttendanceRecord, string>;
    leaveRequests!: Table<LeaveRequest, string>;
    announcements!: Table<Announcement, string>;
    holidays!: Table<Holiday, string>;
    auditLogs!: Table<AuditLog, string>;
    tasks!: Table<Task, string>;
    shifts!: Table<Shift, string>;
    shiftAssignments!: Table<ShiftAssignment, string>;
    companyProfile!: Table<CompanyProfile, number>;
    themeSettings!: Table<ThemeSettings, number>;
    workingHoursSettings!: Table<WorkingHoursSettings, number>;
    notificationSettings!: Table<NotificationSettings, number>;
    overtimeSettings!: Table<OvertimeSettings, number>;
    branches!: Table<Branch, string>;
    payrollHistory!: Table<PayrollRecord, string>;
    vehicles!: Table<Vehicle, string>;
    vehicleDocuments!: Table<VehicleDocument, string>;
    vehicleExpenses!: Table<VehicleExpense, string>;
    workPermits!: Table<WorkPermit, string>;
    businessLicenses!: Table<BusinessLicense, string>;
    employeeDocuments!: Table<EmployeeDocument, string>;
    disciplinaryRecords!: Table<DisciplinaryRecord, string>;
    expenseClaims!: Table<ExpenseClaim, string>;
    customForms!: Table<CustomForm, string>;
    formSubmissions!: Table<FormSubmission, string>;
    applicants!: Table<Applicant, string>;
    journeyEvents!: Table<JourneyEvent, string>;
    cars!: Table<Car, string>;
    vehiclePermits!: Table<VehiclePermit, string>;
    jobPositions!: Table<JobPosition, string>;
    payrollInputs!: Table<PayrollInput, string>;
    payrollSettings!: Table<PayrollSettings, number>;
    exitRecords!: Table<ExitRecord, string>;
    attendanceReports!: Table<AttendanceReport, string>;
    reportLogs!: Table<ReportLog, string>;

    constructor() {
        super('nattyDB');
        (this as Dexie).version(9).stores({ // Incremented version
            employees: 'id, employeeId, department, status, userRole, authUid, email, surname',
            attendanceRecords: 'id, [employeeId+date]',
            leaveRequests: 'id, employeeId, status',
            announcements: 'id, date',
            holidays: 'id, date',
            auditLogs: 'id, timestamp',
            tasks: 'id, assigneeId, status, dueDate',
            shifts: 'id, name',
            shiftAssignments: 'id, [employeeId+date]',
            companyProfile: 'id',
            themeSettings: 'id',
            workingHoursSettings: 'id',
            notificationSettings: 'id',
            overtimeSettings: 'id',
            branches: 'id, name',
            payrollHistory: 'id, [employeeId+year+month]',
            vehicles: 'id, plateNumber, department',
            vehicleDocuments: 'id, vehicleId, renewalDate',
            vehicleExpenses: 'id, vehicleId, date',
            workPermits: 'id, employeeId, expiryDate',
            businessLicenses: 'id, licenseName, expiryDate',
            employeeDocuments: 'id, employeeId, category',
            disciplinaryRecords: 'id, employeeId, incidentDate',
            expenseClaims: 'id, employeeId, date, status',
            customForms: 'id, title',
            formSubmissions: 'id, formId, employeeId',
            applicants: 'id, status, position',
            journeyEvents: 'id, employeeId, date, type',
            cars: 'id, name',
            vehiclePermits: 'id, carId, expiryDate',
            jobPositions: 'id, title, status, department',
            payrollInputs: 'id, [employeeId+year+month]',
            payrollSettings: 'id',
            exitRecords: 'id, employeeId, exitDate, status',
            attendanceReports: 'id, [employeeId+year+month], status',
            reportLogs: 'id, reportId, timestamp',
        });
    }
}

export const db = new MySubClassedDexie();
