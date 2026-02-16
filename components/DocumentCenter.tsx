
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';
import { PlusIcon, DocumentTextIcon, SearchIcon, EyeIcon, PencilSquareIcon } from './icons';
import { DocumentCategory, EmployeeDocument } from '../types';

const DocumentCenter: React.FC = () => {
    const { employeeDocuments, employees, openDocumentCenterModal, openSignatureModal, currentUser } = useAppContext();
    const { t } = useI18n();

    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | 'all'>('all');

    const employeeMap = useMemo(() => new Map(employees.map(e => [e.id, `${e.firstName} ${e.surname}`])), [employees]);

    const filteredDocs = useMemo(() => {
        let docs = employeeDocuments;
        if (categoryFilter !== 'all') {
            docs = docs.filter(d => d.category === categoryFilter);
        }
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            docs = docs.filter(d => 
                d.title.toLowerCase().includes(query) || 
                (employeeMap.get(d.employeeId)?.toLowerCase().includes(query))
            );
        }
        return docs;
    }, [employeeDocuments, categoryFilter, searchQuery, employeeMap]);

    return (
        <div className="container mx-auto animate-fadeIn space-y-6">
             <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold">{t('sidebar.document_center')}</h1>
                <button onClick={() => openDocumentCenterModal(null)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-lg">
                    <PlusIcon className="h-5 w-5" />
                    <span>{t('document_center.upload_document')}</span>
                </button>
            </div>

            <div className="bg-white/70 dark:bg-slate-800/70 p-4 rounded-xl shadow-lg border border-white/30 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search by title or employee..."
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                <select 
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value as any)}
                    className="px-4 py-2 bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                    <option value="all">All Categories</option>
                    <option value="Identity">Identity</option>
                    <option value="Contract">Contract</option>
                    <option value="Financial">Financial</option>
                    <option value="Permit">Permit</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-xl border border-white/40 dark:border-slate-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b dark:border-slate-700">
                            <tr className="text-xs font-bold uppercase text-slate-500">
                                <th className="p-4">Document</th>
                                <th className="p-4">Employee</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Upload Date</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {filteredDocs.length > 0 ? (
                                filteredDocs.map(doc => (
                                    <tr key={doc.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-700/20">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <DocumentTextIcon className="h-8 w-8 text-indigo-500" />
                                                <div>
                                                    <p className="font-bold">{doc.title}</p>
                                                    <p className="text-xs text-slate-500 font-mono">{doc.fileName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 font-medium">{employeeMap.get(doc.employeeId)}</td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-[10px] font-bold uppercase">{doc.category}</span>
                                        </td>
                                        <td className="p-4 text-sm">{doc.uploadDate}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                {doc.category === 'Contract' && !doc.signature && (
                                                    <button onClick={() => openSignatureModal(doc.id)} className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700">Sign</button>
                                                )}
                                                <button onClick={() => openDocumentCenterModal(doc)} className="p-2 text-slate-500 hover:text-indigo-600"><PencilSquareIcon className="h-5 w-5"/></button>
                                                <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="p-2 text-slate-500 hover:text-blue-600"><EyeIcon className="h-5 w-5" /></a>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center opacity-40">
                                        <DocumentTextIcon className="h-16 w-16 mx-auto mb-4" />
                                        <p className="text-xl font-bold">No Documents Found</p>
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

export default DocumentCenter;
