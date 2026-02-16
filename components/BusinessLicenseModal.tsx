
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { BusinessLicense } from '../types';
import { useI18n } from '../hooks/useI18n';
import { cloudStorage } from '../services/supabase';
import { CloudArrowUpIcon } from './icons';

interface BusinessLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  license: BusinessLicense | null;
}

const BusinessLicenseModal: React.FC<BusinessLicenseModalProps> = ({ isOpen, onClose, license }) => {
  const { addBusinessLicense, updateBusinessLicense } = useAppContext();
  const { t } = useI18n();

  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const initialState: Omit<BusinessLicense, 'id'> = {
    licenseName: '',
    licenseNumber: '',
    issuingAuthority: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
  };

  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (license) {
      setFormData({
        ...initialState,
        ...license,
      });
    } else {
      setFormData(initialState);
    }
  }, [license, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    let finalData: any = { ...formData };

    try {
        if (selectedFile) {
            const { publicUrl } = await cloudStorage.upload('documents', selectedFile);
            finalData.fileUrl = publicUrl;
            finalData.fileName = selectedFile.name;
        }

        if (license) {
            await updateBusinessLicense(license.id, finalData);
        } else {
            await addBusinessLicense(finalData);
        }
        onClose();
    } catch (error: any) {
        alert("Upload failed: " + error.message);
    } finally {
        setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-2xl w-full max-w-lg border border-white/20" onClick={e => e.stopPropagation()}>
        <h2 className="text-3xl font-black mb-6 uppercase tracking-tighter">{license ? 'Edit Company License' : 'Register License'}</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">License Name</label>
            <input type="text" name="licenseName" value={formData.licenseName} onChange={handleChange} required placeholder="e.g. Trading License, Health Certificate" className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold outline-none focus:border-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Serial Number</label>
              <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} required className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Authority</label>
              <input type="text" name="issuingAuthority" value={formData.issuingAuthority} onChange={handleChange} required className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Issue Date</label>
                <input type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} required className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Expiry Date</label>
                <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} required className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold outline-none focus:border-indigo-500" />
              </div>
          </div>
           <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Digital Registry (Optional)</label>
              <div className="relative group">
                  <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className="p-6 bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] text-center group-hover:border-indigo-500 transition-all">
                      <CloudArrowUpIcon className="h-8 w-8 mx-auto text-slate-400 mb-2 group-hover:text-indigo-500" />
                      <p className="text-xs font-bold text-slate-500">{selectedFile ? selectedFile.name : 'Drop License File'}</p>
                  </div>
              </div>
            </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 dark:bg-slate-700 rounded-2xl font-black uppercase text-[10px] tracking-widest">Cancel</button>
            <button type="submit" disabled={isUploading} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-95">
                {isUploading ? "Uploading..." : "Save License"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessLicenseModal;
