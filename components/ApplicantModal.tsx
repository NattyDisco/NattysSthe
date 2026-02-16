
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Applicant, ApplicantStatus } from '../types';
import { useI18n } from '../hooks/useI18n';

interface ApplicantModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: Applicant | null;
}

const ApplicantModal: React.FC<ApplicantModalProps> = ({ isOpen, onClose, applicant }) => {
  const { addApplicant, updateApplicant } = useAppContext();
  const { t } = useI18n();
  
  const initialState: Omit<Applicant, 'id'> = {
    firstName: '',
    surname: '',
    email: '',
    phone: '',
    position: '',
    applicationDate: new Date().toISOString().split('T')[0],
    status: 'pending' as ApplicantStatus,
    notes: '',
  };
  
  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (applicant) {
      setFormData({ ...initialState, ...applicant });
    } else {
      setFormData(initialState);
    }
  }, [applicant, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (applicant) {
      updateApplicant(applicant.id, formData);
    } else {
      addApplicant(formData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6">{applicant ? t('modals.applicant.edit_title') : t('modals.applicant.add_title')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" required className="p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                <input name="surname" value={formData.surname} onChange={handleChange} placeholder="Surname" required className="p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
            </div>
             <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email Address" required className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
             <input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="Phone Number" required className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
             <input name="position" value={formData.position} onChange={handleChange} placeholder="Position Applied For" required className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600">
                <option value="pending">Pending</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
            </select>
            <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Notes..." rows={3} className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
            <div>
              <label className="block text-sm font-medium">Resume (Optional)</label>
              <input type="file" className="w-full mt-1 text-sm"/>
            </div>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-md">{t('common.cancel')}</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">{t('common.save')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicantModal;
