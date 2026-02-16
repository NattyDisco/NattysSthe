import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { ExpenseClaim, ExpenseClaimCategory } from '../types';
import { useI18n } from '../hooks/useI18n';
// FIX: Added missing ArrowTrendingUpIcon to imports.
import { XCircleIcon, CurrencyDollarIcon, CalendarDaysIcon, PaperClipIcon, SparklesIcon, BriefcaseIcon, ArrowTrendingUpIcon } from './icons';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: ExpenseClaim | null;
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose, expense }) => {
  const { addExpenseClaim, currentUser } = useAppContext();
  const { t } = useI18n();

  const categories: ExpenseClaimCategory[] = ['Travel', 'Meals', 'Supplies', 'Training', 'Other'];
  
  const initialState = {
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: 'Travel' as ExpenseClaimCategory,
    amount: 0,
  };

  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (expense) {
      const { id, status, employeeId, ...editableData } = expense;
      setFormData(editableData as typeof initialState);
    } else {
      setFormData(initialState);
    }
  }, [expense, isOpen]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    addExpenseClaim({ ...formData, employeeId: currentUser.id });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex justify-center items-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-[4rem] p-10 sm:p-16 shadow-2xl w-full max-w-2xl border-8 border-indigo-600/10" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-12">
            <div>
                <h2 className="text-4xl font-black uppercase tracking-tighter text-indigo-600 leading-none mb-2">
                    {expense ? 'Update Registry' : 'Establish Claim'}
                </h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Expenditure Declaration Terminal</p>
            </div>
            <button onClick={onClose} className="p-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
                <XCircleIcon className="h-10 w-10 text-slate-300 hover:text-slate-500"/>
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-5 tracking-[0.4em] flex items-center gap-2">
                        <CalendarDaysIcon className="h-4 w-4 text-indigo-500" /> Event Date
                    </label>
                    <input 
                        type="date" 
                        name="date" 
                        value={formData.date} 
                        onChange={handleChange} 
                        required 
                        className="w-full p-6 bg-slate-50 dark:bg-slate-950 border-4 border-slate-100 dark:border-slate-800 rounded-[2rem] font-black uppercase text-sm outline-none focus:border-indigo-500 shadow-inner transition-all" 
                    />
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-5 tracking-[0.4em] flex items-center gap-2">
                        <BriefcaseIcon className="h-4 w-4 text-indigo-500" /> Intent Category
                    </label>
                    <div className="relative">
                        <select 
                            name="category" 
                            value={formData.category} 
                            onChange={handleChange} 
                            className="w-full p-6 bg-slate-50 dark:bg-slate-950 border-4 border-slate-100 dark:border-slate-800 rounded-[2rem] font-black uppercase text-xs tracking-widest outline-none focus:border-indigo-500 appearance-none shadow-inner transition-all cursor-pointer"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                            <ArrowTrendingUpIcon className="h-5 w-5" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-5 tracking-[0.4em] flex items-center gap-2">
                    <CurrencyDollarIcon className="h-4 w-4 text-indigo-500" /> Settlement Required (LSL)
                </label>
                <div className="relative">
                    <span className="absolute left-8 top-1/2 -translate-y-1/2 font-black text-indigo-600 text-3xl">M</span>
                    <input 
                        type="number" 
                        name="amount" 
                        step="0.01"
                        value={formData.amount || ''} 
                        onChange={handleChange} 
                        placeholder="0.00" 
                        required 
                        className="w-full p-10 pl-20 bg-slate-50 dark:bg-slate-950 border-4 border-slate-100 dark:border-slate-800 rounded-[3rem] font-black text-5xl outline-none focus:border-indigo-500 shadow-inner transition-all" 
                    />
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-5 tracking-[0.4em]">Operational Narrative</label>
                <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    rows={4} 
                    placeholder="Provide detailed justification for this expenditure..."
                    required 
                    className="w-full p-8 bg-slate-50 dark:bg-slate-950 border-4 border-slate-100 dark:border-slate-800 rounded-[2.5rem] font-medium text-base outline-none focus:border-indigo-500 shadow-inner resize-none transition-all" 
                />
            </div>

            <div className="p-10 bg-indigo-50/50 dark:bg-indigo-900/10 border-4 border-dashed border-indigo-100 dark:border-indigo-800/50 rounded-[3rem] group hover:border-indigo-500 transition-all cursor-pointer">
                <label className="flex flex-col items-center gap-4 cursor-pointer">
                    <input type="file" className="hidden" />
                    <div className="p-5 bg-white dark:bg-slate-800 rounded-[1.5rem] shadow-xl text-indigo-600 group-hover:scale-110 transition-transform">
                        <PaperClipIcon className="h-10 w-10" />
                    </div>
                    <div className="text-center">
                        <span className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 tracking-[0.3em]">Attach Verified Evidence</span>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">Digital Scans, PDFs or Photographic Proof</p>
                    </div>
                </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-6">
                <button type="button" onClick={onClose} className="flex-1 py-6 bg-slate-100 dark:bg-slate-800 rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] transition-all active:scale-95">Discard</button>
                <button type="submit" className="flex-[2] py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 active:scale-95 transition-all">Submit to Treasury</button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;