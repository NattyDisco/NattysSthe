import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n, supportedLanguages } from '../hooks/useI18n';
import { 
    BuildingOfficeIcon, Cog8ToothIcon, BellAlertIcon, 
    CurrencyDollarIcon, LanguageIcon, ChevronLeftIcon, UserGroupIcon, 
    LockClosedIcon, CalendarDaysIcon, DocumentTextIcon, 
    CloudIcon, BriefcaseIcon, SaveIcon, CalculatorIcon,
    ArrowTrendingUpIcon, IdentificationIcon, CheckCircleIcon,
    ArrowPathIcon, ShoppingCartIcon, StarIcon, ClockIcon,
    PlusIcon, TrashIcon
} from './icons';
import { motion, AnimatePresence } from 'framer-motion';
import { TaxBracket } from '../types';

const MotionDiv = motion.div as any;

type SettingsModule = 'identity' | 'personnel' | 'compensation' | 'commercial' | 'compliance' | 'system';

const Settings: React.FC = () => {
    const { 
        setView, companyProfile, updateCompanyProfile, 
        workingHoursSettings, updateWorkingHoursSettings,
        notificationSettings, updateNotificationSettings,
        payrollSettings, updatePayrollSettings,
        businessProfile, updateBusinessProfile,
        allEmployees
    } = useAppContext();
    
    const { t, setLanguage, language } = useI18n();

    const [activeModule, setActiveModule] = useState<SettingsModule>('identity');
    const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

    // Form States
    const [compForm, setCompForm] = useState(companyProfile);
    const [whForm, setWhForm] = useState(workingHoursSettings);
    const [notifForm, setNotifForm] = useState(notificationSettings);
    const [payForm, setPayForm] = useState(payrollSettings);
    const [busForm, setBusForm] = useState(businessProfile || { businessName: '', address: '', shopCapacity: '', vatRate: 15, registeredAt: '', id: '1' });
    
    const [lateThreshold, setLateThreshold] = useState(15);
    const [priorityWeights, setPriorityWeights] = useState({ High: 3, Medium: 2, Low: 1 });

    useEffect(() => {
        setCompForm(companyProfile);
        setWhForm(workingHoursSettings);
        setNotifForm(notificationSettings);
        setPayForm(payrollSettings);
        if (businessProfile) setBusForm(businessProfile);
    }, [companyProfile, workingHoursSettings, notificationSettings, payrollSettings, businessProfile]);

    const triggerSyncFeedback = (moduleName: string) => {
        setSyncFeedback(`Propagating ${moduleName} logic...`);
        setTimeout(() => setSyncFeedback(null), 2500);
    };

    const handleSaveModule = async (module: SettingsModule) => {
        try {
            switch (module) {
                case 'identity':
                    await updateCompanyProfile(compForm);
                    triggerSyncFeedback("Identity");
                    break;
                case 'personnel':
                    await updateWorkingHoursSettings(whForm);
                    triggerSyncFeedback("Personnel");
                    break;
                case 'compensation':
                    await updatePayrollSettings(payForm);
                    triggerSyncFeedback("Compensation");
                    break;
                case 'commercial':
                    await updateBusinessProfile(busForm);
                    triggerSyncFeedback("Commercial");
                    break;
                case 'compliance':
                    await updateNotificationSettings(notifForm);
                    triggerSyncFeedback("Compliance");
                    break;
                case 'system':
                    triggerSyncFeedback("System Environment");
                    break;
            }
        } catch (e) {
            console.error("Settings update failure", e);
        }
    };

    const moduleNav = [
        { id: 'identity', label: 'Identity', icon: <BuildingOfficeIcon />, color: 'text-indigo-500' },
        { id: 'personnel', label: 'Personnel', icon: <UserGroupIcon />, color: 'text-emerald-500' },
        { id: 'compensation', label: 'Compensation', icon: <CurrencyDollarIcon />, color: 'text-rose-500' },
        { id: 'commercial', label: 'Commercial', icon: <ShoppingCartIcon />, color: 'text-amber-500' },
        { id: 'compliance', label: 'Compliance', icon: <IdentificationIcon />, color: 'text-sky-500' },
        { id: 'system', label: 'System', icon: <Cog8ToothIcon />, color: 'text-slate-500' },
    ];

    const Input = ({ label, value, onChange, type = "text", placeholder = "", suffix = "" }: any) => (
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{label}</label>
            <div className="relative">
                <input 
                    type={type}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-all shadow-inner"
                    value={value} onChange={onChange} placeholder={placeholder}
                />
                {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-300 text-[10px] uppercase">{suffix}</span>}
            </div>
        </div>
    );

    const renderIdentity = () => (
        <MotionDiv initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
            <div className="flex items-center gap-4">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-[1.5rem] shadow-lg"><BuildingOfficeIcon className="h-8 w-8" /></div>
                <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter">Organization Profile</h3>
                    <p className="text-sm font-medium text-slate-400">Global branding and contact signatures</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Company Name" value={compForm.name} onChange={(e: any) => setCompForm({...compForm, name: e.target.value})} />
                <Input label="Primary Contact" value={compForm.contact} onChange={(e: any) => setCompForm({...compForm, contact: e.target.value})} />
                <div className="md:col-span-2">
                    <Input label="Official Headquarters Address" value={compForm.address} onChange={(e: any) => setCompForm({...compForm, address: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                    <Input label="Brand Asset URL (Logo)" value={compForm.logoUrl} onChange={(e: any) => setCompForm({...compForm, logoUrl: e.target.value})} />
                </div>
            </div>
            <button onClick={() => handleSaveModule('identity')} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">Synchronize Identity</button>
        </MotionDiv>
    );

    const renderPersonnel = () => (
        <MotionDiv initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
            <div className="flex items-center gap-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-[1.5rem] shadow-lg"><CalendarDaysIcon className="h-8 w-8" /></div>
                <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter">Personnel Standards</h3>
                    <p className="text-sm font-medium text-slate-400">Working hours, thresholds, and weighted priorities</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6 p-8 bg-white dark:bg-slate-900/50 rounded-[2.5rem] border-2 dark:border-slate-800">
                    <h4 className="text-[10px] font-black uppercase text-emerald-500 tracking-widest flex items-center gap-2"><ClockIcon className="h-4 w-4" /> Shift Cycle</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Shift Start" type="time" value={whForm.startTime} onChange={(e: any) => setWhForm({...whForm, startTime: e.target.value})} />
                        <Input label="Shift End" type="time" value={whForm.endTime} onChange={(e: any) => setWhForm({...whForm, endTime: e.target.value})} />
                    </div>
                    <Input label="Grace Period" type="number" suffix="Minutes" value={lateThreshold} onChange={(e: any) => setLateThreshold(parseInt(e.target.value) || 0)} />
                    <Input label="Mandatory Break" type="number" suffix="Minutes" value={whForm.allowedLunchMinutes} onChange={(e: any) => setWhForm({...whForm, allowedLunchMinutes: parseInt(e.target.value) || 0})} />
                </div>

                <div className="space-y-6 p-8 bg-white dark:bg-slate-900/50 rounded-[2.5rem] border-2 dark:border-slate-800">
                    <h4 className="text-[10px] font-black uppercase text-indigo-500 tracking-widest flex items-center gap-2"><StarIcon className="h-4 w-4" /> Performance Weights</h4>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500">High Priority Multiplier</span>
                            <input type="range" min="1" max="10" value={priorityWeights.High} onChange={e => setPriorityWeights({...priorityWeights, High: parseInt(e.target.value)})} className="w-32 accent-indigo-600" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500">Medium Priority Multiplier</span>
                            <input type="range" min="1" max="10" value={priorityWeights.Medium} onChange={e => setPriorityWeights({...priorityWeights, Medium: parseInt(e.target.value)})} className="w-32 accent-indigo-600" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500">Low Priority Multiplier</span>
                            <input type="range" min="1" max="10" value={priorityWeights.Low} onChange={e => setPriorityWeights({...priorityWeights, Low: parseInt(e.target.value)})} className="w-32 accent-indigo-600" />
                        </div>
                    </div>
                    <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center">
                        <p className="text-[9px] font-black uppercase text-slate-400">Weighted Average Scale</p>
                        <p className="text-xl font-black text-indigo-600">{priorityWeights.High} : {priorityWeights.Medium} : {priorityWeights.Low}</p>
                    </div>
                </div>
            </div>
            <button onClick={() => handleSaveModule('personnel')} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">Apply Personnel Rules</button>
        </MotionDiv>
    );

    const renderCompensation = () => (
        <MotionDiv initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
            <div className="flex items-center gap-4">
                <div className="p-4 bg-rose-50 dark:bg-rose-900/30 text-rose-600 rounded-[1.5rem] shadow-lg"><CalculatorIcon className="h-8 w-8" /></div>
                <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter">Treasury Logic</h3>
                    <p className="text-sm font-medium text-slate-400">Statutory Tax (P.A.Y.E) & NPF Rates</p>
                </div>
            </div>

            <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                    <Input label="Accounting Days / Month" type="number" value={payForm.workingDaysPerMonth} onChange={(e: any) => setPayForm({...payForm, workingDaysPerMonth: parseInt(e.target.value) || 22})} />
                    <Input label="Standard OT Multiplier" type="number" step="0.1" value={payForm.overtimeMultiplier} onChange={(e: any) => setPayForm({...payForm, overtimeMultiplier: parseFloat(e.target.value) || 1.5})} />
                </div>

                <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl space-y-6 border-4 border-indigo-500/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-black uppercase text-xs tracking-[0.2em] text-indigo-400 leading-none">Statutory Pension (NPF)</h4>
                            <p className="text-[10px] text-slate-500 mt-2">Applied to gross base salary per cycle</p>
                        </div>
                        <input type="checkbox" checked={payForm.pensionEnabled} onChange={e => setPayForm({...payForm, pensionEnabled: e.target.checked})} className="h-6 w-6 accent-indigo-500 cursor-pointer" />
                    </div>
                    {payForm.pensionEnabled && (
                        <div className="flex items-center gap-6 animate-fadeIn">
                             <div className="flex-1">
                                <label className="text-[9px] font-bold uppercase text-slate-500 ml-1">Current Contribution Rate %</label>
                                <input type="number" value={payForm.pensionPercentage} onChange={e => setPayForm({...payForm, pensionPercentage: parseFloat(e.target.value) || 0})} className="w-full bg-white/5 p-4 rounded-xl font-black border-2 border-indigo-500/30 outline-none mt-1 focus:border-indigo-500 transition-all" />
                             </div>
                        </div>
                    )}
                </div>

                <div className="p-8 bg-white dark:bg-slate-900/50 rounded-[3rem] border-2 dark:border-slate-800 space-y-6">
                    <div className="flex justify-between items-center mb-4">
                         <h4 className="font-black uppercase text-xs tracking-[0.2em] text-rose-500 leading-none">Statutory Tax Tiers</h4>
                         <button 
                            onClick={() => setPayForm({...payForm, taxBrackets: [...payForm.taxBrackets, { min: 0, max: null, rate: 0 }]})}
                            className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl hover:bg-indigo-600 transition-all"
                        >
                            <PlusIcon className="h-5 w-5" />
                        </button>
                    </div>
                    {payForm.taxBrackets.map((bracket, i) => (
                        <div key={i} className="grid grid-cols-12 gap-3 items-center group/tier">
                            <div className="col-span-4"><Input label="Min" type="number" value={bracket.min} onChange={(e: any) => {
                                const brackets = [...payForm.taxBrackets];
                                brackets[i].min = parseFloat(e.target.value) || 0;
                                setPayForm({...payForm, taxBrackets: brackets});
                            }} /></div>
                            <div className="col-span-4"><Input label="Max" type="number" placeholder="Max" value={bracket.max || ''} onChange={(e: any) => {
                                const brackets = [...payForm.taxBrackets];
                                brackets[i].max = e.target.value ? parseFloat(e.target.value) : null;
                                setPayForm({...payForm, taxBrackets: brackets});
                            }} /></div>
                            <div className="col-span-3"><Input label="Rate %" type="number" value={bracket.rate} onChange={(e: any) => {
                                const brackets = [...payForm.taxBrackets];
                                brackets[i].rate = parseFloat(e.target.value) || 0;
                                setPayForm({...payForm, taxBrackets: brackets});
                            }} /></div>
                            <div className="col-span-1 pt-6"><button onClick={() => setPayForm({...payForm, taxBrackets: payForm.taxBrackets.filter((_, idx) => idx !== i)})} className="p-2 text-slate-300 hover:text-red-500 transition-all"><TrashIcon className="h-5 w-5" /></button></div>
                        </div>
                    ))}
                </div>
            </div>
            <button onClick={() => handleSaveModule('compensation')} className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all">Commit Financial Rules</button>
        </MotionDiv>
    );

    const renderCommercial = () => (
        <MotionDiv initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
            <div className="flex items-center gap-4">
                <div className="p-4 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-[1.5rem] shadow-lg"><ShoppingCartIcon className="h-8 w-8" /></div>
                <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter">Commercial Core</h3>
                    <p className="text-sm font-medium text-slate-400">Business identity and statutory commerce rules</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Registry Business Name" value={busForm.businessName} onChange={(e: any) => setBusForm({...busForm, businessName: e.target.value})} />
                <Input label="LRS VAT Compliance %" type="number" value={busForm.vatRate} onChange={(e: any) => setBusForm({...busForm, vatRate: parseFloat(e.target.value) || 15})} />
                <div className="md:col-span-2">
                     <Input label="Official Document Header Address" value={busForm.address} onChange={(e: any) => setBusForm({...busForm, address: e.target.value})} />
                </div>
            </div>
            <button onClick={() => handleSaveModule('commercial')} className="w-full py-5 bg-amber-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all">Update Unit Registry</button>
        </MotionDiv>
    );

    const renderCompliance = () => (
        <MotionDiv initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
            <div className="flex items-center gap-4">
                <div className="p-4 bg-sky-50 dark:bg-sky-900/30 text-sky-600 rounded-[1.5rem] shadow-lg"><IdentificationIcon className="h-8 w-8" /></div>
                <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter">Compliance Radar</h3>
                    <p className="text-sm font-medium text-slate-400">Lead-time alerts for document and permit expiry</p>
                </div>
            </div>
            <div className="space-y-6">
                <div className="p-8 bg-white dark:bg-slate-800 rounded-[2.5rem] border-2 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-8 group">
                    <div className="flex-1 text-center sm:text-left">
                        <p className="font-black text-lg uppercase tracking-tight leading-none mb-2">Fleet Document Sensitivity</p>
                        <p className="text-xs text-slate-400 font-medium">Global alert threshold for road permits and renewals</p>
                    </div>
                    <div className="flex items-center gap-6 bg-slate-50 dark:bg-slate-900 p-4 rounded-3xl border dark:border-slate-800">
                        <Input label="Notify Days" type="number" value={notifForm.documentExpiry.daysBefore} onChange={(e: any) => setNotifForm({...notifForm, documentExpiry: {...notifForm.documentExpiry, daysBefore: parseInt(e.target.value)}})} />
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[8px] font-black uppercase text-slate-400">ACTIVE</span>
                            <input type="checkbox" checked={notifForm.documentExpiry.enabled} onChange={e => setNotifForm({...notifForm, documentExpiry: {...notifForm.documentExpiry, enabled: e.target.checked}})} className="h-6 w-6 accent-sky-500" />
                        </div>
                    </div>
                </div>
            </div>
            <button onClick={() => handleSaveModule('compliance')} className="w-full py-5 bg-sky-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all">Synchronize Thresholds</button>
        </MotionDiv>
    );

    const renderSystem = () => (
        <MotionDiv initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
            <div className="flex items-center gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-600 rounded-[1.5rem] shadow-lg"><Cog8ToothIcon className="h-8 w-8" /></div>
                <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter">Core Environment</h3>
                    <p className="text-sm font-medium text-slate-400">Localization, backup clusters, and session health</p>
                </div>
            </div>
            
            <div className="space-y-8">
                <div className="p-8 bg-white dark:bg-slate-900/50 rounded-[3rem] border-2 dark:border-slate-800 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 text-indigo-500"><LanguageIcon className="h-32 w-32" /></div>
                    <div className="flex items-center gap-3 mb-8 relative z-10">
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200">Global Localization Strategy</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Current Active Locale</label>
                            <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl border-2 border-indigo-100 dark:border-indigo-800">
                                <span className="w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase">{language}</span>
                                <span className="font-black text-sm uppercase tracking-tight text-indigo-600 dark:text-indigo-400">
                                    {supportedLanguages.find(l => l.code === language)?.name}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Switch User Interface Language</label>
                            <select 
                                value={language} 
                                onChange={e => { setLanguage(e.target.value); triggerSyncFeedback("Language Hub"); }}
                                className="w-full p-4 bg-white dark:bg-slate-800 border-4 border-slate-50 dark:border-slate-700 rounded-2xl font-black uppercase text-xs tracking-widest outline-none focus:border-indigo-500 shadow-2xl appearance-none cursor-pointer"
                            >
                                {supportedLanguages.map(l => (
                                    <option key={l.code} value={l.code}>
                                        {l.native} ({l.name})
                                    </option>
                                ))}
                            </select>
                            <p className="text-[9px] text-slate-400 font-bold uppercase italic text-center">Changes propagate globally across all modules.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-10 bg-slate-900 rounded-[3rem] text-white flex flex-col justify-between h-full group overflow-hidden border-4 border-slate-800 shadow-2xl">
                        <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform"><CloudIcon className="h-32 w-32" /></div>
                        <div className="relative z-10">
                            <h4 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2 text-indigo-400">
                                <ArrowPathIcon className="h-4 w-4" /> System Health Node
                            </h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span>Cloud Persistence</span>
                                    <span className="text-emerald-500 flex items-center gap-1 font-black"><CheckCircleIcon className="h-3 w-3"/> Latency Verified</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span>Locale Stream</span>
                                    <span className="text-indigo-400 font-black">L-5 Protocol Active</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span>Registry Volume</span>
                                    <span>{allEmployees.length} Staff Identified</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-10 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-4 border-dashed dark:border-slate-800 text-center space-y-8 flex flex-col justify-center">
                        <div className="p-6 bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl inline-block mx-auto border dark:border-slate-700">
                            <CloudIcon className="h-12 w-12 text-indigo-500" />
                        </div>
                        <div>
                            <p className="font-black text-sm uppercase tracking-tight">Registry Portability Cluster</p>
                            <p className="text-xs text-slate-500 italic mt-1 px-8">Snapshots capture local state, locales, and attendance markers.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button className="flex-1 py-4 bg-white dark:bg-slate-800 border-2 dark:border-slate-700 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:border-indigo-500 transition-all">Download JSON</button>
                            <button className="flex-1 py-4 bg-white dark:bg-slate-800 border-2 dark:border-slate-700 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:border-indigo-500 transition-all">Restore Hub</button>
                        </div>
                    </div>
                </div>
            </div>
        </MotionDiv>
    );

    return (
        <div className="container mx-auto animate-fadeIn pb-32">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 pt-4">
                <div className="flex items-center gap-6">
                    <button onClick={() => setView('dashboard')} className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border dark:border-slate-700 hover:text-indigo-600 transition-all no-print">
                        <ChevronLeftIcon className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="text-5xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">Logic Center</h1>
                        <p className="text-slate-500 font-medium italic mt-2 text-xl">Governance, statutory rules, and localization</p>
                    </div>
                </div>
                
                <AnimatePresence>
                    {syncFeedback && (
                        <MotionDiv initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-400">
                            <ArrowPathIcon className="h-5 w-5 animate-spin" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{syncFeedback}</span>
                        </MotionDiv>
                    )}
                </AnimatePresence>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-3xl rounded-[4rem] shadow-2xl border-4 border-white dark:border-slate-700 overflow-hidden flex flex-col lg:flex-row min-h-[750px]">
                <div className="w-full lg:w-72 bg-slate-50/50 dark:bg-slate-900/50 border-r-2 dark:border-slate-700 p-8 space-y-3 no-print">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] mb-8 ml-2">Module Nodes</p>
                    {moduleNav.map(nav => (
                        <button 
                            key={nav.id}
                            onClick={() => setActiveModule(nav.id as any)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] transition-all group ${activeModule === nav.id ? 'bg-white dark:bg-slate-800 shadow-xl ring-2 ring-indigo-500/20' : 'hover:bg-white/50 dark:hover:bg-slate-800/50'}`}
                        >
                            <div className={`transition-transform group-hover:scale-110 ${activeModule === nav.id ? nav.color : 'text-slate-400'}`}>
                                {React.cloneElement(nav.icon as any, { className: 'h-6 w-6' })}
                            </div>
                            <span className={`text-[11px] font-black uppercase tracking-widest ${activeModule === nav.id ? 'text-slate-800 dark:text-white' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                {nav.label}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="flex-1 p-10 md:p-16">
                    <AnimatePresence mode="wait">
                        <div key={activeModule}>
                            {activeModule === 'identity' && renderIdentity()}
                            {activeModule === 'personnel' && renderPersonnel()}
                            {activeModule === 'compensation' && renderCompensation()}
                            {activeModule === 'commercial' && renderCommercial()}
                            {activeModule === 'compliance' && renderCompliance()}
                            {activeModule === 'system' && renderSystem()}
                        </div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Settings;