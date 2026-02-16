import React from 'react';
import { HelpIcon, WhatsappIcon } from './icons';
import { useI18n } from '../hooks/useI18n';

const FAQItem: React.FC<{ question: string; children: React.ReactNode }> = ({ question, children }) => (
    <details className="p-4 rounded-lg bg-slate-50/70 dark:bg-slate-700/50 cursor-pointer transition-colors hover:bg-slate-100/70 dark:hover:bg-slate-700/70 group">
        <summary className="font-semibold text-lg text-slate-800 dark:text-slate-100 list-none flex justify-between items-center">
            {question}
            <span className="text-indigo-500 transform transition-transform duration-300 group-open:rotate-180">&#9660;</span>
        </summary>
        <div className="mt-2 text-slate-600 dark:text-slate-300 prose prose-sm max-w-none">
            {children}
        </div>
    </details>
);

const Help: React.FC = () => {
  const { t } = useI18n();
  return (
    <div className="container mx-auto animate-fadeIn">
        <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 mb-4">
                <HelpIcon className="h-8 w-8 text-indigo-500" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">{t('help.title')}</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">{t('help.subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">{t('help.faq_title')}</h2>
                <div className="space-y-4">
                    <FAQItem question={t('help.faqs.q1')}>
                        <p>{t('help.faqs.a1')}</p>
                    </FAQItem>
                    <FAQItem question={t('help.faqs.q2')}>
                        <p>{t('help.faqs.a2')}</p>
                    </FAQItem>
                    <FAQItem question={t('help.faqs.q3')}>
                        <p>{t('help.faqs.a3')}</p>
                    </FAQItem>
                    <FAQItem question={t('help.faqs.q4')}>
                        <p>{t('help.faqs.a4')}</p>
                    </FAQItem>
                </div>
            </div>

             <div className="md:col-span-2 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 rounded-lg shadow-lg p-6 text-center flex flex-col justify-center items-center">
                 <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/50 mb-4">
                    <WhatsappIcon className="h-8 w-8 text-green-500" />
                 </div>
                 <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">{t('help.contact_title')}</h2>
                 <p className="text-slate-600 dark:text-slate-400 mb-6">
                     {t('help.contact_desc')}
                 </p>
                 <a href="https://wa.me/26658008512" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center mt-2 px-6 py-3 text-white bg-green-500 rounded-lg hover:bg-green-600 transition-transform transform hover:scale-105 duration-300 shadow-lg hover:shadow-green-400/50">
                    <span className="ml-3 font-semibold">{t('help.contact_button')}</span>
                </a>
             </div>
        </div>
    </div>
  );
};

export default Help;
