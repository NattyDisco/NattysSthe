import React, { Suspense, lazy, useState, useEffect, useMemo } from 'react';
import { useAppContext, AppContextProvider } from './hooks/useAppContext';
import { useI18n, I18nProvider } from './hooks/useI18n';
import type { View, Task } from './types';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import Header from './components/Header';
import { AppBackground } from './components/AppBackground';
import Footer from './components/Footer';
import { LogoIcon, SparklesIcon, ArrowPathIcon } from './components/icons';
import LoginPage from './components/LoginPage';
import TaskReminderToast from './components/TaskReminderToast';

// Modals & Panels
import EmployeeModal from './components/EmployeeModal';
import ChangePasswordModal from './components/ChangePasswordModal';
import ConfirmationModal from './components/ConfirmationModal';
import TaskModal from './components/TaskModal';
import TaskDetailPanel from './components/TaskDetailPanel';
import AIChatbotModal from './components/AIChatbotModal';
import ShiftModal from './components/ShiftModal';
import ShiftAssignmentModal from './components/ShiftAssignmentModal';
import SickLeaveModal from './components/SickLeaveModal';
import TimeLogModal from './components/TimeLogModal';
import VehicleModal from './components/VehicleModal';
import VehicleExpenseModal from './components/VehicleExpenseModal';
import DocumentModal from './components/DocumentModal';
import WorkPermitModal from './components/WorkPermitModal';
import BusinessLicenseModal from './components/BusinessLicenseModal';
import CarModal from './components/CarModal';
import BackupRestoreModal from './components/BackupRestoreModal';
import ApplicantModal from './components/ApplicantModal';
import JobPositionModal from './components/JobPositionModal';
import ExpenseModal from './components/ExpenseModal';
import DocumentCenterModal from './components/DocumentCenterModal';
import SignatureModal from './components/SignatureModal';
import JourneyEventModal from './components/JourneyEventModal';
import DisciplinaryRecordModal from './components/DisciplinaryRecordModal';
import AttendancePreselectionModal from './components/AttendancePreselectionModal';
import GlobalSearchModal from './components/GlobalSearchModal';
import SettingsMenu from './components/SettingsMenu';
import DisciplinaryUpdateModal from './components/DisciplinaryUpdateModal';
import RequestSubmittedModal from './components/RequestSubmittedModal';
import PayslipModal from './components/PayslipModal';

// Lazy load views
const Dashboard = lazy(() => import('./components/Dashboard'));
const EmployeeList = lazy(() => import('./components/EmployeeList'));
const Attendance = lazy(() => import('./components/Attendance'));
const MyAttendance = lazy(() => import('./components/MyAttendance'));
const LeaveManagement = lazy(() => import('./components/LeaveManagement'));
const Tasks = lazy(() => import('./components/Tasks'));
const MyTasks = lazy(() => import('./components/MyTasks'));
const Reports = lazy(() => import('./components/Reports'));
const MonthlyAttendanceReport = lazy(() => import('./components/MonthlyAttendanceReport'));
const Settings = lazy(() => import('./components/Settings'));
const Help = lazy(() => import('./components/Help'));
const Announcements = lazy(() => import('./components/Announcements'));
const AuditLogs = lazy(() => import('./components/AuditLogs'));
const Notifications = lazy(() => import('./components/Notifications'));
const DataAnalytics = lazy(() => import('./components/DataAnalytics'));
const Payroll = lazy(() => import('./components/Payroll'));
const MyPayslips = lazy(() => import('./components/MyPayslips'));
const PayrollSettings = lazy(() => import('./components/PayrollSettings'));
const Shifts = lazy(() => import('./components/Shifts'));
const ShiftRoster = lazy(() => import('./components/ShiftRoster'));
const BulkAttendance = lazy(() => import('./components/BulkAttendance'));
const Permits = lazy(() => import('./components/Permits'));
const PWAInstaller = lazy(() => import('./components/PWAInstaller'));
const CarsList = lazy(() => import('./components/CarsList'));
const Performance = lazy(() => import('./components/Performance'));
const Recruitment = lazy(() => import('./components/Recruitment'));
const HRHub = lazy(() => import('./components/HRHub'));
const EmployeeJourney = lazy(() => import('./components/EmployeeJourney'));
const Disciplinary = lazy(() => import('./components/Disciplinary'));
const ExitManagement = lazy(() => import('./components/ExitManagement'));
const HoursCalculator = lazy(() => import('./components/HoursCalculator'));
const PolicyReports = lazy(() => import('./components/PolicyReports'));
const ExpenseManagement = lazy(() => import('./components/ExpenseManagement'));
const DocumentCenter = lazy(() => import('./components/DocumentCenter'));
const CustomForms = lazy(() => import('./components/CustomForms'));
const FormBuilder = lazy(() => import('./components/FormBuilder'));
const FormResponses = lazy(() => import('./components/FormResponses'));
const FillForm = lazy(() => import('./components/FillForm'));
const Alerts = lazy(() => import('./components/Alerts'));
const OrgChart = lazy(() => import('./components/OrgChart'));
const Incentives = lazy(() => import('./components/Incentives'));
const BiometricImport = lazy(() => import('./components/BiometricImport'));
const CalculationRules = lazy(() => import('./components/CalculationRules'));
const BusinessHub = lazy(() => import('./components/BusinessHub'));
const SalesReporting = lazy(() => import('./components/SalesReporting'));

