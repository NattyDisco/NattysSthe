import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from './icons';

const toYYYYMMDD = (date: Date): string => date.toISOString().split('T')[0];

const ShiftRoster: React.FC = () => {
    const { employees, shifts, shiftAssignments, setView, openShiftAssignmentModal } = useAppContext();
    const { t } = useI18n();
    const [currentDate, setCurrentDate] = useState(new Date());

    const { weekDates, weekLabel } = useMemo(() => {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Start on Sunday
        const dates: Date[] = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(day.getDate() + i);
            dates.push(day);
        }
        const endOfWeek = dates[6];
        const label = `${startOfWeek.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
        return { weekDates: dates, weekLabel: label };
    }, [currentDate]);

    const goToPreviousWeek = () => {
        setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)));
    };
    const goToNextWeek = () => {
        setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)));
    };
    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const assignmentsMap = useMemo(() => {
        const map = new Map<string, { shift: any, assignment: any }>();
        shiftAssignments.forEach(assignment => {
            const shift = shifts.find(s => s.id === assignment.shiftId);
            if (shift) {
                map.set(`${assignment.employeeId}-${assignment.date}`, { shift, assignment });
            }
        });
        return map;
    }, [shiftAssignments, shifts]);

    return (
        <div className="container mx-auto animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold">{t('sidebar.shift_roster')}</h1>
                <div className="flex items-center gap-2">
                    <button onClick={goToToday} className="px-4 py-2 text-sm font-semibold border rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-700/50 dark:border-slate-600">{t('common.today')}</button>
                    <button onClick={goToPreviousWeek} className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50"><ChevronLeftIcon /></button>
                    <span className="font-semibold text-center w-48">{weekLabel}</span>
                    <button onClick={goToNextWeek} className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50"><ChevronRightIcon /></button>
                    <button onClick={() => setView('shifts')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 ml-4">{t('sidebar.manage_shifts')}</button>
                </div>
            </div>

            <div className="bg-white/70 dark:bg-slate-800/70 rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <div className="grid min-w-full" style={{ gridTemplateColumns: '180px repeat(7, 1fr)'}}>
                        <div className="p-3 font-semibold sticky left-0 bg-slate-50/80 dark:bg-slate-700/80 z-10">{t('common.employee')}</div>
                        {weekDates.map(date => (
                            <div key={date.toISOString()} className="p-3 text-center font-semibold border-l dark:border-slate-700">
                                <p>{date.toLocaleDateString(undefined, { weekday: 'short' })}</p>
                                <p className="text-sm text-slate-500">{date.getDate()}</p>
                            </div>
                        ))}
                        {employees.filter(e => e.status === 'active').map(employee => (
                            <React.Fragment key={employee.id}>
                                <div className="p-3 font-medium sticky left-0 bg-white/80 dark:bg-slate-800/80 border-t dark:border-slate-700 z-10">
                                    {employee.firstName} {employee.surname}
                                </div>
                                {weekDates.map(date => {
                                    const dateString = toYYYYMMDD(date);
                                    const data = assignmentsMap.get(`${employee.id}-${dateString}`);
                                    return (
                                        <div key={dateString} className="p-2 border-l border-t dark:border-slate-700 group">
                                            <div 
                                                onClick={() => openShiftAssignmentModal({ date: dateString, employeeId: employee.id, assignment: data?.assignment || null })}
                                                className="h-full rounded-md flex items-center justify-center cursor-pointer transition-colors hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                                            >
                                                {data ? (
                                                    <div className="w-full text-center p-2 rounded" style={{ backgroundColor: `${data.shift.color}40` }}>
                                                        <p className="font-bold text-sm" style={{ color: data.shift.color }}>{data.shift.name}</p>
                                                        <p className="text-xs font-mono" style={{ color: data.shift.color }}>{data.shift.startTime}-{data.shift.endTime}</p>
                                                    </div>
                                                ) : (
                                                    <PlusIcon className="h-5 w-5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShiftRoster;