import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';
import { PlusIcon, CarIcon, DocumentTextIcon, EditIcon, TrashIcon, IdentificationIcon, BriefcaseIcon, ClockIcon, CurrencyDollarIcon } from './icons';
import type { Car, VehiclePermit, WorkPermit, BusinessLicense, VehicleExpense } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'fleet' | 'car-permits' | 'staff-permits' | 'business' | 'expenses';

// FIX: Added MotionDiv casting to bypass motion property type errors.
const MotionDiv = motion.div as any;

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button onClick={onClick} className={`px-6 py-4 text-xs font-black uppercase tracking-widest border-b-4 transition-all ${isActive ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
        {label}
    </button>
);

const Permits: React.FC = () => {
    const { 
      cars, vehiclePermits, workPermits, businessLicenses, allEmployees, vehicleExpenses,
      addCar, updateCar, deleteCar, 
      addVehiclePermit, updateVehiclePermit, deleteVehiclePermit,
      openWorkPermitModal, deleteWorkPermit, 
      openBusinessLicenseModal, deleteBusinessLicense, openConfirmModal,
      openVehicleExpenseModal, deleteVehicleExpense
    } = useAppContext();
    const { t } = useI18n();
    const [activeTab, setActiveTab] = useState<Tab>('fleet');

    // Internal Registry States
    const [isCarModalOpen, setCarModalOpen] = useState(false);
    const [carToEdit, setCarToEdit] = useState<Car | null>(null);
    const [isVPMO, setVPMO] = useState(false); // Vehicle Permit Modal Open
    const [vpToEdit, setVpToEdit] = useState<VehiclePermit | null>(null);

    const handleCarSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const carData = {
            name: data.get('name') as string,
            model: data.get('model') as string,
            plateNumber: data.get('plateNumber') as string,
            permit: '', // legacy field placeholder
            permitCreatedDate: '',
            permitRenewalDate: '',
        };
        if (carToEdit) updateCar(carToEdit.id, carData);
        else addCar(carData);
        setCarModalOpen(false);
    };

    const handleVPSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const vpData = {
            carId: data.get('carId') as string,
            permitName: data.get('permitName') as string,
            establishedDate: data.get('establishedDate') as string,
            expiryDate: data.get('expiryDate') as string,
        };
        if (vpToEdit) updateVehiclePermit(vpToEdit.id, vpData);
        else addVehiclePermit(vpData);
        setVPMO(false);
    };

    const renderFleetTab = () => (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Vehicle Registry</h2>
            <p className="text-sm text-slate-500 font-medium italic">Register fleet cars first before adding permits</p>
          </div>
          <button onClick={() => { setCarToEdit(null); setCarModalOpen(true); }} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all uppercase text-[10px] tracking-widest">
            <PlusIcon className="h-5 w-5" /> Register Car
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map(car => (
            <div key={car.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 group relative overflow-hidden flex flex-col justify-between h-full">
              <div className="absolute -right-4 -top-4 bg-indigo-500/10 p-10 rounded-full group-hover:scale-110 transition-transform">
                <CarIcon className="h-12 w-12 text-indigo-500/20" />
              </div>
              <div>
                <h3 className="font-black text-xl text-slate-800 dark:text-white mb-1 uppercase tracking-tight">{car.name}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">{car.model}</p>
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Registry Number</p>
                    <p className="font-mono text-lg font-black text-indigo-600">{car.plateNumber}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-6">
                <button onClick={() => { setCarToEdit(car); setCarModalOpen(true); }} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 hover:bg-indigo-100 transition-colors">Edit Registry</button>
                <button onClick={() => openConfirmModal("Delete Car", `Delete ${car.name}?`, () => deleteCar(car.id))} className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><TrashIcon className="h-5 w-5"/></button>
              </div>
            </div>
          ))}
          {cars.length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl border-slate-200 dark:border-slate-800 opacity-50">
                  <CarIcon className="h-16 w-16 mx-auto mb-4" />
                  <p className="font-black text-slate-400 italic">Fleet registry is currently empty.</p>
              </div>
          )}
        </div>
      </div>
    );

    const renderCarPermitsTab = () => (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Road & Operational Permits</h2>
            <p className="text-sm text-slate-500 font-medium italic">Monitor permit validity for the registered fleet</p>
          </div>
          <button onClick={() => { setVpToEdit(null); setVPMO(true); }} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all uppercase text-[10px] tracking-widest">
            <PlusIcon className="h-5 w-5" /> Add Vehicle Permit
          </button>
        </div>
        <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b dark:border-slate-700">
              <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                <th className="p-5">Linked Vehicle</th>
                <th className="p-5">Permit Name</th>
                <th className="p-5">Established</th>
                <th className="p-5">Expiry Date</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {vehiclePermits.map(vp => {
                const car = cars.find(c => c.id === vp.carId);
                const isExpiring = new Date(vp.expiryDate).getTime() <= (new Date().getTime() + 31 * 24 * 60 * 60 * 1000);
                return (
                  <tr key={vp.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="p-5">
                        <p className="font-black text-sm text-slate-800 dark:text-white">{car?.name || 'Unknown'}</p>
                        <p className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-tight">{car?.plateNumber || '---'}</p>
                    </td>
                    <td className="p-5 font-bold text-slate-700 dark:text-slate-300">{vp.permitName}</td>
                    <td className="p-5 text-xs text-slate-500">{vp.establishedDate}</td>
                    <td className="p-5">
                        <span className={`font-black text-xs px-2 py-1 rounded-lg ${isExpiring ? 'bg-red-50 text-red-600' : 'text-emerald-600'}`}>
                            {vp.expiryDate}
                        </span>
                    </td>
                    <td className="p-5 text-right">
                       <div className="flex justify-end gap-2">
                        <button onClick={() => { setVpToEdit(vp); setVPMO(true); }} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><EditIcon className="h-5 w-5"/></button>
                        <button onClick={() => openConfirmModal("Delete Permit", "Remove this permit entry?", () => deleteVehiclePermit(vp.id))} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><TrashIcon className="h-5 w-5"/></button>
                       </div>
                    </td>
                  </tr>
                )
              })}
              {vehiclePermits.length === 0 && (
                  <tr>
                      <td colSpan={5} className="p-10 text-center text-slate-400 font-bold italic">No permits have been assigned to vehicles yet.</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );

    const renderStaffTab = () => (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Staff Documentation</h2>
            <p className="text-sm text-slate-500 font-medium italic">Work permits and professional licenses</p>
          </div>
          <button onClick={() => openWorkPermitModal(null)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-500/20 uppercase text-[10px] tracking-widest">
            <PlusIcon className="h-5 w-5" /> Add Document
          </button>
        </div>
        <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b dark:border-slate-700">
              <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                <th className="p-5">Staff Member</th>
                <th className="p-5">Doc # / License</th>
                <th className="p-5">Issued</th>
                <th className="p-5">Expiry</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {workPermits.map(p => {
                const emp = allEmployees.find(e => e.id === p.employeeId);
                const isExpiring = new Date(p.expiryDate).getTime() <= (new Date().getTime() + 31 * 24 * 60 * 60 * 1000);
                return (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="p-5">
                        <div className="flex items-center gap-3">
                            <img src={emp?.photoUrl} className="h-8 w-8 rounded-full object-cover shadow-sm ring-2 ring-white" alt="" />
                            <span className="font-bold text-sm text-slate-800 dark:text-white">{emp?.firstName} {emp?.surname}</span>
                        </div>
                    </td>
                    <td className="p-5 font-mono text-xs text-slate-600 dark:text-slate-400 font-bold">{p.permitNumber}</td>
                    <td className="p-5 text-xs text-slate-500">{p.issueDate}</td>
                    <td className="p-5">
                        <span className={`font-black text-xs ${isExpiring ? 'text-red-500 bg-red-50 px-2 py-1 rounded-lg' : 'text-emerald-600'}`}>{p.expiryDate}</span>
                    </td>
                    <td className="p-5 text-right">
                       <div className="flex justify-end gap-2">
                        <button onClick={() => openWorkPermitModal(p)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><EditIcon className="h-5 w-5"/></button>
                        <button onClick={() => openConfirmModal("Delete Permit", "Remove this documentation?", () => deleteWorkPermit(p.id))} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><TrashIcon className="h-5 w-5"/></button>
                       </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    );

    const renderBusinessTab = () => (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Business Licenses</h2>
            <p className="text-sm text-slate-500 font-medium italic">Operational, trading and safety licenses</p>
          </div>
          <button onClick={() => openBusinessLicenseModal(null)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-500/20 uppercase text-[10px] tracking-widest">
            <PlusIcon className="h-5 w-5" /> Add License
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {businessLicenses.map(l => (
            <div key={l.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 flex justify-between items-center group">
              <div>
                <h3 className="font-black text-lg text-slate-800 dark:text-white uppercase tracking-tighter">{l.licenseName}</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{l.issuingAuthority}</p>
                <div className="mt-4 flex gap-6 text-xs">
                  <div>
                    <p className="text-slate-400 font-bold uppercase text-[9px] tracking-tighter">Expires</p>
                    <p className={`font-black ${new Date(l.expiryDate).getTime() < (new Date().getTime() + 31 * 24 * 60 * 60 * 1000) ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>{l.expiryDate}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openBusinessLicenseModal(l)} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl hover:text-indigo-600 transition-colors shadow-sm"><EditIcon className="h-5 w-5"/></button>
                <button onClick={() => openConfirmModal("Delete License", "Permanently remove this license record?", () => deleteBusinessLicense(l.id))} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl hover:text-red-500 transition-colors shadow-sm"><TrashIcon className="h-5 w-5"/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    const renderExpensesTab = () => (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Vehicle Expenditures</h2>
            <p className="text-sm text-slate-500 font-medium italic">Track fuel, maintenance, and other vehicle costs</p>
          </div>
          <button onClick={() => openVehicleExpenseModal(null)} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all uppercase text-[10px] tracking-widest">
            <PlusIcon className="h-5 w-5" /> Log Expense
          </button>
        </div>
        <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b dark:border-slate-700">
              <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                <th className="p-5">Date</th>
                <th className="p-5">Vehicle</th>
                <th className="p-5">Category</th>
                <th className="p-5">Description</th>
                <th className="p-5 text-right">Amount</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {vehicleExpenses.sort((a, b) => b.date.localeCompare(a.date)).map(exp => {
                const car = cars.find(c => c.id === exp.vehicleId);
                return (
                  <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="p-5 text-xs font-bold text-slate-500">{exp.date}</td>
                    <td className="p-5">
                        <p className="font-black text-sm text-slate-800 dark:text-white">{car?.name || '---'}</p>
                        <p className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-tight">{car?.plateNumber || '---'}</p>
                    </td>
                    <td className="p-5">
                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-[10px] font-black uppercase text-slate-600 dark:text-slate-300">
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-5 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate" title={exp.description}>
                      {exp.description}
                    </td>
                    <td className="p-5 text-right font-black text-indigo-600 dark:text-indigo-400">
                      M {exp.amount.toFixed(2)}
                    </td>
                    <td className="p-5 text-right">
                       <div className="flex justify-end gap-2">
                        <button onClick={() => openVehicleExpenseModal(exp)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><EditIcon className="h-5 w-5"/></button>
                        <button onClick={() => openConfirmModal("Delete Expense", "Permanently remove this expense record?", () => deleteVehicleExpense(exp.id))} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><TrashIcon className="h-5 w-5"/></button>
                       </div>
                    </td>
                  </tr>
                )
              })}
              {vehicleExpenses.length === 0 && (
                  <tr>
                      <td colSpan={6} className="p-10 text-center text-slate-400 font-bold italic">No vehicle expenses recorded yet.</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );

    return (
        <div className="container mx-auto animate-fadeIn pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Compliance & Registry Hub</h1>
                <p className="text-slate-500 font-medium italic">Fleet management, staff permits, and company licensing</p>
              </div>
            </div>
            
            <div className="bg-white/70 dark:bg-slate-800/70 rounded-3xl shadow-2xl border border-white/30 backdrop-blur-xl overflow-hidden">
                <div className="flex border-b dark:border-slate-700 overflow-x-auto no-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
                    <TabButton label="Fleet Registry" isActive={activeTab === 'fleet'} onClick={() => setActiveTab('fleet')} />
                    <TabButton label="Car Permits" isActive={activeTab === 'car-permits'} onClick={() => setActiveTab('car-permits')} />
                    <TabButton label="Staff Permits" isActive={activeTab === 'staff-permits'} onClick={() => setActiveTab('staff-permits')} />
                    <TabButton label="Business Licenses" isActive={activeTab === 'business'} onClick={() => setActiveTab('business')} />
                    <TabButton label="Vehicle Expenses" isActive={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} />
                </div>

                <div className="p-6 sm:p-10">
                    {activeTab === 'fleet' && renderFleetTab()}
                    {activeTab === 'car-permits' && renderCarPermitsTab()}
                    {activeTab === 'staff-permits' && renderStaffTab()}
                    {activeTab === 'business' && renderBusinessTab()}
                    {activeTab === 'expenses' && renderExpensesTab()}
                </div>
            </div>

            {/* In-view Car Registry Modal */}
            <AnimatePresence>
                {isCarModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setCarModalOpen(false)}>
                        <MotionDiv initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl w-full max-md:max-w-md" onClick={e => e.stopPropagation()}>
                            <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter">{carToEdit ? 'Update Vehicle Registry' : 'Register New Vehicle'}</h2>
                            <form onSubmit={handleCarSubmit} className="space-y-4">
                                <input name="name" defaultValue={carToEdit?.name} placeholder="Vehicle Name (e.g. Delivery Van 1)" required className="w-full p-3 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                                <input name="model" defaultValue={carToEdit?.model} placeholder="Model (e.g. Toyota Hilux)" required className="w-full p-3 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                                <input name="plateNumber" defaultValue={carToEdit?.plateNumber} placeholder="Registry Plate Number" required className="w-full p-3 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 font-mono" />
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setCarModalOpen(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl font-black text-[10px] uppercase">Cancel</button>
                                    <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase">Confirm Registry</button>
                                </div>
                            </form>
                        </MotionDiv>
                    </div>
                )}
            </AnimatePresence>

            {/* In-view Vehicle Permit Modal */}
            <AnimatePresence>
                {isVPMO && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setVPMO(false)}>
                        <MotionDiv initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl w-full max-md:max-w-md" onClick={e => e.stopPropagation()}>
                            <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter">Vehicle Permit Link</h2>
                            <form onSubmit={handleVPSubmit} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Select Registered Car</label>
                                    <select name="carId" defaultValue={vpToEdit?.carId} required className="w-full p-3 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500">
                                        <option value="">-- Choose Car --</option>
                                        {cars.map(c => <option key={c.id} value={c.id}>{c.name} ({c.plateNumber})</option>)}
                                    </select>
                                </div>
                                <input name="permitName" defaultValue={vpToEdit?.permitName} placeholder="Permit Name (e.g. Road License)" required className="w-full p-3 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Established Date</label>
                                        <input type="date" name="establishedDate" defaultValue={vpToEdit?.establishedDate} required className="w-full p-3 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Expiry Date</label>
                                        <input type="date" name="expiryDate" defaultValue={vpToEdit?.expiryDate} required className="w-full p-3 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setVPMO(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl font-black text-[10px] uppercase">Cancel</button>
                                    <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase">Save Permit</button>
                                </div>
                            </form>
                        </MotionDiv>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Permits;