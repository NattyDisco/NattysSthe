import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';
import { PlusIcon, CarIcon, EditIcon, TrashIcon } from './icons';
import type { Car } from '../types';

const CarsList: React.FC = () => {
    const { cars, openCarModal, deleteCar, openConfirmModal } = useAppContext();
    const { t } = useI18n();

    const handleDelete = (car: Car) => {
        openConfirmModal(
            'Delete Car',
            `Are you sure you want to delete ${car.name}?`,
            () => deleteCar(car.id)
        );
    };

    return (
        <div className="container mx-auto animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Cars</h1>
                <button onClick={() => openCarModal(null)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    <PlusIcon className="h-5 w-5" />
                    <span>Add Car</span>
                </button>
            </div>
            <div className="bg-white/70 dark:bg-slate-800/70 rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/70 dark:bg-slate-700/50">
                            <tr>
                                <th className="p-4 font-semibold">Name</th>
                                <th className="p-4 font-semibold">Model</th>
                                <th className="p-4 font-semibold">Permit #</th>
                                <th className="p-4 font-semibold">Permit Created Date</th>
                                <th className="p-4 font-semibold">Permit Renewal Date</th>
                                <th className="p-4 font-semibold text-right">{t('common.actions')}</th>
                            </tr>
                        </thead>
                         <tbody>
                            {cars.length > 0 ? (
                                cars.map(c => (
                                    <tr key={c.id} className="border-t dark:border-slate-700">
                                        <td className="p-4 font-medium">{c.name}</td>
                                        <td className="p-4">{c.model}</td>
                                        <td className="p-4 font-mono">{c.permit}</td>
                                        <td className="p-4">{c.permitCreatedDate}</td>
                                        <td className="p-4">{c.permitRenewalDate}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => openCarModal(c)} className="p-2 text-slate-500 hover:text-indigo-600" title="Edit Car"><EditIcon className="h-5 w-5"/></button>
                                                <button onClick={() => handleDelete(c)} className="p-2 text-slate-500 hover:text-red-600" title="Delete Car"><TrashIcon className="h-5 w-5"/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center p-16">
                                        <CarIcon className="h-16 w-16 text-slate-400 mx-auto mb-4"/>
                                        <h2 className="text-xl font-semibold">No Cars Added</h2>
                                        <p className="text-slate-500">Add cars to track their permits here.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CarsList;
