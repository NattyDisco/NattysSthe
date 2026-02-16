
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';
import { ClipboardDocumentListIcon, PlusIcon, PrinterIcon, ChevronLeftIcon, CheckCircleIcon, XCircleIcon, PaperClipIcon } from './icons';
import { View, AttendanceReport, Employee } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const formatPercent = (val: number) => `${val.toFixed(1)}%`;

const MonthlyAttendanceReport: React.FC<{ setView: (view: View) => void }> = ({ setView }) => {
    const { 
        allEmployees, attendanceReports, reportLogs, companyProfile,
        bulkGenerateReports, bulkSendReports, sendReport, generateMonthlyReport, openConfirmModal
    } = useAppContext();
    const { t } = useI18n();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(false);
    const [selectedReport, setSelectedReport] = useState<AttendanceReport | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthsArr = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('default', { month: 'long' }));
    const yearsArr = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    const reportStatus = useMemo(() => {
        return allEmployees.filter(e => e.status === 'active').map(emp => {
            const report = attendanceReports.find(r => r.employeeId === emp.id && r.year === year && r.month === month);
            return { employee: emp, report };
        });
    }, [allEmployees, attendanceReports, year, month]);

    const handleBatchGenerate = () => {
        openConfirmModal(
            "Batch Generate Reports",
            `This will create snapshots for all active employees for ${monthsArr[month]} ${year}. Proceed?`,
            async () => {
                setIsLoading(true);
                await bulkGenerateReports(year, month);
                setIsLoading(false);
            }
        );
    };

    const handleBatchSend = () => {
        openConfirmModal(
            "Execute Batch Dispatch",
            "This will email all drafted reports to employees. This action is tracked in audit logs.",
            async () => {
                setIsLoading(true);
                await bulkSendReports(year, month);
                setIsLoading(false);
            }
        );
    };

    const MotionDiv = motion.div as any;

    return (
        <div className="container mx-auto animate-fadeIn space-y-8 pb-20">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                  <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Reporting Deck</h1>
                  <p className="text-slate-500 font-medium italic">Monthly attendance snapshots & employee dispatch</p>
                </div>
                
                <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                    <button 
                        onClick={handleBatchGenerate}
                        disabled={isLoading}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-indigo-500 transition-all"
                    >
                        <PlusIcon className="h-5 w-5" /> Generate Batches
                    </button>
                    <button 
                        onClick={handleBatchSend}
                        disabled={isLoading}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700"
                    >
                        <ClipboardDocumentListIcon className="h-5 w-5" />
                        {isLoading ? "Processing..." : "Dispatch All"}
                    </button>
                </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/80 p-6 rounded-3xl shadow-xl border border-white/40 dark:border-slate-700/50 backdrop-blur-xl flex flex-col md:flex-row gap-6 items-center">
                <div className="flex items-center gap-4 flex-1">
                    <h2 className="text-sm font-black uppercase text-slate-400 tracking-widest">Select Cycle:</h2>
                    <select value={month} onChange={e => setCurrentDate(new Date(year, parseInt(e.target.value)))} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl font-bold border-0 focus:ring-2 focus:ring-indigo-500">
                        {monthsArr.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                    <select value={year} onChange={e => setCurrentDate(new Date(parseInt(e.target.value), month))} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl font-bold border-0 focus:ring-2 focus:ring-indigo-500">
                        {yearsArr.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-700">
                        <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <th className="p-5">Employee</th>
                            <th className="p-5">Presence</th>
                            <th className="p-5">Late Arrivals</th>
                            <th className="p-5">Status</th>
                            <th className="p-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {reportStatus.map(({ employee, report }) => (
                            <tr key={employee.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="p-5">
                                    <div className="flex items-center gap-3">
                                        <img src={employee.photoUrl} className="h-10 w-10 rounded-xl object-cover" />
                                        <div>
                                            <p className="font-black text-sm text-slate-800 dark:text-white uppercase">{employee.firstName} {employee.surname}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{employee.role}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5">
                                    {report ? (
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-indigo-600">{formatPercent(report.data.attendancePercentage)}</p>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase">{report.data.daysPresent} Days / {report.data.totalWorkingDays} Required</p>
                                        </div>
                                    ) : <span className="text-xs text-slate-300 italic">No Data Generated</span>}
                                </td>
                                <td className="p-5">
                                    {report ? (
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${report.data.lateArrivals > 2 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                                            {report.data.lateArrivals} Incidents
                                        </span>
                                    ) : '---'}
                                </td>
                                <td className="p-5">
                                    {report ? (
                                        <span className={`text-[10px] font-black uppercase ${report.status === 'sent' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                            {report.status}
                                        </span>
                                    ) : '---'}
                                </td>
                                <td className="p-5 text-right">
                                    <div className="flex justify-end gap-2">
                                        {report ? (
                                            <>
                                                <button onClick={() => setSelectedReport(report)} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Review</button>
                                                <button onClick={() => sendReport(report.id)} className="p-1.5 text-slate-400 hover:text-indigo-600"><PaperClipIcon className="h-4 w-4"/></button>
                                            </>
                                        ) : (
                                            <button onClick={() => generateMonthlyReport(employee.id, year, month)} className="text-xs font-black text-indigo-600 uppercase tracking-widest px-3 py-1.5 hover:bg-indigo-50 rounded-xl">Generate</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* PREVIEW MODAL */}
            <AnimatePresence>
                {selectedReport && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                        <MotionDiv 
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl border dark:border-slate-800 flex flex-col"
                            onClick={(e: any) => e.stopPropagation()}
                        >
                            <header className="p-8 border-b dark:border-slate-800 flex justify-between items-center no-print">
                                <h2 className="text-2xl font-black uppercase tracking-tighter">Attendance Performance Review</h2>
                                <div className="flex gap-2">
                                    <button onClick={() => window.print()} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:text-indigo-600"><PrinterIcon className="h-5 w-5"/></button>
                                    <button onClick={() => setSelectedReport(null)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:text-red-500"><XCircleIcon className="h-5 w-5"/></button>
                                </div>
                            </header>
                            
                            <main className="p-12 printable-area space-y-12">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h1 className="text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-white">{companyProfile.name}</h1>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Monthly Attendance Report</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-indigo-600">{monthsArr[selectedReport.month]} {selectedReport.year}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Issued: {new Date(selectedReport.generatedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-12 p-8 bg-slate-50 dark:bg-slate-800 rounded-[2rem]">
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Identity Details</h4>
                                        {(() => {
                                            const emp = allEmployees.find(e => e.id === selectedReport.employeeId);
                                            return (
                                                <div className="space-y-1">
                                                    <p className="text-2xl font-black uppercase">{emp?.firstName} {emp?.surname}</p>
                                                    <p className="text-sm font-bold text-slate-500">{emp?.role} • {emp?.employeeId}</p>
                                                    <p className="text-xs font-medium text-slate-400">{emp?.department} / {emp?.branchId}</p>
                                                </div>
                                            )
                                        })()}
                                    </div>
                                    <div className="text-center">
                                        <h4 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Compliance Rating</h4>
                                        <div className="relative inline-block">
                                            <p className="text-5xl font-black text-indigo-600">{formatPercent(selectedReport.data.attendancePercentage)}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase mt-2">Verified Attendance</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 pb-2 border-b-2 border-indigo-50">Presence Summary</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm"><span>Days Present</span><span className="font-bold">{selectedReport.data.daysPresent}</span></div>
                                            <div className="flex justify-between text-sm"><span>Late Arrivals</span><span className="font-bold text-red-500">{selectedReport.data.lateArrivals}</span></div>
                                            <div className="flex justify-between text-sm"><span>Overtime Hours</span><span className="font-bold text-emerald-600">{selectedReport.data.overtimeHours.toFixed(1)} hrs</span></div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-amber-500 pb-2 border-b-2 border-amber-50">Absence & Leave</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm"><span>Approved Leave</span><span className="font-bold">{selectedReport.data.daysLeave}</span></div>
                                            <div className="flex justify-between text-sm"><span>Sick Days</span><span className="font-bold">{selectedReport.data.daysSick}</span></div>
                                            <div className="flex justify-between text-sm"><span>Unexcused Absent</span><span className="font-bold text-red-500">{selectedReport.data.daysAbsent}</span></div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 pb-2 border-b-2 border-slate-100">Calendar Context</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm"><span>Public Holidays</span><span className="font-bold">{selectedReport.data.daysHoliday}</span></div>
                                            <div className="flex justify-between text-sm"><span>Rest Days</span><span className="font-bold">{selectedReport.data.daysWeekend}</span></div>
                                            <div className="flex justify-between text-sm font-black pt-2 border-t"><span>Payable Days</span><span className="text-indigo-600">{selectedReport.data.payableDays}</span></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] text-center italic text-sm text-slate-400">
                                    "This report is an automated summary of digital clock-in records and approved HR status updates. Discrepancies should be reported to the HR department within 48 hours of receipt."
                                </div>
                            </main>
                            
                            <footer className="p-8 mt-auto text-center border-t dark:border-slate-800 no-print">
                                <button onClick={() => sendReport(selectedReport.id)} className="px-12 py-4 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-indigo-500/40">Transmit to Employee</button>
                            </footer>
                        </MotionDiv>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MonthlyAttendanceReport;
