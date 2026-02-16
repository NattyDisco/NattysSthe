import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';
import { AttendanceStatus } from '../types';
import { PaperClipIcon } from './icons';

interface SickLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: { employeeId: string; date: string } | null;
}

const SickLeaveModal: React.FC<SickLeaveModalProps> = ({ isOpen, onClose, context }) => {
  const { updateAttendance } = useAppContext();
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!context) return;
    
    // In a real app, you'd upload the file and get a URL.
    // For this mock, we'll just store file info.
    updateAttendance(context.employeeId, context.date, AttendanceStatus.Sick, {
        notes,
        sickLeaveFileName: file?.name,
        sickLeaveFileType: file?.type,
        // sickLeaveUrl: 'url-from-upload' 
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6">{t('modals.sick_leave.title')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">{t('modals.sick_leave.doctor_note')}</label>
            <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full mt-1 text-sm" />
          </div>
           <div>
            <label className="block text-sm font-medium">{t('modals.sick_leave.notes')}</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full mt-1 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" rows={3}></textarea>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-md">{t('common.cancel')}</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">{t('common.submit')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SickLeaveModal;
