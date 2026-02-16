import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';
import type { View } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MenuIcon,
  SearchIcon,
  SunIcon,
  MoonIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  BellIcon,
  LogoIcon,
  ChevronLeftIcon,
  DashboardIcon,
  UsersIcon,
  AttendanceIcon,
  RequestsIcon,
  TasksIcon,
  PayrollIcon,
  IdentificationIcon,
  ShoppingCartIcon,
  Cog8ToothIcon,
  UserIcon,
  ChevronRightIcon
} from './icons';

const Header: React.FC<{ toggleSidebar: () => void }> = () => {
    const { 
        currentUser, 
        theme, 
        toggleTheme, 
        openGlobalSearch,
        openSettingsMenu,
        view,
        setView,
    } = useAppContext();
    const { t } = useI18n();

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showLeftPointer, setShowLeftPointer] = useState(false);
    const navRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const handleScroll = () => {
        if (navRef.current) {
            // Show left pointer if we have scrolled away from the start
            setShowLeftPointer(navRef.current.scrollLeft > 20);
        }
    };

    const toggleFullscreen = async () => {
        if (!document.fullscreenElement) {
            try { await document.documentElement.requestFullscreen(); } catch (err) {}
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    };

    const role = currentUser?.userRole;
    const isSuperAdmin = role === 'super-admin';

    const navItems = useMemo(() => [
        { id: 'dashboard', label: 'Hub', icon: <DashboardIcon />, role: 'all' },
        { id: 'attendance', label: 'Audit', icon: <AttendanceIcon />, role: 'super-admin' },
        { id: 'employees', label: 'Staff', icon: <UsersIcon />, role: 'HR Manager' },
        { id: 'business_hub', label: 'Commercial', icon: <ShoppingCartIcon />, role: 'Finance Manager' },
        { id: 'payroll', label: 'Payroll', icon: <PayrollIcon />, role: 'super-admin' },
        { id: 'my_attendance', label: 'My Clock', icon: <UserIcon />, role: 'all' },
        { id: 'leave_management', label: 'Leave', icon: <RequestsIcon />, role: 'all' },
        { id: 'my_tasks', label: 'Directives', icon: <TasksIcon />, role: 'all' },
        { id: 'permits', label: 'Permits', icon: <IdentificationIcon />, role: 'super-admin' },
        { id: 'settings', label: 'System', icon: <Cog8ToothIcon />, role: 'admin' },
    ], []);

    const filteredNav = navItems.filter(item => {
        if (item.role === 'all') return true;
        if (isSuperAdmin) return true;
        return item.role === role;
    });

    return (
        <header className="flex-shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border-b border-slate-200 dark:border-slate-800 z-50 sticky top-0 no-print">
            <div className="max-w-[1600px] mx-auto flex flex-col">
                {/* Upper Tier: Branding and Actions */}
                <div className="flex items-center justify-between p-4 px-6 sm:px-8 border-b dark:border-slate-800/50">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer" onClick={() => setView('dashboard')}>
                            <LogoIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 dark:text-white leading-none">Natty Hub</h1>
                            <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-1">Operational Workspace v4.1</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shadow-inner">
                            <button onClick={openGlobalSearch} className="p-2 rounded-lg text-slate-500 hover:bg-white dark:hover:bg-slate-700 transition-all" title="Global Search"><SearchIcon className="h-4 w-4" /></button>
                            <button onClick={toggleFullscreen} className="p-2 rounded-lg text-slate-500 hover:bg-white dark:hover:bg-slate-700 transition-all hidden sm:block">
                                {isFullscreen ? <ArrowsPointingInIcon className="h-4 w-4" /> : <ArrowsPointingOutIcon className="h-4 w-4" />}
                            </button>
                            <button onClick={toggleTheme} className="p-2 rounded-lg text-slate-500 hover:bg-white dark:hover:bg-slate-700 transition-all">
                                {theme === 'light' ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
                            </button>
                        </div>

                        <button onClick={openSettingsMenu} className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                            <img 
                                src={currentUser?.photoUrl || `https://ui-avatars.com/api/?name=${currentUser?.firstName}&background=random`} 
                                className="h-9 w-9 rounded-xl object-cover ring-2 ring-white dark:ring-slate-700 shadow-sm"
                                alt=""
                            />
                            <div className="hidden lg:block text-left pr-2">
                                <p className="text-[10px] font-black uppercase text-slate-800 dark:text-white leading-none">{currentUser?.firstName}</p>
                                <p className="text-[8px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Registry Open</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Lower Tier: Horizontal Navigation Deck */}
                <div className="relative flex items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <AnimatePresence>
                        {showLeftPointer && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="absolute left-0 top-0 bottom-0 z-20 flex items-center pl-4 pointer-events-none"
                            >
                                <div className="p-1.5 bg-indigo-600 text-white rounded-full shadow-2xl animate-pulse">
                                    <ChevronLeftIcon className="h-4 w-4" />
                                </div>
                                <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-50 dark:from-slate-900 via-slate-50/80 dark:via-slate-900/80 to-transparent"></div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <nav 
                        ref={navRef}
                        onScroll={handleScroll}
                        className="flex-1 flex overflow-x-auto no-scrollbar scroll-smooth snap-x items-center px-4"
                    >
                        {filteredNav.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setView(item.id as View)}
                                className={`snap-start flex items-center gap-2.5 px-6 py-4.5 transition-all whitespace-nowrap border-b-2 font-black uppercase text-[10px] tracking-[0.2em] relative group ${
                                    view === item.id 
                                        ? 'border-indigo-600 text-indigo-600 bg-indigo-50/20 dark:bg-indigo-900/10' 
                                        : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                }`}
                            >
                                <div className={`${view === item.id ? 'text-indigo-600' : 'text-slate-300 group-hover:text-indigo-400'} transition-colors`}>
                                    {/* FIX: Added 'as any' cast to icon element in cloneElement to allow injection of className prop without strict interface checking */}
                                    {React.cloneElement(item.icon as any, { className: 'h-4 w-4' })}
                                </div>
                                {item.label}
                                {view === item.id && (
                                    <motion.div layoutId="nav-glow" className="absolute inset-0 bg-indigo-600/5 dark:bg-indigo-400/5 pointer-events-none" />
                                )}
                            </button>
                        ))}
                    </nav>
                    
                    {/* Visual Endcap */}
                    <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-slate-50 dark:from-slate-900 to-transparent pointer-events-none z-10" />
                </div>
            </div>
        </header>
    );
};

export default Header;