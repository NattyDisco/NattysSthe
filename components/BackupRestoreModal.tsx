import React, { useRef } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';
import { ArrowDownOnSquareIcon, ArrowUpOnSquareIcon } from './icons';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({ isOpen, onClose }) => {
  const { restoreData, ...allData } = useAppContext();
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackup = () => {
    const dataToBackup = {
        employees: allData.allEmployees,
        attendanceRecords: allData.attendanceRecords,
        // ... include all other relevant state
    };
    const dataStr = JSON.stringify(dataToBackup);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `natty-hub-backup-${new Date().toISOString().slice(0,10)}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const json = JSON.parse(e.target?.result as string);
            restoreData(json);
            alert(t('modals.backup.restore_success'));
            onClose();
        } catch (error) {
            alert(t('modals.backup.restore_error'));
        }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6">{t('modals.backup.title')}</h2>
        <div className="space-y-4">
            <button onClick={handleBackup} className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg">
                <ArrowDownOnSquareIcon className="h-5 w-5"/>
                {t('modals.backup.backup_button')}
            </button>
             <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 p-3 bg-green-600 text-white rounded-lg">
                <ArrowUpOnSquareIcon className="h-5 w-5"/>
                {t('modals.backup.restore_button')}
            </button>
            <input type="file" ref={fileInputRef} onChange={handleRestore} accept=".json" className="hidden" />
        </div>
      </div>
    </div>
  );
};

export default BackupRestoreModal;
