import React, { useState, useMemo, useCallback } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { AttendanceStatus } from '../types';
import { ATTENDANCE_STATUS_DETAILS } from '../constants';
import { SearchIcon, ChevronLeftIcon } from './icons';
import { useI18n } from '../hooks/useI18n';

const toYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const BulkAttendance: React.FC = () => {
    const { employees, bulkUpdateAttendance, setView } = useAppContext();
    const { t } = useI18n();
    const [startDate, setStartDate] = useState(toYYYYMMDD(new Date()));
    const [endDate, setEndDate] = useState(toYYYYMMDD(new Date()));
    const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>(AttendanceStatus.Present);
    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [notification, setNotification] = useState<string | null>(null);

    const employeeList = useMemo(() => employees.filter(e => e.userRole === 'employee'), [employees]);

    const filteredEmployees = useMemo(() => 
        employeeList.filter(employee =>
            `${employee.firstName} ${employee.surname}`.toLowerCase().includes(searchQuery.toLowerCase())
        ), [employeeList, searchQuery]);

    const showNotification = useCallback((message: string) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 4000);
    }, []);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedEmployeeIds(new Set(filteredEmployees.map(e => e.id)));
        } else {
            setSelectedEmployeeIds(new Set());
        }
    };

    const handleSelectEmployee = (employeeId: string) => {
        setSelectedEmployeeIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(employeeId)) {
                newSet.delete(employeeId);
            } else {
                newSet.add(employeeId);
            }
            return newSet;
        });
    };

    const isAllSelected = useMemo(() => 
        filteredEmployees.length > 0 && selectedEmployeeIds.size === filteredEmployees.length,
    [filteredEmployees, selectedEmployeeIds]);

    const handleApply = (options: { onlyWeekdays: boolean }) => {
        if (selectedEmployeeIds.size === 0) {
            alert('Please select at least one employee.');
            return;
        }
        if (!startDate || !endDate || startDate > endDate) {
            alert('Please select a valid date range.');
            return;
        }
        
        const employeeIds = [...selectedEmployeeIds];
        const statusToApply = options.onlyWeekdays ? AttendanceStatus.Present : selectedStatus;
        
        bulkUpdateAttendance(employeeIds, startDate, endDate, statusToApply, { onlyWeekdays: options.onlyWeekdays, ignoreLeave: true });

        const message = options.onlyWeekdays 
            ? t('bulk_attendance.notification_weekdays', { count: employeeIds.length })
            : t('bulk_attendance.notification_status', { status: t(ATTENDANCE_STATUS_DETAILS[statusToApply]?.label || ''), count: employeeIds.length });
        
        showNotification(message);
        setSelectedEmployeeIds(new Set());
    };
    
    const statusesToApply = [
        AttendanceStatus.Present,
        AttendanceStatus.Absent,
        AttendanceStatus.Sick,
        AttendanceStatus.Remote,
        AttendanceStatus.Off,
    ];

    return (
        <div className="container mx-auto animate-fadeIn space-y-6">
            {notification && (
                <div className="fixed top-20 right-5 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fadeIn z-50">
                    {notification}
                </div>
            )}
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setView('dashboard')} 
                    className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                    aria-label="Back to Dashboard"
                >
                    <ChevronLeftIcon className="h-6 w-6" />
                </button>
                <h1 className="text-3xl font-bold">Bulk Attendance Marking</h1>
            </div>

            {/* Controls */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 p-6 rounded-lg shadow-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium">Start Date</label>
                        <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-md bg-transparent dark:border-slate-600"/>
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium">End Date</label>
                        <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-md bg-transparent dark:border-slate-600"/>
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium">Status to Apply</label>
                        <select id="status" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value as AttendanceStatus)} className="w-full mt-1 px-3 py-2 border rounded-md bg-transparent dark:border-slate-600">
                           {statusesToApply.map(status => (
                               <option key={status} value={status}>{t(ATTENDANCE_STATUS_DETAILS[status]?.label || '')}</option>
                           ))}
                        </select>
                    </div>
                    <button onClick={() => handleApply({ onlyWeekdays: false })} className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 h-10">Apply Status</button>
                </div>
                 <div className="border-t dark:border-slate-700 pt-4">
                    <button onClick={() => handleApply({ onlyWeekdays: true })} className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">
                        Quick Action: Mark Weekdays Present
                    </button>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                        Marks selected employees as 'Present' on all weekdays (Mon-Fri) in the selected date range. Ignores holidays and days already marked as 'Leave'.
                    </p>
                </div>
            </div>
            
            {/* Employee List */}
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 rounded-lg shadow-lg">
                <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Select Employees ({selectedEmployeeIds.size} selected)</h2>
                    <div className="relative w-full sm:w-64">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <SearchIcon className="h-5 w-5 text-slate-400" />
                        </span>
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-transparent dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>
                <div className="max-h-[50vh] overflow-y-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/70 dark:bg-slate-700/50 sticky top-0">
                            <tr>
                                <th className="p-4 w-12">
                                    <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                                </th>
                                <th className="p-4 font-semibold">Employee</th>
                                <th className="p-4 font-semibold">Role</th>
                            </tr>
                        </thead>
                        <tbody>
                           {filteredEmployees.map(employee => (
                                <tr key={employee.id} className="border-t dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/50 cursor-pointer" onClick={() => handleSelectEmployee(employee.id)}>
                                    <td className="p-4">
                                        <input type="checkbox" checked={selectedEmployeeIds.has(employee.id)} onChange={() => {}} onClick={(e) => e.stopPropagation()} className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                                    </td>
                                    <td className="p-4 flex items-center">
                                        <img src={employee.photoUrl} alt={employee.firstName} className="w-10 h-10 rounded-full mr-3 object-cover" />
                                        <div>
                                            <span className="font-semibold">{employee.firstName} {employee.surname}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-600 dark:text-slate-400">{employee.role}</td>
                                </tr>
                           ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BulkAttendance;