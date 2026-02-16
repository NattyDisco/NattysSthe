
import React, { useState, useMemo, useCallback } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';
import { BrainCircuitIcon, CalendarDaysIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon, TasksIcon, UserCircleIcon } from './icons';
import { generatePerformanceInsights } from '../services/geminiService';
import { AttendanceStatus } from '../types';
import { DonutChart } from './charts';
import { motion } from 'framer-motion';

// FIX: Cast motion.div to any to avoid type errors with motion props.
const MotionDiv = motion.div as any;

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; }> = ({ icon, title, value }) => (
    <div className="bg-slate-50/50 dark:bg-slate-800/50 p-4 rounded-lg flex items-center gap-4">
        <div className="p-3 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg">
          {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
        </div>
    </div>
);


const PerformanceView: React.FC = () => {
    const { employees, attendanceRecords, tasks, workingHoursSettings } = useAppContext();
    const { t } = useI18n();
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [insights, setInsights] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const [startDate, setStartDate] = useState(startOfMonth.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
    
    const parseTime = (timeStr: string): number => {
        if (!timeStr) return NaN;
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const performanceData = useMemo(() => {
        if (!selectedEmployeeId) return null;

        const employee = employees.find(e => e.id === selectedEmployeeId);
        if (!employee) return null;

        const records = attendanceRecords.filter(r => r.employeeId === selectedEmployeeId && r.date >= startDate && r.date <= endDate);
        const employeeTasks = tasks.filter(t => t.assigneeId === selectedEmployeeId && t.dueDate >= startDate && t.dueDate <= endDate);

        const presentRecords = records.filter(r => r.status === AttendanceStatus.Present || r.status === AttendanceStatus.Remote);
        const lateRecords = presentRecords.filter(r => r.checkInTime && parseTime(r.checkInTime) > parseTime(workingHoursSettings.startTime));
        
        const totalCheckInMinutes = presentRecords.reduce((acc, r) => {
            if (!r.checkInTime) return acc;
            const checkInMins = parseTime(r.checkInTime);
            return isNaN(checkInMins) ? acc : acc + checkInMins;
        }, 0);
        
        const validCheckIns = presentRecords.filter(r => r.checkInTime && !isNaN(parseTime(r.checkInTime))).length;
        const avgCheckInMinutes = validCheckIns > 0 ? totalCheckInMinutes / validCheckIns : 0;
        const avgHour = Math.floor(avgCheckInMinutes / 60);
        const avgMin = Math.round(avgCheckInMinutes % 60);
        const avgCheckInTime = isNaN(avgHour) || avgCheckInMinutes === 0 ? 'N/A' : `${String(avgHour).padStart(2, '0')}:${String(avgMin).padStart(2, '0')}`;

        const leaveDays = records.filter(r => r.status === AttendanceStatus.Leave || r.status === AttendanceStatus.Sick).length;

        const completedTasks = employeeTasks.filter(t => t.status === 'done');
        const completionRate = employeeTasks.length > 0 ? (completedTasks.length / employeeTasks.length) * 100 : 100;

        const attendanceDistribution = {
            'Present': presentRecords.length - lateRecords.length,
            'Late': lateRecords.length,
            'Leave/Sick': leaveDays,
            'Absent': records.filter(r => r.status === AttendanceStatus.Absent).length,
        };
        
        const chartData = [
            { label: 'On Time', value: attendanceDistribution['Present'], color: '#22c55e' },
            { label: 'Late', value: attendanceDistribution['Late'], color: '#f97316' },
            { label: 'Leave/Sick', value: attendanceDistribution['Leave/Sick'], color: '#3b82f6' },
            { label: 'Absent', value: attendanceDistribution['Absent'], color: '#ef4444' },
        ];


        return {
            employee,
            presentDays: presentRecords.length,
            lateArrivals: lateRecords.length,
            avgCheckInTime,
            leaveDays,
            tasksAssigned: employeeTasks.length,
            tasksCompleted: completedTasks.length,
            completionRate: `${completionRate.toFixed(0)}%`,
            chartData,
        };
    }, [selectedEmployeeId, employees, attendanceRecords, tasks, startDate, endDate, workingHoursSettings]);

    const handleGenerate = useCallback(async () => {
        if (!performanceData) return;
        
        setIsLoading(true);
        setInsights('');

        const { employee } = performanceData;
        const employeeRecords = attendanceRecords.filter(r => r.employeeId === employee.id && r.date >= startDate && r.date <= endDate);
        const employeeTasks = tasks.filter(t => t.assigneeId === employee.id && t.dueDate >= startDate && t.dueDate <= endDate);
        
        const result = await generatePerformanceInsights(employee, employeeRecords, employeeTasks, startDate, endDate, workingHoursSettings, t);
        setInsights(result);
        
        setIsLoading(false);
    }, [performanceData, attendanceRecords, tasks, startDate, endDate, workingHoursSettings, t]);

    return (
        <div className="container mx-auto animate-fadeIn space-y-6">
            <h1 className="text-3xl font-bold">{t('sidebar.performance')}</h1>

            <div className="bg-white/70 dark:bg-slate-800/70 p-4 rounded-lg shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label htmlFor="employee-select" className="block text-sm font-medium">{t('common.employee')}</label>
                        <select id="employee-select" value={selectedEmployeeId} onChange={e => { setSelectedEmployeeId(e.target.value); setInsights(''); }} className="w-full mt-1 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600">
                            <option value="">{t('performance.select_employee')}</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.surname}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="start-date-perf" className="block text-sm font-medium">{t('reports.start_date')}</label>
                        <input type="date" id="start-date-perf" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full mt-1 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                    </div>
                    <div>
                        <label htmlFor="end-date-perf" className="block text-sm font-medium">{t('reports.end_date')}</label>
                        <input type="date" id="end-date-perf" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full mt-1 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                    </div>
                </div>
            </div>
            
            {!performanceData ? (
                <div className="text-center py-16 bg-white/70 dark:bg-slate-800/70 rounded-lg shadow-lg">
                    <UserCircleIcon className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold">{t('performance.select_employee')}</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{t('performance.select_employee_desc')}</p>
                </div>
            ) : (
                <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard icon={<CheckCircleIcon className="h-6 w-6 text-green-500"/>} title="Days Present" value={performanceData.presentDays} />
                        <StatCard icon={<ExclamationTriangleIcon className="h-6 w-6 text-orange-500"/>} title="Late Arrivals" value={performanceData.lateArrivals} />
                        <StatCard icon={<ClockIcon className="h-6 w-6 text-blue-500"/>} title="Avg. Check-in" value={performanceData.avgCheckInTime} />
                        <StatCard icon={<CalendarDaysIcon className="h-6 w-6 text-red-500"/>} title="Leave/Sick Days" value={performanceData.leaveDays} />
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 bg-white/70 dark:bg-slate-800/70 p-6 rounded-lg shadow-lg">
                             <h3 className="text-lg font-bold mb-4">Attendance Breakdown</h3>
                             <DonutChart data={performanceData.chartData} />
                        </div>
                        <div className="lg:col-span-2 bg-white/70 dark:bg-slate-800/70 p-6 rounded-lg shadow-lg space-y-4">
                             <h3 className="text-lg font-bold">Task Performance</h3>
                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <StatCard icon={<TasksIcon className="h-6 w-6 text-slate-500"/>} title="Tasks Assigned" value={performanceData.tasksAssigned} />
                                <StatCard icon={<TasksIcon className="h-6 w-6 text-green-500"/>} title="Tasks Completed" value={performanceData.tasksCompleted} />
                                <StatCard icon={<TasksIcon className="h-6 w-6 text-indigo-500"/>} title="Completion Rate" value={performanceData.completionRate} />
                             </div>
                        </div>
                    </div>

                    <div className="bg-indigo-50/70 dark:bg-slate-800/50 backdrop-blur-sm p-6 rounded-lg shadow-lg border-l-4 border-indigo-500">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                             <div>
                                <h2 className="text-2xl font-bold mb-2 flex items-center">
                                    <BrainCircuitIcon className="h-6 w-6 text-indigo-500 mr-2" />
                                    {t('data_analytics.ai.title')}
                                </h2>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{t('data_analytics.ai.description')}</p>
                            </div>
                            <button onClick={handleGenerate} disabled={isLoading} className="flex-shrink-0 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors">
                                {isLoading ? t('performance.generating') : t('performance.generate_button')}
                            </button>
                        </div>
                        { (isLoading || insights) && (
                            <div className="mt-4 border-t border-indigo-200 dark:border-slate-700 pt-4">
                                 {isLoading && <p className="text-center italic">{t('data_analytics.ai.generating')}</p>}
                                 {insights && (
                                    <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose prose-sm sm:prose dark:prose-invert max-w-none whitespace-pre-wrap">
                                        {insights}
                                    </MotionDiv>
                                 )}
                            </div>
                        )}
                    </div>
                </MotionDiv>
            )}
        </div>
    );
};

export default PerformanceView;
