
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';
import { AttendanceStatus } from '../types';
import { ATTENDANCE_STATUS_DETAILS } from '../constants';
import { 
    ClockIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon, 
    SearchIcon, SaveIcon, UserCircleIcon, CloudArrowUpIcon, 
    CheckCircleIcon, XCircleIcon, CalendarDaysIcon 
} from './icons';
import { motion, AnimatePresence } from 'framer-motion';

const MyAttendance: React.FC = () => {
  const { 
    currentUser, allEmployees, attendanceRecords, updateAttendance, 
    checkIn, checkOut, refreshData 
  } = useAppContext();
  const { t } = useI18n();

  const isAdmin = currentUser?.userRole === 'admin' || currentUser?.userRole === 'super-admin' || currentUser?.userRole === 'HR Manager';

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(currentUser?.id || '');
  const [activeDropdown, setActiveDropdown] = useState<{ date: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAdmin && currentUser) {
      setSelectedEmployeeId(currentUser.id);
    }
  }, [currentUser, isAdmin]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setActiveDropdown(null);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = firstDayOfMonth.getDay();
    const days = [];
    
    const prevMonthLastDay = new Date(year, month, 0);
    const prevMonthDays = prevMonthLastDay.getDate();
    for (let i = startDayOfWeek; i > 0; i--) {
        days.push({ date: new Date(year, month - 1, prevMonthDays - i + 1), isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    const endDayOfWeek = lastDayOfMonth.getDay();
    for (let i = 1; i < 7 - endDayOfWeek; i++) {
        days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    const recordsMap = new Map<string, AttendanceStatus>();
    attendanceRecords
      .filter(r => r.employeeId === selectedEmployeeId)
      .forEach(r => recordsMap.set(r.date, r.status));

    return { days, recordsMap, year, month };
  }, [currentDate, attendanceRecords, selectedEmployeeId]);

  const handleStatusChange = async (date: string, status: AttendanceStatus) => {
    if (!selectedEmployeeId || !isAdmin) return;
    setIsSaving(true);
    try {
        await updateAttendance(selectedEmployeeId, date, status);
        setActiveDropdown(null);
    } finally {
        setIsSaving(false);
    }
  };

  const handleSyncCloud = async () => {
    setIsSaving(true);
    try {
        await refreshData();
        setSaveMessage("Cloud Sync Successful.");
        setTimeout(() => setSaveMessage(null), 3000);
    } finally {
        setIsSaving(false);
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);
  const months = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('default', { month: 'long' }));
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const MotionDiv = motion.div as any;
  const targetEmployee = allEmployees.find(e => e.id === selectedEmployeeId);

  return (
    <div className="container mx-auto animate-fadeIn pb-24">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
            {isAdmin ? "Verification Hub" : "Service Record"}
          </h1>
          <p className="text-slate-500 font-bold italic mt-2 flex items-center gap-2">
            <CheckCircleIcon className="h-4 w-4 text-indigo-500" />
            {isAdmin ? "Personnel attendance oversight" : "Your digital clock-in ledger"}
          </p>
        </div>
        
        {isAdmin && (
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-1 min-w-[300px]">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <select 
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[1.5rem] shadow-sm focus:ring-4 focus:ring-indigo-500/10 outline-none font-black text-sm uppercase tracking-tighter transition-all"
              >
                <option value="">-- Choose Personnel Member --</option>
                {allEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.firstName} {emp.surname} ({emp.employeeId})</option>
                ))}
              </select>
            </div>
            <button 
              onClick={handleSyncCloud}
              disabled={isSaving || !selectedEmployeeId}
              className="flex items-center gap-2 px-8 py-4 glass-btn glass-btn-primary rounded-[1.5rem] font-black uppercase text-xs tracking-widest active:scale-95 disabled:opacity-50"
            >
              {isSaving ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : <CloudArrowUpIcon className="h-5 w-5" />}
              {isSaving ? "Syncing..." : "Finalize & Sync"}
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {saveMessage && (
            <MotionDiv initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-8 p-5 bg-emerald-500 text-white rounded-[1.5rem] shadow-xl shadow-emerald-500/20 flex items-center justify-between border border-white/20">
                <div className="flex items-center gap-3">
                    <CheckCircleIcon className="h-6 w-6" /> 
                    <span className="font-black uppercase text-xs tracking-widest">{saveMessage}</span>
                </div>
                <button onClick={() => setSaveMessage(null)}><XCircleIcon className="h-5 w-5" /></button>
            </MotionDiv>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/70 dark:bg-slate-800/70 p-8 rounded-[2.5rem] shadow-xl border border-white/30 backdrop-blur-xl">
            {targetEmployee && (
                <div className="mb-10 text-center">
                    <img src={targetEmployee.photoUrl} className="w-24 h-24 rounded-[2rem] mx-auto border-4 border-white dark:border-slate-700 shadow-2xl object-cover mb-4" alt=""/>
                    <h3 className="font-black text-2xl text-slate-800 dark:text-white uppercase tracking-tight">{targetEmployee.firstName} {targetEmployee.surname}</h3>
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">{targetEmployee.role}</p>
                </div>
            )}
            
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2 text-slate-400">
              <CalendarDaysIcon className="h-4 w-4" /> Focus Period
            </h2>
            <div className="space-y-4">
              <select 
                value={currentDate.getMonth()}
                onChange={(e) => setCurrentDate(new Date(currentDate.getFullYear(), parseInt(e.target.value), 1))}
                className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-black uppercase text-xs outline-none focus:border-indigo-500 transition-colors"
              >
                {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <select 
                value={currentDate.getFullYear()}
                onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth(), 1))}
                className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-black uppercase text-xs outline-none focus:border-indigo-500 transition-colors"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            
            {!isAdmin && (
              <div className="mt-10 pt-10 border-t dark:border-slate-700 space-y-4">
                <button onClick={() => checkIn(currentUser!.id)} className="w-full py-4 glass-btn bg-emerald-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95 shadow-emerald-500/20">Daily Clock In</button>
                <button onClick={() => checkOut(currentUser!.id)} className="w-full py-4 glass-btn bg-rose-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95 shadow-rose-500/20">Daily Clock Out</button>
              </div>
            )}

            <div className="mt-10 pt-10 border-t dark:border-slate-700">
                <h4 className="text-[10px] font-black uppercase text-slate-400 mb-6 tracking-widest">Marking Index</h4>
                <div className="grid grid-cols-2 gap-4">
                    {[AttendanceStatus.Present, AttendanceStatus.Absent, AttendanceStatus.Leave, AttendanceStatus.Sick, AttendanceStatus.Off].map(s => (
                        <div key={s} className="flex items-center gap-3">
                            <span className={`w-7 h-7 flex items-center justify-center rounded-xl text-[10px] font-black shadow-sm ${ATTENDANCE_STATUS_DETAILS[s]?.bgColor} ${ATTENDANCE_STATUS_DETAILS[s]?.color}`}>{s}</span>
                            <span className="text-[10px] font-black uppercase text-slate-500">{ATTENDANCE_STATUS_DETAILS[s]?.key}</span>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white/80 dark:bg-slate-800/80 p-6 sm:p-12 rounded-[3.5rem] shadow-2xl border border-white/40 backdrop-blur-2xl flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
              {currentDate.toLocaleString('default', { month: 'long' })} <span className="text-indigo-600">{currentDate.getFullYear()}</span>
            </h2>
            <div className="flex gap-3">
              <button onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))} className="p-3.5 glass-btn bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-2xl shadow-sm"><ChevronLeftIcon className="h-5 w-5"/></button>
              <button onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} className="p-3.5 glass-btn bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-2xl shadow-sm"><ChevronRightIcon className="h-5 w-5"/></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-3 mb-6">
            {weekdays.map(day => (
              <div key={day} className="text-center py-3 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-6 flex-1">
            {calendarData.days.map(({ date, isCurrentMonth }, i) => {
              const dateString = date.toISOString().split('T')[0];
              const status = calendarData.recordsMap.get(dateString);
              const details = status ? ATTENDANCE_STATUS_DETAILS[status] : null;
              const isToday = new Date().toDateString() === date.toDateString();
              const isDropdownActive = activeDropdown?.date === dateString;

              return (
                <div key={i} className={`relative group min-h-[120px] rounded-[2.5rem] border-2 transition-all p-2 ${
                    isCurrentMonth ? 'bg-white/40 dark:bg-slate-900/40 border-slate-50 dark:border-slate-700 shadow-sm' : 'border-transparent opacity-0 pointer-events-none'
                } ${isToday ? 'border-indigo-500 ring-4 ring-indigo-500/5' : ''}`}>
                  
                  <div className="flex justify-between items-start mb-1 px-2">
                    <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg ${isToday ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 bg-slate-50/50 dark:bg-slate-800/30'}`}>{date.getDate()}</span>
                  </div>

                  <div className="flex-1 flex items-center justify-center">
                    <button 
                        onClick={() => isAdmin && selectedEmployeeId && setActiveDropdown(isDropdownActive ? null : { date: dateString })}
                        className={`w-14 h-14 flex flex-col items-center justify-center rounded-2xl glass-btn ${
                        details ? `${details.bgColor} ${details.color} ring-4 ring-white dark:ring-slate-900` : 'bg-slate-50 dark:bg-slate-800 text-slate-200'
                        } ${!isAdmin ? 'cursor-default' : 'active:scale-95'}`}
                    >
                        <span className="text-xl font-black">{status || (isAdmin && selectedEmployeeId ? '·' : '')}</span>
                    </button>
                  </div>

                  <AnimatePresence>
                    {isDropdownActive && isAdmin && (
                      <MotionDiv 
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        ref={dropdownRef} 
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 z-50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl shadow-[0_40px_80px_rgba(0,0,0,0.4)] rounded-[2.5rem] p-6 grid grid-cols-4 gap-3 border dark:border-slate-700 min-w-[320px]"
                      >
                        <div className="col-span-4 flex justify-between items-center mb-3 px-1">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Update State</p>
                            <button onClick={() => setActiveDropdown(null)}><XCircleIcon className="h-5 w-5 text-slate-300" /></button>
                        </div>
                        {[AttendanceStatus.Present, AttendanceStatus.Absent, AttendanceStatus.Leave, AttendanceStatus.Sick, AttendanceStatus.Holiday, AttendanceStatus.Remote, AttendanceStatus.Off, AttendanceStatus.Weekend].map(s => {
                          const d = ATTENDANCE_STATUS_DETAILS[s];
                          return (
                            <button 
                              key={s} 
                              onClick={(e) => { e.stopPropagation(); handleStatusChange(dateString, s); }} 
                              title={t(d?.label || '')}
                              className={`w-12 h-12 flex items-center justify-center rounded-xl text-[10px] font-black glass-btn active:scale-90 ${d?.bgColor} ${d?.color}`}
                            >
                              {s}
                            </button>
                          )
                        })}
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleStatusChange(dateString, null as any); }}
                          className="col-span-4 mt-4 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 glass-btn bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 hover:text-red-50 rounded-2xl active:bg-rose-500"
                        >
                          Clear Record Entry
                        </button>
                      </MotionDiv>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
          
          <div className="mt-12 p-10 bg-slate-50/50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-slate-50 dark:border-slate-800/50">
            <h4 className="font-black text-xs uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-8">Performance Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Presence</p>
                    <p className="text-3xl font-black text-slate-800 dark:text-white">{Array.from(calendarData.recordsMap.values()).filter(s => s === 'P' || s === 'R').length} <span className="text-xs opacity-40 uppercase">Days</span></p>
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Unexcused Absences</p>
                    <p className="text-3xl font-black text-rose-500">{Array.from(calendarData.recordsMap.values()).filter(s => s === 'A').length} <span className="text-xs opacity-40 uppercase">Days</span></p>
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Leaves / Sick</p>
                    <p className="text-3xl font-black text-sky-500">{Array.from(calendarData.recordsMap.values()).filter(s => s === 'L' || s === 'S').length} <span className="text-xs opacity-40 uppercase">Days</span></p>
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rest / Holiday</p>
                    <p className="text-3xl font-black text-slate-400">{Array.from(calendarData.recordsMap.values()).filter(s => s === 'W' || s === 'H' || s === 'O').length} <span className="text-xs opacity-40 uppercase">Days</span></p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAttendance;
