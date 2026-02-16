

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';

interface DisciplinaryUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: { employeeId: string; recordId: string } | null;
}

const DisciplinaryUpdateModal: React.FC<DisciplinaryUpdateModalProps> = ({ isOpen, onClose, context }) => {
    const { addDisciplinaryUpdate, currentUser } = useAppContext();
    const { t } = useI18n();

    const [note, setNote] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setNote('');
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!context || !note.trim() || !currentUser) return;
        
        // FIX: Added required 'id' property to DisciplinaryUpdate object using crypto.randomUUID().
        addDisciplinaryUpdate(context.employeeId, context.recordId, {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            note: note.trim(),
            authorName: `${currentUser.firstName} ${currentUser.surname}`
        });
        
        onClose();
    };

    if(!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6">{t('modals.disciplinary.update_title')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">{t('modals.disciplinary.update_note')}</label>
                        <textarea 
                            name="note" 
                            value={note} 
                            onChange={(e) => setNote(e.target.value)} 
                            placeholder="Add a note about a meeting, decision, or observation..." 
                            required 
                            rows={5} 
                            className="w-full mt-1 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" 
                        />
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

export default DisciplinaryUpdateModal;
