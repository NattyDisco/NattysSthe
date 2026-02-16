
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { EmployeeDocument, DocumentCategory } from '../types';
import { useI18n } from '../hooks/useI18n';
import { cloudStorage } from '../services/supabase';
import { CloudArrowUpIcon } from './icons';

interface DocumentCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: EmployeeDocument | null;
}

const DocumentCenterModal: React.FC<DocumentCenterModalProps> = ({ isOpen, onClose, document }) => {
  const { employees, addEmployeeDocument, updateEmployeeDocument, currentUser } = useAppContext();
  const { t } = useI18n();

  const categories: DocumentCategory[] = ['Identity', 'Contract', 'Financial', 'Permit', 'Other'];
  
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const initialState: Omit<EmployeeDocument, 'id' | 'signature'> = {
    employeeId: '',
    title: '',
    category: 'Identity' as DocumentCategory,
    uploadDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    fileUrl: '',
    fileName: '',
    fileType: '',
    uploadedBy: currentUser?.id || '',
    isPrivate: false,
  };
  
  const [formData, setFormData] = useState<Omit<EmployeeDocument, 'id' | 'signature'>>(initialState);
  
  useEffect(() => {
    if(document) {
        const { id, signature, ...editableData } = document as any;
        setFormData({ ...initialState, ...editableData });
    } else {
        setFormData({...initialState, uploadedBy: currentUser?.id || ''});
    }
  }, [document, isOpen, currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({...prev, [name]: checked }));
    } else {
        setFormData(prev => ({...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    let finalData = { ...formData };

    try {
        if (selectedFile) {
            const { publicUrl, fileName } = await cloudStorage.upload('documents', selectedFile);
            finalData.fileUrl = publicUrl;
            finalData.fileName = fileName;
            finalData.fileType = selectedFile.type;
        }

        if(document) {
            await updateEmployeeDocument(document.id, finalData);
        } else {
            await addEmployeeDocument(finalData);
        }
        onClose();
    } catch (error: any) {
        alert("Upload failed: " + error.message);
    } finally {
        setIsUploading(false);
    }
  };

  if(!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-2xl w-full max-w-lg border border-white/20" onClick={e => e.stopPropagation()}>
             <h2 className="text-3xl font-black mb-6 uppercase tracking-tighter">{document ? 'Update Vault Item' : 'Upload to Vault'}</h2>
             <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Target Personnel</label>
                    <select name="employeeId" value={formData.employeeId} onChange={handleChange} required className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold outline-none focus:border-indigo-500">
                        <option value="">Select Employee...</option>
                        {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.surname}</option>)}
                    </select>
                </div>
                
                <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Document Title</label>
                    <input name="title" value={formData.title} onChange={handleChange} placeholder="e.g. National ID, Drivers License" required className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold outline-none focus:border-indigo-500" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Category</label>
                        <select name="category" value={formData.category} onChange={handleChange} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold outline-none">
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Expiry Date</label>
                        <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold outline-none" />
                    </div>
                </div>

                 <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">File Source (ID/License)</label>
                    <div className="relative group">
                        <input type="file" onChange={handleFileChange} required={!document && !formData.fileUrl} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        <div className="p-6 bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] text-center group-hover:border-indigo-500 transition-all">
                            <CloudArrowUpIcon className="h-8 w-8 mx-auto text-slate-400 mb-2 group-hover:text-indigo-500" />
                            <p className="text-xs font-bold text-slate-500">{selectedFile ? selectedFile.name : (formData.fileName || 'Drop ID/License Here')}</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" name="isPrivate" checked={formData.isPrivate} onChange={handleChange} className="h-5 w-5 rounded-lg accent-indigo-600" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Confidential / Admin Only</span>
                    </label>
                </div>

                 <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 dark:bg-slate-700 rounded-2xl font-black uppercase text-[10px] tracking-widest">Discard</button>
                    <button type="submit" disabled={isUploading} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 active:scale-95 transition-all">
                        {isUploading ? "Uploading to Cloud..." : "Commit to Vault"}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default DocumentCenterModal;
