import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../hooks/useAppContext';
import { XCircleIcon, PrinterIcon, LogoIcon } from './icons';
import type { Employee, PayrollRecord } from '../types';

interface PayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    employee: Employee;
    record: PayrollRecord;
  } | null;
}

const formatCurrency = (amount: number, currency: string = 'LSL') => 
    `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PayslipModal: React.FC<PayslipModalProps> = ({ isOpen, onClose, data }) => {
    const { companyProfile, payrollSettings } = useAppContext();
    if (!data) return null;
    const { employee, record } = data;

    const handlePrint = () => window.print();
    const MotionDiv = motion.div as any;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex justify-center items-center p-4">
                    <MotionDiv
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 30 }}
                        className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden border dark:border-slate-800"
                        onClick={(e: any) => e.stopPropagation()}
                    >
                        <header className="flex-shrink-0 p-8 bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800 flex justify-between items-center no-print">
                            <div className="flex items-center gap-3">
                                <PrinterIcon className="h-6 w-6 text-slate-400" />
                                <h2 className="text-xl font-black uppercase tracking-tighter text-slate-600 dark:text-slate-300">Internal Audit Preview</h2>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={handlePrint} className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-700 rounded-2xl shadow-sm font-black text-[10px] uppercase tracking-widest hover:text-indigo-600 transition-all border dark:border-slate-600">
                                    <PrinterIcon className="h-4 w-4"/> Physical Print / PDF
                                </button>
                                <button onClick={onClose} className="p-3 bg-white dark:bg-slate-700 rounded-2xl shadow-sm hover:text-red-500 transition-all border dark:border-slate-600">
                                    <XCircleIcon className="h-6 w-6"/>
                                </button>
                            </div>
                        </header>
                        
                        <main className="flex-1 overflow-y-auto p-12 printable-area custom-scrollbar bg-white dark:bg-slate-900">
                            {/* Branding Header */}
                            <div className="flex justify-between items-start mb-16 border-b-2 border-slate-100 dark:border-slate-800 pb-12">
                                <div>
                                    <div className="flex items-center gap-5 mb-6">
                                        <div className="p-4 bg-indigo-600 rounded-[1.5rem] shadow-xl shadow-indigo-500/30">
                                            <LogoIcon className="h-10 w-10 text-white" />
                                        </div>
                                        <div>
                                            <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none mb-1">{companyProfile.name}</h1>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Confidential Compensation Statement</p>
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold text-slate-500 space-y-1">
                                        <p>{companyProfile.address}</p>
                                        <p>{companyProfile.contact}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-[2rem] border dark:border-slate-700 inline-block shadow-sm">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payment Interval</p>
                                        <p className="text-xl font-black text-slate-800 dark:text-white uppercase leading-none">
                                            {new Date(record.year, record.month).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Identity Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                                <div>
                                    <h4 className="text-[10px] font-black uppercase text-indigo-500 tracking-widest mb-6 border-b pb-2">Employee Master Record</h4>
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{employee.firstName} {employee.surname}</p>
                                            <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">{employee.role} — {employee.department}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-8">
                                            <div><p className="text-slate-400 uppercase text-[9px] font-black tracking-widest mb-1">Staff Identifier</p><p className="text-sm font-black text-slate-800 dark:text-slate-200">{employee.employeeId}</p></div>
                                            <div><p className="text-slate-400 uppercase text-[9px] font-black tracking-widest mb-1">Payment Channel</p><p className="text-sm font-black text-slate-800 dark:text-slate-200">{employee.bankName || 'Registry EFT'}</p></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-500/20 text-white relative overflow-hidden">
                                    <div className="absolute -right-4 -top-4 opacity-10">
                                        <LogoIcon className="h-32 w-32" />
                                    </div>
                                    <div className="relative z-10">
                                        <h4 className="text-[10px] font-black uppercase text-indigo-100 tracking-widest mb-4 text-center">Net Amount Payable</h4>
                                        <p className="text-6xl font-black text-center tracking-tighter mb-4">
                                            {formatCurrency(record.netSalary, payrollSettings.currency)}
                                        </p>
                                        <div className="h-px bg-white/20 w-full mb-4" />
                                        <p className="text-[9px] font-black text-center text-indigo-100 uppercase tracking-widest">Verified Digital Disbursement</p>
                                    </div>
                                </div>
                            </div>

                            {/* Breakdown Tables */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 border-t-2 border-slate-50 dark:border-slate-800 pt-12">
                                <section>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8 flex justify-between items-center">
                                        <span>Earnings Component</span>
                                        <span className="h-px bg-slate-100 dark:bg-slate-800 flex-1 ml-4" />
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-bold text-slate-600 dark:text-slate-400">Basic Wage</span>
                                            <span className="font-black text-slate-900 dark:text-slate-200">{formatCurrency(record.baseSalary, payrollSettings.currency)}</span>
                                        </div>
                                        {record.housingAllowance > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="font-bold text-slate-600 dark:text-slate-400">Housing Allowance</span>
                                                <span className="font-black text-emerald-600">{formatCurrency(record.housingAllowance, payrollSettings.currency)}</span>
                                            </div>
                                        )}
                                        {record.transportAllowance > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="font-bold text-slate-600 dark:text-slate-400">Transport Allowance</span>
                                                <span className="font-black text-emerald-600">{formatCurrency(record.transportAllowance, payrollSettings.currency)}</span>
                                            </div>
                                        )}
                                        {record.overtimePay > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="font-bold text-slate-600 dark:text-slate-400">Overtime Premium ({record.overtimeHours.toFixed(1)} hrs)</span>
                                                <span className="font-black text-emerald-600">{formatCurrency(record.overtimePay, payrollSettings.currency)}</span>
                                            </div>
                                        )}
                                        {record.additions.map((item) => {
                                            return (
                                                <div key={item.id} className="flex justify-between text-sm">
                                                    <span className="font-bold text-slate-600 dark:text-slate-400">{item.name}</span>
                                                    <span className="font-black text-emerald-600">{formatCurrency(item.amount, payrollSettings.currency)}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-8 pt-6 border-t-2 border-slate-50 dark:border-slate-800 flex justify-between font-black uppercase text-lg text-slate-900 dark:text-white tracking-tighter">
                                        <span>Gross Earnings</span>
                                        <span>{formatCurrency(record.grossEarnings, payrollSettings.currency)}</span>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8 flex justify-between items-center">
                                        <span>Deductions Component</span>
                                        <span className="h-px bg-slate-100 dark:bg-slate-800 flex-1 ml-4" />
                                    </h3>
                                    <div className="space-y-4">
                                        {record.payeAmount > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="font-bold text-slate-600 dark:text-slate-400">P.A.Y.E. Tax Retained</span>
                                                <span className="font-black text-red-500">{formatCurrency(record.payeAmount, payrollSettings.currency)}</span>
                                            </div>
                                        )}
                                        {record.pensionAmount > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="font-bold text-slate-600 dark:text-slate-400">NPF Contribution</span>
                                                <span className="font-black text-red-500">{formatCurrency(record.pensionAmount, payrollSettings.currency)}</span>
                                            </div>
                                        )}
                                        {record.absenceDeduction > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="font-bold text-slate-600 dark:text-slate-400">Absence Penalty ({record.absentDays} days)</span>
                                                <span className="font-black text-red-500">{formatCurrency(record.absenceDeduction, payrollSettings.currency)}</span>
                                            </div>
                                        )}
                                        {record.lateArrivalDeduction > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="font-bold text-slate-600 dark:text-slate-400">Late Arrival Penalty ({record.lateArrivalMinutes} min)</span>
                                                <span className="font-black text-red-500">{formatCurrency(record.lateArrivalDeduction, payrollSettings.currency)}</span>
                                            </div>
                                        )}
                                        {record.deductions.map((item) => (
                                            <div key={item.id} className="flex justify-between text-sm">
                                                <span className="font-bold text-slate-600 dark:text-slate-400">{item.name}</span>
                                                <span className="font-black text-red-500">{formatCurrency(item.amount, payrollSettings.currency)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-8 pt-6 border-t-2 border-slate-50 dark:border-slate-800 flex justify-between font-black uppercase text-lg text-slate-900 dark:text-white tracking-tighter">
                                        <span>Total Retentions</span>
                                        <span>{formatCurrency(record.grossEarnings - record.netSalary, payrollSettings.currency)}</span>
                                    </div>
                                </section>
                            </div>
                            
                            <div className="mt-16 grid grid-cols-2 gap-16">
                                <div className="border-t-2 border-slate-200 dark:border-slate-700 pt-4">
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-10">Employee Acceptance</p>
                                    <div className="h-px bg-slate-300 w-48 mb-2" />
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Signature & Date</p>
                                </div>
                                <div className="border-t-2 border-slate-200 dark:border-slate-700 pt-4 text-right">
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-10">Authorized Official</p>
                                    <div className="h-px bg-slate-300 w-48 mb-2 ml-auto" />
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Paymaster Registry Stamp</p>
                                </div>
                            </div>

                            <div className="mt-20 pt-10 border-t-2 border-dashed border-slate-100 dark:border-slate-100 text-center">
                                <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.4em] mb-4">Verification Certificate #PS-{record.id.slice(-8)}</p>
                                <p className="text-xs font-bold text-slate-400 italic">"This is a computer-generated salary statement issued by {companyProfile.name}. All statutory deductions are remitted to Lesotho Revenue Services & NPF respectively."</p>
                            </div>
                        </main>
                        
                        <footer className="p-8 bg-slate-50 dark:bg-slate-800/50 text-center no-print">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End of Master Record Preview</p>
                        </footer>
                    </MotionDiv>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PayslipModal;