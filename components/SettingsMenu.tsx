import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';
import { PasswordIcon, SettingsIcon } from './icons';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ isOpen, onClose }) => {
    const { openChangePasswordModal, setView } = useAppContext();
    const { t } = useI18n();

    // FIX: Cast motion.div to any to avoid type errors with motion props.
    const MotionDiv = motion.div as any;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-40" onClick={onClose}>
                    <MotionDiv
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-20 right-4 w-56 bg-white dark:bg-slate-700 rounded-lg shadow-2xl border dark:border-slate-600 py-2"
                        onClick={(e: any) => e.stopPropagation()}
                    >
                       <button onClick={() => { setView('settings'); onClose(); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-600"><SettingsIcon className="h-5 w-5"/> {t('sidebar.settings')}</button>
                       <button onClick={() => { openChangePasswordModal(); onClose(); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-600"><PasswordIcon className="h-5 w-5"/> {t('settings_menu.change_password')}</button>
                    </MotionDiv>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SettingsMenu;