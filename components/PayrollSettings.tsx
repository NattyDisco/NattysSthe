
import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';
import { ChevronLeftIcon, SaveIcon, CurrencyDollarIcon, CalculatorIcon, BriefcaseIcon, PlusIcon, TrashIcon } from './icons';
import { View, PayrollSettings, TaxBracket } from '../types';

const PayrollSettingsView: React.FC<{ setView: (view: View) => void }> = ({ setView }) => {
    const { payrollSettings, updatePayrollSettings } = useAppContext();
    const { t } = useI18n();

    const [form, setForm] = useState<PayrollSettings>(payrollSettings);

    const handleSave = async () => {
        await updatePayrollSettings(form);
        alert("Payroll calculation logic updated successfully.");
        setView('payroll');
    };

    const addTaxBracket = () => {
        setForm({
            ...form,
            taxBrackets: [...form.taxBrackets, { min: 0, max: null, rate: 0 }]
        });
    };

    const removeTaxBracket = (index: number) => {
        setForm({
            ...form,
            taxBrackets: form.taxBrackets.filter((_, i) => i !== index)
        });
    };

    const updateTaxBracket = (index: number, field: keyof TaxBracket, value: number | null) => {
        const updated = [...form.taxBrackets];
        updated[index] = { ...updated[index], [field]: value };
        setForm({ ...form, taxBrackets: updated });
    };

    return (
        <div className="container mx-auto animate-fadeIn max-w-6xl pb-32">
            <div className="flex items-center gap-6 mb-12">
                <button onClick={() => setView('payroll')} className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl hover:text-indigo-600 transition-all border dark:border-slate-700">
                    <ChevronLeftIcon className="h-6 w-6" />
                </button>
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter">Treasury Logic & Statutory Control</h1>
                    <p className="text-slate-500 font-medium italic">Configure official Lesotho tax brackets, NPF rates, and cycle standards</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left side: Base Config */}
                <div className="lg:col-span-4 space-y-8">
                    <section className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-700 space-y-8">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-600 flex items-center gap-3">
                            <CalculatorIcon className="h-5 w-5" /> Base Policy
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 ml-2">Days Per Month (Default: 22)</label>
                                <input 
                                    type="number" 
                                    value={form.workingDaysPerMonth} 
                                    onChange={e => setForm({...form, workingDaysPerMonth: parseInt(e.target.value) || 22})}
                                    className="w-full p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl font-black border-0 outline-none ring-2 ring-slate-100 dark:ring-slate-800 focus:ring-indigo-500 transition-all shadow-inner" 
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 ml-2">Standard Daily Hours</label>
                                <input 
                                    type="number" 
                                    value={form.workingHoursPerDay} 
                                    onChange={e => setForm({...form, workingHoursPerDay: parseInt(e.target.value) || 8})}
                                    className="w-full p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl font-black border-0 outline-none ring-2 ring-slate-100 dark:ring-slate-800 focus:ring-indigo-500 transition-all shadow-inner" 
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 ml-2">OT Rate Multiplier</label>
                                <input 
                                    type="number" 
                                    step="0.1"
                                    value={form.overtimeMultiplier} 
                                    onChange={e => setForm({...form, overtimeMultiplier: parseFloat(e.target.value) || 1.5})}
                                    className="w-full p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl font-black border-0 outline-none ring-2 ring-slate-100 dark:ring-slate-800 focus:ring-indigo-500 transition-all shadow-inner text-indigo-600" 
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 ml-2">Currency Symbol</label>
                                <input 
                                    type="text" 
                                    value={form.currency} 
                                    onChange={e => setForm({...form, currency: e.target.value.toUpperCase()})}
                                    className="w-full p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl font-black border-0 outline-none ring-2 ring-slate-100 dark:ring-slate-800 focus:ring-indigo-500 transition-all shadow-inner text-center" 
                                />
                            </div>
                        </div>
                    </section>

                    <section className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl text-white">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-4 bg-indigo-600 rounded-2xl"><CurrencyDollarIcon className="h-6 w-6" /></div>
                            <h3 className="text-lg font-black uppercase tracking-tighter">Pension Logic</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                                <span className="text-[10px] font-black uppercase tracking-widest">Enable NPF Deduct</span>
                                <input type="checkbox" checked={form.pensionEnabled} onChange={e => setForm({...form, pensionEnabled: e.target.checked})} className="h-6 w-6 accent-indigo-500" />
                            </div>
                            {form.pensionEnabled && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">NPF Contribution %</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            value={form.pensionPercentage} 
                                            onChange={e => setForm({...form, pensionPercentage: parseFloat(e.target.value) || 0})}
                                            className="w-full p-4 bg-white/5 rounded-2xl font-black border-0 outline-none focus:ring-2 focus:ring-indigo-500" 
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">%</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right side: Tax Brackets Editor */}
                <div className="lg:col-span-8 space-y-8">
                    <section className="bg-white dark:bg-slate-800 p-10 rounded-[3.5rem] shadow-2xl border border-white/20 h-full">
                        <div className="flex justify-between items-center mb-10">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-rose-50 dark:bg-rose-900/30 text-rose-600 rounded-[1.5rem] shadow-lg"><BriefcaseIcon className="h-6 w-6" /></div>
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tighter leading-none">P.A.Y.E. Tax Engine</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Tiered calculation sequence</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Toggle System</span>
                                <input type="checkbox" checked={form.payeEnabled} onChange={e => setForm({...form, payeEnabled: e.target.checked})} className="h-8 w-8 accent-indigo-600" />
                            </div>
                        </div>

                        <div className={`space-y-4 transition-all ${!form.payeEnabled ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                            <div className="grid grid-cols-12 gap-6 px-6 mb-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                                <div className="col-span-4">Tier Min (M)</div>
                                <div className="col-span-4">Tier Max (M)</div>
                                <div className="col-span-2 text-center">Rate (%)</div>
                                <div className="col-span-2"></div>
                            </div>

                            {form.taxBrackets.map((bracket, idx) => (
                                <div key={idx} className="grid grid-cols-12 gap-4 items-center bg-slate-50 dark:bg-slate-900 p-6 rounded-[2rem] border-2 border-transparent hover:border-indigo-100 transition-all">
                                    <div className="col-span-4">
                                        <input 
                                            type="number" 
                                            value={bracket.min} 
                                            onChange={e => updateTaxBracket(idx, 'min', parseFloat(e.target.value) || 0)}
                                            className="w-full p-4 bg-white dark:bg-slate-800 rounded-xl font-black text-sm outline-none border dark:border-slate-700 focus:ring-2 focus:ring-indigo-500" 
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <input 
                                            type="number" 
                                            placeholder="No Limit"
                                            value={bracket.max || ''} 
                                            onChange={e => updateTaxBracket(idx, 'max', e.target.value ? parseFloat(e.target.value) : null)}
                                            className="w-full p-4 bg-white dark:bg-slate-800 rounded-xl font-black text-sm outline-none border dark:border-slate-700 focus:ring-2 focus:ring-indigo-500" 
                                        />
                                    </div>
                                    <div className="col-span-2 relative">
                                        <input 
                                            type="number" 
                                            value={bracket.rate} 
                                            onChange={e => updateTaxBracket(idx, 'rate', parseFloat(e.target.value) || 0)}
                                            className="w-full p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl font-black text-sm text-center text-indigo-600 outline-none border border-indigo-100 dark:border-indigo-800 focus:ring-2 focus:ring-indigo-500" 
                                        />
                                    </div>
                                    <div className="col-span-2 flex justify-end">
                                        <button onClick={() => removeTaxBracket(idx)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button onClick={addTaxBracket} className="w-full py-6 mt-6 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem] text-slate-400 font-black uppercase text-[10px] tracking-widest hover:border-indigo-500 hover:text-indigo-600 transition-all flex items-center justify-center gap-3">
                                <PlusIcon className="h-5 w-5" /> Add Calculation Tier
                            </button>
                        </div>
                    </section>
                </div>

                {/* Final Commit */}
                <div className="lg:col-span-12">
                    <div className="bg-indigo-600 p-10 rounded-[3.5rem] shadow-2xl text-white flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-8">
                            <div className="p-6 bg-white/10 rounded-[2rem] backdrop-blur-md">
                                <SaveIcon className="h-10 w-10" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tight">Synchronize Fiscal Rules</h3>
                                <p className="text-indigo-100 font-medium italic">Logic will apply to all future draft generations and manual adjustments.</p>
                            </div>
                        </div>
                        <button onClick={handleSave} className="w-full md:w-auto px-16 py-5 bg-white text-indigo-600 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all">
                            Save Global Config
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PayrollSettingsView;