const viewMap: Record<View, React.LazyExoticComponent<React.ComponentType<any>>> = {
    dashboard: Dashboard,
    employees: EmployeeList,
    attendance: Attendance,
    my_attendance: MyAttendance,
    leave_management: LeaveManagement,
    tasks: Tasks,
    my_tasks: MyTasks,
    reports: Reports,
    monthly_reports: MonthlyAttendanceReport,
    settings: Settings,
    help: Help,
    announcements: Announcements,
    audit_logs: AuditLogs,
    notifications: Notifications,
    data_analytics: DataAnalytics,
    payroll: Payroll,
    my_payslips: MyPayslips,
    payroll_settings: PayrollSettings,
    shifts: Shifts,
    shift_roster: ShiftRoster,
    bulk_attendance: BulkAttendance,
    permits: Permits,
    cars_list: CarsList,
    install: PWAInstaller,
    performance: Performance,
    recruitment: Recruitment,
    hr_hub: HRHub,
    employee_journey: EmployeeJourney,
    disciplinary: Disciplinary,
    exit_management: ExitManagement,
    hours_calculator: HoursCalculator,
    policy_reports: PolicyReports,
    expense_management: ExpenseManagement,
    document_center: DocumentCenter,
    custom_forms: CustomForms,
    form_builder: FormBuilder,
    form_responses: FormResponses,
    fill_form: FillForm,
    alerts: Alerts,
    org_chart: OrgChart,
    incentives: Incentives,
    biometric_import: BiometricImport,
    calculation_rules: CalculationRules,
    business_hub: BusinessHub,
    sales_reporting: SalesReporting,
};

const ComponentLoader: React.FC = () => (
    <div className="flex justify-center items-center min-h-[50vh] w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
    </div>
);

const MotionDiv = motion.div as any;

const ViewRenderer: React.FC = () => {
    const { view, setView } = useAppContext();
    const Component = viewMap[view] || Dashboard;
    return (
        <MotionDiv
            key={view}
            initial={{ opacity: 0, scale: 0.99, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.99, y: -4 }}
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            className="flex-1 w-full"
        >
            <Component setView={setView} />
        </MotionDiv>
    );
};

