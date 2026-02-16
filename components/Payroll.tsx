import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';
import { 
    CalculatorIcon, Cog8ToothIcon, LockClosedIcon, 
    CheckCircleIcon, SearchIcon, PencilSquareIcon,
    ExportIcon, ArrowPathIcon, ArrowTrendingUpIcon,
    CurrencyDollarIcon, PrinterIcon, ChevronLeftIcon,
    LogoIcon, ClipboardDocumentListIcon
} from './icons';
import { PayrollRecord, View, Employee } from '../types';
import ManualPayrollModal from './ManualPayrollModal';
import { motion, AnimatePresence } from 'framer-motion';

const formatCurrency = (amount: number, currency: string = 'LSL') => 
    `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Payroll: React.FC<{ setView: (view: View) => void }> = ({ setView }) => {
    const { 
        allEmployees, payrollHistory, generatePayroll, lockPayrollRecord, 
        lockAllPayrollRecordsForMonth, openPayslipModal, openConfirmModal,
        calculateEmployeePayroll, payrollSettings, companyProfile
    } = useAppContext();
    const { t } = useI18n();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [adjustingContext, setAdjustingContext] = useState<{ employee: Employee, year: number, month: number } | null>(null);
    const [isSummaryReportOpen, setIsSummaryReportOpen] = useState(false);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthsArr = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('default', { month: 'long' }));
    const yearsArr = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    const activeRecords = useMemo(() => {
        const filtered = allEmployees.filter(e => 
            e.status === 'active' && 
            e.monthlySalary && 
            (e.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || e.surname.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        
        return filtered.map(emp => {
            const stored = payrollHistory.find(h => h.employeeId === emp.id && h.year === year && h.month === month);
            return { 
                employee: emp, 
                record: stored || calculateEmployeePayroll(emp.id, year, month), 
                isStored: !!stored 
            };
        }).filter(item => item.record !== null) as { employee: Employee, record: PayrollRecord, isStored: boolean }[];
    }, [allEmployees, payrollHistory, year, month, searchTerm, calculateEmployeePayroll]);

    const totals = useMemo(() => {
        return activeRecords.reduce((acc, curr) => ({
            gross: acc.gross + curr.record.grossEarnings,
            deductions: acc.deductions + (curr.record.grossEarnings - curr.record.netSalary),
            net: acc.net + curr.record.netSalary,
            tax: acc.tax + curr.record.payeAmount,
            pension: acc.pension + curr.record.pensionAmount,
            overtime: acc.overtime + curr.record.overtimePay,
            manualDeductions: acc.manualDeductions + curr.record.totalManualDeductions
        }), { gross: 0, deductions: 0, net: 0, tax: 0, pension: 0, overtime: 0, manualDeductions: 0 });
    }, [activeRecords]);

    const handleRunPayroll = async () => {
        openConfirmModal(
            "Execute Global Cycle",
            `This will recalculate and update all draft records for ${monthsArr[month]} ${year} based on the latest attendance and manual inputs. Continue?`,
            async () => {
                setIsLoading(true);
                await generatePayroll(year, month);
                setIsLoading(false);
            }
        );
    };

    const handleLockAll = () => {
        const unlockedCount = activeRecords.filter(r => !r.record.isLocked).length;
        if (unlockedCount === 0) return;
        
        openConfirmModal(
            "Seal Monthly Ledger",
            `Are you sure you want to seal ${unlockedCount} records for this month? Once sealed, records become immutable and the audit period closes.`,
            async () => {
                setIsLoading(true);
                await lockAllPayrollRecordsForMonth(year, month);
                setIsLoading(false);
            }
        );
    };

    const handleExportBankList = () => {
        const headers = ["Account Name", "Bank Name", "Account Number", "Amount", "Currency", "Reference"];
        const rows = activeRecords.map(({ employee, record }) => [
            `"${employee.firstName} ${employee.surname}"`,
            `"${employee.bankName || '---'}"`,
            `"${employee.bankAccount || '---'}"`,
            record.netSalary.toFixed(2),
            payrollSettings.currency,
            `"SAL-${monthsArr[month].slice(0,3)}-${year}"`
        ].join(','));
        
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `bank_transfer_list_${monthsArr[month]}_${year}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const MotionDiv = motion.div as any;

    if (isSummaryReportOpen) {
        return (
            <div className="container mx-auto animate-fadeIn pb-32">
                <div className="flex justify-between items-center mb-10 no-print">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSummaryReportOpen(false)} className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border hover:text-indigo-600 transition-all">
                            <ChevronLeftIcon className="h-6 w-6" />
                        </button>
                        <h1 className="text-3xl font-black uppercase tracking-tighter">Monthly Summary Report</h1>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => window.print()} className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95">
                            <PrinterIcon className="h-5 w-5" /> Export to PDF
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] shadow-2xl border dark:border-slate-800 printable-area">
                    <div className="flex justify-between items-start mb-12 border-b-2 border-slate-100 dark:border-slate-800 pb-10">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg">
                                <LogoIcon className="h-10 w-10 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">{companyProfile.name}</h2>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Global Payroll Summary Ledger</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Fiscal Cycle</p>
                            <p className="text-2xl font-black text-slate-800 dark:text-white uppercase">{monthsArr[month]} {year}</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b-2 dark:border-slate-800">
                                    <th className="py-4 px-2">Personnel</th>
                                    <th className="py-4 px-2 text-right">Gross</th>
                                    <th className="py-4 px-2 text-right">Overtime</th>
                                    <th className="py-4 px-2 text-right text-rose-500">PAYE</th>
                                    <th className="py-4 px-2 text-right text-rose-500">NPF</th>
                                    <th className="py-4 px-2 text-right text-rose-500">Manual Ded.</th>
                                    <th className="py-4 px-2 text-right text-indigo-600 font-black">Net Salary</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {activeRecords.map(({ employee, record }) => (
                                    <tr key={employee.id} className="text-xs">
                                        <td className="py-4 px-2">
                                            <p className="font-black text-slate-800 dark:text-white uppercase">{employee.firstName} {employee.surname}</p>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase">{employee.employeeId}</p>
                                        </td>
                                        <td className="py-4 px-2 text-right font-bold">{record.grossEarnings.toFixed(2)}</td>
                                        <td className="py-4 px-2 text-right">{record.overtimePay.toFixed(2)}</td>
                                        <td className="py-4 px-2 text-right text-rose-500/80">{record.payeAmount.toFixed(2)}</td>
                                        <td className="py-4 px-2 text-right text-rose-500/80">{record.pensionAmount.toFixed(2)}</td>
                                        <td className="py-4 px-2 text-right text-rose-500/80">{record.totalManualDeductions.toFixed(2)}</td>
                                        <td className="py-4 px-2 text-right font-black text-sm text-indigo-600">{formatCurrency(record.netSalary, '')}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="border-t-4 border-double dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                <tr className="font-black">
                                    <td className="py-6 px-2 uppercase text-[10px] tracking-widest text-slate-400">Total Liabilities</td>
                                    <td className="py-6 px-2 text-right">{totals.gross.toFixed(2)}</td>
                                    <td className="py-6 px-2 text-right">{totals.overtime.toFixed(2)}</td>
                                    <td className="py-6 px-2 text-right text-rose-600">{totals.tax.toFixed(2)}</td>
                                    <td className="py-6 px-2 text-right text-rose-600">{totals.pension.toFixed(2)}</td>
                                    <td className="py-6 px-2 text-right text-rose-600">{totals.manualDeductions.toFixed(2)}</td>
                                    <td className="py-6 px-2 text-right text-xl text-indigo-600 tracking-tighter">
                                        {formatCurrency(totals.net, payrollSettings.currency)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12 text-center md:text-left border-t-2 border-dashed dark:border-slate-800 pt-12">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Internal Certification</p>
                            <p className="text-xs font-medium text-slate-500 italic">"I hereby certify that this summary represents the accurate disbursement of organizational funds for the specified epoch."</p>
                            <div className="h-px bg-slate-300 w-48 mt-12 mx-auto md:ml-0" />
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Finance Director / Paymaster</p>
                        </div>
                        <div className="text-right space-y-4">
                            <div className="inline-block p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                                <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">Audit Token: PS-{Date.now().toString().slice(-8)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto animate-fadeIn space-y-8 pb-32">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                  <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Compensation Desk</h1>
                  <p className="text-slate-500 font-medium italic mt-1">Monthly ledger management and treasury disbursements</p>
                </div>
                
                <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                    <button onClick={() => setView('settings')} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-indigo-500 transition-all shadow-sm">
                        <Cog8ToothIcon className="h-5 w-5" /> Global Rules
                    </button>
                    <button 
                        onClick={() => setIsSummaryReportOpen(true)}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-indigo-500 transition-all shadow-sm"
                    >
                        <ClipboardDocumentListIcon className="h-5 w-5" /> Monthly Summary
                    </button>
                    <button 
                        onClick={handleExportBankList}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-xl"
                    >
                        <ExportIcon className="h-5 w-5" /> Bank List
                    </button>
                    <button 
                        onClick={handleRunPayroll} 
                        disabled={isLoading}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 disabled:bg-slate-400"
                    >
                        <CalculatorIcon className="h-5 w-5" />
                        {isLoading ? "Recalculating..." : "Run Global Cycle"}
                    </button>
                </div>
            </div>

            {/* Financial Cycle Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MotionDiv whileHover={{ scale: 1.02 }} className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden flex flex-col justify-between group">
                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform"><CurrencyDollarIcon className="h-40 w-40" /></div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase text-indigo-100 tracking-[0.3em] mb-4">Total Net Payout</p>
                        <p className="text-4xl font-black tracking-tighter font-mono">{formatCurrency(totals.net, payrollSettings.currency)}</p>
                        <div className="mt-4 flex items-center gap-2">
                            <span className="bg-white/10 px-2 py-1 rounded-lg text-[9px] font-black uppercase">Active Cycle</span>
                        </div>
                    </div>
                </MotionDiv>
                
                <div className="bg-white/80 dark:bg-slate-800/80 p-8 rounded-[2.5rem] shadow-xl border border-white/40 dark:border-slate-700 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Gross Expenditure</p>
                            <p className="text-3xl font-black text-slate-800 dark:text-white font-mono">{formatCurrency(totals.gross, payrollSettings.currency)}</p>
                        </div>
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl"><ArrowTrendingUpIcon className="h-6 w-6" /></div>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Total Cost to Company</p>
                </div>

                <div className="bg-white/80 dark:bg-slate-800/80 p-8 rounded-[2.5rem] shadow-xl border border-white/40 dark:border-slate-700 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Tax Liability (PAYE)</p>
                            <p className="text-3xl font-black text-rose-500 font-mono">{formatCurrency(totals.tax, payrollSettings.currency)}</p>
                        </div>
                        <div className="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 rounded-2xl"><CalculatorIcon className="h-6 w-6" /></div>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Remittance to LRS</p>
                </div>

                <div className="bg-white/80 dark:bg-slate-800/80 p-8 rounded-[2.5rem] shadow-xl border border-white/40 dark:border-slate-700 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Pension Fund (NPF)</p>
                            <p className="text-3xl font-black text-emerald-500 font-mono">{formatCurrency(totals.pension, payrollSettings.currency)}</p>
                        </div>
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 rounded-2xl"><ArrowPathIcon className="h-6 w-6" /></div>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Total Retained Savings</p>
                </div>
            </div>

            {/* Filter & Global Actions */}
            <div className="bg-white/80 dark:bg-slate-800/80 p-6 rounded-3xl shadow-xl border border-white/40 dark:border-slate-700/50 backdrop-blur-xl flex flex-col md:flex-row gap-6 items-center">
                <div className="flex items-center gap-4 flex-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Accounting Epoch:</span>
                    <select value={month} onChange={e => setCurrentDate(new Date(year, parseInt(e.target.value)))} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl font-black uppercase text-[11px] border-0 outline-none ring-2 ring-slate-100 dark:ring-slate-700 focus:ring-indigo-500 shadow-inner text-indigo-600">
                        {monthsArr.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                    <select value={year} onChange={e => setCurrentDate(new Date(parseInt(e.target.value), month))} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl font-black uppercase text-[11px] border-0 outline-none ring-2 ring-slate-100 dark:ring-slate-700 focus:ring-indigo-500 shadow-inner text-indigo-600">
                        {yearsArr.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Filter personnel..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-700 rounded-2xl font-black uppercase text-[10px] outline-none focus:border-indigo-500"
                        />
                    </div>
                    <button 
                        onClick={handleLockAll}
                        disabled={isLoading || activeRecords.every(r => r.record.isLocked)}
                        className="px-8 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-rose-500/20 active:scale-95 disabled:opacity-20"
                    >
                        Seal Monthly Ledger
                    </button>
                </div>
            </div>

            {/* Ledger Table */}
            <div className="bg-white dark:bg-slate-950 rounded-[3rem] shadow-2xl border dark:border-slate-800 overflow-hidden no-print">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-900/80 border-b dark:border-slate-800">
                            <tr className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                                <th className="p-8">Staff Registry</th>
                                <th className="p-8 text-right">Gross Income</th>
                                <th className="p-8 text-right">Statutory / Deduct</th>
                                <th className="p-8 text-right">Net Settlement</th>
                                <th className="p-8 text-center">Lifecycle</th>
                                <th className="p-8 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {activeRecords.map(({ employee, record, isStored }) => (
                                <tr key={employee.id} className="hover:bg-indigo-50/20 dark:hover:bg-indigo-900/5 transition-colors group">
                                    <td className="p-8">
                                        <div className="flex items-center gap-5">
                                            <img src={employee.photoUrl} className="h-12 w-12 rounded-[1.25rem] object-cover shadow-lg ring-4 ring-white dark:ring-slate-800" alt="" />
                                            <div>
                                                <p className="font-black text-slate-800 dark:text-white uppercase tracking-tighter text-lg leading-none">{employee.firstName} {employee.surname}</p>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">{employee.department} • {employee.employeeId}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8 text-right">
                                        <p className="font-black text-slate-700 dark:text-slate-300 text-sm font-mono">{formatCurrency(record.grossEarnings, payrollSettings.currency)}</p>
                                        <p className="text-[8px] text-slate-400 font-black uppercase tracking-tighter mt-1">
                                          Base: {formatCurrency(record.baseSalary, payrollSettings.currency)}
                                          {record.overtimePay > 0 && ` • OT: ${formatCurrency(record.overtimePay, payrollSettings.currency)}`}
                                        </p>
                                    </td>
                                    <td className="p-8 text-right">
                                        <p className="font-black text-rose-500 text-sm font-mono">{formatCurrency(record.grossEarnings - record.netSalary, payrollSettings.currency)}</p>
                                        <p className="text-[8px] text-slate-400 font-black uppercase tracking-tighter mt-1">Tax: {formatCurrency(record.payeAmount, payrollSettings.currency)} | Pension: {formatCurrency(record.pensionAmount, payrollSettings.currency)}</p>
                                    </td>
                                    <td className="p-8 text-right">
                                        <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter font-mono">{formatCurrency(record.netSalary, payrollSettings.currency)}</p>
                                    </td>
                                    <td className="p-8 text-center">
                                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 shadow-sm ${record.isLocked ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                            {record.isLocked ? 'Sealed' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="p-8 text-right">
                                        <div className="flex justify-end items-center gap-3">
                                            <button 
                                                onClick={() => openPayslipModal({ record, employee })}
                                                className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
                                            >
                                                Audit Slip
                                            </button>
                                            
                                            {!record.isLocked ? (
                                                <>
                                                    <button 
                                                        onClick={() => setAdjustingContext({ employee, year, month })}
                                                        className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all shadow-sm"
                                                        title="Manual Entry Override"
                                                    >
                                                        <PencilSquareIcon className="h-5 w-5" />
                                                    </button>
                                                    {isStored && (
                                                        <button 
                                                            onClick={() => openConfirmModal("Commit Record", "Finalize this specific record for the permanent archive?", () => lockPayrollRecord(record.id))}
                                                            className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 rounded-2xl transition-all shadow-sm"
                                                            title="Seal Entry"
                                                        >
                                                            <LockClosedIcon className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-2xl border border-emerald-100 dark:border-emerald-800" title={`Sealed on ${new Date(record.lockedAt!).toLocaleDateString()}`}>
                                                    <CheckCircleIcon className="h-6 w-6" />
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {activeRecords.length === 0 && (
                    <div className="p-40 text-center space-y-4 opacity-20">
                        <CalculatorIcon className="h-24 w-24 mx-auto text-slate-300" />
                        <h2 className="text-2xl font-black uppercase tracking-[0.4em]">Ledger Stream Vacant</h2>
                        <p className="font-bold italic">No active personnel found for the current accounting epoch</p>
                    </div>
                )}
            </div>

            {adjustingContext && (
                <ManualPayrollModal 
                    isOpen={!!adjustingContext} 
                    onClose={() => setAdjustingContext(null)} 
                    employee={adjustingContext.employee}
                    year={adjustingContext.year}
                    month={adjustingContext.month}
                />
            )}
        </div>
    );
};

export default Payroll;