
import type { 
    Employee, AttendanceRecord, LeaveRequest, Announcement, Holiday, AuditLog, Task, 
    Shift, Branch, CompanyProfile, ThemeSettings, WorkingHoursSettings, NotificationSettings, OvertimeSettings, ShiftAssignment, Vehicle, VehicleDocument, VehicleExpense, WorkPermit, EmployeeDocument, DisciplinaryRecord, ExpenseClaim, CustomForm, FormSubmission, Applicant, JourneyEvent, BusinessLicense,
    Car,
    JobPosition
} from '../types';
import { AttendanceStatus } from '../types';
import { db } from '../services/db';
import Dexie from 'dexie';

const today = new Date();
const toYYYYMMDD = (d: Date) => d.toISOString().split('T')[0];

const MOCK_BRANCHES: Omit<Branch, 'id'>[] = [
    { name: 'Maseru Central', location: 'Maseru' },
    { name: 'Berea North', location: 'Berea' },
];

const MOCK_EMPLOYEES: Omit<Employee, 'id'>[] = [
    { 
      employeeId: 'EMP-001', firstName: 'Alice', surname: 'Smith', email: 'admin@natty.com', phone: '12345678', role: 'Super Admin', department: 'Management', photoUrl: `https://i.pravatar.cc/150?u=EMP-001`, status: 'active', userRole: 'super-admin', leaveBalance: 15, monthlySalary: 50000, authUid: null, branchId: 'maseru-central', dateOfEmployment: '2020-01-15', onboardingSteps: [], achievements: [], trainings: [], disciplinaryRecords: [], points: 150, badges: ['Top Performer'], reportsTo: undefined
    },
    { 
      employeeId: 'EMP-002', firstName: 'Bob', surname: 'Johnson', email: 'hr@natty.com', phone: '23456789', role: 'HR Manager', department: 'Human Resources', photoUrl: `https://i.pravatar.cc/150?u=EMP-002`, status: 'active', userRole: 'HR Manager', leaveBalance: 12, monthlySalary: 35000, authUid: null, branchId: 'maseru-central', dateOfEmployment: '2021-03-20', onboardingSteps: [], achievements: [], trainings: [], disciplinaryRecords: [], points: 120, badges: [], reportsTo: undefined
    }
];

const MOCK_CARS = (): Omit<Car, 'id'>[] => {
  const expiryNear = new Date();
  expiryNear.setDate(expiryNear.getDate() + 15); // Expiring in 15 days
  return [
    { name: 'Company Van', model: 'Toyota Hiace', plateNumber: 'A 123 LS', permit: 'P-101', permitCreatedDate: '2024-01-01', permitRenewalDate: toYYYYMMDD(expiryNear) },
    { name: 'Executive Sedan', model: 'Mercedes C200', plateNumber: 'B 456 LS', permit: 'P-202', permitCreatedDate: '2023-12-01', permitRenewalDate: '2025-06-15' }
  ];
};

export const getMockData = () => {
    const branches: Branch[] = MOCK_BRANCHES.map(b => ({ ...b, id: b.name.toLowerCase().replace(' ', '-') }));
    const employees: Employee[] = MOCK_EMPLOYEES.map(e => ({...e, id: crypto.randomUUID() }));
    
    const cars = MOCK_CARS().map(c => ({ ...c, id: crypto.randomUUID() }));

    const workPermits: WorkPermit[] = [
      { id: crypto.randomUUID(), employeeId: employees[0].id, permitNumber: 'WP-778', issueDate: '2024-01-01', expiryDate: toYYYYMMDD(new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)), fileName: '', fileType: '', fileUrl: '' }
    ];

    const businessLicenses: BusinessLicense[] = [
      { id: crypto.randomUUID(), licenseName: "Health Safety License", licenseNumber: 'HS-2024', issuingAuthority: 'Ministry of Health', issueDate: '2024-01-01', expiryDate: '2025-01-01' }
    ];

    const companyProfile: CompanyProfile = { id: 1, name: 'Natty Solutions', address: '123 Main Street, Maseru', contact: 'info@natty.com', logoUrl: '' };
    const themeSettings: ThemeSettings = { id: 1, primaryColor: '#4f46e5' };
    const workingHoursSettings: WorkingHoursSettings = { id: 1, startTime: '09:00', endTime: '17:00', workingDays: [1,2,3,4,5], allowedLunchMinutes: 60 };
    const notificationSettings: NotificationSettings = { id: 1, documentExpiry: { enabled: true, daysBefore: 30 }, workPermitExpiry: { enabled: true, daysBefore: 60 } };
    const overtimeSettings: OvertimeSettings = { id: 1, normalHoursPerWeek: 40, averageWorkDaysPerMonth: 21.67, overtimeMultiplier: 1.5, holidayMultiplier: 2 };

    return {
        employees,
        branches,
        attendanceRecords: [],
        announcements: [],
        companyProfile,
        themeSettings,
        workingHoursSettings,
        notificationSettings,
        overtimeSettings,
        businessLicenses,
        tasks: [],
        cars,
        jobPositions: [],
        applicants: [],
        disciplinaryRecords: [],
        leaveRequests: [],
        holidays: [],
        auditLogs: [],
        shifts: [],
        shiftAssignments: [],
        payrollHistory: [],
        vehicles: [],
        vehicleDocuments: [],
        vehicleExpenses: [],
        workPermits,
        employeeDocuments: [],
        expenseClaims: [],
        customForms: [],
        formSubmissions: [],
        journeyEvents: [],
        exitRecords: []
    };
};

export const seedDatabase = async () => {
    try {
        const mock = getMockData();
        await (db as Dexie).transaction('rw', (db as Dexie).tables, async () => {
            await Promise.all([
                db.branches.bulkAdd(mock.branches),
                db.employees.bulkAdd(mock.employees),
                db.businessLicenses.bulkAdd(mock.businessLicenses),
                db.cars.bulkAdd(mock.cars),
                db.workPermits.bulkAdd(mock.workPermits),
                db.companyProfile.put(mock.companyProfile),
                db.themeSettings.put(mock.themeSettings),
                db.workingHoursSettings.put(mock.workingHoursSettings),
                db.notificationSettings.put(mock.notificationSettings),
                db.overtimeSettings.put(mock.overtimeSettings),
            ]);
        });
    } catch (error) {
        console.error("Failed to seed database:", error);
    }
};
