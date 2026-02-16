
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';
import { CustomForm, FormField, FormFieldType } from '../types';
import { PlusIcon, TrashIcon, ChevronLeftIcon, GripVerticalIcon } from './icons';
import { Reorder, motion, useDragControls, AnimatePresence } from 'framer-motion';

const FieldEditor: React.FC<{
    field: FormField;
    onUpdate: (id: string, updates: Partial<FormField>) => void;
    onRemove: (id: string) => void;
}> = ({ field, onUpdate, onRemove }) => {
    
    const handleOptionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate(field.id, { options: e.target.value.split(',').map(s => s.trim()) });
    };

    return (
        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border dark:border-slate-600 space-y-3">
            <div className="flex justify-between items-start">
                <input
                    type="text"
                    value={field.label}
                    onChange={(e) => onUpdate(field.id, { label: e.target.value })}
                    placeholder="Question / Label"
                    className="w-full font-semibold bg-transparent focus:outline-none border-b-2 border-transparent focus:border-indigo-500"
                />
                 <button type="button" onClick={() => onRemove(field.id)} className="p-1 text-slate-400 hover:text-red-500"><TrashIcon className="h-5 w-5"/></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="text-xs">Field Type</label>
                    <select value={field.type} onChange={(e) => onUpdate(field.id, { type: e.target.value as FormFieldType })} className="w-full p-2 mt-1 border rounded-md dark:bg-slate-600 dark:border-slate-500 text-sm">
                        <option value="text">Text</option>
                        <option value="textarea">Text Area</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="dropdown">Dropdown</option>
                        <option value="checkbox">Checkbox</option>
                    </select>
                </div>
                <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={field.required} onChange={(e) => onUpdate(field.id, { required: e.target.checked })} />
                        <span className="text-sm">Required</span>
                    </label>
                </div>
            </div>
            {field.type === 'dropdown' && (
                <div>
                    <label className="text-xs">Options (comma-separated)</label>
                    <input
                        type="text"
                        value={field.options?.join(', ') || ''}
                        onChange={handleOptionsChange}
                        placeholder="e.g. Option 1, Option 2"
                        className="w-full p-2 mt-1 border rounded-md dark:bg-slate-600 dark:border-slate-500 text-sm"
                    />
                </div>
            )}
        </div>
    );
};


const DraggableField: React.FC<{
    field: FormField;
    onUpdate: (id: string, updates: Partial<FormField>) => void;
    onRemove: (id: string) => void;
}> = ({ field, onUpdate, onRemove }) => {
    const controls = useDragControls();

    // FIX: Cast Reorder.Item to any to avoid type errors with motion props.
    const ReorderItem = Reorder.Item as any;

    return (
        <ReorderItem 
            value={field} 
            dragListener={false} 
            dragControls={controls} 
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
        >
            <span onPointerDown={(e) => controls.start(e)} className="p-2 cursor-grab text-slate-400">
                <GripVerticalIcon className="h-5 w-5"/>
            </span>
            <div className="flex-1">
               <FieldEditor field={field} onUpdate={onUpdate} onRemove={onRemove} />
            </div>
        </ReorderItem>
    );
};

const FormBuilder: React.FC<{ setView: (view: any) => void }> = ({ setView }) => {
    const { selectedFormId, customForms, addCustomForm, updateCustomForm } = useAppContext();
    const { t } = useI18n();
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [fields, setFields] = useState<FormField[]>([]);

    useEffect(() => {
        if (selectedFormId) {
            const existingForm = customForms.find(f => f.id === selectedFormId);
            if (existingForm) {
                setTitle(existingForm.title);
                setDescription(existingForm.description);
                setFields(existingForm.fields);
            }
        } else {
            setTitle('');
            setDescription('');
            setFields([]);
        }
    }, [selectedFormId, customForms]);

    const addField = () => {
        setFields(prev => [...prev, {
            id: crypto.randomUUID(),
            label: '',
            type: 'text',
            required: false,
            options: []
        }]);
    };

    const updateField = (id: string, updates: Partial<FormField>) => {
        setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const removeField = (id: string) => {
        setFields(prev => prev.filter(f => f.id !== id));
    };
    
    const handleSave = async () => {
        const form: Omit<CustomForm, 'id'> = { title, description, fields, createdAt: new Date().toISOString() };
        if (selectedFormId) {
            await updateCustomForm(selectedFormId, form);
        } else {
            await addCustomForm(form);
        }
        setView('custom_forms');
    };

    return (
        <div className="container mx-auto animate-fadeIn">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setView('custom_forms')} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                    <ChevronLeftIcon className="h-6 w-6" />
                </button>
                <h1 className="text-3xl font-bold">{selectedFormId ? t('form_builder.edit_title') : t('form_builder.create_title')}</h1>
            </div>

            <div className="bg-white/70 dark:bg-slate-800/70 p-6 rounded-lg shadow-lg mb-6">
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Form Title" required className="w-full text-2xl font-bold bg-transparent border-b-2 dark:border-slate-600 focus:outline-none focus:border-indigo-500 mb-2"/>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Form Description" rows={2} className="w-full text-sm bg-transparent border-b-2 dark:border-slate-600 focus:outline-none focus:border-indigo-500" />
            </div>

            <Reorder.Group axis="y" values={fields} onReorder={setFields} className="space-y-4">
              <AnimatePresence>
                {fields.map(field => (
                     <DraggableField 
                        key={field.id}
                        field={field}
                        onUpdate={updateField}
                        onRemove={removeField}
                    />
                ))}
              </AnimatePresence>
            </Reorder.Group>

            <div className="mt-6 flex justify-between">
                <button onClick={addField} className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-300">
                    <PlusIcon className="h-5 w-5"/> Add Field
                </button>
                 <button onClick={handleSave} disabled={!title} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400">
                    {t('common.save')} Form
                </button>
            </div>
        </div>
    );
};

export default FormBuilder;
