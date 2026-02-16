import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';
import { AttendanceRecord, AttendanceStatus } from '../types';

interface TimeLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: { employeeId: string; date: string } | null;
}

const TimeLogModal: React.FC<TimeLogModalProps> = ({ isOpen, onClose, context }) => {
  const { attendanceRecords, updateAttendance } = useAppContext();
  const { t } = useI18n();

  const record = attendanceRecords.find(r => r.employeeId === context?.employeeId && r.date === context?.date);

  const [checkIn, setCheckIn] = useState(record?.checkInTime || '');
  const [checkOut, setCheckOut] = useState(record?.checkOutTime || '');
  const [overtime, setOvertime] = useState<string>(record?.overtimeHours?.toString() || '');
  
  useEffect(() => {
    const record = attendanceRecords.find(r => r.employeeId === context?.employeeId && r.date === context?.date);
    setCheckIn(record?.checkInTime || '');
    setCheckOut(record?.checkOutTime || '');
    setOvertime(record?.overtimeHours?.toString() || '');
  }, [context, attendanceRecords]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!context) return;
    updateAttendance(context.employeeId, context.date, AttendanceStatus.Present, {
        checkInTime: checkIn,
        checkOutTime: checkOut,
        overtimeHours: parseFloat(overtime) || 0
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6">{t('modals.time_log.title')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{t('modals.time_log.check_in')}</label>
              <input type="time" value={checkIn} onChange={e => setCheckIn(e.target.value)} className="w-full p-2 border rounded-md bg-white dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{t('modals.time_log.check_out')}</label>
              <input type="time" value={checkOut} onChange={e => setCheckOut(e.target.value)} className="w-full p-2 border rounded-md bg-white dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"/>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Overtime Hours</label>
            <input 
              type="number" 
              step="0.5"
              min="0"
              placeholder="0.0"
              value={overtime} 
              onChange={e => setOvertime(e.target.value)} 
              className="w-full p-2 border rounded-md bg-white dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest">Additional approved hours worked</p>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t dark:border-slate-700 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-md font-bold hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors uppercase text-xs">{t('common.cancel')}</button>
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-md font-bold hover:bg-indigo-700 transition-all uppercase text-xs shadow-lg shadow-indigo-500/20 active:scale-95">{t('common.save')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimeLogModal;