
import React from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '../hooks/useI18n';

// FIX: Cast motion components to any to avoid type errors with motion props.
const MotionCircle = motion.circle as any;
const MotionPath = motion.path as any;
const MotionDiv = motion.div as any;

export const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
    const { t } = useI18n();
    const total = data.reduce((acc, item) => acc + item.value, 0);
    if (total === 0) {
        return <div className="flex items-center justify-center h-full text-slate-500">{t('charts.no_data')}</div>;
    }

    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    let accumulatedPercentage = 0;

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-48 h-48 transform -rotate-90">
                <circle cx="50" cy="50" r={radius} fill="transparent" strokeWidth="10" className="text-slate-200 dark:text-slate-700" stroke="currentColor" />
                {data.map((item, index) => {
                    if (item.value === 0) return null;
                    const percentage = item.value / total;
                    const dashoffset = circumference * (1 - accumulatedPercentage);
                    const dasharray = `${circumference * percentage} ${circumference}`;
                    
                    const segment = (
                        <MotionCircle
                            key={index}
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="transparent"
                            stroke={item.color}
                            strokeWidth="10"
                            strokeDasharray={dasharray}
                            strokeLinecap="round"
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset: dashoffset }}
                            transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
                        />
                    );
                    accumulatedPercentage += percentage;
                    return segment;
                })}
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">{total}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">{t('charts.total_records')}</span>
            </div>
        </div>
    );
};


export const LineChart: React.FC<{ data: { label: string, value: number }[], color: string, height?: number }> = ({ data, color, height = 200 }) => {
    const { t } = useI18n();
    const width = 500;
    if (!data || data.length < 2) return <div className="flex items-center justify-center h-full text-slate-500" style={{ height: `${height}px` }}>{t('charts.not_enough_data')}</div>;
    
    const maxValue = Math.max(...data.map(d => d.value), 1);
    
    const getCoords = (value: number, index: number) => {
        const x = (index / (data.length - 1 || 1)) * width;
        const y = height - (value / maxValue) * (height - 10) - 5; // Add padding
        return { x, y };
    };

    const pathData = data.map((d, i) => {
        const { x, y } = getCoords(d.value, i);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    }).join(' ');
    
    const areaPathData = `${pathData} V ${height} L 0 ${height} Z`;

    return (
        <div className="relative w-full" style={{ height: `${height}px` }}>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
                <defs>
                    <linearGradient id={`areaGradient-${color.replace('#','')}`} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <MotionPath 
                    d={areaPathData} 
                    fill={`url(#areaGradient-${color.replace('#','')})`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                />
                <MotionPath 
                    d={pathData} 
                    fill="none" 
                    stroke={color} 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                />
            </svg>
            <div className="absolute -bottom-4 w-full flex justify-between text-xs text-slate-400 px-1">
                <span>{data[0]?.label}</span>
                {data.length > 10 && <span>{data[Math.floor(data.length * 0.25)]?.label}</span>}
                <span>{data[Math.floor(data.length / 2)]?.label}</span>
                {data.length > 10 && <span>{data[Math.floor(data.length * 0.75)]?.label}</span>}
                <span>{data[data.length - 1]?.label}</span>
            </div>
        </div>
    );
};

export const BarChart: React.FC<{ data: { label: string; value: number; color: string }[]; height: string }> = ({ data, height }) => {
    const { t } = useI18n();
    if (!data || data.length === 0) {
        return <div className={`flex items-center justify-center text-slate-500 ${height}`}>{t('charts.no_data')}</div>;
    }

    const maxValue = Math.max(...data.map(d => d.value), 0);
    const maxVal = maxValue === 0 ? 1 : maxValue; // Avoid division by zero

    return (
        <div className={`w-full ${height} flex items-end gap-2 px-4`}>
            {data.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1 group relative h-full">
                    <div className="relative w-full h-full flex items-end">
                        <MotionDiv
                            className="w-full rounded-t-md"
                            style={{ backgroundColor: item.color }}
                            initial={{ height: '0%' }}
                            animate={{ height: `${(item.value / maxVal) * 100}%` }}
                            transition={{ duration: 0.5, delay: index * 0.05, ease: 'easeOut' }}
                        >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-slate-800 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {item.value}
                            </div>
                        </MotionDiv>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate w-full text-center">{item.label}</span>
                </div>
            ))}
        </div>
    );
};
