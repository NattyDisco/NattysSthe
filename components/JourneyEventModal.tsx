import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';

interface JourneyEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: { employeeId: string; type: 'achievement' | 'training' } | null;
}

const JourneyEventModal: React.FC<JourneyEventModalProps> = ({ isOpen, onClose, context }) => {
    const { addJourneyEvent } = useAppContext();
    const { t } = useI18n();

    const [formData, setFormData] = useState({ date: '', title: '', description: '', provider: '' });

    useEffect(() => {
        setFormData({ date: new Date().toISOString().split('T')[0], title: '', description: '', provider: '' });
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!context) return;
        
        const { date, title, description, provider } = formData;
        const data = context.type === 'achievement' 
            ? { date, title, description }
            : { date, courseName: title, provider };
            
        addJourneyEvent(context.employeeId, context.type, data);
        onClose();
    };

    if (!isOpen || !context) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6">{t(`modals.journey.${context.type}_title`)}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
                    <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder={context.type === 'achievement' ? 'Achievement Title' : 'Course Name'} required className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
                    {context.type === 'achievement' ? (
                        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" rows={3} className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
                    ) : (
                        <input type="text" name="provider" value={formData.provider} onChange={handleChange} placeholder="Training Provider" className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
                    )}
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-md">{t('common.cancel')}</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">{t('common.save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default JourneyEventModal;