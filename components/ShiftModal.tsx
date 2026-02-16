import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Shift } from '../types';
import { useI18n } from '../hooks/useI18n';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  shift: Shift | null;
}

const ShiftModal: React.FC<ShiftModalProps> = ({ isOpen, onClose, shift }) => {
  const { addShift, updateShift } = useAppContext();
  const { t } = useI18n();
  
  const initialState = {
    name: '',
    startTime: '09:00',
    endTime: '17:00',
    color: '#4f46e5',
  };
  
  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (shift) {
      setFormData(shift);
    } else {
      setFormData(initialState);
    }
  }, [shift, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (shift) {
      updateShift(shift.id, formData);
    } else {
      addShift(formData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6">{shift ? t('modals.shift.edit_title') : t('modals.shift.add_title')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">{t('modals.shift.name')}</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium">{t('modals.shift.start_time')}</label>
              <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium">{t('modals.shift.end_time')}</label>
              <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">{t('modals.shift.color')}</label>
            <input type="color" name="color" value={formData.color} onChange={handleChange} className="w-full mt-1 h-10 p-1 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-md">{t('common.cancel')}</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">{t('common.save')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShiftModal;
