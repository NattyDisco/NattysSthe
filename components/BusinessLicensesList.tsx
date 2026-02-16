import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';
import { PlusIcon, BriefcaseIcon, EditIcon, TrashIcon } from './icons';
import type { BusinessLicense } from '../types';

const BusinessLicensesList: React.FC = () => {
    const { businessLicenses, openBusinessLicenseModal, deleteBusinessLicense, openConfirmModal } = useAppContext();
    const { t } = useI18n();

    const handleDelete = (license: BusinessLicense) => {
        openConfirmModal(
            'Delete Business License',
            `Are you sure you want to delete the license "${license.licenseName}"?`,
            () => deleteBusinessLicense(license.id)
        );
    };

    return (
        <div className="container mx-auto animate-fadeIn">
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Business Licenses</h1>
                <button onClick={() => openBusinessLicenseModal(null)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    <PlusIcon className="h-5 w-5" />
                    <span>Add Business License</span>
                </button>
            </div>
             <div className="bg-white/70 dark:bg-slate-800/70 rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/70 dark:bg-slate-700/50">
                            <tr>
                                <th className="p-4 font-semibold">License Name</th>
                                <th className="p-4 font-semibold">License #</th>
                                <th className="p-4 font-semibold">Issuing Authority</th>
                                <th className="p-4 font-semibold">Issue Date</th>
                                <th className="p-4 font-semibold">Expiry Date</th>
                                <th className="p-4 font-semibold text-right">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                        {businessLicenses.length > 0 ? (
                            businessLicenses.map(l => (
                                <tr key={l.id} className="border-t dark:border-slate-700">
                                    <td className="p-4 font-medium">{l.licenseName}</td>
                                    <td className="p-4 font-mono">{l.licenseNumber}</td>
                                    <td className="p-4">{l.issuingAuthority}</td>
                                    <td className="p-4">{l.issueDate}</td>
                                    <td className="p-4">{l.expiryDate}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex gap-2 justify-end">
                                            <button onClick={() => openBusinessLicenseModal(l)} className="p-2 text-slate-500 hover:text-indigo-600"><EditIcon className="h-5 w-5"/></button>
                                            <button onClick={() => handleDelete(l)} className="p-2 text-slate-500 hover:text-red-600"><TrashIcon className="h-5 w-5"/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                             <tr>
                                <td colSpan={6} className="text-center p-16">
                                    <BriefcaseIcon className="h-16 w-16 text-slate-400 mx-auto mb-4"/>
                                    <h2 className="text-xl font-semibold">No Business Licenses Added</h2>
                                    <p className="text-slate-500">Add company-wide licenses to track them here.</p>
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

export default BusinessLicensesList;
