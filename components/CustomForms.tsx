import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';
import { PlusIcon, ClipboardDocumentListIcon, EyeIcon, PencilSquareIcon, TrashIcon } from './icons';
import { View } from '../types';

const CustomForms: React.FC<{ setView: (view: View) => void }> = ({ setView }) => {
    const { customForms, formSubmissions, setSelectedFormId, deleteCustomForm, openConfirmModal } = useAppContext();
    const { t } = useI18n();

    const getResponseCount = (formId: string) => {
        return formSubmissions.filter(sub => sub.formId === formId).length;
    };

    const handleDelete = (formId: string, formTitle: string) => {
        openConfirmModal(
            'Delete Form',
            `Are you sure you want to delete the form "${formTitle}"? All associated responses will also be deleted. This action cannot be undone.`,
            () => deleteCustomForm(formId)
        );
    };

    return (
        <div className="container mx-auto animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{t('sidebar.custom_forms')}</h1>
                <button onClick={() => { setSelectedFormId(null); setView('form_builder'); }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    <PlusIcon className="h-5 w-5"/>
                    <span>{t('custom_forms.new_form')}</span>
                </button>
            </div>
            
            {customForms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {customForms.map(form => (
                        <div key={form.id} className="bg-white/70 dark:bg-slate-800/70 p-6 rounded-lg shadow-lg flex flex-col justify-between">
                            <div>
                                <h2 className="text-xl font-bold">{form.title}</h2>
                                <p className="text-sm text-slate-500 mt-2 line-clamp-2">{form.description}</p>
                                <p className="text-xs text-slate-400 mt-2">Created: {new Date(form.createdAt).toLocaleDateString()}</p>
                                <p className="text-sm font-semibold mt-4">{getResponseCount(form.id)} Responses</p>
                            </div>
                            <div className="mt-4 pt-4 border-t dark:border-slate-700 flex flex-wrap gap-2">
                                <button onClick={() => { setSelectedFormId(form.id); setView('fill_form'); }} className="flex-1 text-center px-3 py-2 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-md hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900">Fill Out</button>
                                <div className="flex gap-2">
                                    <button onClick={() => { setSelectedFormId(form.id); setView('form_responses'); }} className="p-2 bg-slate-200 dark:bg-slate-600 rounded-md hover:bg-slate-300" title="View Responses"><EyeIcon className="h-5 w-5"/></button>
                                    <button onClick={() => { setSelectedFormId(form.id); setView('form_builder'); }} className="p-2 bg-slate-200 dark:bg-slate-600 rounded-md hover:bg-slate-300" title="Edit Form"><PencilSquareIcon className="h-5 w-5"/></button>
                                    <button onClick={() => handleDelete(form.id, form.title)} className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300" title="Delete Form"><TrashIcon className="h-5 w-5"/></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center p-16 bg-white/70 dark:bg-slate-800/70 rounded-lg shadow-lg">
                    <ClipboardDocumentListIcon className="h-16 w-16 text-slate-400 mx-auto mb-4"/>
                    <h2 className="text-xl font-semibold">No Custom Forms Yet</h2>
                    <p className="text-slate-500">Click 'New Form' to create your first custom form.</p>
                </div>
            )}
        </div>
    );
};

export default CustomForms;
