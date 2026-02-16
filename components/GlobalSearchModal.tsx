import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useDebounce } from '../hooks/useDebounce';
import { SearchIcon } from './icons';
import GlobalSearchResults from './GlobalSearchResults';
import { Employee, Task, Vehicle, View } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
    const { allEmployees, tasks, vehicles, setView } = useAppContext();
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 300);
    const [results, setResults] = useState<{ employees: Employee[]; tasks: Task[]; vehicles: Vehicle[] } | null>(null);

    useEffect(() => {
        if (debouncedQuery.length > 1) {
            const lowerQuery = debouncedQuery.toLowerCase();
            const employeeResults = allEmployees.filter(e => 
                `${e.firstName} ${e.surname}`.toLowerCase().includes(lowerQuery) ||
                e.email.toLowerCase().includes(lowerQuery)
            ).slice(0, 5);

            const taskResults = tasks.filter(t => t.title.toLowerCase().includes(lowerQuery)).slice(0, 5);
            const vehicleResults = vehicles.filter(v => 
                v.model.toLowerCase().includes(lowerQuery) ||
                v.plateNumber.toLowerCase().includes(lowerQuery)
            ).slice(0, 5);
            
            setResults({ employees: employeeResults, tasks: taskResults, vehicles: vehicleResults });
        } else {
            setResults(null);
        }
    }, [debouncedQuery, allEmployees, tasks, vehicles]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-20" onClick={onClose}>
            <div className="relative w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="relative">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for employees, tasks, vehicles..."
                        className="w-full p-4 pl-12 rounded-lg shadow-2xl bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        autoFocus
                    />
                </div>
                {results && <GlobalSearchResults results={results} onClose={onClose} setView={setView} />}
            </div>
        </div>
    );
};

export default GlobalSearchModal;
