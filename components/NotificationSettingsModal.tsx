
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { NotificationSettings } from '../types';
import { useI18n } from '../hooks/useI18n';
import { BellAlertIcon } from './icons';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({ isOpen, onClose }) => {
  const { notificationSettings, updateNotificationSettings } = useAppContext();
  const { t } = useI18n();

  const [settings, setSettings] = useState(notificationSettings);

  useEffect(() => {
    setSettings(notificationSettings);
  }, [notificationSettings, isOpen]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked, value, type } = e.target;
      const [category, prop] = name.split('.');
      
      setSettings(prev => {
        const catKey = category as keyof NotificationSettings;
        const currentVal = prev[catKey];
        if (typeof currentVal === 'object' && currentVal !== null) {
          return {
            ...prev,
            [catKey]: {
              ...currentVal,
              [prop]: type === 'checkbox' ? checked : parseInt(value) || 0,
            },
          };
        }
        return prev;
      });
  };

  const handleSave = () => {
    updateNotificationSettings(settings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-6">
            <BellAlertIcon className="h-8 w-8 text-indigo-500" />
            <h2 className="text-2xl font-bold">{t('modals.notifications.title')}</h2>
        </div>
        
        <div className="space-y-6">
            <section className="p-4 border dark:border-slate-700 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                    <label className="font-bold text-slate-800 dark:text-slate-200">Vehicle Documents</label>
                    <input 
                        type="checkbox" 
                        name="documentExpiry.enabled" 
                        checked={settings.documentExpiry.enabled} 
                        onChange={handleChange} 
                        className="h-5 w-5"
                    />
                </div>
                {settings.documentExpiry.enabled && (
                    <div className="space-y-2">
                        <label className="block text-sm text-slate-500">Days before expiry to notify:</label>
                        <input 
                            type="number" 
                            name="documentExpiry.daysBefore" 
                            value={settings.documentExpiry.daysBefore} 
                            onChange={handleChange} 
                            className="w-full p-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-md"
                        />
                    </div>
                )}
            </section>

            <section className="p-4 border dark:border-slate-700 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                    <label className="font-bold text-slate-800 dark:text-slate-200">Work Permits</label>
                    <input 
                        type="checkbox" 
                        name="workPermitExpiry.enabled" 
                        checked={settings.workPermitExpiry.enabled} 
                        onChange={handleChange} 
                        className="h-5 w-5"
                    />
                </div>
                {settings.workPermitExpiry.enabled && (
                    <div className="space-y-2">
                        <label className="block text-sm text-slate-500">Days before expiry to notify:</label>
                        <input 
                            type="number" 
                            name="workPermitExpiry.daysBefore" 
                            value={settings.workPermitExpiry.daysBefore} 
                            onChange={handleChange} 
                            className="w-full p-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-md"
                        />
                    </div>
                )}
            </section>
        </div>

        <div className="flex justify-end gap-4 pt-6 mt-4 border-t dark:border-slate-700">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-lg">{t('common.cancel')}</button>
            <button type="button" onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">{t('common.save')}</button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsModal;
