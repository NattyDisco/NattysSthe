
import React, { useState, useEffect, useMemo } from 'react';
import { Employee, Task, Vehicle, View } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import { TasksIcon, CarIcon, EyeIcon, EditIcon, AttendanceIcon, ChartIcon } from './icons';
import { motion } from 'framer-motion';

// FIX: Cast motion.div to any to avoid type errors with motion props.
const MotionDiv = motion.div as any;

interface GlobalSearchResultsProps {
    results: {
        employees: Employee[];
        tasks: Task[];
        vehicles: Vehicle[];
    } | null;
    onClose: () => void;
    setView: (view: View) => void;
}

const GlobalSearchResults: React.FC<GlobalSearchResultsProps> = ({ results, onClose, setView }) => {
    const { 
        allEmployees,
        openTaskDetailPanel, 
        openVehicleDetail, 
        openEditEmployeeModal, 
        openAddTaskModal, 
        setPreselectedEmployeeForAttendance,
        setPreselectedEmployeeIdForReport,
    } = useAppContext();

    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set());

    // Clear selection when results change
    useEffect(() => {
        setSelectedEmployeeIds(new Set());
    }, [results]);

    const handleEmployeeSelect = (employeeId: string) => {
        setSelectedEmployeeIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(employeeId)) {
                newSet.delete(employeeId);
            } else {
                newSet.add(employeeId);
            }
            return newSet;
        });
    };

    const handleTaskClick = (task: Task) => {
        openTaskDetailPanel(task.id);
        onClose();
    };
    
    const handleVehicleClick = (vehicle: Vehicle) => {
        setView('permits');
        openVehicleDetail(vehicle.id);
        onClose();
    };
    
    const selectedEmployees = useMemo(() => 
        allEmployees.filter(emp => selectedEmployeeIds.has(emp.id)),
    [allEmployees, selectedEmployeeIds]);

    if (!results) {
        return (
             <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-b-lg shadow-lg border-t dark:border-slate-700 p-4">
                <p className="text-sm text-slate-500 text-center italic">Searching...</p>
             </div>
        );
    }
    
    const { employees, tasks, vehicles } = results;
    const hasResults = employees.length > 0 || tasks.length > 0 || vehicles.length > 0;

    const ActionButton: React.FC<{
        label: string;
        icon: React.ReactNode;
        onClick: () => void;
        disabled?: boolean;
        disabledText?: string;
    }> = ({ label, icon, onClick, disabled = false, disabledText }) => (
         <button 
            onClick={onClick} 
            disabled={disabled}
            className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-colors w-24 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:disabled:hover:bg-transparent"
            title={disabled ? disabledText : label}
        >
            <div className={`transition-colors ${disabled ? '' : 'text-indigo-500'}`}>{icon}</div>
            <span className="text-xs font-semibold text-center">{label}</span>
        </button>
    );

    return (
        <div className="absolute top-full mt-2 w-96 bg-white dark:bg-slate-800 rounded-lg shadow-lg border dark:border-slate-700 max-h-[32rem] flex flex-col z-20">
            <div className="flex-1 overflow-y-auto">
                {hasResults ? (
                    <div className="p-2">
                        {employees.length > 0 && (
                            <section>
                                <h3 className="px-2 py-1 text-xs font-bold uppercase text-slate-400">Employees</h3>
                                <ul>
                                    {employees.map(emp => (
                                        <li key={`emp-${emp.id}`}>
                                            <label className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                                                <input 
                                                    type="checkbox"
                                                    checked={selectedEmployeeIds.has(emp.id)}
                                                    onChange={() => handleEmployeeSelect(emp.id)}
                                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <img src={emp.photoUrl} alt={emp.firstName} className="h-10 w-10 rounded-full object-cover flex-shrink-0" />
                                                <div className="flex-1">
                                                    <p className="font-semibold text-sm">{emp.firstName} {emp.surname}</p>
                                                    <p className="text-xs text-slate-500">{emp.role}</p>
                                                </div>
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                        {tasks.length > 0 && (
                            <section className="mt-2">
                                <h3 className="px-2 py-1 text-xs font-bold uppercase text-slate-400">Tasks</h3>
                                <ul>
                                    {tasks.map(task => (
                                        <li key={`task-${task.id}`} onClick={() => handleTaskClick(task)} className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                                            <TasksIcon className="h-5 w-5 text-slate-500 flex-shrink-0"/>
                                            <p className="font-semibold text-sm truncate">{task.title}</p>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                        {vehicles.length > 0 && (
                            <section className="mt-2">
                                <h3 className="px-2 py-1 text-xs font-bold uppercase text-slate-400">Vehicles</h3>
                                <ul>
                                    {vehicles.map(v => (
                                        <li key={`veh-${v.id}`} onClick={() => handleVehicleClick(v)} className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                                            <CarIcon className="h-5 w-5 text-slate-500 flex-shrink-0"/>
                                            <div>
                                                <p className="font-semibold text-sm">{v.model}</p>
                                                <p className="text-xs text-slate-500">{v.plateNumber}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-slate-500 text-center p-4">No results found.</p>
                )}
            </div>
            
            {selectedEmployeeIds.size > 0 && (
                <MotionDiv 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="border-t dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 backdrop-blur-sm p-3 flex-shrink-0"
                >
                    <h4 className="text-sm font-bold mb-2">Actions for {selectedEmployeeIds.size} employee(s)</h4>
                    <div className="flex flex-wrap justify-center gap-2">
                        <ActionButton 
                            label="Manage Attendance"
                            icon={<AttendanceIcon className="h-6 w-6"/>}
                            onClick={() => {
                                setPreselectedEmployeeForAttendance(selectedEmployees[0].id);
                                setView('attendance');
                                onClose();
                            }}
                            disabled={selectedEmployeeIds.size !== 1}
                            disabledText="Select one employee"
                        />
                        <ActionButton 
                            label="Generate Report"
                            icon={<ChartIcon className="h-6 w-6"/>}
                            onClick={() => {
                                setPreselectedEmployeeIdForReport(selectedEmployees[0].id);
                                setView('reports');
                                onClose();
                            }}
                            disabled={selectedEmployeeIds.size !== 1}
                             disabledText="Select one employee"
                        />
                         <ActionButton 
                            label="Assign Task"
                            icon={<TasksIcon className="h-6 w-6"/>}
                            onClick={() => {
                                openAddTaskModal(selectedEmployees[0].id);
                                onClose();
                            }}
                            disabled={selectedEmployeeIds.size !== 1}
                             disabledText="Select one employee"
                        />
                         <ActionButton 
                            label="Edit Profile"
                            icon={<EditIcon className="h-6 w-6"/>}
                            onClick={() => {
                                openEditEmployeeModal(selectedEmployees[0]);
                                onClose();
                            }}
                            disabled={selectedEmployeeIds.size !== 1}
                             disabledText="Select one employee"
                        />
                    </div>
                </MotionDiv>
            )}
        </div>
    );
};

export default GlobalSearchResults;
