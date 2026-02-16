import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { AttendanceStatus, Employee } from '../types';
import { DocumentTextIcon, CalculatorIcon, PrinterIcon } from './icons';
import { useI18n } from '../hooks/useI18n';


const toYYYYMMDD = (date: Date): string => date.toISOString().split('T')[0];
const parseTime = (timeStr: string): number => {
    if (!timeStr) return NaN;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

const formatCurrency = (amount: number) => {
    if (isNaN(amount)) return `M 0.00`;
    return `M ${amount.toFixed(2)}`;
};

interface ReportRow {
    employeeId: string;
    employeeName: string;
    totalLateMinutes: number;
    totalOvertimeHours: number;
    lateDeduction: number;
    overtimePay: number;
}


const PolicyReports: React.FC = () => {
    const { employees, attendanceRecords, workingHoursSettings, overtimeSettings, holidays } = useAppContext();
    const { t } = useI18n();
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const [startDate, setStartDate] = useState(toYYYYMMDD(startOfMonth));
    const [endDate, setEndDate] = useState(toYYYYMMDD(today));
    const [reportData, setReportData] = useState<ReportRow[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateReport = () => {
        setIsLoading(true);

        setTimeout(() => { // Simulate processing
            const report: ReportRow[] = [];
            const employeeMap = new Map(employees.map(e => [e.id, e]));
            
            const recordsInPeriod = attendanceRecords.filter(r => r.date >= startDate && r.date <= endDate);
            
            const employeeReports: Record<string, Omit<ReportRow, 'employeeId' | 'employeeName'>> = {};

            recordsInPeriod.forEach(record => {
                const employee = employeeMap.get(record.employeeId) as Employee | undefined;
                if (!employee || employee.userRole !== 'employee' || !employee.monthlySalary) return;

                if (!employeeReports[employee.id]) {
                    employeeReports[employee.id] = { totalLateMinutes: 0, totalOvertimeHours: 0, lateDeduction: 0, overtimePay: 0 };
                }

                if (!record.checkInTime || !record.checkOutTime) return;

                const normalDailyHours = overtimeSettings.normalHoursPerWeek / (workingHoursSettings.workingDays.length || 5);
                const hourlyRate = (employee.monthlySalary / overtimeSettings.averageWorkDaysPerMonth) / normalDailyHours;

                const date = new Date(record.date + 'T12:00:00Z');
                const dayOfWeek = date.getUTCDay();
                const isHoliday = holidays.some(h => h.date === record.date);
                const isWorkDay = workingHoursSettings.workingDays.includes(dayOfWeek);

                // Late deduction
                if (isWorkDay && !isHoliday) {
                    const expectedClockInMinutes = parseTime(workingHoursSettings.startTime);
                    const actualClockInMinutes = parseTime(record.checkInTime);
                    if (actualClockInMinutes > expectedClockInMinutes) {
                        const lateMinutes = actualClockInMinutes - expectedClockInMinutes;
                        employeeReports[employee.id].totalLateMinutes += lateMinutes;
                        employeeReports[employee.id].lateDeduction += (lateMinutes / 60) * hourlyRate;
                    }
                }

                // Overtime
                const workedMinutes = parseTime(record.checkOutTime) - parseTime(record.checkInTime) - (record.lunchBreakMinutes || 0);
                const workedHours = workedMinutes / 60;
                
                if (isHoliday || dayOfWeek === 0) { // All hours on Holiday/Sunday are overtime
                     const otHours = workedHours;
                     employeeReports[employee.id].totalOvertimeHours += otHours;
                     employeeReports[employee.id].overtimePay += otHours * hourlyRate * overtimeSettings.holidayMultiplier;
                } else if (isWorkDay) {
                    const overtimeHours = Math.max(0, workedHours - normalDailyHours);
                    if (overtimeHours > 0) {
                        employeeReports[employee.id].totalOvertimeHours += overtimeHours;
                        employeeReports[employee.id].overtimePay += overtimeHours * hourlyRate * overtimeSettings.overtimeMultiplier;
                    }
                }
            });

            for (const empId in employeeReports) {
                const employee = employeeMap.get(empId) as Employee | undefined;
                if (employee) {
                    report.push({
                        employeeId: empId,
                        employeeName: `${employee.firstName} ${employee.surname}`,
                        ...employeeReports[empId]
                    });
                }
            }

            setReportData(report.sort((a,b) => a.employeeName.localeCompare(b.employeeName)));
            setIsLoading(false);
        }, 500);
    };
    
    const totals = useMemo(() => {
        if (!reportData) return { lateDeduction: 0, overtimePay: 0 };
        return reportData.reduce((acc, row) => ({
            lateDeduction: acc.lateDeduction + row.lateDeduction,
            overtimePay: acc.overtimePay + row.overtimePay,
        }), { lateDeduction: 0, overtimePay: 0 });
    }, [reportData]);
    
    const handlePrint = () => window.print();

    return (
         <div className="container mx-auto animate-fadeIn space-y-6">
            <style>{`.input-field { background-color: #f9fafb; border: 1px solid #d1d5db; border-radius: 0.375rem; padding: 0.5rem 0.75rem; } .dark .input-field { background-color: #334155; border-color: #475569; }`}</style>
             <h1 className="text-3xl font-bold">{t('policy_reports.title')}</h1>

             <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 p-6 rounded-lg shadow-lg space-y-4 no-print">
                <h2 className="text-xl font-bold">{t('policy_reports.filters.title')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div><label htmlFor="startDate" className="block text-sm font-medium">{t('policy_reports.filters.start_date')}</label><input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full mt-1 input-field" /></div>
                    <div><label htmlFor="endDate" className="block text-sm font-medium">{t('policy_reports.filters.end_date')}</label><input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full mt-1 input-field" /></div>
                    <button onClick={handleGenerateReport} disabled={isLoading} className="w-full px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 h-11">{isLoading ? t('policy_reports.generating') : t('policy_reports.generate_button')}</button>
                </div>
             </div>

             {isLoading && <div className="text-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div></div>}

             {!isLoading && !reportData && (
                <div className="text-center p-16 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
                    <CalculatorIcon className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold">{t('policy_reports.results.placeholder_title')}</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">{t('policy_reports.results.placeholder_description')}</p>
                </div>
            )}
            
            {!isLoading && reportData && (
                 <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 rounded-lg shadow-lg printable-area">
                    <div className="p-4 flex justify-between items-center border-b dark:border-slate-700">
                        <div>
                            <h2 className="text-xl font-bold print-title">{t('policy_reports.results.report_title')}</h2>
                            <p className="text-sm text-slate-500 print-title">{startDate} to {endDate}</p>
                        </div>
                        <button onClick={handlePrint} className="flex items-center gap-2 text-sm px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 no-print"><PrinterIcon className="h-4 w-4"/> {t('common.print')}</button>
                    </div>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-xs text-slate-700 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-700/50">
                                <tr>
                                    <th className="p-3">{t('common.employee')}</th>
                                    <th className="p-3 text-right">{t('policy_reports.table.total_late')}</th>
                                    <th className="p-3 text-right">{t('policy_reports.table.late_deduction')}</th>
                                    <th className="p-3 text-right">{t('policy_reports.table.total_overtime')}</th>
                                    <th className="p-3 text-right">{t('policy_reports.table.overtime_pay')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {reportData.map(row => (
                                    <tr key={row.employeeId}>
                                        <td className="p-3 font-medium">{row.employeeName}</td>
                                        <td className="p-3 text-right">{Math.round(row.totalLateMinutes)} min</td>
                                        <td className="p-3 text-right text-red-600 dark:text-red-400">{formatCurrency(row.lateDeduction)}</td>
                                        <td className="p-3 text-right">{row.totalOvertimeHours.toFixed(2)} hrs</td>
                                        <td className="p-3 text-right text-green-600 dark:text-green-400">{formatCurrency(row.overtimePay)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-slate-100 dark:bg-slate-900 font-bold border-t-2 dark:border-slate-600">
                                <tr>
                                    <td className="p-3">{t('common.totals')}</td>
                                    <td colSpan={1}></td>
                                    <td className="p-3 text-right">{formatCurrency(totals.lateDeduction)}</td>
                                    <td colSpan={1}></td>
                                    <td className="p-3 text-right">{formatCurrency(totals.overtimePay)}</td>
                                </tr>
                            </tfoot>
                        </table>
                     </div>
                </div>
            )}
         </div>
    );
};

export default PolicyReports;
