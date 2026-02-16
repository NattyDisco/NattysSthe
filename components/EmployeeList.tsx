import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Employee } from '../types';
import { 
    PlusIcon, EditIcon, TrashIcon, SearchIcon, 
    EllipsisVerticalIcon, AttendanceIcon, ChartIcon, 
    ChevronLeftIcon, ArrowUpIcon, ArrowDownIcon, 
    EmailIcon, BriefcaseIcon, PasswordIcon, XCircleIcon 
} from './icons';
import { motion, AnimatePresence } from 'framer-motion';

type SortableKeys = 'name' | 'employeeId' | 'department' | 'role' | 'status';

const StatusBadge: React.FC<{ status: Employee['status'] }> = ({ status }) => {
    const styles: Record<Employee['status'], string> = {
        active: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        inactive: 'bg-slate-100 text-slate-800 dark:bg-slate-600 dark:text-slate-200',
        'on-leave': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        terminated: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    };
    return <span className={`px-2 py-1 text-[10px] font-black rounded-lg capitalize tracking-wider ${styles[status]}`}>{status.replace('-', ' ')}</span>;
};


const EmployeeList: React.FC = () => {
    const { 
        currentUser,
        employees, 
        allEmployees,
        openAddEmployeeModal,
        openEditEmployeeModal,
        deleteEmployee,
        openConfirmModal,
        setView,
        setSelectedEmployeeForJourney,
        setPreselectedEmployeeIdForReport,
        openAttendancePreselectionModal,
        resetEmployeePassword
    } = useAppContext();

    const [searchQuery, setSearchQuery] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });
    const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);

    // FIX: Standardized admin check to include super-admin for total control
    const isAdmin = currentUser?.userRole === 'admin' || currentUser?.userRole === 'super-admin' || currentUser?.userRole === 'HR Manager';

    // Calculate department list and stats for the filter
    const departments = useMemo(() => {
        const set = new Set(allEmployees.map(e => e.department).filter(Boolean));
        return Array.from(set).sort();
    }, [allEmployees]);

    const departmentStats = useMemo(() => {
        const stats: Record<string, number> = {};
        allEmployees.forEach(e => {
            if (e.department) {
                stats[e.department] = (stats[e.department] || 0) + 1;
            }
        });
        return stats;
    }, [allEmployees]);

    const isFiltered = searchQuery !== '' || departmentFilter !== 'all' || statusFilter !== 'all';

    const handleRowClick = (employee: Employee) => {
        if (!isAdmin) return;
        setSelectedEmployeeForJourney(employee);
        setView('employee_journey');
    };

    const filteredAndSortedEmployees = useMemo(() => {
        let filtered = [...employees];

        if (departmentFilter !== 'all') {
            filtered = filtered.filter(emp => emp.department === departmentFilter);
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(emp => emp.status === statusFilter);
        }

        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(emp => 
                `${emp.firstName || ''} ${emp.surname || ''}`.toLowerCase().includes(lowercasedQuery) ||
                (emp.email || '').toLowerCase().includes(lowercasedQuery) ||
                (emp.employeeId || '').toLowerCase().includes(lowercasedQuery)
            );
        }

        filtered.sort((a, b) => {
            let aValue: string = '';
            let bValue: string = '';
            
            if (sortConfig.key === 'name') {
                aValue = `${a.firstName || ''} ${a.surname || ''}`.trim().toLowerCase();
                bValue = `${b.firstName || ''} ${b.surname || ''}`.trim().toLowerCase();
            } else {
                const key = sortConfig.key as keyof Employee;
                aValue = (a[key] || '').toString().toLowerCase();
                bValue = (b[key] || '').toString().toLowerCase();
            }
            
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [employees, departmentFilter, statusFilter, searchQuery, sortConfig]);

    const handleSort = (key: SortableKeys) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const resetFilters = () => {
        setSearchQuery('');
        setDepartmentFilter('all');
        setStatusFilter('all');
    };

    const handleDelete = (e: React.MouseEvent, employee: Employee) => {
        e.stopPropagation();
        openConfirmModal(
            'Delete Employee',
            `Are you sure you want to delete ${employee.firstName} ${employee.surname}? This action cannot be undone.`,
            () => deleteEmployee(employee.id)
        );
        setActiveActionMenu(null);
    };

    const handleResetPassword = (e: React.MouseEvent, employee: Employee) => {
        e.stopPropagation();
        openConfirmModal(
            'Security Override',
            `Initiate password reset sequence for ${employee.firstName} ${employee.surname}? A secure link will be dispatched to ${employee.email}.`,
            () => resetEmployeePassword(employee.email)
        );
        setActiveActionMenu(null);
    };

    const SortIndicator = ({ column }: { column: SortableKeys }) => {
        if (sortConfig.key !== column) return <div className="w-4 h-4 opacity-20" />;
        return sortConfig.direction === 'asc' ? 
            <ArrowUpIcon className="h-4 w-4 text-indigo-600" /> : 
            <ArrowDownIcon className="h-4 w-4 text-indigo-600" />;
    };

    const ActionMenu: React.FC<{ emp: Employee }> = ({ emp }) => {
        const MotionDiv = motion.div as any;
        return (
            <AnimatePresence>
                {activeActionMenu === emp.id && (
                    <MotionDiv 
                        initial={{ opacity: 0, scale: 0.9, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        className="absolute top-full right-0 mt-3 w-64 bg-white dark:bg-slate-800 rounded-[2rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] border-2 border-slate-50 dark:border-slate-700 z-[100] py-4 overflow-hidden"
                    >
                        <div className="px-5 pb-3 mb-2 border-b dark:border-slate-700">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Operations Menu</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); openEditEmployeeModal(emp); setActiveActionMenu(null); }} className="w-full text-left flex items-center gap-3 px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-indigo-600 hover:text-white transition-all">
                            <EditIcon className="h-4 w-4"/> Edit Profile
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); openAttendancePreselectionModal(emp.id); setActiveActionMenu(null); }} className="w-full text-left flex items-center gap-3 px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-indigo-600 hover:text-white transition-all">
                            <AttendanceIcon className="h-4 w-4"/> Attendance
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setPreselectedEmployeeIdForReport(emp.id); setView('reports'); setActiveActionMenu(null); }} className="w-full text-left flex items-center gap-3 px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-indigo-600 hover:text-white transition-all">
                            <ChartIcon className="h-4 w-4"/> Reports
                        </button>
                        <button onClick={(e) => handleResetPassword(e, emp)} className="w-full text-left flex items-center gap-3 px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-amber-500 hover:text-white transition-all">
                            <PasswordIcon className="h-4 w-4"/> Reset Security
                        </button>
                        <div className="my-2 h-px bg-slate-100 dark:bg-slate-700 mx-2"></div>
                        <button onClick={(e) => handleDelete(e, emp)} className="w-full text-left flex items-center gap-3 px-5 py-3 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-600 hover:text-white transition-all">
                            <TrashIcon className="h-4 w-4"/> Purge Record
                        </button>
                    </MotionDiv>
                )}
            </AnimatePresence>
        );
    };

    const MotionDiv = motion.div as any;

    return (
        <div className="container mx-auto animate-fadeIn pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-6">
                <div className="flex items-center gap-4 self-start sm:self-center">
                    <button 
                        onClick={() => setView('dashboard')} 
                        className="p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border dark:border-slate-700 hover:text-indigo-600 hover:border-indigo-200 transition-all active:scale-90"
                        aria-label="Back to Dashboard"
                    >
                        <ChevronLeftIcon className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Staff Registry</h1>
                        <p className="text-slate-500 font-medium italic mt-1">Manage personnel roles and organizational structure</p>
                    </div>
                </div>
                {isAdmin && (
                    <button onClick={openAddEmployeeModal} className="flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-[1.75rem] font-black uppercase text-xs tracking-widest hover:bg-indigo-700 hover:scale-105 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 w-full sm:w-auto">
                        <PlusIcon className="h-5 w-5" />
                        <span>Hire New Personnel</span>
                    </button>
                )}
            </div>
            
            <div className="bg-white/70 dark:bg-slate-800/70 p-6 rounded-[2.5rem] shadow-xl mb-8 flex flex-col sm:flex-row gap-5 border border-white/30 backdrop-blur-xl items-center">
                <div className="relative flex-grow w-full">
                    <SearchIcon className="h-5 w-5 text-slate-400 absolute top-1/2 left-4 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="Search ID, Name or Email..." 
                      value={searchQuery} 
                      onChange={e => setSearchQuery(e.target.value)} 
                      className="w-full pl-12 pr-4 py-4 border-2 border-slate-100 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 shadow-sm focus:border-indigo-500 outline-none font-bold transition-all" 
                    />
                </div>
                
                <div className="relative w-full sm:w-auto">
                    <BriefcaseIcon className="h-4 w-4 text-indigo-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select 
                      value={departmentFilter} 
                      onChange={e => setDepartmentFilter(e.target.value)} 
                      className="w-full sm:w-auto pl-11 pr-10 py-4 border-2 border-slate-100 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 shadow-sm font-black uppercase text-[10px] tracking-widest focus:border-indigo-500 outline-none cursor-pointer appearance-none"
                    >
                        <option value="all">All Departments ({allEmployees.length})</option>
                        {departments.map(dep => (
                            <option key={dep} value={dep}>
                                {dep} ({departmentStats[dep] || 0})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="relative w-full sm:w-auto">
                    <select 
                        value={statusFilter} 
                        onChange={e => setStatusFilter(e.target.value)} 
                        className="w-full sm:w-auto px-6 py-4 border-2 border-slate-100 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 shadow-sm font-black uppercase text-[10px] tracking-widest focus:border-indigo-500 outline-none cursor-pointer"
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="on-leave">On Leave</option>
                        <option value="terminated">Terminated</option>
                    </select>
                </div>

                {isFiltered && (
                    <button 
                        onClick={resetFilters}
                        className="p-4 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-2xl hover:text-red-500 transition-all active:scale-95 flex-shrink-0"
                        title="Clear Filters"
                    >
                        <XCircleIcon className="h-6 w-6" />
                    </button>
                )}
            </div>

            <div className="space-y-6">
                {/* Mobile/Tablet Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-6">
                    {filteredAndSortedEmployees.length > 0 ? filteredAndSortedEmployees.map(emp => (
                        <MotionDiv
                            key={emp.id}
                            whileHover={{ y: -5, scale: 1.02 }}
                            onClick={() => handleRowClick(emp)}
                            className={`bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-lg border border-white/40 dark:border-slate-700/50 flex flex-col relative group transition-all hover:bg-white/90 dark:hover:bg-slate-800/90 hover:shadow-indigo-500/10 ${isAdmin ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <img src={emp.photoUrl} alt={emp.firstName} className="h-16 w-16 rounded-[1.5rem] object-cover shadow-md ring-4 ring-white dark:ring-slate-700 transition-transform group-hover:scale-110"/>
                                    <div>
                                        <p className="font-black text-xl text-slate-800 dark:text-white leading-tight uppercase tracking-tighter">{emp.firstName} {emp.surname}</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{emp.employeeId}</p>
                                    </div>
                                </div>
                                {isAdmin && (
                                    <div className="relative">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setActiveActionMenu(activeActionMenu === emp.id ? null : emp.id) }} 
                                            className="p-3 text-slate-400 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-transparent hover:border-indigo-400 active:scale-90"
                                        >
                                            <EllipsisVerticalIcon className="h-6 w-6"/>
                                        </button>
                                        <ActionMenu emp={emp} />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border dark:border-slate-700">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><BriefcaseIcon className="h-3 w-3" /> Department</p>
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{emp.department || '---'}</p>
                                </div>
                                <div className="p-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border dark:border-slate-700">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><EmailIcon className="h-3 w-3" /> Contact</p>
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{emp.email || '---'}</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-auto pt-4 border-t dark:border-slate-700">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{emp.role}</p>
                                <StatusBadge status={emp.status || 'active'} />
                            </div>
                        </MotionDiv>
                    )) : (
                        <div className="col-span-full p-20 text-center text-slate-400 font-bold italic bg-white/40 rounded-[3rem] border-2 border-dashed border-slate-200">
                            No matching personnel records found in the current filter.
                        </div>
                    )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block bg-white/80 dark:bg-slate-800/80 rounded-[3.5rem] shadow-2xl border border-white/40 dark:border-slate-700/50 overflow-hidden backdrop-blur-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b dark:border-slate-700">
                                <tr>
                                    <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 cursor-pointer group" onClick={() => handleSort('name')}>
                                        <div className="flex items-center gap-2 group-hover:text-indigo-600 transition-colors">
                                            Personnel
                                            <SortIndicator column="name" />
                                        </div>
                                    </th>
                                    <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 cursor-pointer group" onClick={() => handleSort('employeeId')}>
                                        <div className="flex items-center gap-2 group-hover:text-indigo-600 transition-colors">
                                            Identifier
                                            <SortIndicator column="employeeId" />
                                        </div>
                                    </th>
                                    <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 cursor-pointer group" onClick={() => handleSort('department')}>
                                        <div className="flex items-center gap-2 group-hover:text-indigo-600 transition-colors">
                                            Department
                                            <SortIndicator column="department" />
                                        </div>
                                    </th>
                                    <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 cursor-pointer group" onClick={() => handleSort('role')}>
                                        <div className="flex items-center gap-2 group-hover:text-indigo-600 transition-colors">
                                            Role
                                            <SortIndicator column="role" />
                                        </div>
                                    </th>
                                    <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 cursor-pointer group" onClick={() => handleSort('status')}>
                                        <div className="flex items-center gap-2 group-hover:text-indigo-600 transition-colors">
                                            Lifecycle
                                            <SortIndicator column="status" />
                                        </div>
                                    </th>
                                    {isAdmin && <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredAndSortedEmployees.length > 0 ? filteredAndSortedEmployees.map(emp => (
                                    <tr key={emp.id} onClick={() => handleRowClick(emp)} className={`border-t dark:border-slate-800 even:bg-slate-50/80 dark:even:bg-slate-900/40 hover:bg-indigo-50/80 dark:hover:bg-indigo-900/20 hover:scale-[1.01] hover:shadow-lg transition-all duration-300 ${isAdmin ? 'cursor-pointer' : 'cursor-default'}`}>
                                        <td className="p-6">
                                            <div className="flex items-center gap-5">
                                                <img src={emp.photoUrl} alt={emp.firstName} className="h-14 w-14 rounded-2xl object-cover shadow-md ring-4 ring-white dark:ring-slate-700"/>
                                                <div>
                                                    <p className="font-black text-lg text-slate-800 dark:text-white uppercase tracking-tighter leading-none">{emp.firstName} {emp.surname}</p>
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{emp.email || 'No Email'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 text-sm font-mono font-black text-slate-400 uppercase tracking-tighter">{emp.employeeId || '---'}</td>
                                        <td className="p-6 text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">{emp.department || '---'}</td>
                                        <td className="p-6 text-xs font-bold text-slate-600 dark:text-slate-300">{emp.role || '---'}</td>
                                        <td className="p-6"><StatusBadge status={emp.status || 'active'} /></td>
                                        {isAdmin && (
                                            <td className="p-6 text-right">
                                                <div className="relative inline-block">
                                                    <button 
                                                      onClick={(e) => { e.stopPropagation(); setActiveActionMenu(activeActionMenu === emp.id ? null : emp.id) }} 
                                                      className="p-3 text-slate-400 rounded-2xl hover:bg-indigo-600 hover:text-white hover:scale-110 shadow-sm border border-transparent hover:border-indigo-400 dark:hover:border-indigo-400 transition-all active:scale-90"
                                                    >
                                                      <EllipsisVerticalIcon className="h-6 w-6"/>
                                                    </button>
                                                    <ActionMenu emp={emp} />
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                )) : (
                                  <tr>
                                    <td colSpan={isAdmin ? 6 : 5} className="p-32 text-center text-slate-400 font-black italic uppercase tracking-widest">No entries found in registry for active filters.</td>
                                  </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeList;