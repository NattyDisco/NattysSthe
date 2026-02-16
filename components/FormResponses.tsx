import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';
import { ChevronLeftIcon, ClipboardDocumentListIcon, ExportIcon } from './icons';

const FormResponses: React.FC<{ setView: (view: any) => void }> = ({ setView }) => {
    const { selectedFormId, customForms, formSubmissions, employees } = useAppContext();
    const { t } = useI18n();

    const form = customForms.find(f => f.id === selectedFormId);
    const submissions = formSubmissions.filter(s => s.formId === selectedFormId).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    const employeeMap = new Map(employees.map(e => [e.id, `${e.firstName} ${e.surname}`]));
    
    const handleExport = () => {
        if (!form || submissions.length === 0) return;

        const headers = ['Submitted By', 'Submission Date', ...form.fields.map(f => `"${f.label.replace(/"/g, '""')}"`)];
        const rows = submissions.map(sub => {
            const row = [
                `"${employeeMap.get(sub.employeeId) || 'Unknown'}"`,
                `"${new Date(sub.submittedAt).toLocaleString()}"`
            ];
            form.fields.forEach(field => {
                const response = sub.responses[field.id];
                const value = Array.isArray(response) ? response.join('; ') : response;
                row.push(`"${String(value || '').replace(/"/g, '""')}"`);
            });
            return row.join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${form.title}-responses.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
    };

    if (!form) return <div className="p-8 text-center">{t('form_responses.not_found')}</div>;

    return (
        <div className="container mx-auto animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => setView('custom_forms')} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                        <ChevronLeftIcon className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold">{t('form_responses.title', { formTitle: form.title })}</h1>
                        <p className="text-slate-500">{submissions.length} total responses</p>
                    </div>
                </div>
                <button onClick={handleExport} disabled={submissions.length === 0} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg disabled:bg-slate-400">
                    <ExportIcon className="h-5 w-5"/> Export CSV
                </button>
            </div>
            
             <div className="bg-white/70 dark:bg-slate-800/70 rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    {submissions.length > 0 ? (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50/70 dark:bg-slate-700/50">
                                <tr>
                                    <th className="p-3 font-semibold">Submitted By</th>
                                    <th className="p-3 font-semibold">Date</th>
                                    {form.fields.map(field => <th key={field.id} className="p-3 font-semibold">{field.label}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map(sub => (
                                    <tr key={sub.id} className="border-t dark:border-slate-700">
                                        <td className="p-3 font-medium">{employeeMap.get(sub.employeeId) || 'Unknown'}</td>
                                        <td className="p-3 whitespace-nowrap">{new Date(sub.submittedAt).toLocaleString()}</td>
                                        {form.fields.map(field => {
                                            const response = sub.responses[field.id];
                                            const value = Array.isArray(response) ? response.join(', ') : response;
                                            return <td key={field.id} className="p-3">{String(value || '-')}</td>
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center p-16">
                            <ClipboardDocumentListIcon className="h-16 w-16 text-slate-400 mx-auto mb-4"/>
                            <h2 className="text-xl font-semibold">No Responses Yet</h2>
                            <p className="text-slate-500">Share the form with employees to start collecting responses.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FormResponses;
