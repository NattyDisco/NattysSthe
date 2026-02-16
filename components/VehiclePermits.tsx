import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';
import { PlusIcon, CarIcon, DocumentTextIcon, EditIcon, TrashIcon } from './icons';
import type { Vehicle } from '../types';

const VehiclePermits: React.FC = () => {
    const { vehicles, openVehicleModal, deleteVehicle, openConfirmModal, openDocumentModal } = useAppContext();
    const { t } = useI18n();

    const handleDelete = (vehicle: Vehicle) => {
        openConfirmModal(
            t('vehicle_permits.confirm_delete_title'),
            t('vehicle_permits.confirm_delete_message', { model: vehicle.model, plate: vehicle.plateNumber }),
            () => deleteVehicle(vehicle.id)
        );
    };

    return (
        <div className="container mx-auto animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{t('sidebar.vehicle_permits')}</h1>
                <button onClick={() => openVehicleModal(null)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    <PlusIcon className="h-5 w-5" />
                    <span>{t('vehicle_permits.add_vehicle')}</span>
                </button>
            </div>
            <div className="bg-white/70 dark:bg-slate-800/70 rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/70 dark:bg-slate-700/50">
                            <tr>
                                <th className="p-4 font-semibold">{t('vehicle_permits.table.model')}</th>
                                <th className="p-4 font-semibold">{t('vehicle_permits.table.plate')}</th>
                                <th className="p-4 font-semibold">{t('vehicle_permits.table.owner')}</th>
                                <th className="p-4 font-semibold">{t('vehicle_permits.table.department')}</th>
                                <th className="p-4 font-semibold text-right">{t('common.actions')}</th>
                            </tr>
                        </thead>
                         <tbody>
                            {vehicles.length > 0 ? (
                                vehicles.map(v => (
                                    <tr key={v.id} className="border-t dark:border-slate-700">
                                        <td className="p-4 font-medium">{v.model}</td>
                                        <td className="p-4 font-mono">{v.plateNumber}</td>
                                        <td className="p-4">{v.ownerName}</td>
                                        <td className="p-4">{v.department}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => openDocumentModal(v.id)} className="p-2 text-slate-500 hover:text-blue-600" title="Manage Documents"><DocumentTextIcon className="h-5 w-5"/></button>
                                                <button onClick={() => openVehicleModal(v)} className="p-2 text-slate-500 hover:text-indigo-600" title="Edit Vehicle"><EditIcon className="h-5 w-5"/></button>
                                                <button onClick={() => handleDelete(v)} className="p-2 text-slate-500 hover:text-red-600" title="Delete Vehicle"><TrashIcon className="h-5 w-5"/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center p-16">
                                        <CarIcon className="h-16 w-16 text-slate-400 mx-auto mb-4"/>
                                        <h2 className="text-xl font-semibold">{t('vehicle_permits.empty.title')}</h2>
                                        <p className="text-slate-500">{t('vehicle_permits.empty.description')}</p>
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

export default VehiclePermits;
