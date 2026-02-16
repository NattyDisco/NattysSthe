import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';
import { BellAlertIcon, XCircleIcon } from './icons';
import { DocumentReminder, WorkPermitReminder, EmployeeDocumentReminder } from '../types';

type AlertItem =
  | (DocumentReminder & { alertType: 'vehicle' })
  | (WorkPermitReminder & { alertType: 'permit' })
  | (EmployeeDocumentReminder & { alertType: 'employeeDoc' });

const getAlertDetails = (alert: AlertItem) => {
    const isOverdue = alert.status === 'overdue';
    const daysText = isOverdue ? `${Math.abs(alert.daysUntil)} days overdue` : `in ${alert.daysUntil} days`;
    
    switch (alert.alertType) {
        case 'vehicle':
            return {
                title: `Vehicle Document ${isOverdue ? 'Expired' : 'Expiring'}`,
                message: `${alert.docType} for ${alert.vehicleModel} (${alert.plateNumber}) expires ${daysText}.`
            };
        case 'permit':
            return {
                title: `Work Permit ${isOverdue ? 'Expired' : 'Expiring'}`,
                message: `Work permit for ${alert.employeeName} expires ${daysText}.`
            };
        case 'employeeDoc':
            return {
                title: `Employee Document ${isOverdue ? 'Expired' : 'Expiring'}`,
                message: `Document '${alert.docTitle}' for ${alert.employeeName} expires ${daysText}.`
            };
        default:
            return { title: 'Alert', message: '' };
    }
};


const Alerts: React.FC = () => {
    const { 
        documentReminders, 
        workPermitReminders, 
        employeeDocumentReminders,
        dismissDocumentReminder,
        dismissWorkPermitReminder,
        dismissEmployeeDocumentReminder
    } = useAppContext();
    const { t } = useI18n();
    
    const allAlerts: AlertItem[] = [
        ...documentReminders.map(r => ({ ...r, alertType: 'vehicle' as const })),
        ...workPermitReminders.map(r => ({ ...r, alertType: 'permit' as const })),
        ...employeeDocumentReminders.map(r => ({ ...r, alertType: 'employeeDoc' as const }))
    ].sort((a, b) => a.daysUntil - b.daysUntil);

    const handleDismiss = (alert: AlertItem) => {
        switch (alert.alertType) {
            case 'vehicle': return dismissDocumentReminder(alert.id);
            case 'permit': return dismissWorkPermitReminder(alert.id);
            case 'employeeDoc': return dismissEmployeeDocumentReminder(alert.id);
        }
    }

    return (
        <div className="container mx-auto animate-fadeIn">
            <h1 className="text-3xl font-bold mb-6">{t('sidebar.alerts')}</h1>
            
            <div className="space-y-4">
                {allAlerts.length > 0 ? (
                    allAlerts.map(alert => {
                        const { title, message } = getAlertDetails(alert);
                        const borderColor = alert.status === 'overdue' ? 'border-red-500' : 'border-orange-500';
                        return (
                            <div key={alert.id} className={`bg-white/70 dark:bg-slate-800/70 p-4 rounded-lg shadow-md border-l-4 ${borderColor} flex items-start justify-between`}>
                                <div>
                                    <p className="font-bold">{title}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p>
                                </div>
                                <button onClick={() => handleDismiss(alert)} className="p-1 text-slate-400 hover:text-slate-600">
                                    <XCircleIcon className="h-5 w-5"/>
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center p-16 bg-white/70 dark:bg-slate-800/70 rounded-lg shadow-lg">
                        <BellAlertIcon className="h-16 w-16 text-slate-400 mx-auto mb-4"/>
                        <h2 className="text-xl font-semibold">{t('alerts.empty.title')}</h2>
                        <p className="text-slate-500">{t('alerts.empty.description')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Alerts;