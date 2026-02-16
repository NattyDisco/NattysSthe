
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';
import { Applicant, ApplicantStatus, JobPosition } from '../types';
import { PlusIcon, UserGroupIcon, BriefcaseIcon } from './icons';
import { motion } from 'framer-motion';

// FIX: Cast motion.div to any to avoid type errors with motion props.
const MotionDiv = motion.div as any;

// Kanban components for applicants (can be mostly reused)
const ApplicantCard: React.FC<{ applicant: Applicant, onEdit: (app: Applicant) => void }> = ({ applicant, onEdit }) => (
    <MotionDiv 
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => onEdit(applicant)} 
        className="bg-white dark:bg-slate-700 p-3 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
    >
        <h3 className="font-bold text-sm">{applicant.firstName} {applicant.surname}</h3>
        <p className="text-xs text-slate-500">{applicant.applicationDate}</p>
    </MotionDiv>
);

const RecruitmentColumn: React.FC<{ title: string; applicants: Applicant[]; onEdit: (app: Applicant) => void }> = ({ title, applicants, onEdit }) => (
    <div className="bg-slate-100/70 dark:bg-slate-800/70 p-3 rounded-lg flex-1">
        <h2 className="font-bold mb-4 capitalize text-slate-600 dark:text-slate-300">{title} ({applicants.length})</h2>
        <div className="space-y-3 min-h-[200px]">
            {applicants.map(app => <ApplicantCard key={app.id} applicant={app} onEdit={onEdit} />)}
        </div>
    </div>
);

// New component for Job Position cards
const PositionCard: React.FC<{
    position: JobPosition;
    applicantCount: number;
    isSelected: boolean;
    onSelect: () => void;
}> = ({ position, applicantCount, isSelected, onSelect }) => {
    const isFilled = position.status === 'filled';
    return (
        <MotionDiv
            layout
            onClick={onSelect}
            className={`p-4 rounded-lg shadow-lg cursor-pointer transition-all duration-300 relative overflow-hidden ${
                isSelected 
                    ? 'bg-white dark:bg-slate-700/80 ring-2 ring-indigo-500' 
                    : 'bg-white/70 dark:bg-slate-800/70 hover:shadow-xl hover:-translate-y-1'
            } ${isFilled ? 'opacity-60' : ''}`}
        >
            {isFilled && <div className="absolute top-2 right-2 px-2 py-1 text-xs font-bold text-white bg-slate-500 rounded-full z-10">FILLED</div>}
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{position.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{position.department}</p>
                </div>
                {!isFilled && <div className="px-2 py-1 text-xs font-bold text-green-800 bg-green-200 dark:text-green-200 dark:bg-green-900/50 rounded-full">OPEN</div>}
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <UserGroupIcon className="h-4 w-4" />
                <span>{applicantCount} Applicant{applicantCount !== 1 ? 's' : ''}</span>
            </div>
        </MotionDiv>
    );
};


const Recruitment: React.FC = () => {
    const { applicants, openApplicantModal, jobPositions, openJobPositionModal } = useAppContext();
    const { t } = useI18n();
    const [selectedPosition, setSelectedPosition] = useState<JobPosition | null>(null);

    const applicantsByPosition = useMemo(() => {
        if (!selectedPosition) return [];
        return applicants.filter(a => a.position === selectedPosition.title);
    }, [applicants, selectedPosition]);

    const statuses: ApplicantStatus[] = ['pending', 'interview', 'offer', 'hired', 'rejected'];

    const getApplicantCount = (positionTitle: string) => {
        return applicants.filter(a => a.position === positionTitle).length;
    };

    return (
        <div className="container mx-auto animate-fadeIn space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold">{t('sidebar.recruitment')}</h1>
                <div className="flex gap-2">
                    <button onClick={() => openJobPositionModal(null)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                        <PlusIcon className="h-5 w-5" />
                        <span>{t('recruitment.add_position')}</span>
                    </button>
                    <button onClick={() => openApplicantModal()} className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700">
                        <PlusIcon className="h-5 w-5" />
                        <span>{t('recruitment.add_applicant')}</span>
                    </button>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><BriefcaseIcon className="h-5 w-5 text-indigo-500" />{t('recruitment.positions_title')}</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobPositions.map(pos => (
                        <PositionCard 
                            key={pos.id}
                            position={pos}
                            applicantCount={getApplicantCount(pos.title)}
                            isSelected={selectedPosition?.id === pos.id}
                            onSelect={() => setSelectedPosition(pos)}
                        />
                    ))}
                </div>
            </div>

            {selectedPosition && (
                 <MotionDiv layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h2 className="text-xl font-semibold mb-4">{t('recruitment.applicants_for', { position: selectedPosition.title })}</h2>
                    <div className="flex flex-col md:flex-row gap-6">
                        {statuses.map(status => (
                            <RecruitmentColumn 
                                key={status}
                                title={t(`recruitment.statuses.${status}`)} 
                                applicants={applicantsByPosition.filter(a => a.status === status)}
                                onEdit={openApplicantModal}
                            />
                        ))}
                    </div>
                </MotionDiv>
            )}

            {!selectedPosition && jobPositions.length > 0 && (
                <div className="text-center py-10 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                    <p className="text-slate-500">{t('recruitment.select_position_prompt')}</p>
                </div>
            )}
        </div>
    );
};

export default Recruitment;
