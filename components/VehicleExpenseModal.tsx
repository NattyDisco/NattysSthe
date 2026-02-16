
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { VehicleExpense } from '../types';
import { useI18n } from '../hooks/useI18n';
import { XCircleIcon, CurrencyDollarIcon, CalendarDaysIcon } from './icons';

interface VehicleExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: VehicleExpense | null;
}

const VehicleExpenseModal: React.FC<VehicleExpenseModalProps> = ({ isOpen, onClose, expense }) => {
  const { cars, addVehicleExpense, updateVehicleExpense } = useAppContext();
  const { t } = useI18n();

  const initialState: Omit<VehicleExpense, 'id'> = {
    vehicleId: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Fuel',
    amount: 0,
    description: '',
  };

  const [formData, setFormData] = useState(initialState);
  const categories = ['Fuel', 'Maintenance', 'Insurance', 'Cleaning', 'Parking', 'Toll', 'Repairs', 'Other'];

  useEffect(() => {
    if (expense) {
      setFormData({
        vehicleId: expense.vehicleId,
        date: expense.date,
        category: expense.category,
        amount: expense.amount,
        description: expense.description,
      });
    } else {
      setFormData(initialState);
    }
  }, [expense, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (expense) {
      await updateVehicleExpense(expense.id, formData);
    } else {
      await addVehicleExpense(formData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-2xl w-full max-w-lg border border-white/20" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">
            {expense ? 'Edit Expense' : 'Log Vehicle Expense'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
            <XCircleIcon className="h-6 w-6 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Linked Vehicle</label>
            <select
              name="vehicleId"
              value={formData.vehicleId}
              onChange={handleChange}
              required
              className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold outline-none focus:border-indigo-500"
            >
              <option value="">-- Choose Car --</option>
              {cars.map(c => <option key={c.id} value={c.id}>{c.name} ({c.plateNumber})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest flex items-center gap-1.5">
                <CalendarDaysIcon className="h-3 w-3" /> Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold outline-none focus:border-indigo-500"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest flex items-center gap-1.5">
              <CurrencyDollarIcon className="h-3 w-3" /> Amount (LSL)
            </label>
            <input
              type="number"
              name="amount"
              step="0.01"
              value={formData.amount || ''}
              onChange={handleChange}
              required
              placeholder="0.00"
              className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1 tracking-widest">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Provide details about the expenditure..."
              className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-slate-100 dark:bg-slate-700 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-600 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 active:scale-95 transition-all"
            >
              {expense ? 'Save Changes' : 'Record Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleExpenseModal;
