
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { VehicleDocument } from '../types';
import { useI18n } from '../hooks/useI18n';
import { cloudStorage } from '../services/supabase';
import { CloudArrowUpIcon, PaperClipIcon } from './icons';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: string | null;
  document?: VehicleDocument | null;
}

const DocumentModal: React.FC<DocumentModalProps> = ({ isOpen, onClose, vehicleId, document }) => {
  const { addDocument, updateDocument } = useAppContext();
  const { t } = useI18n();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const getInitialState = () => ({
    vehicleId: vehicleId || '',
    documentType: 'Road Permit' as VehicleDocument['documentType'],
    licenseNumber: '',
    registryDate: new Date().toISOString().split('T')[0],
    renewalDate: '',
    renewalCost: 0,
    fileName: '',
    fileType: '',
    fileUrl: '',
  });

  const [formData, setFormData] = useState(getInitialState());

  useEffect(() => {
    if (document) {
      setFormData({
        ...getInitialState(),
        ...document
      });
    } else {
      setFormData(getInitialState());
    }
    setSelectedFile(null);
  }, [document, vehicleId, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // @ts-ignore
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let finalData = { ...formData };
      
      if (selectedFile) {
        const { publicUrl, fileName } = await cloudStorage.upload('documents', selectedFile);
        finalData.fileUrl = publicUrl;
        finalData.fileName = fileName;
        finalData.fileType = selectedFile.type;
      }

      if (document) {
        await updateDocument(document.id, finalData);
      } else {
        await addDocument(finalData);
      }
      onClose();
    } catch (error: any) {
      alert("Failed to save document: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen || !vehicleId) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-2xl w-full max-w-lg border border-white/20" onClick={e => e.stopPropagation()}>
        <h2 className="text-3xl font-black mb-6 uppercase tracking-tighter">{document ? 'Update Document' : 'Register Vehicle Doc'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest ml-1">{t('modals.document.type')}</label>
            <select name="documentType" value={formData.documentType} onChange={handleChange} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold outline-none focus:border-indigo-500">
                <option>Road Permit</option>
                <option>Insurance</option>
                <option>License Disk</option>
                <option>Fitness Certificate</option>
                <option>Other</option>
            </select>
          </div>
           <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest ml-1">License / Policy Number</label>
              <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} placeholder="e.g. POL-998812" className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold outline-none focus:border-indigo-500" />
            </div>
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest ml-1">Registry Date</label>
                <input type="date" name="registryDate" value={formData.registryDate} onChange={handleChange} required className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest ml-1">Renewal Date</label>
                <input type="date" name="renewalDate" value={formData.renewalDate} onChange={handleChange} required className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold outline-none focus:border-indigo-500" />
              </div>
          </div>
           <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest ml-1">Renewal Cost (LSL)</label>
              <input type="number" name="renewalCost" value={formData.renewalCost} onChange={handleChange} placeholder="0.00" className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold outline-none focus:border-indigo-500" />
            </div>
            
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest ml-1 flex items-center gap-2">
                <PaperClipIcon className="h-4 w-4" /> Scanned Document (Cloud)
              </label>
              <div className="relative group">
                <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className="p-6 bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] text-center group-hover:border-indigo-500 transition-all">
                    <CloudArrowUpIcon className="h-8 w-8 mx-auto text-slate-400 mb-2 group-hover:text-indigo-500" />
                    <p className="text-xs font-bold text-slate-500 truncate px-4">
                      {selectedFile ? selectedFile.name : (formData.fileName || 'Drop scanned PDF or Image here')}
                    </p>
                    {formData.fileUrl && !selectedFile && (
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-2 block">Document safe in cloud ✅</span>
                    )}
                </div>
              </div>
            </div>

          <div className="flex justify-end gap-3 pt-6">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 dark:bg-slate-700 rounded-2xl font-black uppercase text-[10px] tracking-widest">Cancel</button>
            <button type="submit" disabled={isUploading} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50">
                {isUploading ? "Uploading to Cloud..." : (document ? "Update Record" : "Save Record")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentModal;
