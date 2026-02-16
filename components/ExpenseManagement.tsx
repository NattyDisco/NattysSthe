import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { PlusIcon, CurrencyDollarIcon, PaperClipIcon, SearchIcon, ClockIcon, CheckCircleIcon, XCircleIcon, ChevronLeftIcon, ArrowTrendingUpIcon } from './icons';
import type { ExpenseClaim } from '../types';
import { useI18n } from '../hooks/useI18n';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div as any;

const StatusBadge: React.FC<{ status: ExpenseClaim['status'] }> = ({ status }) => {
    const styles = {
        pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
        approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
        rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800',
    };
    return (
        <span className={`px-4 py-1.5 text-[10px] font-black rounded-xl capitalize tracking-widest uppercase border-2 ${styles[status]}`}>
            {status}
        </span>
    );
};

const ExpenseManagement: React.FC = () => {
    const { 
        currentUser, expenseClaims, employees, updateExpenseClaimStatus, 
        openExpenseModal, openConfirmModal, setView 
    } = useAppContext();
    const { t } = useI18n();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    const isAdmin = currentUser?.userRole === 'admin' || currentUser?.userRole === 'super-admin' || currentUser?.userRole === 'Finance Manager';

    const getEmployee = (employeeId: string) => employees.find(e => e.id === employeeId);
  
    const filteredClaims = useMemo(() => {
        let claims = isAdmin ? expenseClaims : expenseClaims.filter(r => r.employeeId === currentUser?.id);
        
        if (statusFilter !== 'all') {
            claims = claims.filter(c => c.status === statusFilter);
        }
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            claims = claims.filter(c => {
                const emp = getEmployee(c.employeeId);
                return (
                    c.description.toLowerCase().includes(query) ||
                    (emp && `${emp.firstName} ${emp.surname}`.toLowerCase().includes(query))
                );
            });
        }

        return [...claims].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [expenseClaims, currentUser, isAdmin, statusFilter, searchQuery, employees]);

    const stats = useMemo(() => {
        const activeSet = isAdmin ? expenseClaims : expenseClaims.filter(c => c.employeeId === currentUser?.id);
        return {
            total: activeSet.reduce((acc, c) => acc + c.amount, 0),
            pending: activeSet.filter(c => c.status === 'pending').length,
            approved: activeSet.filter(c => c.status === 'approved').length,
            pendingValue: activeSet.filter(c => c.status === 'pending').reduce((acc, c) => acc + c.amount, 0)
        };
    }, [expenseClaims, currentUser, isAdmin]);

    const handleReject = (claimId: string) => {
        openConfirmModal(
            'Deny Claim',
            'This will permanently mark the expenditure as rejected in the audit trail. Proceed?',
            () => updateExpenseClaimStatus(claimId, 'rejected')
        );
    };

    return (
        <div className="container mx-auto animate-fadeIn pb-32">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-8">
                <div className="flex items-center gap-6">
                    <button onClick={() => setView('dashboard')} className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 hover:text-indigo-600 transition-all no-print">
                        <ChevronLeftIcon className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">Claims Registry</h1>
                        <p className="text-slate-500 font-medium italic mt-2">Manage operational expenditures and commercial reimbursements</p>
                    </div>
                </div>
                <button onClick={() => openExpenseModal(null)} className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95 transition-all">
                    <PlusIcon className="h-6 w-6" />
                    <span>Establish New Claim</span>
                </button>
            </div>

            {/* Financial Intelligence Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
                <div className="bg-white/80 dark:bg-slate-800/80 p-8 rounded-[3rem] shadow-xl border border-white/40 flex items-center gap-6 group hover:scale-[1.02] transition-all">
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-3xl"><CurrencyDollarIcon className="h-8 w-8" /></div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Cumulative Volume</p>
                        <p className="text-3xl font-black text-slate-800 dark:text-white">M {stats.total.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-white/80 dark:bg-slate-800/80 p-8 rounded-[3rem] shadow-xl border border-white/40 flex items-center gap-6 group hover:scale-[1.02] transition-all">
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-3xl"><ClockIcon className="h-8 w-8" /></div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Under Audit</p>
                        <p className="text-3xl font-black text-slate-800 dark:text-white">{stats.pending} Entries</p>
                    </div>
                </div>
                <div className="bg-white/80 dark:bg-slate-800/80 p-8 rounded-[3rem] shadow-xl border border-white/40 flex items-center gap-6 group hover:scale-[1.02] transition-all">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-3xl"><CheckCircleIcon className="h-8 w-8" /></div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Verified Approved</p>
                        <p className="text-3xl font-black text-slate-800 dark:text-white">{stats.approved} Settled</p>
                    </div>
                </div>
                <div className="bg-indigo-600 p-8 rounded-[3rem] shadow-2xl text-white flex items-center gap-6 relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                        <ArrowTrendingUpIcon className="h-32 w-32" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase text-indigo-200 tracking-widest mb-1">Pending Liquidity</p>
                        <p className="text-3xl font-black">M {stats.pendingValue.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Matrix Filter Bar */}
            <div className="bg-white/70 dark:bg-slate-800/70 p-6 rounded-[2.5rem] shadow-xl border border-white/30 dark:border-slate-700 backdrop-blur-xl mb-10 flex flex-col md:flex-row gap-6 no-print">
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Filter by description or staff member..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-all text-xs uppercase tracking-widest"
                    />
                </div>
                <div className="flex gap-2 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-[1.5rem] border dark:border-slate-700">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
                        <button 
                            key={f}
                            onClick={() => setStatusFilter(f)}
                            className={`px-6 py-2.5 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all ${statusFilter === f ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Ledger Display */}
            <div className="bg-white/80 dark:bg-slate-800/80 rounded-[3.5rem] shadow-2xl border border-white/40 overflow-hidden backdrop-blur-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b-2 dark:border-slate-700">
                            <tr className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                                <th className="p-8">Reference</th>
                                {isAdmin && <th className="p-8">Initiator</th>}
                                <th className="p-8">Expenditure Summary</th>
                                <th className="p-8 text-right">Value</th>
                                <th className="p-8 text-center">Lifecycle</th>
                                <th className="p-8 text-right">Verification</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredClaims.length > 0 ? (
                            filteredClaims.map((claim) => {
                                const emp = getEmployee(claim.employeeId);
                                return (
                                    <MotionDiv 
                                        initial={{ opacity: 0 }} 
                                        animate={{ opacity: 1 }} 
                                        key={claim.id} 
                                        className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all group"
                                    >
                                        <td className="p-8">
                                            <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-tighter">{claim.date}</p>
                                            <p className="text-[9px] font-bold text-slate-300 uppercase mt-1">TOKEN: #{claim.id.slice(-6)}</p>
                                        </td>
                                        {isAdmin && (
                                            <td className="p-8">
                                                <div className="flex items-center gap-4">
                                                    <img src={emp?.photoUrl} className="h-10 w-10 rounded-xl object-cover shadow-sm ring-2 ring-white dark:ring-slate-700" alt=""/>
                                                    <div>
                                                        <p className="font-black text-slate-800 dark:text-white uppercase leading-none">{emp?.firstName} {emp?.surname}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{emp?.department}</p>
                                                    </div>
                                                </div>
                                            </td>
                                        )}
                                        <td className="p-8">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded text-[8px] font-black uppercase tracking-[0.2em] inline-block w-fit border border-indigo-100 dark:border-indigo-800">{claim.category}</span>
                                                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 italic line-clamp-1 max-w-[280px]" title={claim.description}>{claim.description}</p>
                                            </div>
                                        </td>
                                        <td className="p-8 text-right font-black text-lg text-slate-900 dark:text-white tracking-tighter">
                                            M {claim.amount.toFixed(2)}
                                        </td>
                                        <td className="p-8 text-center">
                                            <StatusBadge status={claim.status} />
                                        </td>
                                        <td className="p-8 text-right">
                                            <div className="flex items-center justify-end gap-3 no-print">
                                                {claim.receiptUrl ? (
                                                    <a href={claim.receiptUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                                                        <PaperClipIcon className="h-4 w-4" />
                                                    </a>
                                                ) : (
                                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 text-slate-300 rounded-xl border border-dashed dark:border-slate-700">
                                                        <PaperClipIcon className="h-4 w-4 opacity-30" />
                                                    </div>
                                                )}
                                                {isAdmin && claim.status === 'pending' && (
                                                    <div className="flex gap-2 pl-4 border-l dark:border-slate-800 ml-2">
                                                        <button onClick={() => updateExpenseClaimStatus(claim.id, 'approved')} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-90" title="Authorize Settlement"><CheckCircleIcon className="h-5 w-5" /></button>
                                                        <button onClick={() => handleReject(claim.id)} className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-90" title="Reject Claim"><XCircleIcon className="h-5 w-5" /></button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </MotionDiv>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={isAdmin ? 6 : 5} className="text-center p-32">
                                    <div className="opacity-20 flex flex-col items-center">
                                        <CurrencyDollarIcon className="h-24 w-24 mb-6 text-slate-300"/>
                                        <h2 className="text-2xl font-black uppercase text-slate-400 tracking-[0.3em]">Registry Vacant</h2>
                                        <p className="text-slate-500 font-medium italic mt-2">Zero commercial claims detected in current stream.</p>
                                    </div>
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

export default ExpenseManagement;