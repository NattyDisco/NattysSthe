import { useMemo } from 'react';
import { LESOTHO_HOLIDAYS_2025, LEAVE_POLICIES } from '../constants';
import { LeaveType, LeaveRequest, Employee } from '../types';

export const useLeaveEngine = (employee: Employee | null, allRequests: LeaveRequest[]) => {
    
    // 1. Core Calculator: Determines working day impact
    const calculateWorkingDays = (start: string, end: string): number => {
        if (!start || !end) return 0;
        const s = new Date(start);
        const e = new Date(end);
        let count = 0;
        const cur = new Date(s.getTime());
        
        while (cur <= e) {
            const dayOfWeek = cur.getDay();
            const dateStr = cur.toISOString().split('T')[0];
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const isHoliday = LESOTHO_HOLIDAYS_2025.includes(dateStr);
            
            if (!isWeekend && !isHoliday) count++;
            cur.setDate(cur.getDate() + 1);
        }
        return count;
    };

    // 2. Entitlement Radar: Aggregates used days vs limits
    const leaveBalances = useMemo(() => {
        if (!employee) return null;
        
        const currentYear = new Date().getFullYear();
        const result: Record<LeaveType, { used: number; total: number; remaining: number }> = {} as any;

        Object.keys(LEAVE_POLICIES).forEach((key) => {
            const type = key as LeaveType;
            const policy = LEAVE_POLICIES[type];
            
            // Calculate total approved working days for this year
            const used = allRequests
                .filter(r => 
                    r.employeeId === employee.id && 
                    r.status === 'approved' && 
                    r.type === type && 
                    new Date(r.startDate).getFullYear() === currentYear
                )
                .reduce((acc, r) => acc + calculateWorkingDays(r.startDate, r.endDate), 0);
            
            // Annual leave uses the custom balance from employee profile, others use fixed policy caps
            const total = type === 'Annual' ? (employee.leaveBalance || policy.maxDaysPerYear) : policy.maxDaysPerYear;
            
            result[type] = {
                used,
                total,
                remaining: Math.max(0, total - used)
            };
        });

        return result;
    }, [employee, allRequests]);

    // 3. Global Validator
    const validateRequest = (type: LeaveType, start: string, end: string): { isValid: boolean; message: string; days: number } => {
        const days = calculateWorkingDays(start, end);
        if (days === 0) return { isValid: false, message: 'Selection contains zero working days (Holidays/Weekends only).', days: 0 };
        
        const balance = leaveBalances?.[type];
        if (!balance) return { isValid: false, message: 'Invalid balance state.', days };

        if (days > balance.remaining) {
            return { 
                isValid: false, 
                message: `Policy Violation: Requested ${days} days exceeds your available ${type} balance of ${balance.remaining} days.`,
                days 
            };
        }

        return { isValid: true, message: 'Policy Checked: Request within statutory limits.', days };
    };

    return {
        calculateWorkingDays,
        leaveBalances,
        validateRequest,
        policies: LEAVE_POLICIES
    };
};
