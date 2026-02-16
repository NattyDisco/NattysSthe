import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircleIcon, TasksIcon, ClockIcon, UserIcon, BellAlertIcon } from './icons';

interface TaskDetailPanelProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({ taskId, isOpen, onClose }) => {
  const { tasks, employees } = useAppContext();
  const task = tasks.find(t => t.id === taskId);
  const assignee = employees.find(e => e.id === task?.assigneeId);

  const isOverdue = React.useMemo(() => {
    if (!task || task.status === 'done') return false;
    const today = new Date().toISOString().split('T')[0];
    return task.dueDate < today;
  }, [task]);

  // FIX: Cast motion.div to any to avoid type errors with motion props.
  const MotionDiv = motion.div as any;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120]">
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black backdrop-blur-sm"
            onClick={onClose}
          />
          <MotionDiv
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute top-0 right-0 h-full w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l dark:border-slate-800"
          >
            {task ? (
              <>
                <header className="p-8 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg">
                        <TasksIcon className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tighter">Directive Brief</h2>
                  </div>
                  <button onClick={onClose} className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-700 hover:text-red-500 transition-all shadow-sm border border-transparent">
                    <XCircleIcon className="h-7 w-7 text-slate-400 hover:text-inherit" />
                  </button>
                </header>

                <div className="flex-1 p-10 overflow-y-auto space-y-10 custom-scrollbar">
                    <section>
                        <div className="flex items-center justify-between mb-2">
                             <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                task.priority === 'High' ? 'bg-rose-50 text-rose-500' : 
                                task.priority === 'Medium' ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-500'
                             }`}>
                                {task.priority} Priority
                             </span>
                             <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">#{task.id.slice(-6)}</span>
                        </div>
                        <h3 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">{task.title}</h3>
                    </section>

                    <div className="grid grid-cols-2 gap-8 p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                <UserIcon className="h-3 w-3" /> Personnel
                            </p>
                            <p className="font-black text-slate-800 dark:text-slate-200">{assignee?.firstName} {assignee?.surname}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                <ClockIcon className="h-3 w-3" /> Status
                            </p>
                            <p className="font-black text-indigo-600 uppercase text-sm">{task.status.replace('-', ' ')}</p>
                        </div>
                        <div className="col-span-2 space-y-1 border-t dark:border-slate-700 pt-4">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                <BellAlertIcon className="h-3 w-3" /> Due Date
                            </p>
                            <div className="flex items-center gap-3">
                                <p className={`text-xl font-black ${isOverdue ? 'text-rose-500' : 'text-slate-800 dark:text-slate-200'}`}>
                                    {task.dueDate}
                                </p>
                                {isOverdue && (
                                    <span className="px-2 py-0.5 bg-rose-500 text-white text-[8px] font-black uppercase rounded shadow-sm animate-pulse">Overdue</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <section className="space-y-4">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Mission Description</h4>
                        <div className="p-8 bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-800 rounded-[2rem] shadow-sm">
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium italic whitespace-pre-wrap">
                                {task.description || 'No operational details have been specified for this directive.'}
                            </p>
                        </div>
                    </section>

                    {task.reminderDateTime && (
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center gap-3 border border-amber-100 dark:border-amber-800/50">
                            <ClockIcon className="h-5 w-5 text-amber-600" />
                            <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                                Active Alert Set: {new Date(task.reminderDateTime).toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>

                <footer className="p-8 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex gap-4">
                    <button onClick={onClose} className="flex-1 py-4 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-sm border dark:border-slate-600 active:scale-95 transition-all">Dismiss Brief</button>
                    {task.status !== 'done' && (
                        <button className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 active:scale-95 transition-all">Mark Resolved</button>
                    )}
                </footer>
              </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-30">
                    <TasksIcon className="h-20 w-20" />
                    <p className="font-black uppercase tracking-widest">Directive Not Found</p>
                </div>
            )}
          </MotionDiv>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TaskDetailPanel;