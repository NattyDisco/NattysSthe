import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n, supportedLanguages } from '../hooks/useI18n';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LogoIcon, EmailIcon, LockClosedIcon, 
    LanguageIcon, ExclamationTriangleIcon, CheckCircleIcon,
    UserIcon, ArrowPathIcon
} from './icons';
import { authDB } from '../services/supabase';

const MotionDiv = motion.div as any;
const TARGET_ADMIN_EMAIL = 'ndabanattyhlojeng@gmail.com';

const LoginPage: React.FC = () => {
    const { login, signup, refreshData } = useAppContext();
    const { language, setLanguage } = useI18n();
    
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [surname, setSurname] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showTimeoutAction, setShowTimeoutAction] = useState(false);

    useEffect(() => {
        let timeout: any;
        if (isLoading) {
            timeout = setTimeout(() => {
                setShowTimeoutAction(true);
            }, 5000); // Show bypass if sync takes longer than 5 seconds
        } else {
            setShowTimeoutAction(false);
        }
        return () => clearTimeout(timeout);
    }, [isLoading]);

    const validate = () => {
        const errors: Record<string, string> = {};
        if (!email.includes('@')) errors.email = "Identity email required";
        if (password.length < 6) errors.password = "Min 6 chars required";
        
        if (isSignup) {
            if (!firstName) errors.firstName = "Name required";
            if (!surname) errors.surname = "Surname required";
            if (password !== confirmPassword) errors.confirmPassword = "Mismatch detected";
        }
        
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setFieldErrors({});
        setShowTimeoutAction(false);
        if (!validate()) return;
        
        setIsLoading(true);
        try {
            const result = await login(email, password);
            if (!result.success) {
                setError(result.message || "Registry Handshake Refused.");
                setIsLoading(false);
            }
        } catch (err: any) {
            setError(err.message || "Network Cluster Unreachable.");
            setIsLoading(false);
        }
    };

    const handleForcedEntry = async () => {
        setError('');
        setMessage('Purging registry cache & retrying handshake...');
        try {
            // Aggressive purge of session storage to break auth loops
            localStorage.clear();
            sessionStorage.clear();
            
            const { data: { session } } = await authDB.getSession();
            if (session?.user?.id) {
                await refreshData(session.user.id);
            } else {
                window.location.reload();
            }
        } catch (e) {
            window.location.reload();
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setFieldErrors({});
        if (!validate()) return;

        setIsLoading(true);
        try {
            const result = await signup(email, password, { firstName, surname });
            if (result.success) {
                setMessage(result.message || "Registry established. Stand by for node provisioning...");
                setTimeout(() => {
                    setIsSignup(false);
                    setPassword('');
                    setIsLoading(false);
                    setMessage(''); // Clear success message after redirect
                }, 4000);
            } else {
                setError(result.message || "Registry collision detected.");
                setIsLoading(false);
            }
        } catch (err: any) {
            setError("Infrastructure Sync Error.");
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-950 p-4 overflow-y-auto custom-scrollbar">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full animate-pulse delay-1000"></div>

            <div className="w-full max-w-lg mx-auto py-12 relative z-10">
                <div className="text-center mb-12">
                    <MotionDiv initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-5 bg-indigo-600 rounded-[2rem] w-24 h-24 mx-auto shadow-[0_20px_50px_-10px_rgba(79,70,229,0.5)] mb-8 flex items-center justify-center">
                        <LogoIcon className="h-12 w-12 text-white" />
                    </MotionDiv>
                    <h1 className="text-4xl font-black text-white uppercase tracking-[-0.05em] mb-3">Natty Registry</h1>
                    <p className="text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px] opacity-60">Enterprise Handshake terminal</p>
                </div>
                
                <MotionDiv 
                    layout
                    className="bg-white/5 backdrop-blur-3xl border-2 border-white/10 rounded-[3rem] shadow-2xl overflow-hidden"
                >
                    <div className="p-10 sm:p-14">
                        <AnimatePresence mode="wait">
                            {!isSignup ? (
                                <MotionDiv key="login" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                                    <div className="text-center">
                                        <h2 className="text-3xl font-black text-white uppercase tracking-tight">Identity Entry</h2>
                                        <p className="text-[10px] font-black text-slate-500 mt-2 uppercase tracking-widest">Provide terminal credentials</p>
                                    </div>

                                    <form onSubmit={handleLogin} className="space-y-6">
                                        <div className="space-y-2">
                                            <div className="relative group">
                                                <EmailIcon className="h-5 w-5 absolute top-1/2 left-5 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                                <input
                                                    type="email"
                                                    placeholder="Registry Email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full pl-14 pr-6 py-5 bg-white/5 border-2 border-white/5 rounded-2xl font-bold text-white outline-none focus:border-indigo-500 focus:bg-white/10 transition-all placeholder:text-slate-600"
                                                    required
                                                />
                                            </div>
                                            {fieldErrors.email && (
                                                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">
                                                    {fieldErrors.email}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <div className="relative group">
                                                <LockClosedIcon className="h-5 w-5 absolute top-1/2 left-5 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                                <input
                                                    type="password"
                                                    placeholder="Operational Key"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full pl-14 pr-6 py-5 bg-white/5 border-2 border-white/5 rounded-2xl font-bold text-white outline-none focus:border-indigo-500 focus:bg-white/10 transition-all placeholder:text-slate-600"
                                                    required
                                                />
                                            </div>
                                            {fieldErrors.password && (
                                                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">
                                                    {fieldErrors.password}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <button type="submit" disabled={isLoading} className="w-full py-5 bg-indigo-600 text-white rounded-[1.75rem] font-black uppercase text-xs tracking-widest hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 active:scale-95 disabled:bg-slate-800 transition-all">
                                                {isLoading ? (
                                                    <div className="flex items-center justify-center gap-3">
                                                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
                                                        Synchronizing...
                                                    </div>
                                                ) : "Verify Registry"}
                                            </button>
                                            
                                            {showTimeoutAction && (
                                                <button 
                                                    type="button" 
                                                    onClick={handleForcedEntry} 
                                                    className="w-full py-4 bg-rose-600/20 text-rose-400 border-2 border-rose-500/30 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg flex items-center justify-center gap-2 hover:bg-rose-600 hover:text-white transition-all animate-fadeIn"
                                                >
                                                    <ArrowPathIcon className="h-4 w-4" /> Sync Stalled? Force Bypass
                                                </button>
                                            )}
                                        </div>
                                    </form>

                                    <div className="text-center">
                                        <button onClick={() => { setIsSignup(true); setError(''); }} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition-colors">
                                            Awaiting Recruitment? <span className="text-indigo-500 underline">Register Profile</span>
                                        </button>
                                    </div>
                                </MotionDiv>
                            ) : (
                                <MotionDiv key="signup" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                    <div className="text-center">
                                        <h2 className="text-3xl font-black text-white uppercase tracking-tight">Profile Registry</h2>
                                        <p className="text-[10px] font-black text-slate-500 mt-2 uppercase tracking-widest">Establish personnel node</p>
                                    </div>

                                    <form onSubmit={handleSignup} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                placeholder="Name"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                className="w-full p-4 bg-white/5 border-2 border-white/5 rounded-2xl font-bold text-white outline-none focus:border-indigo-500 transition-all text-sm"
                                                required
                                            />
                                            {fieldErrors.firstName && (
                                                <p className="col-span-2 text-[10px] font-black text-rose-400 uppercase tracking-widest mt-1">
                                                    {fieldErrors.firstName}
                                                </p>
                                            )}
                                            <input
                                                type="text"
                                                placeholder="Surname"
                                                value={surname}
                                                onChange={(e) => setSurname(e.target.value)}
                                                className="w-full p-4 bg-white/5 border-2 border-white/5 rounded-2xl font-bold text-white outline-none focus:border-indigo-500 transition-all text-sm"
                                                required
                                            />
                                            {fieldErrors.surname && (
                                                <p className="col-span-2 text-[10px] font-black text-rose-400 uppercase tracking-widest mt-1">
                                                    {fieldErrors.surname}
                                                </p>
                                            )}
                                        </div>

                                        <input
                                            type="email"
                                            placeholder="Audit Email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full p-4 bg-white/5 border-2 border-white/5 rounded-2xl font-bold text-white outline-none focus:border-indigo-500 transition-all text-sm"
                                            required
                                        />
                                        {fieldErrors.email && (
                                            <p className="mt-1 text-[10px] font-black text-rose-400 uppercase tracking-widest">
                                                {fieldErrors.email}
                                            </p>
                                        )}

                                        <input
                                            type="password"
                                            placeholder="New Security Key"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full p-4 bg-white/5 border-2 border-white/5 rounded-2xl font-bold text-white outline-none focus:border-indigo-500 transition-all text-sm"
                                            required
                                        />
                                        {fieldErrors.password && (
                                            <p className="mt-1 text-[10px] font-black text-rose-400 uppercase tracking-widest">
                                                {fieldErrors.password}
                                            </p>
                                        )}

                                        <input
                                            type="password"
                                            placeholder="Confirm Security Key"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full p-4 bg-white/5 border-2 border-white/5 rounded-2xl font-bold text-white outline-none focus:border-indigo-500 transition-all text-sm"
                                            required
                                        />
                                        {fieldErrors.confirmPassword && (
                                            <p className="mt-1 text-[10px] font-black text-rose-400 uppercase tracking-widest">
                                                {fieldErrors.confirmPassword}
                                            </p>
                                        )}

                                        <button type="submit" disabled={isLoading} className="w-full py-5 bg-indigo-600 text-white rounded-[1.75rem] font-black uppercase text-xs tracking-widest shadow-xl transition-all mt-4">
                                            {isLoading ? "Provisioning Node..." : "Establish Profile"}
                                        </button>
                                    </form>

                                    <div className="text-center">
                                        <button onClick={() => setIsSignup(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400">
                                            Verified Agent? <span className="text-indigo-500 underline">Enter Registry</span>
                                        </button>
                                    </div>
                                </MotionDiv>
                            )}
                        </AnimatePresence>
                        
                        <AnimatePresence>
                            {error && (
                                <MotionDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-8 p-5 bg-rose-500/10 border-2 border-rose-500/20 rounded-2xl flex items-center gap-4">
                                    <div className="p-2 bg-rose-600 rounded-xl text-white shadow-lg shadow-rose-600/20"><ExclamationTriangleIcon className="h-5 w-5" /></div>
                                    <p className="text-[10px] font-black text-rose-400 uppercase leading-snug tracking-widest">{error}</p>
                                </MotionDiv>
                            )}
                            {message && (
                                <MotionDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-8 p-5 bg-emerald-500/10 border-2 border-emerald-500/20 rounded-2xl flex items-center gap-4">
                                    <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-lg shadow-emerald-600/20"><CheckCircleIcon className="h-5 w-5" /></div>
                                    <p className="text-[10px] font-black text-emerald-400 uppercase leading-snug tracking-widest">{message}</p>
                                </MotionDiv>
                            )}
                        </AnimatePresence>
                    </div>
                    
                    <div className="px-10 py-6 bg-white/5 border-t border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <LanguageIcon className="h-4 w-4 text-slate-500" />
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-transparent border-none focus:ring-0 outline-none cursor-pointer"
                            >
                                {supportedLanguages.map(lang => (
                                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                                ))}
                            </select>
                        </div>
                        <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.2em]">© 2025 Natty Framework</p>
                    </div>
                </MotionDiv>
            </div>
        </div>
    );
};

export default LoginPage;