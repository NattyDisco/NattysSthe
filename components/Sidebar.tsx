import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DashboardIcon, UsersIcon, AttendanceIcon, RequestsIcon, TasksIcon, 
    PayrollIcon, BuildingOfficeIcon, IdentificationIcon, CurrencyDollarIcon, 
    ClipboardDocumentListIcon, SettingsIcon, Cog8ToothIcon, FingerPrintIcon, 
    DataAnalyticsIcon, ChevronDownIcon,
    BriefcaseIcon, ChartIcon, CalculatorIcon, UserGroupIcon, ClockIcon, 
    XCircleIcon, LockClosedIcon, DocumentTextIcon, LogoIcon,
    ShoppingCartIcon, UserIcon, SparklesIcon, StarIcon
} from './icons';
import type { View } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  setView: (view: View) => void;
  currentView: View;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  view: View;
  currentView: View;
  setView: (view: View) => void;
  color?: string;
  badge?: number;
}> = ({ icon, label, view, currentView, setView, color = "text-indigo-500", badge }) => {
  const isActive = currentView === view;
  return (
    <button
      onClick={() => setView(view)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-[11px] font-black uppercase tracking-widest ${
        isActive
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600'
      }`}
    >
      <div className={isActive ? 'text-white' : color}>
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: 'h-4 w-4' }) : icon}
      </div>
      <span className="flex-1 text-left truncate">{label}</span>
      {badge && badge > 0 ? (
        <span className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {badge}
        </span>
      ) : null}
    </button>
  );
};

const SectionHeader: React.FC<{ 
    label: string; 
    icon: React.ReactNode; 
    isOpen: boolean; 
    onClick: () => void;
}> = ({ label, icon, isOpen, onClick }) => (
    <div 
        onClick={onClick}
        className="flex items-center gap-3 px-2 py-4 cursor-pointer group"
    >
        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400 group-hover:text-indigo-500 transition-colors">
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: 'h-4 w-4' }) : icon}
        </div>
        <span className="flex-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
            {label}
        </span>
        <motion.div 
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="text-slate-300"
        >
             <ChevronDownIcon className="h-4 w-4" />
        </motion.div>
    </div>
);

const CollapsibleGroup: React.FC<{
    label: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
    isActive: boolean;
}> = ({ label, icon, children, defaultOpen = false, isActive }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen || isActive);
    const MotionDiv = motion.div as any;

    return (
        <div className="border-b border-slate-100 dark:border-slate-800/50 pb-2 last:border-0">
            <SectionHeader label={label} icon={icon} isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
            <AnimatePresence initial={false}>
                {isOpen && (
                    <MotionDiv
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="pl-4 space-y-1 mb-4 border-l-2 border-slate-100 dark:border-slate-800 ml-5">
                            {children}
                        </div>
                    </MotionDiv>
                )}
            </AnimatePresence>
        </div>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ setView, currentView, toggleSidebar }) => {
    const { currentUser, inventory, leaveRequests } = useAppContext();
    const { t } = useI18n();

    const lowStockCount = useMemo(() => 
        inventory.filter(i => i.quantity <= (i.minStockLevel || 5)).length, 
    [inventory]);

    const pendingLeaveCount = useMemo(() => 
        leaveRequests.filter(r => r.status === 'pending').length, 
    [leaveRequests]);

    const role = currentUser?.userRole;
    const isSuperAdmin = role === 'super-admin';
    const isHR = role === 'HR Manager' || isSuperAdmin;
    const isFinance = role === 'Finance Manager' || isSuperAdmin;
    const isAdmin = role === 'admin' || isSuperAdmin;

    return (
        <div className="flex flex-col h-full py-6 px-4 overflow-y-auto no-scrollbar bg-white dark:bg-slate-900">
            {/* Branding */}
            <div className="flex items-center gap-4 px-2 mb-10">
                <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/20">
                    <LogoIcon className="h-8 w-8 text-white" />
                </div>
                <div className="overflow-hidden">
                    <h1 className="text-xl font-black uppercase tracking-tighter leading-none truncate">Natty Disco</h1>
                    <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-1.5 truncate">Management Hub</p>
                </div>
                <button onClick={toggleSidebar} className="ml-auto p-2 md:hidden">
                    <XCircleIcon className="h-6 w-6 text-slate-300" />
                </button>
            </div>

            <div className="space-y-1">
                {/* 1. EXECUTIVE HUB */}
                <CollapsibleGroup 
                    label="Executive Hub" 
                    icon={<DashboardIcon />} 
                    isActive={['dashboard', 'sales_reporting'].includes(currentView)}
                    defaultOpen={true}
                >
                    <NavItem icon={<DashboardIcon />} label="Commander Hub" view="dashboard" currentView={currentView} setView={setView} />
                    {isSuperAdmin && <NavItem icon={<DataAnalyticsIcon />} label="Revenue Radar" view="sales_reporting" currentView={currentView} setView={setView} color="text-emerald-500" />}
                </CollapsibleGroup>

                {/* 2. COMMERCIAL OPERATIONS */}
                {(isFinance || isSuperAdmin) && (
                    <CollapsibleGroup 
                        label="Commercial Ops" 
                        icon={<BuildingOfficeIcon />} 
                        isActive={['business_hub', 'expense_management'].includes(currentView)}
                    >
                        <NavItem icon={<ShoppingCartIcon />} label="Commercial Hub" view="business_hub" currentView={currentView} setView={setView} color="text-indigo-600" badge={lowStockCount} />
                        <NavItem icon={<CurrencyDollarIcon />} label="Expense Registry" view="expense_management" currentView={currentView} setView={setView} color="text-rose-500" />
                    </CollapsibleGroup>
                )}

                {/* 3. PERSONNEL MANAGEMENT */}
                {(isHR || isSuperAdmin) && (
                    <CollapsibleGroup 
                        label="Personnel Mgt" 
                        icon={<UsersIcon />} 
                        isActive={['employees', 'recruitment', 'performance', 'disciplinary', 'exit_management', 'org_chart'].includes(currentView)}
                    >
                        <NavItem icon={<UsersIcon />} label="Staff Registry" view="employees" currentView={currentView} setView={setView} />
                        <NavItem icon={<BriefcaseIcon />} label="Recruitment" view="recruitment" currentView={currentView} setView={setView} color="text-teal-500" />
                        <NavItem icon={<ChartIcon />} label="Performance" view="performance" currentView={currentView} setView={setView} color="text-indigo-500" />
                        <NavItem icon={<ClockIcon />} label="Disciplinary" view="disciplinary" currentView={currentView} setView={setView} color="text-orange-500" />
                        <NavItem icon={<XCircleIcon />} label="Exit Control" view="exit_management" currentView={currentView} setView={setView} color="text-slate-500" />
                        <NavItem icon={<UserGroupIcon />} label="Org Structure" view="org_chart" currentView={currentView} setView={setView} color="text-blue-400" />
                    </CollapsibleGroup>
                )}

                {/* 4. OPERATIONAL CORE */}
                {isSuperAdmin && (
                    <CollapsibleGroup 
                        label="Operations" 
                        icon={<Cog8ToothIcon />} 
                        isActive={['attendance', 'payroll', 'permits', 'document_center', 'custom_forms'].includes(currentView)}
                    >
                        <NavItem icon={<AttendanceIcon />} label="Global Audit" view="attendance" currentView={currentView} setView={setView} color="text-emerald-500" />
                        <NavItem icon={<PayrollIcon />} label="Payroll Desk" view="payroll" currentView={currentView} setView={setView} color="text-rose-600" />
                        <NavItem icon={<IdentificationIcon />} label="Permit Control" view="permits" currentView={currentView} setView={setView} color="text-sky-600" />
                        <NavItem icon={<DocumentTextIcon />} label="Secure Vault" view="document_center" currentView={currentView} setView={setView} color="text-slate-400" />
                        <NavItem icon={<ClipboardDocumentListIcon />} label="Form Architect" view="custom_forms" currentView={currentView} setView={setView} color="text-indigo-400" />
                    </CollapsibleGroup>
                )}

                {/* 5. SELF SERVICE */}
                <CollapsibleGroup 
                    label="Self Service" 
                    icon={<UserIcon />} 
                    isActive={['my_attendance', 'my_tasks', 'leave_management', 'my_payslips'].includes(currentView)}
                >
                    <NavItem icon={<ClockIcon />} label="Clock-In Hub" view="my_attendance" currentView={currentView} setView={setView} color="text-emerald-500" />
                    <NavItem icon={<TasksIcon />} label="Directives" view="my_tasks" currentView={currentView} setView={setView} color="text-amber-500" />
                    <NavItem icon={<RequestsIcon />} label="Leave Center" view="leave_management" currentView={currentView} setView={setView} color="text-blue-500" badge={isAdmin ? pendingLeaveCount : 0} />
                    <NavItem icon={<CurrencyDollarIcon />} label="My Payslips" view="my_payslips" currentView={currentView} setView={setView} color="text-rose-500" />
                </CollapsibleGroup>

                {/* 6. SYSTEM ADMINISTRATION */}
                {isAdmin && (
                    <CollapsibleGroup 
                        label="System Admin" 
                        icon={<LockClosedIcon />} 
                        isActive={['policy_reports', 'payroll_settings', 'biometric_import', 'settings'].includes(currentView)}
                    >
                        <NavItem icon={<CalculatorIcon />} label="Policy Intel" view="policy_reports" currentView={currentView} setView={setView} color="text-indigo-400" />
                        <NavItem icon={<Cog8ToothIcon />} label="Fiscal Engine" view="payroll_settings" currentView={currentView} setView={setView} color="text-rose-400" />
                        <NavItem icon={<FingerPrintIcon />} label="Biometrics" view="biometric_import" currentView={currentView} setView={setView} color="text-indigo-600" />
                        <NavItem icon={<SettingsIcon />} label="System Config" view="settings" currentView={currentView} setView={setView} color="text-slate-400" />
                    </CollapsibleGroup>
                )}
            </div>

            {/* User Context Footer */}
            <div className="mt-auto pt-6 border-t dark:border-slate-800">
                <div className="flex items-center gap-3 px-2">
                    <div className="relative flex-shrink-0">
                        <img 
                            src={currentUser?.photoUrl || `https://ui-avatars.com/api/?name=${currentUser?.firstName}+${currentUser?.surname}&background=random`} 
                            className="h-10 w-10 rounded-xl object-cover ring-2 ring-white dark:ring-slate-700 shadow-md"
                            alt=""
                        />
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                    </div>
                    <div className="overflow-hidden">
                        <p className="font-black text-[11px] uppercase truncate">{currentUser?.firstName} {currentUser?.surname}</p>
                        <p className="text-[8px] font-black uppercase text-indigo-500 tracking-widest truncate">{currentUser?.userRole}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;