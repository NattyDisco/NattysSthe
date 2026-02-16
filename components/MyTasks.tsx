import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';
import { TasksIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from './icons';
import { Task } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

// FIX: Added MotionDiv casting to bypass motion property type errors.
const MotionDiv = motion.div as any;

const MyTasks: React.FC = () => {
    const { currentUser, tasks, updateTask, openTaskDetailPanel } = useAppContext();
    const { t } = useI18n();

    const myTasks = tasks.filter(t => t.assigneeId === currentUser?.id);

    const isOverdue = (task: Task) => {
        if (task.status === 'done') return false;
        const today = new Date().toISOString().split('T')[0];
        return task.dueDate < today;
    };

    const handleUpdateStatus = (e: React.MouseEvent, taskId: string, newStatus: Task['status']) => {
        e.stopPropagation();
        updateTask(taskId, { status: newStatus });
    };

    const StatusBadge: React.FC<{ status: Task['status'] }> = ({ status }) => {
        const styles = {
            todo: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
            'in-progress': 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20',
            done: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20',
        };
        return <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-xl ${styles[status]}`}>{status.replace('-', ' ')}</span>;
    };

    return (
        <div className="container mx-auto animate-fadeIn pb-24">
            <div className="mb-12">
                <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">My Directives</h1>
                <p className="text-slate-500 font-bold italic mt-2">Personal workflow and task compliance tracking</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {myTasks.length > 0 ? (
                    myTasks.map(task => {
                        const overdue = isOverdue(task);
                        return (
                            <MotionDiv 
                                key={task.id}
                                whileHover={{ y: -5 }}
                                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-[3rem] shadow-xl border border-white/40 dark:border-slate-700 group cursor-pointer relative overflow-hidden transition-all"
                                onClick={() => openTaskDetailPanel(task.id)}
                            >
                                {overdue && (
                                    <div className="absolute top-4 right-4 animate-pulse">
                                        <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                                    </div>
                                )}
                                <div className="flex justify-between items-start mb-6">
                                    <StatusBadge status={task.status} />
                                    <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-all">
                                        {task.status === 'todo' && (
                                            <button onClick={(e) => handleUpdateStatus(e, task.id, 'in-progress')} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><ClockIcon className="h-4 w-4"/></button>
                                        )}
                                        {task.status === 'in-progress' && (
                                            <button onClick={(e) => handleUpdateStatus(e, task.id, 'done')} className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"><CheckCircleIcon className="h-4 w-4"/></button>
                                        )}
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2 uppercase tracking-tight leading-tight">{task.title}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-8 italic">{task.description || 'No mission details provided.'}</p>
                                
                                <div className="flex items-center justify-between border-t dark:border-slate-700 pt-6">
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${overdue ? 'bg-red-50 text-red-600' : 'bg-slate-50 dark:bg-slate-900/50 text-slate-400'}`}>
                                        <ClockIcon className="h-4 w-4" />
                                        <span className="text-[11px] font-black uppercase tracking-tighter">{overdue ? 'Past Due' : task.dueDate}</span>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${task.priority === 'High' ? 'text-rose-500' : 'text-slate-400'}`}>{task.priority}</span>
                                </div>
                            </MotionDiv>
                        );
                    })
                ) : (
                    <div className="col-span-full py-32 text-center bg-white/40 dark:bg-slate-800/40 rounded-[4rem] border-4 border-dashed border-slate-200 dark:border-slate-700 backdrop-blur-md">
                        <TasksIcon className="h-20 w-20 mx-auto mb-6 text-slate-200 dark:text-slate-700"/>
                        <p className="text-slate-400 text-xl font-black uppercase tracking-widest">Registry Empty</p>
                        <p className="text-slate-500 font-medium italic mt-2">No active assignments directed to your terminal.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyTasks;