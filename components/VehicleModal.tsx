
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Vehicle } from '../types';
import { useI18n } from '../hooks/useI18n';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
}

const VehicleModal: React.FC<VehicleModalProps> = ({ isOpen, onClose, vehicle }) => {
  const { addVehicle, updateVehicle, employees } = useAppContext();
  const { t } = useI18n();

  const initialState: Omit<Vehicle, 'id'> = {
    model: '',
    plateNumber: '',
    vin: '',
    ownerName: '',
    assignedDriverId: '',
    department: '',
    notes: ''
  };

  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (vehicle) {
      setFormData({
        ...initialState,
        ...vehicle
      });
    } else {
      setFormData(initialState);
    }
  }, [vehicle, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (vehicle) {
      updateVehicle(vehicle.id, formData);
    } else {
      addVehicle(formData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6">{vehicle ? t('modals.vehicle.edit_title') : t('modals.vehicle.add_title')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">{t('modals.vehicle.model')}</label>
              <input type="text" name="model" value={formData.model} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
            </div>
            <div>
              <label className="block text-sm font-medium">{t('modals.vehicle.plate')}</label>
              <input type="text" name="plateNumber" value={formData.plateNumber} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">VIN</label>
                <input type="text" name="vin" value={formData.vin} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
              </div>
              <div>
                <label className="block text-sm font-medium">Owner</label>
                <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
              </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Assigned Driver</label>
                 <select name="assignedDriverId" value={formData.assignedDriverId || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600">
                    <option value="">None</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.surname}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Department</label>
                <input type="text" name="department" value={formData.department} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
              </div>
          </div>
           <div>
              <label className="block text-sm font-medium">Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full mt-1 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
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

export default VehicleModal;
