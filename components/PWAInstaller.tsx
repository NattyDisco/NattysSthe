import React, { useState, useEffect } from 'react';
import { DownloadIcon } from './icons';
import { useI18n } from '../hooks/useI18n';

// Mascot component for visual appeal on the install screen
const Mascot: React.FC = () => (
  <div className="relative w-32 h-32 animate-float">
    {/* Head */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-indigo-500 rounded-lg shadow-lg">
       {/* Eye */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-slate-800 rounded-full"></div>
       </div>
    </div>
     {/* Body */}
    <div className="absolute top-16 left-1/2 -translate-x-1/2 w-24 h-12 bg-slate-300 dark:bg-slate-600 rounded-b-lg shadow-lg"></div>
  </div>
);

const PWAInstaller: React.FC = () => {
  const { t } = useI18n();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      setIsInstallable(false);
    }
    
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isInstalled) {
        setIsInstallable(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setIsInstallable(false);
    setDeferredPrompt(null);
  };
  
  const getButtonText = () => {
    if (isInstalled) return t('install.installed_button', { defaultValue: 'Application Installed' });
    if (isInstallable) return t('install.install_now_button', { defaultValue: 'Install to Desktop/Mobile' });
    return t('install.unavailable_button', { defaultValue: 'Already Installed or Unavailable' });
  };
  
  const getHelperText = () => {
    if (isInstalled) return t('install.installed_helper', { defaultValue: 'You are currently running the native version of Natty Hub.' });
    if (isInstallable) return t('install.installable_helper', { defaultValue: 'Add Natty Hub to your home screen for a seamless, full-screen operational experience.' });
    return t('install.unavailable_helper', { defaultValue: 'Native installation is not supported by your current environment or browser.' });
  }

  return (
    <div className="flex items-center justify-center h-full animate-fadeIn p-4">
      <div className="w-full max-w-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 rounded-2xl shadow-2xl p-8 sm:p-12 text-center">
        
        <div className="flex justify-center mb-6">
            <Mascot />
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">{t('install.title', { defaultValue: 'Native Deployment' })}</h1>
        <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-md mx-auto">
          {getHelperText()}
        </p>
        <button 
          onClick={handleInstallClick} 
          disabled={!isInstallable || isInstalled}
          className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 duration-300 disabled:bg-slate-400 dark:disabled:bg-slate-500 disabled:cursor-not-allowed disabled:transform-none"
          aria-label={getButtonText()}
        >
          <DownloadIcon className="h-6 w-6 mr-3" />
          {getButtonText()}
        </button>
      </div>
    </div>
  );
};

export default PWAInstaller;