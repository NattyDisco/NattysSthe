import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';
import { ChevronLeftIcon } from './icons';

const FillForm: React.FC<{ setView: (view: any) => void }> = ({ setView }) => {
    const { selectedFormId, customForms, addFormSubmission, currentUser, openRequestSubmittedModal } = useAppContext();
    const { t } = useI18n();

    const form = customForms.find(f => f.id === selectedFormId);
    const [responses, setResponses] = useState<Record<string, string | string[]>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        // Initialize responses state
        if (form) {
            const initialResponses: Record<string, string | string[]> = {};
            form.fields.forEach(field => {
                initialResponses[field.id] = field.type === 'checkbox' ? [] : '';
            });
            setResponses(initialResponses);
        }
    }, [form]);

    const handleChange = (fieldId: string, value: string, type: string) => {
        if (type === 'checkbox') {
            setResponses(prev => {
                const current = prev[fieldId] as string[] || [];
                const newValues = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
                return { ...prev, [fieldId]: newValues };
            });
        } else {
            setResponses(prev => ({ ...prev, [fieldId]: value }));
        }
        // Clear error on change
        if (errors[fieldId]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldId];
                return newErrors;
            });
        }
    };

    const validate = () => {
        if (!form) return false;
        const newErrors: Record<string, string> = {};
        form.fields.forEach(field => {
            if (field.required && (!responses[field.id] || (Array.isArray(responses[field.id]) && (responses[field.id] as string[]).length === 0))) {
                newErrors[field.id] = `${field.label} is required.`;
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!form || !currentUser || !validate()) return;
        await addFormSubmission({ formId: form.id, employeeId: currentUser.id, responses });
        openRequestSubmittedModal('Submitted Successfully', `Your responses for "${form.title}" have been recorded.`);
        setView('custom_forms');
    };
    
    if (!form) return <div className="p-8 text-center">{t('fill_form.not_found')}</div>;

    return (
        <div className="container mx-auto animate-fadeIn max-w-2xl">
             <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setView('custom_forms')} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                    <ChevronLeftIcon className="h-6 w-6" />
                </button>
                 <div>
                    <h1 className="text-3xl font-bold">{form.title}</h1>
                    <p className="text-slate-500">{form.description}</p>
                 </div>
            </div>
            <div className="bg-white/70 dark:bg-slate-800/70 p-6 rounded-lg shadow-lg space-y-6">
                {form.fields.map(field => (
                    <div key={field.id}>
                        <label className="block font-medium mb-2">{field.label}{field.required && <span className="text-red-500 ml-1">*</span>}</label>
                        {
                            {
                                'text': <input type="text" value={responses[field.id] as string || ''} onChange={(e) => handleChange(field.id, e.target.value, field.type)} className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />,
                                'textarea': <textarea value={responses[field.id] as string || ''} onChange={(e) => handleChange(field.id, e.target.value, field.type)} rows={4} className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />,
                                'number': <input type="number" value={responses[field.id] as string || ''} onChange={(e) => handleChange(field.id, e.target.value, field.type)} className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />,
                                'date': <input type="date" value={responses[field.id] as string || ''} onChange={(e) => handleChange(field.id, e.target.value, field.type)} className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />,
                                'dropdown': (
                                    <select value={responses[field.id] as string || ''} onChange={(e) => handleChange(field.id, e.target.value, field.type)} className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600">
                                        <option value="">Select an option</option>
                                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                ),
                                'checkbox': (
                                    <div className="space-y-2">
                                        {field.options?.map(opt => (
                                            <label key={opt} className="flex items-center gap-2">
                                                <input type="checkbox" value={opt} checked={(responses[field.id] as string[])?.includes(opt)} onChange={(e) => handleChange(field.id, e.target.value, field.type)} />
                                                <span>{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                )
                            }[field.type]
                        }
                        {errors[field.id] && <p className="text-red-500 text-sm mt-1">{errors[field.id]}</p>}
                    </div>
                ))}
                <div className="pt-4 flex justify-end">
                    <button onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">{t('common.submit')}</button>
                </div>
            </div>
        </div>
    );
};

export default FillForm;
