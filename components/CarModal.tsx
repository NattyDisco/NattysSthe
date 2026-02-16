
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Car } from '../types';
import { useI18n } from '../hooks/useI18n';

interface CarModalProps {
  isOpen: boolean;
  onClose: () => void;
  car: Car | null;
}

const CarModal: React.FC<CarModalProps> = ({ isOpen, onClose, car }) => {
  const { addCar, updateCar } = useAppContext();
  const { t } = useI18n();

  const initialState: Omit<Car, 'id'> = {
    name: '',
    model: '',
    // FIX: Added plateNumber to initialState and integrated it with permit fields to match updated Car interface.
    plateNumber: '',
    permit: '',
    permitCreatedDate: new Date().toISOString().split('T')[0],
    permitRenewalDate: '',
  };

  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (car) {
      setFormData({
        ...initialState,
        ...car
      });
    } else {
      setFormData(initialState);
    }
  }, [car, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (car) {
      updateCar(car.id, formData);
    } else {
      addCar(formData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6">{car ? 'Edit Car' : 'Add Car'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
            </div>
            <div>
              <label className="block text-sm font-medium">Model</label>
              <input type="text" name="model" value={formData.model} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Plate Number</label>
            <input type="text" name="plateNumber" value={formData.plateNumber} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
          </div>
          <div>
            <label className="block text-sm font-medium">Permit Number</label>
            <input type="text" name="permit" value={formData.permit} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Permit Created Date</label>
                <input type="date" name="permitCreatedDate" value={formData.permitCreatedDate} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
              </div>
              <div>
                <label className="block text-sm font-medium">Permit Renewal Date</label>
                <input type="date" name="permitRenewalDate" value={formData.permitRenewalDate} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
              </div>
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

export default CarModal;
