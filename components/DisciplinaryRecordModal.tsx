
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { DisciplinaryRecord } from '../types';
import { useI18n } from '../hooks/useI18n';

interface DisciplinaryRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: { employeeId: string } | null;
  record: DisciplinaryRecord | null;
}

const DisciplinaryRecordModal: React.FC<DisciplinaryRecordModalProps> = ({ isOpen, onClose, context, record }) => {
    const { addDisciplinaryRecord } = useAppContext();
    const { t } = useI18n();

    const initialState = {
        incidentDate: new Date().toISOString().split('T')[0],
        type: 'Verbal Warning' as DisciplinaryRecord['type'],
        reason: '',
        feedbackToEmployee: '',
    };
    
    const [formData, setFormData] = useState(initialState);
    
    useEffect(() => {
        if(record) {
            setFormData({
                incidentDate: record.incidentDate,
                type: record.type,
                reason: record.reason,
                feedbackToEmployee: record.feedbackToEmployee || ''
             });
        } else {
            setFormData(initialState);
        }
    }, [record, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!context) return;
        
        // FIX: Construct a valid DisciplinaryRecord object based on fixed types.
        const newRecord: Omit<DisciplinaryRecord, 'id' | 'employeeId'> = {
            incidentDate: formData.incidentDate,
            recordDate: new Date().toISOString().split('T')[0],
            type: formData.type,
            reason: formData.reason,
            feedbackToEmployee: formData.feedbackToEmployee,
            updates: [],
        };
        
        addDisciplinaryRecord(context.employeeId, newRecord);
        onClose();
    };

    if(!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6">{record ? t('modals.disciplinary.edit_title') : t('modals.disciplinary.add_title')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="date" name="incidentDate" value={formData.incidentDate} onChange={handleChange} required className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
                    <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600">
                        <option value="Verbal Warning">Verbal Warning</option>
                        <option value="Written Warning">Written Warning</option>
                        <option value="Suspension">Suspension</option>
                        <option value="Termination">Termination</option>
                    </select>
                    <textarea name="reason" value={formData.reason} onChange={handleChange} placeholder="Reason for action" required rows={3} className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
                    <textarea name="feedbackToEmployee" value={formData.feedbackToEmployee} onChange={handleChange} placeholder="Feedback to Employee (optional)" rows={2} className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-md">{t('common.cancel')}</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">{t('common.save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DisciplinaryRecordModal;
