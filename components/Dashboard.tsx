import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { AttendanceStatus, View } from '../types';
import { 
    UsersIcon, ClockIcon, RequestsIcon, MegaphoneIcon, PlusIcon, 
    TrophyIcon, AttendanceIcon, ExclamationCircleIcon, 
    IdentificationIcon, CarIcon, BulkAttendanceIcon, BellAlertIcon,
    BuildingOfficeIcon, ShoppingCartIcon, CurrencyDollarIcon, BriefcaseIcon,
    ArrowTrendingUpIcon, ChartIcon
} from './icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../hooks/useI18n';
import { getQuickDashboardInsight } from '../services/geminiService';
import { ATTENDANCE_STATUS_DETAILS } from '../constants';

const MotionDiv = motion.div as any;

const toYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatCurrency = (amount: number) => `M ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const SnappyVariant = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { type: 'spring', stiffness: 400, damping: 30 }
};

const StatCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: string | number;
    colorClass?: string;
    onClick?: () => void;
}> = ({ icon, title, value, colorClass = "text-indigo-600", onClick }) => (
    <MotionDiv
        {...SnappyVariant}
        className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-5 rounded-3xl shadow-lg border border-white/40 dark:border-slate-700/50 ${onClick ? 'cursor-pointer' : ''}`}
        whileHover={{ translateY: -3, scale: 1.02 }}
        onClick={onClick}
    >
        <div className="flex items-center gap-4">
            <div className={`p-3 bg-slate-100/50 dark:bg-slate-700/50 rounded-2xl ${colorClass}`}>
              {icon}
            </div>
            <div className="overflow-hidden">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{title}</p>
                <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 truncate">{value}</p>
            </div>
        </div>
    </MotionDiv>
);

const Dashboard: React.FC<{ setView: (view: View) => void }> = ({ setView }) => {
    const { 
        currentUser, employees, attendanceRecords, branches,
        workPermits, cars, vehiclePermits, allEmployees,
        inventory, businessProfile, salesHistory
     } = useAppContext();
    const { t } = useI18n();

    const [aiInsight, setAiInsight] = useState<string>("");
    const todayStr = toYYYYMMDD(new Date());

    const todaySalesStats = useMemo(() => {
        const todaySales = salesHistory.filter(s => s.date.startsWith(todayStr));
        return {
            revenue: todaySales.reduce((acc, s) => acc + s.totalAmount, 0),
            count: todaySales.length
        };
    }, [salesHistory, todayStr]);

    const expiringAlerts = useMemo(() => {
        const now = Date.now();
        const thirtyDays = 31 * 24 * 60 * 60 * 1000;
        const alerts: any[] = [];

        inventory.forEach(item => {
            if (item.quantity <= (item.minStockLevel || 5)) {
                alerts.push({ id: item.id, name: item.itemName, type: 'CRITICAL STOCK', expiry: `Qty: ${item.quantity}`, daysLeft: 0, critical: true });
            }
        });

        if (!businessProfile) alerts.push({ id: 'missing-profile', name: 'Commercial Hub', type: 'REGISTRY MISSING', expiry: 'Action Required', daysLeft: 0, critical: true });

        vehiclePermits.forEach(vp => {
            const expTime = new Date(vp.expiryDate).getTime();
            if (expTime <= now + thirtyDays) {
                const daysLeft = Math.ceil((expTime - now) / (1000 * 60 * 60 * 24));
                alerts.push({ id: vp.id, name: `${cars.find(c => c.id === vp.carId)?.name || 'Vehicle'} - ${vp.permitName}`, type: 'Vehicle Permit', expiry: vp.expiryDate, daysLeft, critical: daysLeft <= 7 });
            }
        });

        return alerts.sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 8);
    }, [cars, vehiclePermits, workPermits, inventory, businessProfile]);

    useEffect(() => {
      let active = true;
      const fetchInsight = async () => {
        const insight = await getQuickDashboardInsight(employees, attendanceRecords, t);
        if (active) setAiInsight(insight);
      };
      if (currentUser?.userRole !== 'employee') fetchInsight();
      return () => { active = false; };
    }, [employees, attendanceRecords, currentUser, t]);

    return (
        <div className="container mx-auto animate-fadeIn space-y-6 sm:space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">Commander Hub</h1>
                  <p className="text-xs sm:text-sm text-slate-500 font-black uppercase tracking-widest mt-2">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <AnimatePresence mode="wait">
                    {expiringAlerts.length > 0 && (
                        <MotionDiv 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-red-50 dark:bg-red-900/10 p-6 rounded-3xl border border-red-200 dark:border-red-800/50 shadow-xl overflow-hidden relative"
                        >
                            <div className="flex items-center justify-between mb-6 relative z-10">
                                <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                                    <BellAlertIcon className="h-6 w-6" />
                                    <h2 className="font-black uppercase tracking-widest text-[10px]">Priority Operation Radar</h2>
                                </div>
                                <span className="bg-red-600 text-white text-[8px] px-3 py-1 rounded-full font-black animate-pulse">ALERT ACTIVE</span>
                            </div>
                            <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar relative z-10">
                                {expiringAlerts.map(alert => (
                                    <div key={alert.id} className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-2xl border border-red-100 dark:border-red-900/30">
                                        <div className="min-w-0 pr-2">
                                            <p className="font-black text-[11px] text-slate-800 dark:text-white uppercase truncate">{alert.name}</p>
                                            <p className="text-[7px] text-slate-500 font-bold uppercase">{alert.type}</p>
                                        </div>
                                        <p className={`text-[10px] font-black ${alert.critical ? 'text-red-600' : 'text-orange-600'}`}>
                                            {alert.critical ? 'CRITICAL' : `${alert.daysLeft}d`}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </MotionDiv>
                    )}
                </AnimatePresence>

                {aiInsight && (
                    <MotionDiv 
                        {...SnappyVariant}
                        className="p-6 bg-indigo-600 rounded-3xl shadow-xl border border-indigo-500 flex flex-col justify-between"
                    >
                        <div className="flex gap-4 items-start">
                            <div className="bg-white/10 p-3 rounded-2xl text-white"><BriefcaseIcon className="h-6 w-6" /></div>
                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-100 mb-1">Operational Intelligence</p>
                                <p className="text-white font-medium italic text-base leading-relaxed">"{aiInsight}"</p>
                            </div>
                        </div>
                    </MotionDiv>
                )}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard icon={<UsersIcon />} title="Present" value={attendanceRecords.filter(r => r.date === todayStr && r.status === AttendanceStatus.Present).length} colorClass="text-emerald-500" />
                <StatCard icon={<ShoppingCartIcon />} title="Sales" value={todaySalesStats.count} colorClass="text-amber-500" onClick={() => setView('sales_reporting')} />
                <StatCard icon={<CurrencyDollarIcon />} title="Revenue" value={formatCurrency(todaySalesStats.revenue)} colorClass="text-emerald-600" onClick={() => setView('sales_reporting')} />
                <StatCard icon={<BuildingOfficeIcon />} title="Units" value={branches.length} colorClass="text-blue-500" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
              <div className="lg:col-span-3 bg-white/70 dark:bg-slate-800/70 p-6 sm:p-8 rounded-3xl shadow-xl border border-white/30 backdrop-blur-md">
                <h2 className="text-xl font-black flex items-center gap-3 uppercase mb-6">
                  <AttendanceIcon className="h-6 w-6 text-indigo-500" /> Latest Trail
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {attendanceRecords.slice(0, 6).map(r => {
                    const emp = allEmployees.find(e => e.id === r.employeeId);
                    return (
                      <div key={r.id} className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border dark:border-slate-800">
                        <div className="flex items-center gap-3 min-w-0">
                          <img src={emp?.photoUrl} className="h-8 w-8 rounded-lg object-cover" />
                          <p className="font-black text-[11px] text-slate-800 dark:text-slate-100 truncate uppercase">{emp?.firstName} {emp?.surname}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-[7px] font-black uppercase ${ATTENDANCE_STATUS_DETAILS[r.status]?.bgColor} ${ATTENDANCE_STATUS_DETAILS[r.status]?.color}`}>
                            {ATTENDANCE_STATUS_DETAILS[r.status]?.key}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
              
              <div className="lg:col-span-1 bg-slate-900 p-6 rounded-3xl shadow-xl text-white relative overflow-hidden flex flex-col justify-center">
                 <div className="absolute -right-4 -bottom-4 opacity-5 rotate-12"><ChartIcon className="h-32 w-32" /></div>
                 <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 mb-6">Quick Jump</h3>
                 <div className="space-y-2 relative z-10">
                    <button onClick={() => setView('business_hub')} className="w-full p-3 bg-white/5 hover:bg-indigo-600 rounded-xl font-black text-[9px] uppercase tracking-widest text-left transition-all">POS System →</button>
                    <button onClick={() => setView('employees')} className="w-full p-3 bg-white/5 hover:bg-indigo-600 rounded-xl font-black text-[9px] uppercase tracking-widest text-left transition-all">Staff Directory →</button>
                 </div>
              </div>
            </div>
        </div>
    );
};

export default Dashboard;