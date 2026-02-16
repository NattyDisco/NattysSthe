import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Employee, UserRole } from '../types';
import { useI18n } from '../hooks/useI18n';
import { cloudStorage } from '../services/supabase';
import { CloudArrowUpIcon, PaperClipIcon, XCircleIcon, UserIcon, PlusIcon } from './icons';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({ isOpen, onClose, employee }) => {
  const { addEmployee, updateEmployee, branches } = useAppContext();
  const { t } = useI18n();
  const [isUploading, setIsUploading] = useState(false);
  
  const getInitialState = useCallback(() => {
    const defaults = {
      firstName: '',
      surname: '',
      email: '',
      phone: '',
      role: '',
      department: '',
      photoUrl: '',
      status: 'active' as Employee['status'],
      userRole: 'employee' as UserRole,
      leaveBalance: 12,
      monthlySalary: 0,
      housingAllowance: 0,
      transportAllowance: 0,
      branchId: branches[0]?.id || '',
      dateOfEmployment: new Date().toISOString().split('T')[0],
      employeeId: `EMP-${Date.now().toString().slice(-6)}`,
      idCardUrl: '',
      licenseUrl: ''
    };
    
    if (employee) return { ...defaults, ...employee };
    return defaults;
  }, [branches, employee]);

  const [formData, setFormData] = useState<any>(getInitialState);

  useEffect(() => {
    if (isOpen) setFormData(getInitialState());
  }, [isOpen, getInitialState]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // @ts-ignore
    const val = type === 'number' ? parseFloat(value) || 0 : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    const bucket = fieldName === 'photoUrl' ? 'photos' : 'documents';
    
    try {
      const { publicUrl } = await cloudStorage.upload(bucket, file);
      setFormData(prev => ({ ...prev, [fieldName]: publicUrl }));
    } catch (err) {
      console.error("Upload failed", err);
      alert(`Upload failed. Please ensure the '${bucket}' bucket exists in Supabase.`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      photoUrl: formData.photoUrl || `https://ui-avatars.com/api/?name=${formData.firstName || 'U'}+${formData.surname || 'M'}&background=random`
    };
    if (employee) {
      await updateEmployee(employee.id, dataToSave);
    } else {
      const { id, ...newEmployeeData } = dataToSave as any;
      await addEmployee(newEmployeeData);
    }
    onClose();
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-white/20" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black uppercase tracking-tighter">{employee ? 'Update Personnel' : 'Add New Personnel'}</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                <XCircleIcon className="h-6 w-6 text-slate-400" />
            </button>
        </div>

        <form onSubmit={handleSubmit}>
            {/* Photo Upload Section */}
            <div className="flex flex-col items-center mb-10">
                <div className="relative group cursor-pointer">
                    <div className="w-36 h-36 rounded-[2.5rem] overflow-hidden bg-slate-50 dark:bg-slate-900 border-4 border-white dark:border-slate-700 shadow-2xl transition-all group-hover:scale-[1.02]">
                        {formData.photoUrl ? (
                            <img 
                                src={formData.photoUrl} 
                                className="w-full h-full object-cover" 
                                alt="Profile Preview"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900/50">
                                <UserIcon className="h-12 w-12 text-slate-300 mb-2" />
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">No Portrait</span>
                            </div>
                        )}
                        
                        <label className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-600/80 text-white rounded-[2.5rem] opacity-0 group-hover:opacity-100 cursor-pointer transition-all z-10 backdrop-blur-sm">
                            <input type="file" onChange={(e) => handleFileUpload(e, 'photoUrl')} className="hidden" accept="image/*" />
                            <CloudArrowUpIcon className="h-10 w-10 mb-2" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{formData.photoUrl ? 'Change Photo' : 'Upload Photo'}</span>
                        </label>
                    </div>

                    {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-slate-800/60 rounded-[2.5rem] z-20 backdrop-blur-sm">
                            <div className="relative">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-t-indigo-600"></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 border-b pb-2">Identity Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">First Name</label>
                            <input name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl font-bold outline-none focus:border-indigo-500 shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Surname</label>
                            <input name="surname" value={formData.surname} onChange={handleChange} required className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl font-bold outline-none focus:border-indigo-500 shadow-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Email Address</label>
                        <input name="email" type="email" value={formData.email} onChange={handleChange} required className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl font-bold outline-none focus:border-indigo-500 shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Job Role</label>
                        <input name="role" value={formData.role} onChange={handleChange} required className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl font-bold outline-none focus:border-indigo-500 shadow-sm" />
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 border-b pb-2">Compensation Structure</h3>
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Monthly Base Salary (Gross)</label>
                        <input name="monthlySalary" type="number" value={formData.monthlySalary} onChange={handleChange} required className="w-full p-3 bg-indigo-50/30 dark:bg-indigo-900/10 border-2 border-indigo-100 dark:border-indigo-800 rounded-xl font-black text-indigo-600 outline-none focus:border-indigo-500 shadow-inner" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Housing Allowance</label>
                            <input name="housingAllowance" type="number" value={formData.housingAllowance} onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl font-bold outline-none focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Transport Allowance</label>
                            <input name="transportAllowance" type="number" value={formData.transportAllowance} onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl font-bold outline-none focus:border-indigo-500" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Initial Leave Entitlement (Days)</label>
                        <input name="leaveBalance" type="number" value={formData.leaveBalance} onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl font-bold outline-none focus:border-indigo-500" />
                    </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 border-b pb-2">Institutional Banking</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Bank Name</label>
                            <input name="bankName" value={formData.bankName} onChange={handleChange} placeholder="e.g. Standard Lesotho Bank" className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl font-bold outline-none focus:border-indigo-500 shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Account Number</label>
                            <input name="bankAccount" value={formData.bankAccount} onChange={handleChange} placeholder="Registry Account Serial" className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl font-bold outline-none focus:border-indigo-500 shadow-sm font-mono" />
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 flex justify-end gap-3 pt-10 border-t dark:border-slate-700">
                    <button type="button" onClick={onClose} className="px-10 py-4 bg-slate-100 dark:bg-slate-700 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-colors">Discard</button>
                    <button type="submit" disabled={isUploading} className="px-12 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-indigo-500/30 hover:bg-indigo-700 active:scale-95 transition-all">
                        {isUploading ? 'Finalizing...' : (employee ? 'Update Master Record' : 'Commit to Registry')}
                    </button>
                </div>
            </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;