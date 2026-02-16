
import React from 'react';
import { motion } from 'framer-motion';

// FIX: Cast motion.path to any to avoid type errors with motion props.
const MotionPath = motion.path as any;

export const AppBackground: React.FC = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
         <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <svg width="1200" height="1200" viewBox="0 0 1200 1200" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-20 dark:opacity-10 animate-spin-slow">
                <circle cx="600" cy="600" r="500" stroke="currentColor" strokeWidth="1" className="text-slate-300 dark:text-slate-700"/>
                <circle cx="600" cy="600" r="400" stroke="currentColor" strokeWidth="1" className="text-slate-300 dark:text-slate-700" strokeDasharray="2 8"/>
                <circle cx="600" cy="600" r="300" stroke="currentColor" strokeWidth="1" className="text-slate-300 dark:text-slate-700"/>
            </svg>
        </div>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-[60%] -translate-y-[60%] transform -rotate-12">
            <svg width="600" height="700" viewBox="0 0 600 700" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-20 dark:opacity-10 drop-shadow-2xl">
                <rect x="60" y="0" width="480" height="700" rx="40" className="fill-slate-200/80 dark:fill-slate-700/80" />
                <rect x="150" y="0" width="300" height="60" className="fill-slate-300/80 dark:fill-slate-600/80" />
                <rect x="250" y="20" width="100" height="20" rx="10" className="fill-slate-400/80 dark:fill-slate-500/80" />
                <line x1="100" y1="120" x2="500" y2="120" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="2" />
                <line x1="100" y1="180" x2="500" y2="180" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="2" />
                <line x1="100" y1="240" x2="500" y2="240" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="2" />
                <line x1="100" y1="480" x2="500" y2="480" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="2" />
                <line x1="100" y1="540" x2="500" y2="540" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="2" />
                <line x1="100" y1="600" x2="500" y2="600" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="2" />

                <MotionPath
                    d="M200 350 L280 430 L450 260"
                    stroke="currentColor"
                    className="text-indigo-500"
                    strokeWidth="25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, ease: "easeInOut", delay: 0.5 }}
                />

                <g transform="translate(420, 180) rotate(20) scale(1.2)">
                    <path d="M 0 0 L 10 60 L -10 60 Z" className="fill-slate-400 dark:fill-slate-500" />
                    <rect x="-5" y="60" width="10" height="100" className="fill-slate-300 dark:fill-slate-600" />
                    <rect x="-5" y="160" width="10" height="15" className="fill-slate-400 dark:fill-slate-500" />
                </g>
            </svg>
        </div>
    </div>
);
