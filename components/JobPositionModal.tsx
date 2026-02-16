import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { JobPosition } from '../types';
import { useI18n } from '../hooks/useI18n';

interface JobPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: JobPosition | null;
}

const JobPositionModal: React.FC<JobPositionModalProps> = ({ isOpen, onClose, position }) => {
  const { addJobPosition, updateJobPosition } = useAppContext();
  const { t } = useI18n();
  
  const initialState = {
    title: '',
    department: '',
    description: '',
    status: 'open' as 'open' | 'filled',
  };
  
  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (position) {
      const { id, ...editableData } = position;
      setFormData(editableData);
    } else {
      setFormData(initialState);
    }
  }, [position, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (position) {
      updateJobPosition(position.id, formData);
    } else {
      addJobPosition(formData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6">{position ? t('modals.job_position.edit_title') : t('modals.job_position.add_title')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">{t('modals.job_position.title')}</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">{t('modals.job_position.department')}</label>
              <input type="text" name="department" value={formData.department} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
            </div>
            <div>
              <label className="block text-sm font-medium">{t('modals.job_position.status')}</label>
              <select name="status" value={formData.status} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600">
                <option value="open">{t('modals.job_position.statuses.open')}</option>
                <option value="filled">{t('modals.job_position.statuses.filled')}</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">{t('modals.job_position.description')}</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full mt-1 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
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

export default JobPositionModal;