import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';
import { 
    PlusIcon, TasksIcon, ChevronLeftIcon, CheckCircleIcon, 
    ClockIcon, SearchIcon, UserGroupIcon, StarIcon, 
    XCircleIcon, ArrowTrendingUpIcon, TrashIcon, EditIcon,
    ExclamationCircleIcon, ClipboardDocumentListIcon,
    ArrowUpIcon, ArrowDownIcon, BellIcon
} from './icons';
import { Task, TaskPriority } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div as any;

const PriorityBadge: React.FC<{ priority: TaskPriority }> = ({ priority }) => {
    const colors = {
        High: 'bg-rose-500 text-white border-rose-400 shadow-rose-500/20',
        Medium: 'bg-amber-500 text-white border-amber-400 shadow-amber-500/20',
        Low: 'bg-indigo-500 text-white border-indigo-400 shadow-indigo-500/20'
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border shadow-lg ${colors[priority]}`}>
            {priority}
        </span>
    );
};

const TaskCard: React.FC<{ task: Task, onView: (taskId: string) => void }> = ({ task, onView }) => {
    const { employees, updateTask, openTaskModal, openConfirmModal, deleteTask } = useAppContext();
    const assignee = employees.find(e => e.id === task.assigneeId);

    const isOverdue = React.useMemo(() => {
        if (task.status === 'done') return false;
        const today = new Date().toISOString().split('T')[0];
        return task.dueDate < today;
    }, [task.dueDate, task.status]);

    const handleAction = (e: React.MouseEvent, status: Task['status']) => {
        e.stopPropagation();
        updateTask(task.id, { status });
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        openConfirmModal("Purge Directive", "Permanently delete this task from the operational ledger?", () => deleteTask(task.id));
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        openTaskModal(task);
    };

    return (
        <MotionDiv 
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -4, shadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}
            onClick={() => onView(task.id)} 
            className={`bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-xl cursor-pointer transition-all border-2 relative overflow-hidden group ${
                task.priority === 'High' ? 'border-rose-100 dark:border-rose-900/30' : 'border-slate-100 dark:border-slate-700'
            }`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                        <PriorityBadge priority={task.priority} />
                        {task.reminderDateTime && (
                            <BellIcon className="h-3 w-3 text-indigo-500" title="Reminder Scheduled" />
                        )}
                    </div>
                    <h3 className="font-black text-slate-800 dark:text-slate-100 line-clamp-2 leading-tight uppercase text-sm tracking-tight">{task.title}</h3>
                </div>
                <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-all">
                    <button onClick={handleEdit} className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"><EditIcon className="h-4 w-4"/></button>
                    <button onClick={handleDelete} className="p-2.5 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"><TrashIcon className="h-4 w-4"/></button>
                </div>
            </div>
            
            <div className="flex items-center gap-3 mb-6">
                <img src={assignee?.photoUrl} className="h-8 w-8 rounded-xl object-cover ring-2 ring-white dark:ring-slate-700 shadow-md" alt="" />
                <div className="overflow-hidden">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest truncate">{assignee?.firstName} {assignee?.surname}</p>
                    <p className="text-[8px] font-bold text-slate-300 uppercase truncate tracking-tighter">{assignee?.role}</p>
                </div>
            </div>
            
            <div className="flex justify-between items-end pt-5 border-t dark:border-slate-700">
                <div className={`flex flex-col ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
                  <p className="text-[8px] font-black uppercase tracking-widest mb-0.5">Deadline</p>
                  <div className="flex items-center gap-1.5">
                    <ClockIcon className="h-3 w-3" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">{task.dueDate}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                    {task.status === 'todo' && (
                        <button onClick={(e) => handleAction(e, 'in-progress')} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">Deploy</button>
                    )}
                    {task.status === 'in-progress' && (
                        <button onClick={(e) => handleAction(e, 'done')} className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">Resolve</button>
                    )}
                    {task.status === 'done' && (
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-full">
                            <CheckCircleIcon className="h-5 w-5" />
                        </div>
                    )}
                </div>
            </div>
            
            {isOverdue && task.status !== 'done' && (
                <div className="absolute top-0 right-0 p-3 bg-red-500 text-white rounded-bl-3xl shadow-lg animate-pulse">
                    <ExclamationCircleIcon className="h-4 w-4" />
                </div>
            )}
        </MotionDiv>
    );
};

