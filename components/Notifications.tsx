
import React from 'react';
import { BellIcon, BellAlertIcon, ShoppingCartIcon } from './icons';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';

const Notifications: React.FC = () => {
    const { leaveRequests, currentUser, inventory, setView } = useAppContext();
    const { t } = useI18n();
    
    const isAdmin = currentUser?.userRole === 'admin' || currentUser?.userRole === 'super-admin' || currentUser?.userRole === 'HR Manager' || currentUser?.userRole === 'Finance Manager';

    const pendingRequests = isAdmin 
        ? leaveRequests.filter(r => r.status === 'pending')
        : [];

    const lowStockItems = isAdmin
        ? inventory.filter(i => i.quantity <= (i.minStockLevel || 5))
        : [];

    const hasNotifications = pendingRequests.length > 0 || lowStockItems.length > 0;

    return (
        <div className="container mx-auto animate-fadeIn pb-20">
            <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 dark:text-white mb-10">Notification Center</h1>
            
            <div className="space-y-6">
                {!hasNotifications && (
                    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 rounded-[2.5rem] shadow-lg p-20 text-center">
                        <BellIcon className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-black uppercase text-slate-400 tracking-widest mb-2">{t('notifications.all_caught_up')}</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-bold italic">{t('notifications.no_new')}</p>
                    </div>
                )}

                {/* HR Notifications */}
                {pendingRequests.map(req => (
                    <div key={req.id} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border-l-8 border-indigo-500 shadow-xl flex items-center justify-between group hover:scale-[1.01] transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl">
                                <BellAlertIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="font-black uppercase text-sm tracking-tight text-slate-800 dark:text-white">{t('notifications.new_leave_request')}</p>
                                <p className="text-xs text-slate-500 font-bold italic">{t('notifications.new_leave_request_desc')}</p>
                            </div>
                        </div>
                        <button onClick={() => setView('leave_management')} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-500/20 active:scale-95">Review Request</button>
                    </div>
                ))}

                {/* Inventory Notifications */}
                {lowStockItems.map(item => (
                    <div key={item.id} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border-l-8 border-red-500 shadow-xl flex items-center justify-between group hover:scale-[1.01] transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-2xl">
                                <ShoppingCartIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="font-black uppercase text-sm tracking-tight text-slate-800 dark:text-white">Critical Stock: {item.itemName}</p>
                                <p className="text-xs text-slate-500 font-bold italic">Current Qty: {item.quantity} {item.unit} (Min: {item.minStockLevel || 5})</p>
                            </div>
                        </div>
                        <button onClick={() => setView('business_hub')} className="px-6 py-2 bg-red-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-red-500/20 active:scale-95">Restock Now</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Notifications;
