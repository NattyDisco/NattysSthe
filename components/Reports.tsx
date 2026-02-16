import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';
import { 
    ChartIcon, PrinterIcon, ChevronLeftIcon, 
    CalendarDaysIcon, UserGroupIcon, SearchIcon, 
    ExportIcon, ArrowTrendingUpIcon, CheckCircleIcon,
    ExclamationCircleIcon, ClipboardDocumentListIcon,
    BriefcaseIcon
} from './icons';
import { AttendanceStatus } from '../types';
import { ATTENDANCE_STATUS_DETAILS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div as any;

const Reports: React.FC = () => {
    const { employees, attendanceRecords, preselectedEmployeeIdForReport, companyProfile } = useAppContext();
    const { t } = useI18n();

    // Advanced Filtering State
    const [startMonth, setStartMonth] = useState(new Date().getMonth());
    const [startYear, setStartYear] = useState(new Date().getFullYear());
    const [endMonth, setEndMonth] = useState(new Date().getMonth());
    const [endYear, setEndYear] = useState(new Date().getFullYear());
    const [selectedEmpId, setSelectedEmpId] = useState<string>(preselectedEmployeeIdForReport || 'all');
    const [isGenerating, setIsGenerating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const months = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('default', { month: 'long' }));
    const years = [2023, 2024, 2025, 2026];

    useEffect(() => {
        if (preselectedEmployeeIdForReport) setSelectedEmpId(preselectedEmployeeIdForReport);
    }, [preselectedEmployeeIdForReport]);

    // Data Aggregation Engine
    const reportData = useMemo(() => {
        const startDate = new Date(startYear, startMonth, 1);
        const endDate = new Date(endYear, endMonth + 1, 0); // Last day of final month

        // Filter raw database stream
        const filtered = attendanceRecords.filter(r => {
            const d = new Date(r.date);
            const inRange = d >= startDate && d <= endDate;
            const matchesEmp = selectedEmpId === 'all' ? true : r.employeeId === selectedEmpId;
            return inRange && matchesEmp;
        });

        // Mapping results to totals
        const empSummaryMap = new Map<string, Record<string, number>>();
        
        employees.forEach(e => {
            empSummaryMap.set(e.id, { P: 0, A: 0, L: 0, S: 0, R: 0, O: 0, W: 0, H: 0 });
        });

        filtered.forEach(r => {
            const stats = empSummaryMap.get(r.employeeId);
            if (stats && stats.hasOwnProperty(r.status)) {
                stats[r.status]++;
            }
        });

        return {
            records: filtered.sort((a, b) => a.date.localeCompare(b.date)),
            summary: empSummaryMap,
            startDate,
            endDate
        };
    }, [startMonth, startYear, endMonth, endYear, selectedEmpId, attendanceRecords, employees]);

    const companyTotals = useMemo(() => {
        const totals = { P: 0, A: 0, L: 0, S: 0, R: 0, O: 0 };
        reportData.summary.forEach(stats => {
            totals.P += stats.P;
            totals.A += stats.A;
            totals.L += stats.L;
            totals.S += stats.S;
            totals.R += stats.R;
            totals.O += stats.O;
        });
        return totals;
    }, [reportData]);

    const handleGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => setIsGenerating(false), 1200); // Pulse effect for UX
    };

    const handlePrint = () => window.print();

    const handleExport = () => {
        const headers = ["Personnel", "ID", "Date", "Marking", "Entry", "Exit"];
        const rows = reportData.records.map(r => {
            const emp = employees.find(e => e.id === r.employeeId);
            const label = ATTENDANCE_STATUS_DETAILS[r.status]?.key || r.status;
            return [
                `"${emp?.firstName} ${emp?.surname}"`,
                `"${emp?.employeeId}"`,
                r.date,
                label,
                r.checkInTime || '-',
                r.checkOutTime || '-'
            ].join(',');
        });
        
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `attendance_audit_${selectedEmpId}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderIndividualView = () => {
        const emp = employees.find(e => e.id === selectedEmpId);
        const stats = reportData.summary.get(selectedEmpId) || { P: 0, A: 0, L: 0, S: 0, R: 0, O: 0 };
        const totalPresence = stats.P + stats.R;
        const potentialDays = reportData.records.length || 1;
        const rating = Math.round((totalPresence / potentialDays) * 100);

        return (
            <div className="space-y-10 animate-fadeIn">
                <div className="flex flex-col xl:flex-row gap-10 items-stretch">
                    <div className="bg-white/70 dark:bg-slate-800/70 p-12 rounded-[4rem] shadow-2xl border border-white/30 backdrop-blur-md flex-1 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-16 opacity-5 text-indigo-500">
                            <ChartIcon className="h-64 w-64" />
                        </div>
                        <div className="flex items-center gap-10 mb-12 relative z-10">
                            <img src={emp?.photoUrl} className="w-28 h-28 rounded-[2.5rem] object-cover shadow-2xl ring-8 ring-white dark:ring-slate-700" alt=""/>
                            <div>
                                <h2 className="text-5xl font-black uppercase tracking-tighter text-slate-800 dark:text-white leading-none">{emp?.firstName} {emp?.surname}</h2>
                                <p className="text-[12px] font-black text-indigo-500 uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
                                    <BriefcaseIcon className="h-4 w-4" /> {emp?.role} • {emp?.employeeId}
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 relative z-10">
                            {[
                                { label: 'Present', val: stats.P, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                { label: 'Remote', val: stats.R, color: 'text-teal-500', bg: 'bg-teal-50' },
                                { label: 'Absent', val: stats.A, color: 'text-red-500', bg: 'bg-red-50' },
                                { label: 'Sick', val: stats.S, color: 'text-orange-500', bg: 'bg-orange-50' },
                                { label: 'Leave', val: stats.L, color: 'text-blue-500', bg: 'bg-blue-50' },
                                { label: 'Off', val: stats.O, color: 'text-slate-400', bg: 'bg-slate-50' }
                            ].map(s => (
                                <div key={s.label} className={`p-6 ${s.bg} dark:bg-slate-900 rounded-3xl border-2 border-white dark:border-slate-800 flex flex-col items-center text-center shadow-sm`}>
                                    <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">{s.label}</p>
                                    <p className={`text-3xl font-black ${s.color} tracking-tighter`}>{s.val}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-indigo-600 p-12 rounded-[4rem] shadow-2xl text-white w-full xl:w-96 flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute -left-12 -bottom-12 opacity-10">
                            <ArrowTrendingUpIcon className="h-64 w-64" />
                        </div>
                        <h3 className="text-3xl font-black uppercase tracking-tighter mb-6">Analytical Radar</h3>
                        <p className="text-indigo-100 font-medium italic text-xl leading-relaxed mb-8 relative z-10">
                            {stats.A > 2 ? "Anomaly: High absence density detected. Verification audit recommended." : "Status: Personnel is maintaining peak organizational compliance."}
                        </p>
                        <div className="pt-8 border-t border-white/20 relative z-10">
                            <p className="text-[11px] font-black uppercase tracking-widest opacity-60 mb-1">Period Productivity Score</p>
                            <p className="text-6xl font-black tracking-tighter">{rating}%</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-slate-800/80 rounded-[5rem] shadow-2xl border border-white/40 overflow-hidden printable-area">
                    <div className="p-10 border-b-2 dark:border-slate-700 flex items-center gap-5 bg-slate-50/50 dark:bg-slate-900/30">
                         <ClipboardDocumentListIcon className="h-8 w-8 text-indigo-500" />
                         <h3 className="text-2xl font-black uppercase tracking-tighter">Chronological Registry Log</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white dark:bg-slate-900 border-b-2 dark:border-slate-700">
                                <tr className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">
                                    <th className="p-10">Timeline Index</th>
                                    <th className="p-10">Day Ref</th>
                                    <th className="p-10">Status Token</th>
                                    <th className="p-10">Clock-In</th>
                                    <th className="p-10 text-right">Clock-Out</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {reportData.records.map(r => {
                                    const d = new Date(r.date);
                                    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                                    const details = ATTENDANCE_STATUS_DETAILS[r.status];
                                    return (
                                        <tr key={r.id} className={`hover:bg-indigo-50/20 transition-all ${isWeekend ? 'bg-slate-50/30 dark:bg-slate-900/10' : ''}`}>
                                            <td className="p-10 font-mono text-sm font-black text-slate-400">{r.date}</td>
                                            <td className="p-10 font-black uppercase text-[12px] text-slate-500 tracking-widest">{d.toLocaleDateString(undefined, { weekday: 'long' })}</td>
                                            <td className="p-10">
                                                <span className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-black/5 ${details?.bgColor} ${details?.color}`}>
                                                    {details?.key || 'Unmarked'}
                                                </span>
                                            </td>
                                            <td className="p-10 text-sm font-black text-slate-600 dark:text-slate-300">{r.checkInTime || '---'}</td>
                                            <td className="p-10 text-sm font-black text-slate-600 dark:text-slate-300 text-right">{r.checkOutTime || '---'}</td>
                                        </tr>
                                    );
                                })}
                                {reportData.records.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-60 text-center text-slate-400 font-black italic uppercase tracking-widest opacity-20">
                                            <ExclamationCircleIcon className="h-24 w-24 mx-auto mb-6" />
                                            Zero Records Mapped In Epoch
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderCollectiveView = () => {
        const filteredList = employees.filter(e => 
            `${e.firstName} ${e.surname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <div className="space-y-12 animate-fadeIn px-2">
                <div className="flex flex-col md:flex-row justify-between items-center no-print gap-6">
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Organization Performance Matrix</h2>
                    <div className="relative w-full md:w-[450px]">
                        <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Filter personnel matrix stream..." 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-16 pr-8 py-5 bg-white dark:bg-slate-800 border-4 border-slate-50 dark:border-slate-700 rounded-[2.5rem] font-black uppercase text-[11px] tracking-[0.2em] outline-none shadow-2xl focus:border-indigo-500 transition-all"
                        />
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-slate-800/80 rounded-[5rem] shadow-2xl border border-white/40 overflow-hidden printable-area">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900 border-b-2 dark:border-slate-700">
                            <tr className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">
                                <th className="p-10">Personnel Identifier</th>
                                <th className="p-10 text-center text-emerald-500">P/R</th>
                                <th className="p-10 text-center text-red-500">A</th>
                                <th className="p-10 text-center text-blue-500">L</th>
                                <th className="p-10 text-center text-orange-500">S</th>
                                <th className="p-10 text-center">O</th>
                                <th className="p-10 text-right">Compliance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredList.map(emp => {
                                const stats = reportData.summary.get(emp.id) || { P: 0, A: 0, L: 0, S: 0, R: 0, O: 0 };
                                const attendance = stats.P + stats.R;
                                const totalMarked = attendance + stats.A + stats.S + stats.L;
                                const score = totalMarked > 0 ? Math.round((attendance / totalMarked) * 100) : 0;
                                
                                return (
                                    <tr key={emp.id} className="hover:bg-indigo-50/20 transition-all">
                                        <td className="p-10">
                                            <div className="flex items-center gap-8">
                                                <img src={emp.photoUrl} className="w-16 h-16 rounded-[1.5rem] object-cover shadow-2xl ring-4 ring-white dark:ring-slate-700" alt=""/>
                                                <div>
                                                    <p className="font-black text-2xl text-slate-800 dark:text-white uppercase tracking-tighter leading-none">{emp.firstName} {emp.surname}</p>
                                                    <p className="text-[11px] font-bold text-slate-400 uppercase mt-2 tracking-[0.2em]">{emp.employeeId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-10 text-center font-black text-2xl text-slate-700 dark:text-slate-200">{stats.P + stats.R}</td>
                                        <td className="p-10 text-center font-black text-2xl text-red-600">{stats.A}</td>
                                        <td className="p-10 text-center font-black text-2xl text-blue-600">{stats.L}</td>
                                        <td className="p-10 text-center font-black text-2xl text-orange-600">{stats.S}</td>
                                        <td className="p-10 text-center font-black text-2xl text-slate-300">{stats.O}</td>
                                        <td className="p-10 text-right">
                                            <div className="flex flex-col items-end gap-3">
                                                <span className={`text-2xl font-black ${score > 90 ? 'text-emerald-500' : score > 70 ? 'text-indigo-500' : 'text-rose-500'}`}>{score}%</span>
                                                <div className="w-28 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                                                    <div className={`h-full ${score > 90 ? 'bg-emerald-500' : score > 70 ? 'bg-indigo-500' : 'bg-rose-500'}`} style={{ width: `${score}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="bg-indigo-600 font-black border-t-8 border-indigo-400 text-white">
                            <tr className="uppercase text-xs tracking-[0.3em]">
                                <td className="p-10">Global Organizational Totals</td>
                                <td className="p-10 text-center text-4xl font-black">{companyTotals.P + companyTotals.R}</td>
                                <td className="p-10 text-center text-4xl font-black">{companyTotals.A}</td>
                                <td className="p-10 text-center text-4xl font-black">{companyTotals.L}</td>
                                <td className="p-10 text-center text-4xl font-black">{companyTotals.S}</td>
                                <td className="p-10 text-center text-4xl font-black text-indigo-300">{companyTotals.O}</td>
                                <td className="p-10 text-right italic text-indigo-200">Terminal Snapshot</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="container mx-auto pb-32 px-4">
            {/* Header & Advanced Global Range Switcher */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-12 no-print pt-6 mb-12">
                <div>
                    <h1 className="text-6xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none mb-4">Intelligence Hub</h1>
                    <p className="text-slate-500 font-medium italic text-xl">Aggregated multi-epoch performance mapping and verified audit registries</p>
                </div>

                <div className="bg-white/80 dark:bg-slate-800/80 p-10 rounded-[4rem] shadow-2xl border-4 border-white dark:border-slate-700 backdrop-blur-3xl flex flex-wrap gap-8 items-end flex-1 w-full xl:max-w-[1250px]">
                    <div className="flex-1 min-w-[320px] space-y-3">
                        <label className="text-[11px] font-black uppercase text-slate-400 ml-3 tracking-[0.3em] flex items-center gap-3">
                           <UserGroupIcon className="h-4 w-4" /> Targeted Audit Cluster
                        </label>
                        <select 
                            value={selectedEmpId} 
                            onChange={e => setSelectedEmpId(e.target.value)}
                            className="w-full p-5 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] font-black text-sm uppercase border-0 outline-none ring-4 ring-slate-50 dark:ring-slate-700 focus:ring-indigo-500 transition-all appearance-none cursor-pointer px-8 shadow-sm"
                        >
                            <option value="all">Global Personnel Snapshot (All)</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.surname}</option>)}
                        </select>
                    </div>

                    <div className="flex gap-6 flex-1 min-w-[500px]">
                        <div className="flex-1 space-y-3">
                            <label className="text-[11px] font-black uppercase text-slate-400 ml-3 tracking-[0.3em]">Epoch Commencement</label>
                            <div className="flex gap-3">
                                <select value={startMonth} onChange={e => setStartMonth(parseInt(e.target.value))} className="flex-1 p-5 bg-slate-50 dark:bg-slate-900 rounded-[2rem] font-black border-0 text-[11px] uppercase ring-2 ring-slate-100 dark:ring-slate-700">
                                    {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                                </select>
                                <select value={startYear} onChange={e => setStartYear(parseInt(e.target.value))} className="p-5 bg-slate-50 dark:bg-slate-900 rounded-[2rem] font-black border-0 text-[11px] ring-2 ring-slate-100 dark:ring-slate-700">
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex-1 space-y-3">
                            <label className="text-[11px] font-black uppercase text-slate-400 ml-3 tracking-[0.3em]">Epoch Termination</label>
                            <div className="flex gap-3">
                                <select value={endMonth} onChange={e => setEndMonth(parseInt(e.target.value))} className="flex-1 p-5 bg-slate-50 dark:bg-slate-900 rounded-[2rem] font-black border-0 text-[11px] uppercase ring-2 ring-slate-100 dark:ring-slate-700">
                                    {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                                </select>
                                <select value={endYear} onChange={e => setEndYear(parseInt(e.target.value))} className="p-5 bg-slate-50 dark:bg-slate-900 rounded-[2rem] font-black border-0 text-[11px] ring-2 ring-slate-100 dark:ring-slate-700">
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 w-full sm:w-auto">
                        <button onClick={handleGenerate} className="flex-1 sm:flex-none px-12 py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black uppercase text-[12px] tracking-[0.3em] shadow-2xl shadow-indigo-500/40 transition-all hover:bg-indigo-700 active:scale-95">
                            {isGenerating ? 'Compiling Tokens...' : 'Generate Intel'}
                        </button>
                        <button onClick={handleExport} className="p-6 glass-btn bg-white dark:bg-slate-700 text-slate-500 rounded-[2rem] shadow-xl hover:text-indigo-600 transition-all active:scale-90"><ExportIcon className="h-6 w-6"/></button>
                        <button onClick={handlePrint} className="p-6 glass-btn bg-white dark:bg-slate-700 text-slate-500 rounded-[2rem] shadow-xl hover:text-indigo-600 transition-all active:scale-90"><PrinterIcon className="h-6 w-6"/></button>
                    </div>
                </div>
            </div>

            {/* Content Output */}
            <AnimatePresence mode="wait">
                {isGenerating ? (
                    <div className="py-72 text-center space-y-16 animate-pulse">
                        <div className="relative inline-block">
                            <div className="w-32 h-32 border-[12px] border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto shadow-2xl shadow-indigo-500/30"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <ChartIcon className="h-10 w-10 text-indigo-400" />
                            </div>
                        </div>
                        <div className="space-y-4">
                           <p className="font-black uppercase tracking-[0.8em] text-slate-400 text-2xl">Parsing Data Stream</p>
                           <p className="text-lg font-bold text-slate-500 italic opacity-60">Reconciling cloud-stored attendance markers for specified epoch...</p>
                        </div>
                    </div>
                ) : (
                    <MotionDiv initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
                        {selectedEmpId === 'all' ? renderCollectiveView() : renderIndividualView()}
                    </MotionDiv>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Reports;