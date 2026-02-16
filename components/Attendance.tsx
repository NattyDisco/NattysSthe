import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { AttendanceStatus, Employee, Shift } from '../types';
import { ATTENDANCE_STATUS_DETAILS, LESOTHO_HOLIDAYS_2025 } from '../constants';
import { 
    ChevronLeftIcon, PlusIcon, AttendanceIcon, 
    CheckCircleIcon, UserIcon, CalendarDaysIcon, 
    XCircleIcon, SearchIcon, ExportIcon, ClockIcon,
    BriefcaseIcon, ArrowTrendingUpIcon, IdentificationIcon
} from './icons';
import { useI18n } from '../hooks/useI18n';
import { useLeaveEngine } from '../hooks/useLeaveEngine';
import { motion, AnimatePresence } from 'framer-motion';

const months = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('default', { month: 'long' }));
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type WorkflowStep = 'year' | 'month' | 'employee' | 'calendar';

const MotionDiv = motion.div as any;

const Attendance: React.FC = () => {
    const { 
        employees, attendanceRecords, updateAttendance, setView, 
        shifts, shiftAssignments, leaveRequests,
        openSickLeaveModal, openTimeLogModal, preselectedEmployeeForAttendance, 
        setPreselectedEmployeeForAttendance, bulkUpdateAttendance
    } = useAppContext();
    const { t } = useI18n();
    
    const [step, setStep] = useState<WorkflowStep>('year');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [markingFeedback, setMarkingFeedback] = useState<string | null>(null);
    const [focusedDay, setFocusedDay] = useState<{ date: string; isCurrentMonth: boolean } | null>(null);

    const engine = useLeaveEngine(selectedEmp, leaveRequests);

    useEffect(() => {
        if (preselectedEmployeeForAttendance) {
            const emp = employees.find(e => e.id === preselectedEmployeeForAttendance);
            if (emp) { setSelectedEmp(emp); setStep('calendar'); }
            setPreselectedEmployeeForAttendance(null);
        }
    }, [preselectedEmployeeForAttendance, employees]);

    const calendarData = useMemo(() => {
        if (!selectedEmp) return { days: [], recordsMap: new Map(), shiftsMap: new Map() };
        const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1);
        const lastDayOfMonth = new Date(selectedYear, selectedMonth + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        const startDayOfWeek = firstDayOfMonth.getDay();
        const days = [];
        const prevMonthLastDay = new Date(selectedYear, selectedMonth, 0).getDate();
        for (let i = startDayOfWeek; i > 0; i--) {
            days.push({ date: new Date(selectedYear, selectedMonth - 1, prevMonthLastDay - i + 1), isCurrentMonth: false });
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ date: new Date(selectedYear, selectedMonth, i), isCurrentMonth: true });
        }
        const endDayOfWeek = lastDayOfMonth.getDay();
        for (let i = 1; i < 7 - endDayOfWeek; i++) {
            days.push({ date: new Date(selectedYear, selectedMonth + 1, i), isCurrentMonth: false });
        }
        const recordsMap = new Map<string, any>();
        attendanceRecords.filter(r => r.employeeId === selectedEmp.id).forEach(r => recordsMap.set(r.date, r));
        const shiftsMap = new Map<string, Shift>();
        shiftAssignments.filter(a => a.employeeId === selectedEmp.id).forEach(a => {
            const shift = shifts.find(s => s.id === a.shiftId);
            if (shift) shiftsMap.set(a.date, shift);
        });
        return { days, recordsMap, shiftsMap };
    }, [selectedYear, selectedMonth, selectedEmp, attendanceRecords, shiftAssignments, shifts]);

    const statsSummary = useMemo(() => {
        const counts = { P: 0, A: 0, L: 0, S: 0, R: 0, O: 0, W: 0, H: 0 };
        let totalOvertime = 0; let totalWorkingDays = 0;
        calendarData.days.forEach(({ date, isCurrentMonth }) => {
            if (!isCurrentMonth) return;
            const ds = date.toISOString().split('T')[0];
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const isHoliday = LESOTHO_HOLIDAYS_2025.includes(ds);
            if (!isWeekend && !isHoliday) totalWorkingDays++;
            const rec = calendarData.recordsMap.get(ds);
            if (rec) {
                if (counts.hasOwnProperty(rec.status)) (counts as any)[rec.status]++;
                totalOvertime += (rec.overtimeHours || 0);
            }
        });
        const presentCount = counts.P + counts.R;
        const compliance = Math.round((presentCount / (totalWorkingDays || 1)) * 100);
        return { ...counts, compliance, totalOvertime, totalWorkingDays };
    }, [calendarData]);

    const handleStatusChange = async (date: string, status: AttendanceStatus) => {
        if (!selectedEmp) return;
        
        const statusDetails = ATTENDANCE_STATUS_DETAILS[status];
        const statusLabel = statusDetails?.key || status;

        if (status === AttendanceStatus.Leave) {
            const validation = engine.validateRequest('Annual', date, date);
            if (!validation.isValid) { alert(validation.message); return; }
        }
        if (status === AttendanceStatus.Sick) {
            const validation = engine.validateRequest('Sick', date, date);
            if (!validation.isValid) { alert(validation.message); return; }
            openSickLeaveModal(selectedEmp.id, date); setFocusedDay(null); return;
        }

        // REQUIRED: Confirmation message logic
        setMarkingFeedback(`Attendance successfully marked for ${selectedEmp.firstName} ${selectedEmp.surname} on ${date} as ${statusLabel.toUpperCase()}.`);
        setTimeout(() => setMarkingFeedback(null), 4000);

        await updateAttendance(selectedEmp.id, date, status);
        if (status === AttendanceStatus.Present || status === AttendanceStatus.Remote) openTimeLogModal(selectedEmp.id, date);
        setFocusedDay(null);
    };

    const handleQuickFill = async () => {
        if (!selectedEmp) return;
        const startDate = new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0];
        const endDate = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split('T')[0];
        await bulkUpdateAttendance([selectedEmp.id], startDate, endDate, AttendanceStatus.Present, { onlyWeekdays: true });
        setMarkingFeedback(`Epoch auto-fill completed for ${selectedEmp.firstName}.`);
        setTimeout(() => setMarkingFeedback(null), 4000);
    };

    const renderYearSelect = () => (
        <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            <div className="text-center">
                <h2 className="text-5xl font-black uppercase tracking-tighter mb-4 text-slate-900 dark:text-white">Audit Registry</h2>
                <p className="text-slate-500 font-bold tracking-widest text-[10px] uppercase">Select target accounting epoch</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto px-4">
                {[2024, 2025, 2026, 2027].map(year => (
                    <button key={year} onClick={() => { setSelectedYear(year); setStep('month'); }} className="group p-12 bg-white dark:bg-slate-800 rounded-[3rem] shadow-xl hover:bg-indigo-600 transition-all border-4 border-transparent hover:border-indigo-400">
                        <p className="text-4xl font-black group-hover:text-white transition-colors">{year}</p>
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-100 mt-4">Authorized Ledger</p>
                    </button>
                ))}
            </div>
        </MotionDiv>
    );

    const renderMonthSelect = () => (
        <MotionDiv initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12">
            <div className="flex items-center justify-between max-w-6xl mx-auto px-4">
                <button onClick={() => setStep('year')} className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:text-indigo-600"><ChevronLeftIcon className="h-6 w-6" /></button>
                <h2 className="text-4xl font-black uppercase tracking-tighter">{selectedYear} Operational Cycles</h2>
                <div className="w-12"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-6xl mx-auto px-4">
                {months.map((m, i) => (
                    <button key={i} onClick={() => { setSelectedMonth(i); setStep('employee'); }} className="p-8 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-lg hover:ring-8 hover:ring-indigo-500/10 text-center transition-all">
                        <p className="font-black uppercase tracking-tight text-xl">{m}</p>
                        <p className="text-[7px] font-bold text-slate-400 uppercase mt-2 tracking-widest">Active Sheet</p>
                    </button>
                ))}
            </div>
        </MotionDiv>
    );

    const renderEmployeeSelect = () => {
        const filtered = employees.filter(e => `${e.firstName} ${e.surname}`.toLowerCase().includes(searchQuery.toLowerCase()) || e.employeeId.toLowerCase().includes(searchQuery.toLowerCase()));
        return (
            <MotionDiv initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6 max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setStep('month')} className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:text-indigo-600"><ChevronLeftIcon className="h-6 w-6" /></button>
                        <div>
                            <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">Personnel Audit</h2>
                            <p className="text-slate-500 font-bold uppercase text-[9px] tracking-widest mt-2">{months[selectedMonth]} {selectedYear} Segment</p>
                        </div>
                    </div>
                    <div className="relative w-full lg:w-96">
                        <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input type="text" placeholder="Identify personnel..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-white dark:bg-slate-800 border-4 border-slate-50 dark:border-slate-700 rounded-[2.5rem] shadow-xl outline-none focus:border-indigo-500 font-black uppercase text-[10px] tracking-widest" />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl mx-auto px-4">
                    {filtered.map(emp => (
                        <button key={emp.id} onClick={() => { setSelectedEmp(emp); setStep('calendar'); }} className="group p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[3rem] shadow-xl border-4 border-transparent hover:border-indigo-500 transition-all text-center flex flex-col items-center">
                            <img src={emp.photoUrl} className="w-24 h-24 rounded-[2rem] object-cover ring-4 ring-white shadow-2xl mb-4 group-hover:scale-105 transition-transform" />
                            <h3 className="font-black text-xl uppercase tracking-tighter leading-none mb-1">{emp.firstName} {emp.surname}</h3>
                            <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{emp.role}</p>
                        </button>
                    ))}
                </div>
            </MotionDiv>
        );
    };

    const renderCalendar = () => (
        <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-[1700px] mx-auto pb-24">
            <AnimatePresence>
                {markingFeedback && (
                    <MotionDiv initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] w-full max-w-xl px-4">
                        <div className="bg-indigo-600 text-white p-6 rounded-[2rem] shadow-2xl flex items-center gap-4 border-4 border-white/20 backdrop-blur-xl">
                            <CheckCircleIcon className="h-7 w-7 shrink-0" />
                            <p className="text-sm font-black uppercase tracking-tight leading-snug">{markingFeedback}</p>
                        </div>
                    </MotionDiv>
                )}
            </AnimatePresence>

            <div className="sticky top-[140px] z-40 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-2xl py-6 border-b-2 dark:border-slate-800 no-print">
                <div className="flex flex-col xl:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                        <button onClick={() => setStep('employee')} className="p-4 bg-white dark:bg-slate-800 rounded-[1.5rem] shadow-lg border-2 dark:border-slate-700 hover:text-indigo-600"><ChevronLeftIcon className="h-6 w-6" /></button>
                        <div className="flex items-center gap-6 p-2 pr-10 bg-white/70 dark:bg-slate-800/70 rounded-[3.5rem] border-2 dark:border-slate-700 shadow-xl">
                            <img src={selectedEmp?.photoUrl} className="w-16 h-16 rounded-[1.5rem] object-cover shadow-2xl ring-4 ring-white" />
                            <div>
                                <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">{selectedEmp?.firstName} {selectedEmp?.surname}</h1>
                                <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-1.5">{months[selectedMonth]} {selectedYear} VERIFICATION SHEET</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={handleQuickFill} className="px-8 py-4 bg-emerald-500 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-xl">Fill Current Cycle</button>
                        <button onClick={() => { setStep('year'); setSelectedEmp(null); }} className="p-4 bg-white dark:bg-slate-800 text-slate-400 rounded-[1.5rem] shadow-lg"><XCircleIcon className="h-6 w-6" /></button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-9 bg-white/80 dark:bg-slate-800/80 p-8 rounded-[4rem] shadow-2xl border-4 border-white dark:border-slate-700 backdrop-blur-3xl">
                    <div className="grid grid-cols-7 gap-4 mb-8">
                        {weekdays.map(day => <div key={day} className="text-center py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 border-b-2 dark:border-slate-700">{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-4">
                        {calendarData.days.map(({ date, isCurrentMonth }) => {
                            const ds = date.toISOString().split('T')[0];
                            const record = calendarData.recordsMap.get(ds);
                            const shift = calendarData.shiftsMap.get(ds);
                            const details = record?.status ? ATTENDANCE_STATUS_DETAILS[record.status as AttendanceStatus] : null;
                            const isToday = new Date().toDateString() === date.toDateString();
                            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                            const isHoliday = LESOTHO_HOLIDAYS_2025.includes(ds);

                            return (
                                <button key={ds} disabled={!isCurrentMonth} onClick={() => setFocusedDay({ date: ds, isCurrentMonth })} className={`group min-h-[140px] rounded-[2.5rem] p-4 flex flex-col relative transition-all duration-300 border-4 ${isCurrentMonth ? 'bg-white/50 dark:bg-slate-900/50 border-slate-50 dark:border-slate-800 hover:shadow-2xl hover:scale-[1.03]' : 'bg-transparent border-transparent opacity-0 pointer-events-none'} ${isToday ? 'border-indigo-500 ring-8 ring-indigo-500/5' : ''} ${isHoliday ? 'bg-rose-50/50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/30' : ''} ${isWeekend && !isHoliday ? 'bg-slate-100/50 dark:bg-slate-800/40' : ''}`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className={`text-sm font-black px-2 py-0.5 rounded-lg ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>{date.getDate()}</span>
                                        {isHoliday && <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-lg" title="Lesotho Statutory Holiday" />}
                                    </div>
                                    <div className="flex-1 flex flex-col items-center justify-center">
                                        <div className={`w-12 h-12 flex items-center justify-center rounded-2xl text-xl font-black shadow-lg ${details ? `${details?.bgColor} ${details?.color} ring-4 ring-white` : 'bg-slate-50 dark:bg-slate-800 text-slate-200'}`}>
                                            {record?.status || <PlusIcon className="h-5 w-5 opacity-20" />}
                                        </div>
                                        {shift && isCurrentMonth && <p className="text-[7px] font-black uppercase text-slate-400 mt-3 truncate w-full px-2 text-center" style={{ color: shift.color }}>{shift.name}</p>}
                                        {isHoliday && <p className="text-[7px] font-black text-rose-500 uppercase mt-1 tracking-tighter">Public Holiday</p>}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white/70 dark:bg-slate-800/70 p-8 rounded-[3rem] shadow-xl border border-white/40">
                        <h3 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                            <ArrowTrendingUpIcon className="h-6 w-6 text-indigo-500" /> Cycle Metrics
                        </h3>
                        <div className="flex justify-between items-center p-6 rounded-[2.5rem] bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-100 dark:border-indigo-800 mb-8">
                            <div>
                                <p className="text-[9px] font-black uppercase text-indigo-400 mb-1">Period Compliance</p>
                                <p className="text-5xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">{statsSummary.compliance}%</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {[
                                { label: 'Present / Remote', val: statsSummary.P + statsSummary.R, color: 'text-emerald-500' },
                                { label: 'Absent', val: statsSummary.A, color: 'text-rose-500' },
                                { label: 'On Leave / Sick', val: statsSummary.L + statsSummary.S, color: 'text-blue-500' },
                                { label: 'Statutory Periods', val: statsSummary.totalWorkingDays, color: 'text-slate-400' }
                            ].map(s => (
                                <div key={s.label} className="p-5 bg-slate-50 dark:bg-slate-900 rounded-3xl border dark:border-slate-800 flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase text-slate-500">{s.label}</span>
                                    <span className={`text-xl font-black ${s.color}`}>{s.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl text-white">
                        <div className="flex items-center gap-3 mb-6">
                            <IdentificationIcon className="h-6 w-6 text-indigo-400" />
                            <h4 className="text-sm font-black uppercase tracking-widest">Registry Note</h4>
                        </div>
                        <p className="text-xs font-medium text-slate-400 italic leading-relaxed">"Verification steps are recorded with the operator's digital signature. Audits may be performed at the end of the accounting cycle."</p>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {focusedDay && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[300] flex items-center justify-center p-4" onClick={() => setFocusedDay(null)}>
                        <MotionDiv initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[4rem] shadow-2xl border-4 border-indigo-500 overflow-hidden" onClick={e => e.stopPropagation()}>
                            <header className="p-10 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
                                <div>
                                    <h2 className="text-3xl font-black uppercase tracking-tighter">State Assignment</h2>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">{new Date(focusedDay.date).toLocaleDateString(undefined, { dateStyle: 'full' })}</p>
                                </div>
                                <button onClick={() => setFocusedDay(null)} className="p-4 hover:bg-white rounded-2xl transition-all"><XCircleIcon className="h-8 w-8 text-slate-400"/></button>
                            </header>
                            <main className="p-12 space-y-12">
                                <div className="grid grid-cols-4 gap-4">
                                    {['P', 'A', 'L', 'S', 'O', 'R'].map(s => {
                                        const d = ATTENDANCE_STATUS_DETAILS[s as AttendanceStatus];
                                        const isActive = calendarData.recordsMap.get(focusedDay.date)?.status === s;
                                        return (
                                            <button key={s} onClick={() => handleStatusChange(focusedDay.date, s as AttendanceStatus)} className={`group relative flex flex-col items-center gap-3 p-6 rounded-[2.5rem] transition-all hover:scale-110 shadow-lg ${isActive ? `${d?.bgColor} ${d?.color} ring-4 ring-indigo-500/20` : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-white'}`}>
                                                <span className="text-3xl font-black">{s}</span>
                                                <span className="text-[8px] font-black uppercase opacity-60 tracking-tighter truncate w-full text-center">{d?.key}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                                <div className="flex gap-4 pt-4">
                                  <button onClick={() => { updateAttendance(selectedEmp!.id, focusedDay.date, null as any); setFocusedDay(null); }} className="flex-1 py-6 bg-slate-50 dark:bg-slate-900 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-red-500 transition-all rounded-3xl border-2 border-dashed dark:border-slate-800">Clear Marker</button>
                                  {calendarData.recordsMap.get(focusedDay.date)?.status && (
                                    <button onClick={() => { openTimeLogModal(selectedEmp!.id, focusedDay.date); setFocusedDay(null); }} className="flex-1 py-6 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl rounded-3xl active:scale-95 transition-all">Capture OT / Clocking</button>
                                  )}
                                </div>
                            </main>
                        </MotionDiv>
                    </div>
                )}
            </AnimatePresence>
        </MotionDiv>
    );

    return (
        <div className="container mx-auto pb-10">
            <AnimatePresence mode="wait">
                {step === 'year' && renderYearSelect()}
                {step === 'month' && renderMonthSelect()}
                {step === 'employee' && renderEmployeeSelect()}
                {step === 'calendar' && renderCalendar()}
            </AnimatePresence>
        </div>
    );
};

export default Attendance;