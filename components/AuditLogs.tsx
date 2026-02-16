import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { AuditLogIcon, ExportIcon } from './icons';
import { useI18n } from '../hooks/useI18n';

const AuditLogs: React.FC = () => {
  const { auditLogs } = useAppContext();
  const { t } = useI18n();
  
  const handleExportCSV = () => {
    if (auditLogs.length === 0) return;
    const headers = ['Timestamp', 'User Name', 'User ID', 'Action'];
    const rows = auditLogs.map(log => 
      [
        `"${new Date(log.timestamp).toLocaleString()}"`,
        `"${log.userName}"`,
        `"${log.userId}"`,
        `"${log.action.replace(/"/g, '""')}"` // Escape double quotes
      ].join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const date = new Date().toISOString().split('T')[0];
    link.download = `audit-logs-${date}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="container mx-auto animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t('sidebar.audit_logs')}</h1>
         <button onClick={handleExportCSV} disabled={auditLogs.length === 0} className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm font-semibold disabled:bg-slate-400 disabled:cursor-not-allowed">
          <ExportIcon className="h-5 w-5" />
          <span>{t('audit_logs.export_csv')}</span>
        </button>
      </div>
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/70 dark:bg-slate-700/50 text-xs uppercase text-slate-700 dark:text-slate-400">
              <tr>
                <th className="p-4">{t('audit_logs.table.timestamp')}</th>
                <th className="p-4">{t('audit_logs.table.user')}</th>
                <th className="p-4">{t('audit_logs.table.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-700">
              {auditLogs.length > 0 ? (
                auditLogs.map((log, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50">
                    <td className="p-4 text-slate-600 dark:text-slate-400 font-mono whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4 font-medium text-slate-800 dark:text-slate-200">{log.userName} (ID: {log.userId})</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{log.action}</td>
                  </tr>
                ))
              ) : (
                <tr>
                    <td colSpan={3} className="text-center p-16">
                        <AuditLogIcon className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-500 dark:text-slate-400">{t('audit_logs.empty_state')}</p>
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
