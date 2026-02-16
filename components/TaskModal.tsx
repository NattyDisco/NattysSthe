import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Task, TaskPriority } from '../types';
import { useI18n } from '../hooks/useI18n';
import { SparklesIcon, XCircleIcon, CalendarDaysIcon, UserIcon, StarIcon, TasksIcon, BellIcon, ClockIcon } from './icons';
import { GoogleGenAI } from "@google/genai";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  assigneeId?: string | null;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task, assigneeId }) => {
  const { employees, addTask, updateTask } = useAppContext();
  const { t } = useI18n();
  const [isGenerating, setIsGenerating] = useState(false);

  const getInitialState = () => ({
    title: '',
    description: '',
    assigneeId: assigneeId || '',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'todo' as Task['status'],
    priority: 'Medium' as TaskPriority,
    reminderDateTime: '',
  });

  const [formData, setFormData] = useState(getInitialState());

  useEffect(() => {
    if (task) {
      setFormData({
        ...getInitialState(),
        ...task,
        reminderDateTime: task.reminderDateTime ? task.reminderDateTime.slice(0, 16) : '', 
      });
    } else {
      setFormData(getInitialState());
    }
  }, [task, assigneeId, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const generateAIDescription = async () => {
    if (!formData.title || !process.env.API_KEY) return;
    setIsGenerating(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `As an operations manager, write a professional, high-impact description and a 3-step checklist for a corporate task titled: "${formData.title}". Keep it concise and actionable. Use bullet points.`
        });
        const text = response.text;
        setFormData(prev => ({ ...prev, description: text || '' }));
    } catch (e) {
        console.error("AI Generation Failed", e);
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = {
        ...formData,
        reminderDateTime: formData.reminderDateTime ? new Date(formData.reminderDateTime).toISOString() : undefined,
    };
    if (task) {
      updateTask(task.id, dataToSave);
    } else {
      addTask(dataToSave);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xl z-[200] flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 sm:p-12 shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto border-4 border-indigo-600" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-indigo-600 flex items-center gap-4">
                <TasksIcon className="h-10 w-10"/> {task ? 'Update Directive' : 'New Directive'}
            </h2>
            <button onClick={onClose} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
                <XCircleIcon className="h-8 w-8 text-slate-400"/>
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-[0.3em]">Operational Title</label>
                <input 
                    name="title" 
                    value={formData.title} 
                    onChange={handleChange} 
                    required 
                    placeholder="Enter task heading..."
                    className="w-full p-5 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-[1.5rem] font-black text-lg outline-none focus:border-indigo-500 transition-all shadow-sm" 
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-[0.3em] flex items-center gap-2">
                        <UserIcon className="h-3 w-3" /> Targeted Personnel
                    </label>
                    <select name="assigneeId" value={formData.assigneeId} onChange={handleChange} required className="w-full p-5 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-[1.5rem] font-bold text-sm outline-none focus:border-indigo-500 appearance-none shadow-sm">
                        <option value="">-- Choose Agent --</option>
                        {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.surname}</option>)}
                    </select>
                </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-[0.3em] flex items-center gap-2">
                        <CalendarDaysIcon className="h-3 w-3" /> Critical Date
                    </label>
                    <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} required className="w-full p-5 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-[1.5rem] font-bold text-sm outline-none focus:border-indigo-500 shadow-sm" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-[0.3em] flex items-center gap-2">
                        <BellIcon className="h-3 w-3 text-indigo-500" /> Operational Alert
                    </label>
                    <input 
                        type="datetime-local" 
                        name="reminderDateTime" 
                        value={formData.reminderDateTime} 
                        onChange={handleChange} 
                        className="w-full p-5 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-[1.5rem] font-bold text-sm outline-none focus:border-indigo-500 shadow-sm" 
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-[0.3em] flex items-center gap-2">
                        <StarIcon className="h-3 w-3" /> Severity Level
                    </label>
                    <select name="priority" value={formData.priority} onChange={handleChange} required className="w-full p-5 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-[1.5rem] font-black uppercase text-xs tracking-widest outline-none focus:border-indigo-500 appearance-none shadow-sm">
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center ml-4 mr-4">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Operational Description</label>
                    <button 
                        type="button" 
                        onClick={generateAIDescription} 
                        disabled={isGenerating || !formData.title}
                        className="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-3 py-1 rounded-full transition-all disabled:opacity-30"
                    >
                        <SparklesIcon className={`h-3 w-3 ${isGenerating ? 'animate-spin' : ''}`} />
                        {isGenerating ? 'Analyzing...' : 'Gemini Elaborate'}
                    </button>
                </div>
                <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    rows={4} 
                    placeholder="Enter specific mission details..."
                    className="w-full p-6 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] font-medium text-sm outline-none focus:border-indigo-500 shadow-sm resize-none custom-scrollbar" 
                />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button type="button" onClick={onClose} className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 rounded-2xl font-black uppercase text-xs tracking-widest transition-all">Discard Changes</button>
                <button type="submit" className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 active:scale-95 transition-all">Commit Directive</button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;