const TaskColumn: React.FC<{ 
    title: string; 
    icon: React.ReactNode;
    tasks: Task[]; 
    onView: (taskId: string) => void;
    color: string;
}> = ({ title, icon, tasks, onView, color }) => (
    <div className="bg-slate-50/50 dark:bg-slate-900/40 p-5 rounded-[3rem] flex-1 border border-slate-100 dark:border-slate-800 flex flex-col h-[75vh] min-w-[340px] max-w-[480px]">
        <div className="flex justify-between items-center mb-8 px-4 sticky top-0 z-10 py-3 bg-slate-50/10 backdrop-blur-md rounded-2xl">
          <div className="flex items-center gap-4">
              <div className={`p-3 bg-white dark:bg-slate-800 rounded-[1.25rem] shadow-sm ${color}`}>
                {icon}
              </div>
              <h2 className="font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] text-[11px]">{title}</h2>
          </div>
          <span className={`${color.replace('text-', 'bg-')} text-white px-4 py-1.5 rounded-full text-[10px] font-black shadow-lg shadow-black/5`}>{tasks.length}</span>
        </div>
        <div className="space-y-5 overflow-y-auto no-scrollbar flex-1 pb-12 px-1">
            <AnimatePresence mode="popLayout">
                {tasks.map(task => <TaskCard key={task.id} task={task} onView={onView} />)}
            </AnimatePresence>
            {tasks.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-10 grayscale scale-90 py-32">
                    <ClipboardDocumentListIcon className="h-24 w-24 mb-6" />
                    <p className="font-black uppercase text-[12px] tracking-[0.3em] text-center">Zero Frequency In Cluster</p>
                </div>
            )}
        </div>
    </div>
);

const Tasks: React.FC = () => {
    const { tasks, openAddTaskModal, openTaskDetailPanel, employees, setView } = useAppContext();
    const { t } = useI18n();

    // Filtering & Sorting State
    const [searchQuery, setSearchQuery] = useState('');
    const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'All'>('All');
    const [assigneeFilter, setAssigneeFilter] = useState<string>('All');
    const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'title'>('dueDate');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const filteredTasks = useMemo(() => {
        return tasks.filter(t => {
            const query = searchQuery.toLowerCase();
            const matchesSearch = t.title.toLowerCase().includes(query) || (t.description || '').toLowerCase().includes(query);
            const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
            const matchesAssignee = assigneeFilter === 'All' || t.assigneeId === assigneeFilter;
            return matchesSearch && matchesPriority && matchesAssignee;
        }).sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'dueDate') {
                comparison = a.dueDate.localeCompare(b.dueDate);
            } else if (sortBy === 'priority') {
                const priorityWeight = { High: 3, Medium: 2, Low: 1 };
                comparison = priorityWeight[a.priority] - priorityWeight[b.priority];
            } else if (sortBy === 'title') {
                comparison = a.title.localeCompare(b.title);
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [tasks, searchQuery, priorityFilter, assigneeFilter, sortBy, sortDirection]);

    const stats = useMemo(() => {
        const total = tasks.length;
        const resolved = tasks.filter(t => t.status === 'done').length;
        const highRisk = tasks.filter(t => t.priority === 'High' && t.status !== 'done').length;
        const overdue = tasks.filter(t => t.status !== 'done' && t.dueDate < new Date().toISOString().split('T')[0]).length;
        return { total, resolved, highRisk, overdue, rate: total > 0 ? Math.round((resolved / total) * 100) : 0 };
    }, [tasks]);

    const todoTasks = filteredTasks.filter(t => t.status === 'todo');
    const inProgressTasks = filteredTasks.filter(t => t.status === 'in-progress');
    const doneTasks = filteredTasks.filter(t => t.status === 'done');

    return (
        <div className="container mx-auto animate-fadeIn pb-24 px-4">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 gap-8 pt-4">
                <div className="flex items-center gap-6">
                    <button onClick={() => setView('dashboard')} className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 hover:text-indigo-600 transition-all no-print">
                        <ChevronLeftIcon className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Operational Command</h1>
                        <p className="text-slate-500 font-medium italic mt-2 text-lg">Personnel Deployment & Mission-Critical Directive Ledger</p>
                    </div>
                </div>
                <button onClick={() => openAddTaskModal()} className="w-full xl:w-auto flex items-center justify-center gap-4 px-12 py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black uppercase text-xs tracking-[0.2em] hover:bg-indigo-700 shadow-2xl shadow-indigo-500/40 active:scale-95 transition-all group">
                    <PlusIcon className="h-6 w-6 group-hover:rotate-90 transition-transform" />
                    <span>Establish Directive</span>
                </button>
            </div>

            {/* Performance Matrix Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
                <div className="bg-white/80 dark:bg-slate-800/80 p-8 rounded-[3rem] shadow-xl border border-white/40 flex items-center gap-6 group hover:scale-[1.02] transition-all">
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-3xl"><TasksIcon className="h-8 w-8" /></div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Active Directives</p>
                        <p className="text-3xl font-black text-slate-800 dark:text-white">{stats.total - stats.resolved} Nodes</p>
                    </div>
                </div>
                <div className="bg-white/80 dark:bg-slate-800/80 p-8 rounded-[3rem] shadow-xl border border-white/40 flex items-center gap-6 group hover:scale-[1.02] transition-all">
                    <div className="p-4 bg-rose-50 dark:bg-rose-900/30 text-rose-600 rounded-3xl"><ExclamationCircleIcon className="h-8 w-8" /></div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Risk Overdue</p>
                        <p className="text-3xl font-black text-rose-600">{stats.overdue} Tasks</p>
                    </div>
                </div>
                <div className="bg-white/80 dark:bg-slate-800/80 p-8 rounded-[3rem] shadow-xl border border-white/40 flex items-center gap-6 group hover:scale-[1.02] transition-all">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-3xl"><CheckCircleIcon className="h-8 w-8" /></div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Resolution Rate</p>
                        <p className="text-3xl font-black text-emerald-600">{stats.rate}%</p>
                    </div>
                </div>
                <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl text-white flex items-center gap-6 relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                        <StarIcon className="h-32 w-32" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase text-indigo-300 tracking-widest mb-1">Critical Priority</p>
                        <p className="text-3xl font-black">{stats.highRisk} Missions</p>
                    </div>
                </div>
            </div>

            {/* Matrix Control Bar */}
            <div className="bg-white/70 dark:bg-slate-800/70 p-6 rounded-[3rem] shadow-xl border border-white/30 dark:border-slate-700 backdrop-blur-xl mb-12 flex flex-col md:flex-row gap-6">
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search directives by title or description..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-16 pr-8 py-5 bg-slate-50 dark:bg-slate-900 border-4 border-slate-50 dark:border-slate-700 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.2em] outline-none focus:border-indigo-500 transition-all shadow-inner"
                    />
                </div>
                <div className="flex flex-wrap gap-4">
                    <div className="relative">
                        <UserGroupIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500 pointer-events-none" />
                        <select 
                            value={assigneeFilter}
                            onChange={e => setAssigneeFilter(e.target.value)}
                            className="pl-14 pr-12 py-5 bg-slate-50 dark:bg-slate-900 border-4 border-slate-50 dark:border-slate-700 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] outline-none focus:border-indigo-500 appearance-none shadow-inner cursor-pointer"
                        >
                            <option value="All">All Personnel</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.surname}</option>)}
                        </select>
                    </div>
                    <div className="relative">
                        <StarIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500 pointer-events-none" />
                        <select 
                            value={priorityFilter}
                            onChange={e => setPriorityFilter(e.target.value as any)}
                            className="pl-14 pr-12 py-5 bg-slate-50 dark:bg-slate-900 border-4 border-slate-50 dark:border-slate-700 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] outline-none focus:border-indigo-500 appearance-none shadow-inner cursor-pointer"
                        >
                            <option value="All">Global Priority</option>
                            <option value="High">Priority High</option>
                            <option value="Medium">Priority Mid</option>
                            <option value="Low">Priority Low</option>
                        </select>
                    </div>
                    {/* Sorting Controls */}
                    <div className="flex items-center bg-slate-50 dark:bg-slate-900 border-4 border-slate-50 dark:border-slate-700 rounded-[2rem] shadow-inner overflow-hidden">
                        <div className="relative">
                            <ArrowTrendingUpIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500 pointer-events-none" />
                            <select 
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value as any)}
                                className="pl-12 pr-4 py-5 bg-transparent font-black uppercase text-[9px] tracking-0.2em outline-none focus:ring-0 appearance-none cursor-pointer"
                            >
                                <option value="dueDate">Due Date</option>
                                <option value="priority">Priority</option>
                                <option value="title">Title</option>
                            </select>
                        </div>
                        <button 
                            onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                            className="px-5 py-5 border-l-4 border-slate-50 dark:border-slate-700 text-indigo-600 hover:bg-white dark:hover:bg-slate-800 transition-all group"
                            title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                        >
                            {sortDirection === 'asc' ? <ArrowUpIcon className="h-4 w-4 group-active:scale-90 transition-transform" /> : <ArrowDownIcon className="h-4 w-4 group-active:scale-90 transition-transform" />}
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="flex gap-10 overflow-x-auto pb-12 no-scrollbar scroll-smooth snap-x snap-mandatory">
                <div className="snap-center"><TaskColumn title="Awaiting Deployment" icon={<ClockIcon className="h-6 w-6"/>} tasks={todoTasks} onView={openTaskDetailPanel} color="text-slate-400" /></div>
                <div className="snap-center"><TaskColumn title="Active Operation" icon={<ArrowTrendingUpIcon className="h-6 w-6"/>} tasks={inProgressTasks} onView={openTaskDetailPanel} color="text-indigo-50" /></div>
                <div className="snap-center"><TaskColumn title="Resolved / Archive" icon={<CheckCircleIcon className="h-6 w-6"/>} tasks={doneTasks} onView={openTaskDetailPanel} color="text-emerald-500" /></div>
            </div>
        </div>
    );
};

export default Tasks;