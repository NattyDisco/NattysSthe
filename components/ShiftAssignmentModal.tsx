import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { ShiftAssignment } from '../types';
import { useI18n } from '../hooks/useI18n';

interface ShiftAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: { date: string; employeeId: string; assignment: ShiftAssignment | null; } | null;
}

const ShiftAssignmentModal: React.FC<ShiftAssignmentModalProps> = ({ isOpen, onClose, context }) => {
  const { employees, shifts, assignOrUpdateShift, unassignShift } = useAppContext();
  const { t } = useI18n();
  
  const [selectedShiftId, setSelectedShiftId] = useState('');

  useEffect(() => {
    if (context?.assignment) {
      setSelectedShiftId(context.assignment.shiftId);
    } else {
      setSelectedShiftId('');
    }
  }, [context]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!context || !selectedShiftId) return;
    assignOrUpdateShift({
        employeeId: context.employeeId,
        date: context.date,
        shiftId: selectedShiftId
    });
    onClose();
  };
  
  const handleUnassign = () => {
      if (!context || !context.assignment) return;
      unassignShift(context.assignment.id);
      onClose();
  };

  if (!isOpen || !context) return null;
  
  const employee = employees.find(e => e.id === context.employeeId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6">{context.assignment ? t('modals.shift_assignment.edit_title') : t('modals.shift_assignment.assign_title')}</h2>
        <div className="mb-4 p-3 bg-slate-100 dark:bg-slate-700 rounded-md">
            <p><span className="font-semibold">{t('common.employee')}:</span> {employee?.firstName} {employee?.surname}</p>
            <p><span className="font-semibold">Date:</span> {new Date(context.date + 'T00:00:00').toLocaleDateString()}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">{t('modals.shift_assignment.select_shift')}</label>
            <select value={selectedShiftId} onChange={e => setSelectedShiftId(e.target.value)} required className="w-full mt-1 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600">
                <option value="">-- Select a Shift --</option>
                {shifts.map(shift => (
                    <option key={shift.id} value={shift.id}>{shift.name} ({shift.startTime} - {shift.endTime})</option>
                ))}
            </select>
          </div>
          <div className="flex justify-between items-center gap-4 pt-4">
            <div>
                 {context.assignment && (
                    <button type="button" onClick={handleUnassign} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">{t('modals.shift_assignment.unassign')}</button>
                )}
            </div>
            <div className="flex gap-4">
                 <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-md">{t('common.cancel')}</button>
                 <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">{t('common.save')}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShiftAssignmentModal;