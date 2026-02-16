import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { LeaveRequest, LeaveType } from '../types';
import { 
    PlusIcon, RequestsIcon, ChevronLeftIcon, 
    WhatsappIcon, BriefcaseIcon, ClockIcon, 
    CheckCircleIcon, XCircleIcon, CalendarDaysIcon,
    ExclamationTriangleIcon, InformationCircleIcon,
    ArrowTrendingUpIcon, IdentificationIcon
} from './icons';
import { useI18n } from '../hooks/useI18n';
import { useLeaveEngine } from '../hooks/useLeaveEngine';
import { motion, AnimatePresence } from 'framer-motion';
import { LEAVE_POLICIES } from '../constants';

const MotionDiv = motion.div as any;

const BalanceCard: React.FC<{ 
    type: string; 
    data: { used: number; total: number; remaining: number };
    policy: any;
}> = ({ type, data, policy }) => {
    const percent = Math.min(100, (data.used / data.total) * 100);
    return (
        <MotionDiv 
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-xl border-2 border-slate-50 dark:border-slate-700 flex flex-col justify-between group"
        >
            <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl ${policy.accentColor} text-white shadow-lg`}>
                    <ClockIcon className="h-5 w-5" />
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{type}</p>
                    <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">{data.remaining}</p>
                </div>
            </div>
            <div className="space-y-3">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
                    <span>Used: {data.used}d</span>
                    <span>Cap: {data.total}d</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border dark:border-slate-800 shadow-inner">
                    <MotionDiv 
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        className={`h-full ${policy.accentColor}`}
                    />
                </div>
                <p className="text-[8px] font-bold text-slate-400 italic leading-tight group-hover:text-slate-600 transition-colors">
                    {policy.description}
                </p>
            </div>
        </MotionDiv>
    );
};

const LeaveRequestModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<LeaveRequest, 'id' | 'status' | 'employeeId' | 'requestedAt'>) => void;
    engine: any;
}> = ({ isOpen, onClose, onSubmit, engine }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [type, setType] = useState<LeaveType>('Annual');

    const validation = useMemo(() => 
        engine.validateRequest(type, startDate, endDate), 
    [type, startDate, endDate, engine]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validation.isValid) return;
        onSubmit({ startDate, endDate, reason, type });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 overflow-y-auto" onClick={onClose}>
            <MotionDiv 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 sm:p-12 shadow-2xl w-full max-w-xl border-4 border-indigo-600/10" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-800 dark:text-white leading-none">Absence Dispatch</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Verified statutory leave terminal</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"><XCircleIcon className="h-8 w-8 text-slate-300" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Absence Category</label>
                            <select 
                                value={type} 
                                onChange={e => setType(e.target.value as LeaveType)}
                                className="w-full p-5 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-black uppercase text-xs tracking-widest outline-none focus:border-indigo-500 shadow-inner"
                            >
                                {Object.keys(LEAVE_POLICIES).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Impact Calculation</label>
                            <div className={`w-full p-5 rounded-2xl font-black text-center border-2 shadow-inner transition-colors ${validation.isValid ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                                {validation.days} Working Days
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Commencement</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="w-full p-5 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-bold outline-none focus:border-indigo-500 shadow-sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Termination</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required className="w-full p-5 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-bold outline-none focus:border-indigo-500 shadow-sm" />
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {(startDate && endDate) && (
                            <MotionDiv 
                                key={validation.message}
                                initial={{ opacity: 0, x: -10 }} 
                                animate={{ opacity: 1, x: 0 }}
                                className={`p-5 rounded-[1.5rem] flex items-start gap-4 border-2 ${validation.isValid ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}
                            >
                                {validation.isValid ? <CheckCircleIcon className="h-6 w-6 shrink-0" /> : <ExclamationTriangleIcon className="h-6 w-6 shrink-0" />}
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{validation.isValid ? 'Compliance Verified' : 'Policy Blocked'}</p>
                                    <p className="text-xs font-bold leading-snug">{validation.message}</p>
                                </div>
                            </MotionDiv>
                        )}
                    </AnimatePresence>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Justification Narrative</label>
                        <textarea value={reason} onChange={e => setReason(e.target.value)} required className="w-full p-6 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] font-medium text-sm outline-none focus:border-indigo-500 shadow-inner h-32 resize-none" placeholder="Provide context for registry validation..."></textarea>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Discard</button>
                        <button 
                            type="submit" 
                            disabled={!validation.isValid}
                            className={`flex-[2] py-5 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl transition-all ${!validation.isValid ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-50' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-indigo-500/30'}`}
                        >
                            Authorize Request
                        </button>
                    </div>
                </form>
            </MotionDiv>
        </div>
    );
};

const LeaveManagement: React.FC = () => {
    const { currentUser, leaveRequests, employees, addLeaveRequest, updateLeaveRequestStatus, setView, openRequestSubmittedModal } = useAppContext();
    const { t } = useI18n();
    const [isModalOpen, setModalOpen] = useState(false);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    const engine = useLeaveEngine(currentUser, leaveRequests);
    const isAdmin = currentUser?.userRole === 'admin' || currentUser?.userRole === 'super-admin' || currentUser?.userRole === 'HR Manager';

    const requestsToShow = useMemo(() => {
        const base = isAdmin ? leaveRequests : leaveRequests.filter(r => r.employeeId === currentUser?.id);
        return filter === 'all' ? base : base.filter(r => r.status === filter);
    }, [isAdmin, leaveRequests, currentUser, filter]);

    const handleSubmit = async (data: Omit<LeaveRequest, 'id' | 'status' | 'employeeId' | 'requestedAt'>) => {
        if (!currentUser) return;
        await addLeaveRequest({ ...data, employeeId: currentUser.id });
        openRequestSubmittedModal('Dispatch Successful', 'Your leave token has been submitted for organizational audit.');
    };

    return (
        <div className="container mx-auto animate-fadeIn pb-32 px-4">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 gap-8 pt-4">
                <div className="flex items-center gap-6">
                    <button onClick={() => setView('dashboard')} className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 hover:text-indigo-600 transition-all no-print">
                        <ChevronLeftIcon className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="text-5xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">Statutory Absence Registry</h1>
                        <p className="text-slate-500 font-medium italic mt-2 text-lg">Real-time Lesotho Labour Code compliance monitoring</p>
                    </div>
                </div>
                <button onClick={() => setModalOpen(true)} className="w-full xl:w-auto flex items-center justify-center gap-4 px-12 py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-indigo-500/30 hover:bg-indigo-700 active:scale-95 transition-all">
                    <PlusIcon className="h-6 w-6" />
                    <span>Establish New Absence</span>
                </button>
            </div>

            {/* Compliance Balance Radar */}
            <div className="mb-12">
                <div className="flex items-center gap-3 mb-8 ml-2">
                    <div className="p-2 bg-indigo-600 rounded-lg text-white"><IdentificationIcon className="h-5 w-5" /></div>
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Personal Statutory Inventory (2025 Cycle)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {engine.leaveBalances && Object.entries(engine.leaveBalances).map(([type, data]) => (
                        <BalanceCard 
                            key={type} 
                            type={type} 
                            data={data as any} 
                            policy={LEAVE_POLICIES[type as LeaveType]} 
                        />
                    ))}
                </div>
            </div>

            {/* Audit Trail Ledger */}
            <div className="bg-white/80 dark:bg-slate-800/80 rounded-[4rem] shadow-2xl border border-white/40 overflow-hidden backdrop-blur-xl">
                <div className="p-8 sm:p-10 border-b dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-6 bg-slate-50/50 dark:bg-slate-900/30 no-print">
                    <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-950 rounded-[1.5rem] border dark:border-slate-800 shadow-inner">
                        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
                            <button 
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${filter === f ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900 border-b-2 dark:border-slate-700">
                            <tr className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">
                                {isAdmin && <th className="p-10">Target Agent</th>}
                                <th className="p-10">Token Type</th>
                                <th className="p-10">Epoch Range</th>
                                <th className="p-10 text-center">Net Impact</th>
                                <th className="p-10">Status</th>
                                {isAdmin && <th className="p-10 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {requestsToShow.length > 0 ? (
                            requestsToShow.map(req => {
                                const emp = employees.find(e => e.id === req.employeeId);
                                const impact = engine.calculateWorkingDays(req.startDate, req.endDate);
                                return (
                                    <tr key={req.id} className="hover:bg-indigo-50/20 dark:hover:bg-indigo-900/5 transition-all">
                                        {isAdmin && (
                                            <td className="p-10">
                                                <div className="flex items-center gap-5">
                                                    <img src={emp?.photoUrl} className="h-12 w-12 rounded-xl object-cover shadow-lg ring-4 ring-white dark:ring-slate-700" alt="" />
                                                    <div>
                                                        <p className="font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none text-lg">{emp?.firstName} {emp?.surname}</p>
                                                        <p className="text-[9px] font-black text-slate-400 mt-2 uppercase tracking-widest">{emp?.role}</p>
                                                    </div>
                                                </div>
                                            </td>
                                        )}
                                        <td className="p-10">
                                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border-2 ${LEAVE_POLICIES[req.type].color} ${LEAVE_POLICIES[req.type].color.replace('text', 'bg').replace('600', '50')}`}>
                                                {req.type}
                                            </span>
                                        </td>
                                        <td className="p-10 font-mono text-sm text-slate-500">
                                            {req.startDate} <span className="mx-2 opacity-30">→</span> {req.endDate}
                                        </td>
                                        <td className="p-10 text-center font-black text-2xl text-slate-700 dark:text-slate-200">{impact}d</td>
                                        <td className="p-10">
                                            <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm ${req.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : req.status === 'rejected' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        {isAdmin && (
                                            <td className="p-10 text-right no-print">
                                                <div className="flex gap-2 justify-end">
                                                    {req.status === 'pending' ? (
                                                        <div className="flex gap-3">
                                                            <button onClick={() => updateLeaveRequestStatus(req.id, 'approved')} className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all active:scale-90"><CheckCircleIcon className="h-6 w-6" /></button>
                                                            <button onClick={() => updateLeaveRequestStatus(req.id, 'rejected')} className="p-4 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all active:scale-90"><XCircleIcon className="h-6 w-6" /></button>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => {
                                                            const phone = emp?.phone.replace(/\D/g, '');
                                                            const msg = `Hi ${emp?.firstName}, your ${req.type} leave (${req.startDate} to ${req.endDate}) is ${req.status}.`;
                                                            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
                                                        }} className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all active:scale-95"><WhatsappIcon className="h-6 w-6" /></button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={isAdmin ? 6 : 5} className="text-center p-60">
                                    <div className="opacity-20 flex flex-col items-center scale-150">
                                        <RequestsIcon className="h-24 w-24 mb-6 text-slate-300" />
                                        <h2 className="text-2xl font-black uppercase text-slate-400 tracking-[0.3em]">Ledger Empty</h2>
                                    </div>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            <LeaveRequestModal 
                isOpen={isModalOpen} 
                onClose={() => setModalOpen(false)} 
                onSubmit={handleSubmit} 
                engine={engine}
            />
        </div>
    );
};

export default LeaveManagement;