const AppContent: React.FC = () => {
    const [isAIChatbotOpen, setIsAIChatbotOpen] = useState(false);
    const {
        currentUser,
        isAuthLoading, view, setView, isSidebarOpen, toggleSidebar,
        isEmployeeModalOpen, closeEmployeeModal, employeeToEdit,
        isChangePasswordModalOpen, closeChangePasswordModal,
        isConfirmModalOpen, closeConfirmModal, confirmModalContent,
        isTaskModalOpen, closeTaskModal, taskToEdit, initialAssigneeIdForTaskModal,
        isTaskDetailPanelOpen, closeTaskDetailPanel, taskForDetailPanel,
        isShiftModalOpen, closeShiftModal, shiftToEdit,
        isShiftAssignmentModalOpen, closeShiftAssignmentModal, shiftAssignmentContext,
        isSickLeaveModalOpen, closeSickLeaveModal, sickLeaveModalContext,
        isTimeLogModalOpen, closeTimeLogModal, timeLogModalContext,
        isVehicleModalOpen, vehicleToEdit, closeVehicleModal,
        isVehicleExpenseModalOpen, vehicleExpenseToEdit, closeVehicleExpenseModal,
        isDocumentModalOpen, closeDocumentModal, documentModalVehicleId,
        isWorkPermitModalOpen, closeWorkPermitModal, workPermitToEdit,
        isBusinessLicenseModalOpen, closeBusinessLicenseModal, businessLicenseToEdit,
        isCarModalOpen, carToEdit, closeCarModal,
        isBackupRestoreModalOpen, closeBackupRestoreModal,
        isApplicantModalOpen, closeApplicantModal, applicantToEdit,
        isJobPositionModalOpen, closeJobPositionModal, jobPositionToEdit,
        isExpenseModalOpen, closeExpenseModal, expenseToEdit,
        isDocumentCenterModalOpen, closeDocumentCenterModal, documentToEdit,
        isSignatureModalOpen, closeSignatureModal, documentToSignId,
        isJourneyEventModalOpen, closeJourneyEventModal, journeyEventContext,
        isDisciplinaryModalOpen, closeDisciplinaryModal, disciplinaryModalContext, disciplinaryRecordToEdit,
        isDisciplinaryUpdateModalOpen, closeDisciplinaryUpdateModal, disciplinaryUpdateContext,
        isAttendancePreselectionModalOpen, closeAttendancePreselectionModal, preselectionModalContext,
        isGlobalSearchOpen, closeGlobalSearch,
        isRequestSubmittedModalOpen, closeRequestSubmittedModal, requestSubmittedModalContent,
        isPayslipModalOpen, closePayslipModal, payslipData,
        tasks
    } = useAppContext();

    // REMINDER LOGIC
    const [dismissedReminders, setDismissedReminders] = useState<Set<string>>(new Set());
    const [activeReminders, setActiveReminders] = useState<Task[]>([]);

    useEffect(() => {
        const checkReminders = () => {
            const now = new Date();
            const triggers = tasks.filter(task => {
                if (task.status === 'done') return false;
                if (!task.reminderDateTime) return false;
                if (dismissedReminders.has(task.id)) return false;
                return now >= new Date(task.reminderDateTime);
            });
            setActiveReminders(triggers);
        };

        const interval = setInterval(checkReminders, 30000); 
        checkReminders(); 
        return () => clearInterval(interval);
    }, [tasks, dismissedReminders]);

    const handleDismissReminder = (taskId: string) => {
        setDismissedReminders(prev => new Set(prev).add(taskId));
    };

    if (isAuthLoading) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 z-[100] p-6 text-center">
                <LogoIcon className="h-12 w-12 text-indigo-600 animate-pulse" />
                <p className="mt-4 text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-[0.3em]">Igniting Workspace...</p>
            </div>
        );
    }

    if (!currentUser) {
        return <LoginPage />;
    }

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 overflow-x-hidden relative flex-col">
            <Header toggleSidebar={toggleSidebar} />
            
            <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 relative overflow-x-hidden">
                <Suspense fallback={<ComponentLoader />}>
                    <ViewRenderer />
                </Suspense>
            </main>

            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
                <div className="flex flex-col gap-3 items-end mb-4">
                    <AnimatePresence>
                        {activeReminders.map(task => (
                            <MotionDiv
                                key={task.id}
                                initial={{ x: 300, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 300, opacity: 0 }}
                            >
                                <TaskReminderToast task={task} onDismiss={handleDismissReminder} />
                            </MotionDiv>
                        ))}
                    </AnimatePresence>
                </div>

                <button 
                    onClick={() => setIsAIChatbotOpen(true)}
                    className="bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:bg-indigo-700 transition-all flex items-center justify-center group scale-100 active:scale-90"
                    title="AI Assistant"
                >
                    <SparklesIcon className="h-6 w-6" />
                </button>
                <AIChatbotModal isOpen={isAIChatbotOpen} onClose={() => setIsAIChatbotOpen(false)} />
            </div>
            
            <Footer />

            <AnimatePresence>
                {isEmployeeModalOpen && <EmployeeModal isOpen={isEmployeeModalOpen} onClose={closeEmployeeModal} employee={employeeToEdit} />}
                {isChangePasswordModalOpen && <ChangePasswordModal isOpen={isChangePasswordModalOpen} onClose={closeChangePasswordModal} />}
                {isConfirmModalOpen && <ConfirmationModal isOpen={isConfirmModalOpen} onClose={closeConfirmModal} {...confirmModalContent} />}
                {isTaskModalOpen && <TaskModal isOpen={isTaskModalOpen} onClose={closeTaskModal} task={taskToEdit} assigneeId={initialAssigneeIdForTaskModal} />}
                {isTaskDetailPanelOpen && <TaskDetailPanel taskId={taskForDetailPanel} isOpen={isTaskDetailPanelOpen} onClose={closeTaskDetailPanel} />}
                {isShiftModalOpen && <ShiftModal isOpen={isShiftModalOpen} onClose={closeShiftModal} shift={shiftToEdit} />}
                {isShiftAssignmentModalOpen && <ShiftAssignmentModal isOpen={isShiftAssignmentModalOpen} onClose={closeShiftAssignmentModal} context={shiftAssignmentContext} />}
                {isSickLeaveModalOpen && <SickLeaveModal isOpen={isSickLeaveModalOpen} onClose={closeSickLeaveModal} context={sickLeaveModalContext} />}
                {isTimeLogModalOpen && <TimeLogModal isOpen={isTimeLogModalOpen} onClose={closeTimeLogModal} context={timeLogModalContext} />}
                {isVehicleModalOpen && <VehicleModal isOpen={isVehicleModalOpen} onClose={closeVehicleModal} vehicle={vehicleToEdit} />}
                {isVehicleExpenseModalOpen && <VehicleExpenseModal isOpen={isVehicleExpenseModalOpen} onClose={closeVehicleExpenseModal} expense={vehicleExpenseToEdit} />}
                {isDocumentModalOpen && <DocumentModal isOpen={isDocumentModalOpen} onClose={closeDocumentModal} vehicleId={documentModalVehicleId} />}
                {isWorkPermitModalOpen && <WorkPermitModal isOpen={isWorkPermitModalOpen} onClose={closeWorkPermitModal} permit={workPermitToEdit} />}
                {isBusinessLicenseModalOpen && <BusinessLicenseModal isOpen={isBusinessLicenseModalOpen} onClose={closeBusinessLicenseModal} license={businessLicenseToEdit} />}
                {isCarModalOpen && <CarModal isOpen={isCarModalOpen} onClose={closeCarModal} car={carToEdit} />}
                {isBackupRestoreModalOpen && <BackupRestoreModal isOpen={isBackupRestoreModalOpen} onClose={closeBackupRestoreModal} />}
                {isApplicantModalOpen && <ApplicantModal isOpen={isApplicantModalOpen} onClose={closeApplicantModal} applicant={applicantToEdit} />}
                {isJobPositionModalOpen && <JobPositionModal isOpen={isJobPositionModalOpen} onClose={closeJobPositionModal} position={jobPositionToEdit} />}
                {isExpenseModalOpen && <ExpenseModal isOpen={isExpenseModalOpen} onClose={closeExpenseModal} expense={expenseToEdit} />}
                {isDocumentCenterModalOpen && <DocumentCenterModal isOpen={isDocumentCenterModalOpen} onClose={closeDocumentCenterModal} document={documentToEdit} />}
                {isSignatureModalOpen && <SignatureModal isOpen={isSignatureModalOpen} onClose={closeSignatureModal} documentId={documentToSignId} />}
                {isJourneyEventModalOpen && <JourneyEventModal isOpen={isJourneyEventModalOpen} onClose={closeJourneyEventModal} context={journeyEventContext} />}
                {isDisciplinaryModalOpen && <DisciplinaryRecordModal isOpen={isDisciplinaryModalOpen} onClose={closeDisciplinaryModal} context={disciplinaryModalContext} record={disciplinaryRecordToEdit} />}
                {isDisciplinaryUpdateModalOpen && <DisciplinaryUpdateModal isOpen={isDisciplinaryUpdateModalOpen} onClose={closeDisciplinaryUpdateModal} context={disciplinaryUpdateContext} />}
                {isAttendancePreselectionModalOpen && <AttendancePreselectionModal isOpen={isAttendancePreselectionModalOpen} onClose={closeAttendancePreselectionModal} context={preselectionModalContext!} />}
                {isGlobalSearchOpen && <GlobalSearchModal isOpen={isGlobalSearchOpen} onClose={closeGlobalSearch} />}
                {isRequestSubmittedModalOpen && <RequestSubmittedModal isOpen={isRequestSubmittedModalOpen} onClose={closeRequestSubmittedModal} {...requestSubmittedModalContent} />}
                {isPayslipModalOpen && <PayslipModal isOpen={isPayslipModalOpen} onClose={closePayslipModal} data={payslipData} />}
            </AnimatePresence>
        </div>
    );
};

export const App: React.FC = () => {
    return (
        <I18nProvider>
            <AppContextProvider>
                <AppBackground />
                <AppContent />
            </AppContextProvider>
        </I18nProvider>
    );
};