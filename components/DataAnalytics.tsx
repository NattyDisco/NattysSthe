import React, { useState, useMemo, useCallback } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { AttendanceStatus } from '../types';
import { ATTENDANCE_STATUS_DETAILS } from '../constants';
import { BrainCircuitIcon } from './icons';
import { generateDataAnalytics } from '../services/geminiService';
import { DonutChart, LineChart, BarChart } from './charts';
import { useI18n } from '../hooks/useI18n';

const toYYYYMMDD = (date: Date): string => date.toISOString().split('T')[0];

const AnalyticsCard: React.FC<{ title: string; children: React.ReactNode; className?: string; }> = ({ title, children, className = '' }) => (
    <div className={`bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 animate-fadeIn border border-white/30 ${className}`}>
        <h2 className="text-lg sm:text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">{title}</h2>
        {children}
    </div>
);

const DataAnalytics: React.FC = () => {
    const { employees, attendanceRecords } = useAppContext();
    const { t } = useI18n();
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [startDate, setStartDate] = useState(toYYYYMMDD(startOfMonth));
    const [endDate, setEndDate] = useState(toYYYYMMDD(today));
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [selectedEmployee, setSelectedEmployee] = useState('all');
    const [aiInsights, setAiInsights] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const departments = useMemo(() => ['all', ...Array.from(new Set(employees.map(e => e.department)))], [employees]);
    
    const { filteredRecords, overviewData, trendData, employeeData, filteredEmployees } = useMemo(() => {
        let visibleEmployees = employees.filter(e => e.userRole === 'employee');
        if (selectedDepartment !== 'all') {
            visibleEmployees = visibleEmployees.filter(e => e.department === selectedDepartment);
        }
        if (selectedEmployee !== 'all') {
            // FIX: Removed parseInt as employee ID is a string.
            visibleEmployees = visibleEmployees.filter(e => e.id === selectedEmployee);
        }
        const visibleEmployeeIds = new Set(visibleEmployees.map(e => e.id));

        const records = attendanceRecords.filter(r => 
            r.date >= startDate && r.date <= endDate && visibleEmployeeIds.has(r.employeeId)
        );
        
        const overview: Record<string, number> = { P: 0, A: 0, L: 0, S: 0, R: 0, O: 0 };
        records.forEach(r => {
            if (overview.hasOwnProperty(r.status)) {
                overview[r.status]++;
            }
        });
        
        const statusColors: { [key in AttendanceStatus]?: string } = {
            [AttendanceStatus.Present]: '#22c55e',
            [AttendanceStatus.Absent]: '#ef4444',
            [AttendanceStatus.Leave]: '#3b82f6',
            [AttendanceStatus.Sick]: '#f97316',
            [AttendanceStatus.Remote]: '#14b8a6',
            [AttendanceStatus.Off]: '#a1a1aa',
        };

        const overviewChartData = Object.entries(overview).map(([status, count]) => ({
            label: t(ATTENDANCE_STATUS_DETAILS[status as AttendanceStatus]?.label || 'Unknown'),
            value: count,
            color: statusColors[status as AttendanceStatus] || '#6b7280',
        }));

        const dateMap: Record<string, number> = {};
        let currentDate = new Date(startDate);
        const end = new Date(endDate);
        while (currentDate <= end) {
            dateMap[toYYYYMMDD(currentDate)] = 0;
            currentDate.setDate(currentDate.getDate() + 1);
        }
        records.forEach(r => {
            if (r.status === AttendanceStatus.Present && dateMap.hasOwnProperty(r.date)) {
                dateMap[r.date]++;
            }
        });
        const trendChartData = Object.entries(dateMap).map(([date, count]) => ({
            label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: count,
        }));

        const employeeStats: Record<string, { present: number, name: string }> = {};
        visibleEmployees.forEach(emp => {
            employeeStats[emp.id] = { present: 0, name: `${emp.firstName} ${emp.surname.charAt(0)}.` };
        });
        records.forEach(r => {
            if (r.status === AttendanceStatus.Present && employeeStats[r.employeeId]) {
                employeeStats[r.employeeId].present++;
            }
        });
        const employeeChartData = Object.values(employeeStats).map(stat => ({
            label: stat.name,
            value: stat.present,
            color: '#14b8a6' // teal
        })).sort((a, b) => b.value - a.value);


        return { filteredRecords: records, overviewData: overviewChartData, trendData: trendChartData, employeeData: employeeChartData, filteredEmployees: visibleEmployees };
    }, [startDate, endDate, selectedDepartment, selectedEmployee, attendanceRecords, employees, t]);

    const handleGenerateInsights = useCallback(async () => {
        setIsLoading(true);
        setAiInsights('');
        try {
            const result = await generateDataAnalytics(filteredEmployees, filteredRecords, startDate, endDate, t);
            setAiInsights(result);
        } catch (error) {
            setAiInsights(t('data_analytics.ai.error_message'));
        } finally {
            setIsLoading(false);
        }
    }, [filteredEmployees, filteredRecords, startDate, endDate, t]);

    return (
        <div className="container mx-auto animate-fadeIn space-y-6">
            <h1 className="text-3xl font-bold">{t('sidebar.data_analytics')}</h1>

            <AnalyticsCard title={t('data_analytics.filters.title')}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium">{t('data_analytics.filters.start_date')}</label>
                        <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium">{t('data_analytics.filters.end_date')}</label>
                        <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                    </div>
                    <div>
                        <label htmlFor="department" className="block text-sm font-medium">{t('data_analytics.filters.department')}</label>
                        <select id="department" value={selectedDepartment} onChange={e => {setSelectedDepartment(e.target.value); setSelectedEmployee('all');}} className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600">
                            {departments.map(dep => <option key={dep} value={dep}>{dep === 'all' ? t('data_analytics.filters.all_departments') : dep}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="employee" className="block text-sm font-medium">{t('common.employee')}</label>
                        <select id="employee" value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" disabled={selectedDepartment === 'all' && employees.length > 20}>
                             <option value="all">{t('data_analytics.filters.all_employees')}</option>
                             {employees.filter(e => selectedDepartment === 'all' || e.department === selectedDepartment).map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.firstName} {emp.surname}</option>
                             ))}
                        </select>
                    </div>
                </div>
            </AnalyticsCard>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <AnalyticsCard title={t('data_analytics.charts.distribution_title')} className="lg:col-span-1">
                    <div className="h-64 flex flex-col justify-center">
                       <DonutChart data={overviewData} />
                       <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-4 text-xs">
                           {overviewData.filter(item => item.value > 0).map(item => (
                               <div key={item.label} className="flex items-center gap-2">
                                   <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }}></span>
                                   <span>{item.label} ({item.value})</span>
                               </div>
                           ))}
                       </div>
                    </div>
                </AnalyticsCard>
                <AnalyticsCard title={t('data_analytics.charts.top_performers_title')} className="lg:col-span-2">
                    <BarChart data={employeeData.slice(0, 15)} height="h-72" />
                </AnalyticsCard>
            </div>

            <AnalyticsCard title={t('data_analytics.charts.trend_title')}>
                <LineChart data={trendData} color="#4f46e5" />
            </AnalyticsCard>

            <div className="bg-indigo-50/70 dark:bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/30 border-l-4 border-indigo-500">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                        <h2 className="text-2xl font-bold mb-2 flex items-center">
                            <BrainCircuitIcon className="h-6 w-6 text-indigo-500 mr-2" />
                            {t('data_analytics.ai.title')}
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{t('data_analytics.ai.description')}</p>
                    </div>
                    <button onClick={handleGenerateInsights} disabled={isLoading} className="flex-shrink-0 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors">
                        {isLoading ? t('data_analytics.ai.loading') : t('data_analytics.ai.button')}
                    </button>
                </div>
                { (isLoading || aiInsights) && (
                    <div className="mt-4 border-t border-indigo-200 dark:border-slate-700 pt-4">
                         {isLoading && <p className="text-center italic">{t('data_analytics.ai.generating')}</p>}
                         {aiInsights && (
                            <div className="prose prose-sm sm:prose dark:prose-invert max-w-none whitespace-pre-wrap">
                                {aiInsights}
                            </div>
                         )}
                    </div>
                )}
            </div>

        </div>
    );
};

export default DataAnalytics;