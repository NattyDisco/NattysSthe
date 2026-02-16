import React from 'react';
import { useI18n } from '../hooks/useI18n';
import { ChevronLeftIcon, PrinterIcon, Cog8ToothIcon } from './icons';
import { useAppContext } from '../hooks/useAppContext';
import { View } from '../types';

const RuleCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-3">{title}</h3>
        <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
            {children}
        </div>
    </div>
);

const Formula: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-slate-100 dark:bg-slate-700 p-3 rounded-md text-sm font-mono mt-2">
        <code>{children}</code>
    </pre>
);

const SalarySlip: React.FC = () => {
    const { t } = useI18n();
    return (
        <div className="printable-area bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg border dark:border-slate-700 max-w-2xl mx-auto">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">Natty Solutions</h1>
                <p className="text-sm text-slate-500">Salary Slip - July 2025</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <p className="font-bold">John Doe</p>
                    <p className="text-sm text-slate-500">EMP-005</p>
                    <p className="text-sm text-slate-500">IT Department</p>
                </div>
                <div className="text-right">
                    <p className="text-sm"><strong>Pay Date:</strong> 2025-07-31</p>
                    <p className="text-sm"><strong>Pay Period:</strong> 2025-07-01 - 2025-07-31</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-8">
                <div>
                    <h4 className="font-bold text-lg mb-2 border-b pb-1">Earnings</h4>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span>Base Salary</span><span>M3,500.00</span></div>
                        <div className="flex justify-between"><span>Overtime Pay</span><span>M220.00</span></div>
                        <div className="flex justify-between"><span>Bonus</span><span>M300.00</span></div>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-1 mt-2">
                        <span>Gross Salary</span>
                        <span>M4,020.00</span>
                    </div>
                </div>
                <div>
                    <h4 className="font-bold text-lg mb-2 border-b pb-1">Deductions</h4>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span>Late Arrival</span><span>M75.00</span></div>
                        <div className="flex justify-between"><span>Off Day</span><span>M120.00</span></div>
                        <div className="flex justify-between"><span>Owings</span><span>M150.00</span></div>
                    </div>
                     <div className="flex justify-between font-bold border-t pt-1 mt-2">
                        <span>Total Deductions</span>
                        <span>M345.00</span>
                    </div>
                </div>
            </div>
            <div className="mt-8 pt-4 border-t-2 border-dashed">
                <div className="flex justify-between font-extrabold text-xl">
                    <span>Net Salary (Payable)</span>
                    <span>M3,675.00</span>
                </div>
            </div>
        </div>
    );
};


const CalculationRules: React.FC<{ setView: (view: View) => void }> = ({ setView }) => {
    const { t } = useI18n();

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="container mx-auto animate-fadeIn space-y-6">
             <div className="flex justify-between items-center no-print">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setView('payroll')} 
                        className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                        aria-label="Back to Payroll"
                    >
                        <ChevronLeftIcon className="h-6 w-6" />
                    </button>
                    <h1 className="text-3xl font-bold">Calculation Rules</h1>
                </div>
                <button onClick={() => setView('settings')} className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700">
                    <Cog8ToothIcon className="h-5 w-5"/>
                    <span>Edit Rules in Settings</span>
                </button>
             </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <RuleCard title="Base Salary">
                    <p>Start with the employee’s basic monthly wage as per their contract.</p>
                    <p>Verify that the amount meets or exceeds the Lesotho minimum wage 2025 for that sector (M2,500–M3,200 depending on sector).</p>
                </RuleCard>
                 <RuleCard title="Late Arrival Deductions">
                    <p>Detect all late arrivals from attendance records.</p>
                    <p>For every late arrival, deduct the proportional amount based on the hourly wage.</p>
                    <Formula>Late Deduction = (Total Late Minutes ÷ 60) × Hourly Rate</Formula>
                </RuleCard>
                 <RuleCard title="Overtime Pay">
                    <p>Detect all approved overtime hours beyond standard working hours (8 hours/day).</p>
                    <p>Apply 1.5× hourly rate for weekdays and 2× hourly rate for Sundays or rest days.</p>
                    <Formula>{`Overtime Pay = (Overtime Hours Weekdays × 1.5 × Hourly Rate) + (Overtime Hours Sundays × 2 × Hourly Rate)`}</Formula>
                </RuleCard>
                 <RuleCard title="Off Days (Unpaid Leave)">
                    <p>Detect all days marked as “Off” without pay.</p>
                    <p>Deduct based on daily rate.</p>
                    <Formula>Off Deduction = Off Days × Daily Rate</Formula>
                </RuleCard>
                 <RuleCard title="Bonuses / Additional Allowances">
                    <p>Add any monthly or performance-based bonuses, sales commissions, or travel allowances.</p>
                    <Formula>Bonus = Given Bonus Amount + Commission + Allowances</Formula>
                </RuleCard>
                <RuleCard title="Owings to the Company">
                    <p>Deduct any amounts owed by the employee (e.g., salary advance, damage cost, loan, etc.).</p>
                    <Formula>Owing Deduction = Total Owing Amount</Formula>
                </RuleCard>
            </div>
            
             <RuleCard title="Salary Calculation Summary">
                <div className="space-y-2">
                    <p><strong>Gross Salary:</strong></p>
                    <Formula>Gross Salary = Base Salary + Overtime Pay + Bonus</Formula>
                    <p><strong>Total Deductions:</strong></p>
                    <Formula>Total Deductions = Late Deduction + Off Deduction + Owing Deduction + Statutory Deductions</Formula>
                    <p><strong>Net Salary:</strong></p>
                    <Formula>Net Salary = Gross Salary - Total Deductions</Formula>
                </div>
            </RuleCard>

            <div className="bg-white/70 dark:bg-slate-800/70 p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-4 no-print">
                    <h3 className="text-xl font-bold">Salary Slip Example</h3>
                    <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700">
                        <PrinterIcon className="h-5 w-5" />
                        <span>Print Example</span>
                    </button>
                </div>
                <SalarySlip />
            </div>
        </div>
    );
};

export default CalculationRules;