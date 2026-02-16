import { AttendanceStatus, LeaveType } from './types.ts';

export const ATTENDANCE_STATUS_DETAILS: { [key in AttendanceStatus]?: { key: string; label: string; color: string; bgColor: string } } = {
  [AttendanceStatus.Present]: { key: 'present', label: 'attendance_statuses.present', color: 'text-white', bgColor: 'bg-present' },
  [AttendanceStatus.Absent]: { key: 'absent', label: 'attendance_statuses.absent', color: 'text-white', bgColor: 'bg-absent' },
  [AttendanceStatus.Leave]: { key: 'leave', label: 'attendance_statuses.leave', color: 'text-white', bgColor: 'bg-leave' },
  [AttendanceStatus.Sick]: { key: 'sick', label: 'attendance_statuses.sick', color: 'text-white', bgColor: 'bg-sick' },
  [AttendanceStatus.Holiday]: { key: 'holiday', label: 'attendance_statuses.holiday', color: 'text-white', bgColor: 'bg-holiday' },
  [AttendanceStatus.Remote]: { key: 'remote work', label: 'attendance_statuses.remote', color: 'text-white', bgColor: 'bg-remote' },
  [AttendanceStatus.Weekend]: { key: 'weekend', label: 'attendance_statuses.weekend', color: 'text-white', bgColor: 'bg-weekend' },
  [AttendanceStatus.Off]: { key: 'off day', label: 'attendance_statuses.off', color: 'text-white', bgColor: 'bg-off' },
};

export const ADMIN_WHATSAPP_NUMBER = '26658008512';

// Official 2025 Public Holidays for Lesotho
export const LESOTHO_HOLIDAYS_2025 = [
  '2025-01-01', // New Year's Day
  '2025-03-11', // Moshoeshoe's Day
  '2025-04-18', // Good Friday
  '2025-04-21', // Easter Monday
  '2025-05-01', // Workers' Day
  '2025-05-29', // Ascension Day
  '2025-07-17', // King's Birthday
  '2025-10-04', // Independence Day
  '2025-12-25', // Christmas Day
  '2025-12-26', // Boxing Day
];

// LESOTHO STATUTORY LEAVE POLICY ENGINE
export interface LeavePolicyRule {
  type: LeaveType;
  maxDaysPerYear: number;
  isStatutory: boolean;
  deductsFromAnnual: boolean;
  description: string;
  color: string;
  accentColor: string;
}

export const LEAVE_POLICIES: Record<LeaveType, LeavePolicyRule> = {
  'Annual': {
    type: 'Annual',
    maxDaysPerYear: 12,
    isStatutory: true,
    deductsFromAnnual: true,
    description: 'Minimum 12 days per annum as per Lesotho Labour Code Order 1992.',
    color: 'text-indigo-600',
    accentColor: 'bg-indigo-600'
  },
  'Sick': {
    type: 'Sick',
    maxDaysPerYear: 7,
    isStatutory: true,
    deductsFromAnnual: false,
    description: 'Statutory 7 days full pay. Medical certificate required for > 2 days.',
    color: 'text-orange-600',
    accentColor: 'bg-orange-600'
  },
  'Maternity': {
    type: 'Maternity',
    maxDaysPerYear: 90,
    isStatutory: true,
    deductsFromAnnual: false,
    description: 'Statutory 12 weeks period. Usually unpaid unless per contract.',
    color: 'text-rose-600',
    accentColor: 'bg-rose-600'
  },
  'Paternity': {
    type: 'Paternity',
    maxDaysPerYear: 5,
    isStatutory: false,
    deductsFromAnnual: false,
    description: 'Company benefit for new fathers. Limited to 5 working days.',
    color: 'text-blue-600',
    accentColor: 'bg-blue-600'
  },
  'Study': {
    type: 'Study',
    maxDaysPerYear: 10,
    isStatutory: false,
    deductsFromAnnual: false,
    description: 'Allowed for examination prep and sitting with proof of registration.',
    color: 'text-teal-600',
    accentColor: 'bg-teal-600'
  },
  'Compassionate': {
    type: 'Compassionate',
    maxDaysPerYear: 3,
    isStatutory: false,
    deductsFromAnnual: false,
    description: 'Family emergency or bereavement support.',
    color: 'text-slate-600',
    accentColor: 'bg-slate-600'
  },
  'Other': {
    type: 'Other',
    maxDaysPerYear: 365,
    isStatutory: false,
    deductsFromAnnual: false,
    description: 'General category for custom Rest & Recuperation.',
    color: 'text-slate-400',
    accentColor: 'bg-slate-400'
  }
};