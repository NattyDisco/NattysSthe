import React, { useState, useCallback } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';
import { ImportIcon, PaperClipIcon, XCircleIcon } from './icons';

const BiometricImport: React.FC = () => {
    const { processBiometricData } = useAppContext();
    const { t } = useI18n();
    const [logData, setLogData] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<{ createdCount: number; updatedCount: number; skippedCount: number; errorCount: number; errors: string[] } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (files: FileList | null) => {
        if (files && files.length > 0) {
            const selectedFile = files[0];
            setFile(selectedFile);
            setResult(null);
            const reader = new FileReader();
            reader.onload = (e) => {
                setLogData(e.target?.result as string);
            };
            reader.readAsText(selectedFile);
        }
    };

    const handleProcess = async () => {
        setIsLoading(true);
        setResult(null);
        const res = await processBiometricData(logData);
        setResult(res);
        setIsLoading(false);
    };

    const handleDragEvents = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileChange(e.dataTransfer.files);
            e.dataTransfer.clearData();
        }
    };

    const clearAll = () => {
        setLogData('');
        setFile(null);
        setResult(null);
    };

    return (
        <div className="container mx-auto animate-fadeIn space-y-6">
            <h1 className="text-3xl font-bold">{t('sidebar.biometric_import')}</h1>

            <div className="bg-white/70 dark:bg-slate-800/70 p-6 rounded-lg shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* File Upload Section */}
                    <div>
                        <h2 className="font-bold text-lg mb-2">{t('biometric_import.upload_section_title')}</h2>
                        <div 
                            onDragEnter={handleDragEvents}
                            onDragOver={handleDragEvents}
                            onDragLeave={handleDragEvents}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-300 dark:border-slate-600'}`}
                        >
                            <ImportIcon className="h-12 w-12 mx-auto text-slate-400" />
                            <p className="mt-4 text-sm text-slate-500">{t('biometric_import.drag_drop')}</p>
                            <p className="my-2 text-xs font-semibold uppercase text-slate-400">{t('biometric_import.or')}</p>
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                accept=".txt,.csv,.dat"
                                onChange={(e) => handleFileChange(e.target.files)}
                            />
                            <label htmlFor="file-upload" className="cursor-pointer font-semibold text-indigo-600 hover:text-indigo-500">
                                {t('biometric_import.select_file')}
                            </label>
                        </div>
                        {file && (
                             <div className="mt-4 flex items-center justify-between bg-slate-100 dark:bg-slate-700 p-2 rounded-md">
                                <div className="flex items-center gap-2">
                                    <PaperClipIcon className="h-5 w-5 text-slate-500" />
                                    <span className="text-sm font-medium truncate">{file.name}</span>
                                </div>
                                <button onClick={clearAll} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600">
                                    <XCircleIcon className="h-5 w-5 text-slate-400"/>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Format Information */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                         <h3 className="font-bold text-lg mb-2">{t('biometric_import.format_title')}</h3>
                         <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{t('biometric_import.format_desc')}</p>
                         <pre className="bg-slate-200 dark:bg-slate-700 p-3 rounded-md text-xs font-mono">
                            <code>
                                {`EmployeeID    YYYY-MM-DD HH:MM:SS\n1             2024-07-21 08:01:15\n2             2024-07-21 08:03:22\n1             2024-07-21 17:05:30`}
                            </code>
                         </pre>
                         <p className="text-xs text-slate-500 mt-2 italic">
                            The system automatically uses the earliest log of the day as check-in and the latest as check-out.
                         </p>
                    </div>
                </div>

                <div className="mt-6 border-t dark:border-slate-700 pt-4">
                     <button onClick={handleProcess} disabled={isLoading || !logData} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 flex items-center gap-2">
                        <ImportIcon className="h-5 w-5"/>
                        {isLoading ? t('biometric_import.processing') : t('biometric_import.import_btn')}
                    </button>
                </div>

                {result && (
                    <div className="mt-6 border-t dark:border-slate-700 pt-4 animate-fadeIn">
                        <h3 className="font-bold text-lg mb-2">{t('biometric_import.results.title')}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded"><p className="font-bold text-lg">{result.createdCount}</p><p className="text-xs">New Records</p></div>
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded"><p className="font-bold text-lg">{result.updatedCount}</p><p className="text-xs">Records Updated</p></div>
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded"><p className="font-bold text-lg">{result.skippedCount}</p><p className="text-xs">{t('biometric_import.results.skipped_duplicates')}</p></div>
                            <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded"><p className="font-bold text-lg">{result.errorCount}</p><p className="text-xs">Errors</p></div>
                        </div>
                        
                        {result.errors.length > 0 && (
                            <div className="mt-4">
                                <h4 className="font-semibold text-red-600">Error Details:</h4>
                                <ul className="text-sm text-red-500 list-disc list-inside mt-2 max-h-40 overflow-y-auto bg-red-50 dark:bg-red-900/20 p-2 rounded-md">
                                    {result.errors.map((err, i) => <li key={i}>{err}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BiometricImport;