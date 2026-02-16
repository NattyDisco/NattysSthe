import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { PasswordIcon } from './icons';
import { useI18n } from '../hooks/useI18n';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const { changePassword } = useAppContext();
  const { t } = useI18n();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal is closed
      setTimeout(() => {
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setSuccess('');
      }, 300); // Delay reset to allow for fade-out animation
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPassword || newPassword.length < 6) {
      setError(t('modals.change_password.error_length'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('modals.change_password.error_match'));
      return;
    }

    const result = await changePassword(newPassword);
    
    if (result.success) {
        setSuccess(t('modals.change_password.success'));
        setTimeout(() => {
            onClose();
        }, 1500);
    } else {
        setError(result.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center animate-fadeIn" onClick={onClose}>
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 rounded-lg p-8 shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="text-center">
            <div className="flex justify-center items-center mx-auto h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 mb-4">
                <PasswordIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold">{t('modals.change_password.title')}</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label className="block text-sm font-medium mb-1">{t('modals.change_password.new_password')}</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('modals.change_password.confirm_new_password')}</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
          </div>
          
          {error && <p className="text-sm text-red-500 text-center animate-fadeIn italic">{error}</p>}
          {success && <p className="text-sm text-green-500 text-center animate-fadeIn italic">{success}</p>}

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">{t('common.cancel')}</button>
            <button type="submit" disabled={!!success} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors">{t('modals.change_password.update_button')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ChangePasswordModal;
