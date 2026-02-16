import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../hooks/useAppContext';
import { XCircleIcon, PlusIcon, TrashIcon, CalculatorIcon, CurrencyDollarIcon } from './icons';
import { Employee, PayrollItem, PayrollInput } from '../types';
import { db } from '../services/db';

interface ManualPayrollModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: Employee;
    year: number;
    month: number;
}

const formatCurrency = (amount: number) => `M ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const ManualPayrollModal: React.FC<ManualPayrollModalProps> = ({ isOpen, onClose, employee, year, month }) => {
    const { payrollInputs, payrollSettings, calculateEmployeePayroll, refreshData } = useAppContext();
    const inputId = `${employee.id}-${year}-${month}`;
    
    const existingInput = useMemo(() => payrollInputs.find(i => i.id === inputId), [payrollInputs, inputId]);

    const [additions, setAdditions] = useState<PayrollItem[]>(existingInput?.manualAdditions || []);
    const [deductions, setDeductions] = useState<PayrollItem[]>(existingInput?.manualDeductions || []);
    const [manualOvertime, setManualOvertime] = useState<number>(existingInput?.manualOvertimeHours || 0);

    const previewRecord = useMemo(() => {
        // This generates a preview based on current modal state overrides
        const mockInput: PayrollInput = {
            id: inputId,
            employeeId: employee.id,
            year,
            month,
            manualAdditions: additions,
            manualDeductions: deductions,
            manualOvertimeHours: manualOvertime
        };
        return calculateEmployeePayroll(employee.id, year, month, mockInput);
    }, [employee.id, year, month, additions, deductions, manualOvertime, calculateEmployeePayroll, inputId]);

    const handleAddItem = (type: 'addition' | 'deduction') => {
        const newItem: PayrollItem = {
            id: crypto.randomUUID(),
            name: '',
            amount: 0,
            isTaxable: type === 'addition',
            type
        };
        if (type === 'addition') setAdditions([...additions, newItem]);
        else setDeductions([...deductions, newItem]);
    };

    const handleUpdateItem = (id: string, field: keyof PayrollItem, value: any, type: 'addition' | 'deduction') => {
        const setter = type === 'addition' ? setAdditions : setDeductions;
        const list = type === 'addition' ? additions : deductions;
        setter(list.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleRemoveItem = (id: string, type: 'addition' | 'deduction') => {
        const setter = type === 'addition' ? setAdditions : setDeductions;
        setter(prev => prev.filter(i => i.id !== id));
    };

    const handleSave = async () => {
        const input: PayrollInput = {
            id: inputId,
            employeeId: employee.id,
            year,
            month,
            manualAdditions: additions,
            manualDeductions: deductions,
            manualOvertimeHours: manualOvertime
        };
        await db.payrollInputs.put(input);
        await refreshData();
        onClose();
    };

    if (!isOpen) return null;

    const MotionDiv = motion.div as any;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex justify-center items-center p-4">
            <MotionDiv
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border dark:border-slate-800"
            >
                <header className="p-8 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter">Adjust Payroll: {employee.firstName}</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Period: {new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white dark:bg-slate-700 rounded-2xl shadow-sm hover:text-red-500 transition-all border dark:border-slate-600">
                        <XCircleIcon className="h-6 w-6"/>
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <section className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs font-black uppercase tracking-widest text-emerald-600">Additional Earnings</h3>
                                <button onClick={() => handleAddItem('addition')} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all">
                                    <PlusIcon className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {additions.map(item => (
                                    <div key={item.id} className="flex gap-2 items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border dark:border-slate-700">
                                        <input 
                                            placeholder="Label (e.g. Bonus)" 
                                            value={item.name} 
                                            onChange={e => handleUpdateItem(item.id, 'name', e.target.value, 'addition')}
                                            className="flex-1 bg-transparent font-bold text-sm outline-none" 
                                        />
                                        <input 
                                            type="number" 
                                            placeholder="0.00" 
                                            value={item.amount || ''} 
                                            onChange={e => handleUpdateItem(item.id, 'amount', parseFloat(e.target.value) || 0, 'addition')}
                                            className="w-24 bg-white dark:bg-slate-900 p-2 rounded-xl text-right font-black text-xs border dark:border-slate-700" 
                                        />
                                        <button onClick={() => handleRemoveItem(item.id, 'addition')} className="text-slate-300 hover:text-red-500 transition-colors">
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                                {additions.length === 0 && <p className="text-center py-4 text-xs font-bold text-slate-400 uppercase italic">No manual additions</p>}
                            </div>
                            
                            <div className="pt-4 border-t dark:border-slate-800">
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Manual Overtime Override (Hours)</label>
                                <input 
                                    type="number" 
                                    value={manualOvertime || ''} 
                                    onChange={e => setManualOvertime(parseFloat(e.target.value) || 0)}
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl font-black border dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" 
                                    placeholder="Add extra OT hours manually..."
                                />
                            </div>
                        </section>

                        <section className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs font-black uppercase tracking-widest text-red-500">Manual Deductions</h3>
                                <button onClick={() => handleAddItem('deduction')} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                                    <PlusIcon className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {deductions.map(item => (
                                    <div key={item.id} className="flex gap-2 items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border dark:border-slate-700">
                                        <input 
                                            placeholder="Label (e.g. Loan)" 
                                            value={item.name} 
                                            onChange={e => handleUpdateItem(item.id, 'name', e.target.value, 'deduction')}
                                            className="flex-1 bg-transparent font-bold text-sm outline-none" 
                                        />
                                        <input 
                                            type="number" 
                                            placeholder="0.00" 
                                            value={item.amount || ''} 
                                            onChange={e => handleUpdateItem(item.id, 'amount', parseFloat(e.target.value) || 0, 'deduction')}
                                            className="w-24 bg-white dark:bg-slate-900 p-2 rounded-xl text-right font-black text-xs border dark:border-slate-700 text-red-500" 
                                        />
                                        <button onClick={() => handleRemoveItem(item.id, 'deduction')} className="text-slate-300 hover:text-red-500 transition-colors">
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                                {deductions.length === 0 && <p className="text-center py-4 text-xs font-bold text-slate-400 uppercase italic">No manual deductions</p>}
                            </div>
                        </section>
                    </div>

                    <div className="bg-indigo-600 p-8 rounded-[2rem] shadow-2xl text-white relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 opacity-10">
                            <CalculatorIcon className="h-40 w-40" />
                        </div>
                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                            <div>
                                <p className="text-[10px] font-black uppercase text-indigo-100 tracking-widest mb-1">Projected Gross</p>
                                <p className="text-3xl font-black">{formatCurrency(previewRecord?.grossEarnings || 0)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-indigo-100 tracking-widest mb-1">Est. Retentions (PAYE/NPF)</p>
                                <p className="text-3xl font-black text-indigo-200">{formatCurrency((previewRecord?.payeAmount || 0) + (previewRecord?.pensionAmount || 0))}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-indigo-100 tracking-widest mb-1">Final Net Payout</p>
                                <p className="text-4xl font-black text-emerald-400 tracking-tighter">{formatCurrency(previewRecord?.netSalary || 0)}</p>
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="p-8 border-t dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="flex items-center gap-3 text-slate-400">
                        <CurrencyDollarIcon className="h-5 w-5" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Cycle adjustments are saved locally</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-8 py-3 bg-white dark:bg-slate-700 rounded-2xl font-black text-[10px] uppercase border dark:border-slate-600">Discard</button>
                        <button onClick={handleSave} className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all">Save Changes</button>
                    </div>
                </footer>
            </MotionDiv>
        </div>
    );
};

export default ManualPayrollModal;