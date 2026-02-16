import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // In a real app, this would route to a page. 
    // Here we prevent default to stop the AI Studio sandbox from freaking out over URL hash changes.
  };

  return (
    <footer className="w-full mt-auto p-6 sm:p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t dark:border-slate-800 text-center no-print">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">&copy; {currentYear} Attendance System</p>
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">Operational Workspace Framework v4.0</p>
        </div>
        <div className="flex gap-8">
          <button onClick={handleLinkClick} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-all">Privacy Policy</button>
          <button onClick={handleLinkClick} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-all">Terms of Service</button>
          <button onClick={handleLinkClick} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-all">Support Desk</button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;