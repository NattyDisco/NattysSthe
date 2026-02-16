import React, { useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';

interface AnnualReportDisplayProps {
    employeeId: string | null;
}

const AnnualReportDisplay: React.FC<AnnualReportDisplayProps> = ({ employeeId }) => {
    const { employees, attendanceRecords } = useAppContext();
    const { t } = useI18n();

    const reportData = useMemo(() => {
        if (!employeeId) return null; // Or generate for all
        const employee = employees.find(e => e.id === employeeId);
        if (!employee) return null;
        
        const year = new Date().getFullYear();
        const records = attendanceRecords.filter(r => r.employeeId === employeeId && new Date(r.date).getFullYear() === year);

        // Aggregate data
        const presentDays = records.filter(r => r.status === 'P').length;
        const sickDays = records.filter(r => r.status === 'S').length;

        return {
            employeeName: `${employee.firstName} ${employee.surname}`,
            year,
            presentDays,
            sickDays
        };

    }, [employeeId, employees, attendanceRecords]);

    if (!reportData) {
        return <div className="p-4 text-center text-slate-500">{t('annual_report.select_employee')}</div>;
    }

    return (
        <div>
            <h3 className="text-2xl font-bold text-center mb-2">{t('annual_report.title')}</h3>
            <h4 className="text-xl font-semibold text-center mb-6">{reportData.employeeName} - {reportData.year}</h4>
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
                    <p className="text-3xl font-bold">{reportData.presentDays}</p>
                    <p className="text-sm text-slate-500">{t('annual_report.present_days')}</p>
                </div>
                 <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
                    <p className="text-3xl font-bold">{reportData.sickDays}</p>
                    <p className="text-sm text-slate-500">{t('annual_report.sick_days')}</p>
                </div>
            </div>
        </div>
    );
};

export default AnnualReportDisplay;
