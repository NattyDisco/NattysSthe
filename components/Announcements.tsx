import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { MegaphoneIcon, PlusIcon, WhatsappIcon } from './icons';
import type { Announcement } from '../types';
import { useI18n } from '../hooks/useI18n';

const AnnouncementModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (data: { title: string; content: string }) => void; }> = ({ isOpen, onClose, onSave }) => {
    const { t } = useI18n();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ title, content });
        setTitle('');
        setContent('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center animate-fadeIn p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6">{t('announcements.modal.title')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('announcements.modal.form_title')}</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('announcements.modal.content')}</label>
                        <textarea value={content} onChange={e => setContent(e.target.value)} className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" rows={5} required />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500">{t('common.cancel')}</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">{t('announcements.modal.post_button')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Announcements: React.FC = () => {
    // FIX: Destructured missing `addAnnouncement` function from context.
    const { announcements, addAnnouncement, currentUser } = useAppContext();
    const { t } = useI18n();
    const [isModalOpen, setModalOpen] = useState(false);

    const handleSave = (data: { title: string; content: string }) => {
        addAnnouncement(data);
    };
    
    const handleShare = (ann: Announcement) => {
        const message = `*${t('announcements.share.title')}: ${ann.title}*\n\n${ann.content}\n\n- Attendance System`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className="container mx-auto animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold">{t('sidebar.announcements')}</h1>
                {currentUser?.userRole === 'admin' && (
                    <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors w-full sm:w-auto">
                        <PlusIcon className="h-5 w-5" />
                        <span>{t('announcements.new_button')}</span>
                    </button>
                )}
            </div>

            {announcements.length > 0 ? (
                <div className="space-y-6">
                    {announcements.map(ann => (
                        <div key={ann.id} className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 rounded-lg shadow-lg p-6 animate-fadeIn">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{ann.title}</h2>
                                <span className="text-sm text-slate-500 dark:text-slate-400 flex-shrink-0">{ann.date}</span>
                            </div>
                            <p className="mt-4 text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{ann.content}</p>
                            {currentUser?.userRole === 'admin' && (
                                <div className="mt-4 pt-4 border-t dark:border-slate-700 flex justify-end">
                                    <button onClick={() => handleShare(ann)} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors">
                                        <WhatsappIcon className="h-4 w-4" />
                                        {t('announcements.share_button')}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                 <div className="text-center py-16 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 rounded-lg shadow-lg">
                    <MegaphoneIcon className="h-16 w-16 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">{t('announcements.empty.title')}</h2>
                    <p className="text-slate-500 dark:text-slate-400">{t('announcements.empty.description')}</p>
                </div>
            )}
            
            <AnnouncementModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} />
        </div>
    );
};

export default Announcements;