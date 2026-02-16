import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';
import { 
    ChartIcon, ExportIcon, PrinterIcon, 
    CurrencyDollarIcon, ShoppingCartIcon, ClockIcon,
    ChevronLeftIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon,
    CalculatorIcon, ClipboardDocumentListIcon
} from './icons';
import { DonutChart, LineChart, BarChart } from './charts';
import { motion, AnimatePresence } from 'framer-motion';
import { SaleRecord } from '../types';

const MotionDiv = motion.div as any;

const formatCurrency = (val: number) => `M ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const SalesReporting: React.FC = () => {
    const { salesHistory, inventory, setView, businessProfile, currentUser } = useAppContext();
    const { t } = useI18n();

    const [filterRange, setFilterRange] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('monthly');
    const [reprintReceipt, setReprintReceipt] = useState<SaleRecord | null>(null);

    const vatRate = businessProfile?.vatRate || 15;

    // Filtering logic based on range
    const filteredSales = useMemo(() => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        
        return salesHistory.filter(sale => {
            const saleDate = new Date(sale.date);
            const saleDateStr = sale.date.split('T')[0];

            if (filterRange === 'daily') {
                return saleDateStr === todayStr;
            }
            if (filterRange === 'weekly') {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(now.getDate() - 7);
                return saleDate >= oneWeekAgo;
            }
            if (filterRange === 'monthly') {
                return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
            }
            return true;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [salesHistory, filterRange]);

    // Analytics Calculations
    const stats = useMemo(() => {
        let totalRevenue = 0;
        let totalProfit = 0;
        let totalTax = 0;
        const productMap: Record<string, { name: string, qty: number, revenue: number }> = {};
        const categoryMap: Record<string, number> = {};

        filteredSales.forEach(sale => {
            totalRevenue += sale.subtotal;
            totalTax += sale.taxAmount;

            sale.items.forEach(item => {
                // Find matching inventory item to get cost price for profit calculation
                const invItem = inventory.find(i => i.id === item.inventoryItemId);
                const cost = invItem?.costPrice || 0;
                totalProfit += (item.priceAtSale - cost) * item.quantity;

                // Best Selling Products aggregation
                if (!productMap[item.inventoryItemId]) {
                    productMap[item.inventoryItemId] = { name: item.itemName, qty: 0, revenue: 0 };
                }
                productMap[item.inventoryItemId].qty += item.quantity;
                productMap[item.inventoryItemId].revenue += item.total;

                // Category performance
                if (invItem) {
                    categoryMap[invItem.category] = (categoryMap[invItem.category] || 0) + item.total;
                }
            });
        });

        const bestSelling = Object.values(productMap)
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 5)
            .map(p => ({ label: p.name, value: p.qty, color: '#4f46e5' }));

        const categoryData = Object.entries(categoryMap).map(([cat, val]) => ({
            label: cat,
            value: Math.round(val),
            color: `hsl(${Math.random() * 360}, 70%, 50%)`
        }));

        // Revenue trend data (grouping by date)
        const trendMap: Record<string, number> = {};
        filteredSales.forEach(sale => {
            const day = new Date(sale.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            trendMap[day] = (trendMap[day] || 0) + sale.subtotal;
        });

        const trendData = Object.entries(trendMap)
            .map(([label, value]) => ({ label, value }))
            .reverse();

        return {
            totalRevenue,
            totalProfit,
            totalTax,
            transactionCount: filteredSales.length,
            bestSelling,
            categoryData,
            trendData,
            avgOrderValue: filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0
        };
    }, [filteredSales, inventory]);

    const handleExportCSV = () => {
        const headers = ["Sale ID", "Date", "Items Count", "Subtotal", "Tax", "Total", "Payment Method"];
        const rows = filteredSales.map(s => [
            s.id, new Date(s.date).toLocaleString(), s.items.length, s.subtotal, s.taxAmount, s.totalAmount, s.paymentMethod
        ].join(','));
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `sales_report_${filterRange}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="container mx-auto animate-fadeIn pb-32">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div className="flex items-center gap-5">
                    <button onClick={() => setView('business_hub')} className="p-4 glass-btn bg-white dark:bg-slate-800 rounded-2xl group transition-all no-print">
                        <ChevronLeftIcon className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Sales Intelligence</h1>
                        <p className="text-slate-500 font-bold italic mt-2 flex items-center gap-2">
                             <ChartIcon className="h-4 w-4 text-indigo-500" />
                             Comprehensive Commercial Performance
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 no-print">
                    <div className="bg-white/70 dark:bg-slate-800/70 p-1 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex">
                        {(['daily', 'weekly', 'monthly', 'all'] as const).map(range => (
                            <button 
                                key={range}
                                onClick={() => setFilterRange(range)}
                                className={`px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${filterRange === range ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                    <button onClick={handleExportCSV} className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-sm hover:border-indigo-500 transition-all">
                        <ExportIcon className="h-4 w-4" /> Excel
                    </button>
                    <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95">
                        <PrinterIcon className="h-4 w-4" /> Print Screen
                    </button>
                </div>
            </div>

            {/* Daily High-Level Detail Section */}
            {filterRange === 'daily' && (
                <MotionDiv 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-100 dark:border-indigo-800 rounded-[3rem] p-8 mb-10 flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl"
                >
                    <div className="flex items-center gap-6">
                        <div className="p-5 bg-indigo-600 text-white rounded-[2rem] shadow-xl shadow-indigo-500/30">
                            <ClipboardDocumentListIcon className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Daily Operational Summary</h2>
                            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Snapshot for {new Date().toLocaleDateString(undefined, { dateStyle: 'full' })}</p>
                        </div>
                    </div>
                    <div className="flex gap-12 text-center md:text-left">
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Today's Revenue</p>
                            <p className="text-3xl font-black text-slate-900 dark:text-white">{formatCurrency(stats.totalRevenue)}</p>
                        </div>
                        <div className="h-12 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Transaction Volume</p>
                            <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.transactionCount} <span className="text-xs opacity-30">Ledgers</span></p>
                        </div>
                    </div>
                </MotionDiv>
            )}

            {/* KPI Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border border-white/40 dark:border-slate-700 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform">
                        <CurrencyDollarIcon className="h-32 w-32 text-indigo-600" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{filterRange === 'daily' ? "Today's Revenue" : "Gross Revenue"}</p>
                    <p className="text-3xl font-black text-slate-800 dark:text-white leading-none">{formatCurrency(stats.totalRevenue)}</p>
                    <div className="mt-4 flex items-center gap-1.5 text-emerald-500 font-black text-[10px] uppercase">
                        <ArrowTrendingUpIcon className="h-3 w-3" /> Growth Stable
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border border-white/40 dark:border-slate-700 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform">
                        <ArrowTrendingUpIcon className="h-32 w-32 text-emerald-600" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{filterRange === 'daily' ? "Today's Net Profit" : "Net Profit"}</p>
                    <p className="text-3xl font-black text-emerald-600 leading-none">{formatCurrency(stats.totalProfit)}</p>
                    <p className="mt-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Est. ROI: {((stats.totalProfit / (stats.totalRevenue - stats.totalProfit || 1)) * 100).toFixed(1)}%</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border border-white/40 dark:border-slate-700 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform">
                        <ShoppingCartIcon className="h-32 w-32 text-amber-600" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{filterRange === 'daily' ? "Today's Volume" : "Volume"}</p>
                    <p className="text-3xl font-black text-slate-800 dark:text-white leading-none">{stats.transactionCount} <span className="text-xs uppercase opacity-30">Sales</span></p>
                    <p className="mt-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Avg Ticket: {formatCurrency(stats.avgOrderValue)}</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border border-white/40 dark:border-slate-700 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform">
                        <CalculatorIcon className="h-32 w-32 text-rose-600" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Tax Accrual</p>
                    <p className="text-3xl font-black text-rose-500 leading-none">{formatCurrency(stats.totalTax)}</p>
                    <p className="mt-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">LRS VAT: {(businessProfile?.vatRate || 0.15) * 100}% Rate</p>
                </div>
            </div>

            {/* Visual Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-10">
                <div className="lg:col-span-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl border border-white/40">
                    <h3 className="text-xl font-black uppercase tracking-tighter mb-10 flex items-center gap-3">
                        <ArrowTrendingUpIcon className="h-6 w-6 text-indigo-500" />
                        Revenue Velocity Trend
                    </h3>
                    <div className="h-64">
                        {stats.trendData.length > 0 ? (
                            <LineChart data={stats.trendData} color="#6366f1" height={250} />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full opacity-20 italic font-black">Waiting for Data Pipeline...</div>
                        )}
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl border border-white/40">
                    <h3 className="text-xl font-black uppercase tracking-tighter mb-10">Product Mix</h3>
                    <div className="h-64 flex items-center justify-center">
                        {stats.categoryData.length > 0 ? (
                            <DonutChart data={stats.categoryData} />
                        ) : (
                            <div className="text-center opacity-20 italic font-black">No Category Data</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Best Sellers */}
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl border border-white/40">
                    <h3 className="text-xl font-black uppercase tracking-tighter mb-8">Performance Leaderboard (Qty)</h3>
                    <div className="h-72">
                         {stats.bestSelling.length > 0 ? (
                            <BarChart data={stats.bestSelling} height="h-full" />
                         ) : (
                             <div className="flex items-center justify-center h-full opacity-20 italic font-black">Leaderboard Empty</div>
                         )}
                    </div>
                </div>

                {/* Transaction Ledger */}
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl border border-white/40 overflow-hidden flex flex-col">
                    <h3 className="text-xl font-black uppercase tracking-tighter mb-6">Recent Ledger</h3>
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                        <table className="w-full text-left">
                            <thead className="sticky top-0 bg-white/90 dark:bg-slate-800/90 z-10 border-b dark:border-slate-700">
                                <tr className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                    <th className="pb-4">Stamp</th>
                                    <th className="pb-4">Token</th>
                                    <th className="pb-4 text-right">Settlement</th>
                                    <th className="pb-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {filteredSales.slice(0, 25).map(sale => (
                                    <tr key={sale.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                                        <td className="py-4">
                                            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                                {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <p className="text-[8px] font-black text-slate-400 uppercase">{new Date(sale.date).toLocaleDateString()}</p>
                                        </td>
                                        <td className="py-4">
                                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-[9px] font-black uppercase tracking-tighter">#{sale.id.slice(-6)}</span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <p className="text-xs font-black text-indigo-600">{formatCurrency(sale.totalAmount)}</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase">{sale.paymentMethod}</p>
                                        </td>
                                        <td className="py-4 text-right">
                                            <button onClick={() => setReprintReceipt(sale)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="Reprint Receipt"><PrinterIcon className="h-4 w-4"/></button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredSales.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-20 text-center opacity-20 italic font-black">Registry Silence</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Reprint Modal */}
            <AnimatePresence>
                {reprintReceipt && (
                    <div className="fixed inset-0 bg-black/80 z-[150] flex items-center justify-center p-4 no-print" onClick={() => setReprintReceipt(null)}>
                        <MotionDiv initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-2xl w-full max-w-xl text-center printable-area" onClick={(e: any) => e.stopPropagation()}>
                            <div className="border-b-4 border-double border-slate-100 dark:border-slate-800 pb-8 mb-8">
                                <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">{businessProfile?.businessName}</h1>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{businessProfile?.address}</p>
                                <p className="text-[10px] font-black text-slate-400 mt-4 uppercase tracking-[0.3em]">{reprintReceipt.paymentMethod === 'quotation' ? 'OFFICIAL QUOTATION' : 'DUPLICATE RECEIPT'}</p>
                                <p className="text-[9px] font-bold text-slate-300 mt-1">TOKEN: #{reprintReceipt.id}</p>
                            </div>
                            <div className="space-y-4 mb-8">
                                {reprintReceipt.items.map((i: any) => (
                                    <div key={i.inventoryItemId} className="flex justify-between text-sm font-bold uppercase tracking-tight">
                                        <span className="text-left flex-1">{i.quantity}x {i.itemName}</span>
                                        <div className="text-right">
                                            <p>{formatCurrency(i.total)}</p>
                                            {i.discountAmount > 0 && <p className="text-[8px] text-red-500 font-black">- {formatCurrency(i.discountAmount)}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t-2 border-dashed border-slate-100 dark:border-slate-800 pt-8 space-y-3">
                                {reprintReceipt.transactionDiscount > 0 && <div className="flex justify-between text-xs font-black text-red-500 uppercase tracking-widest"><span>PROMO DISCOUNT</span><span>-{formatCurrency(reprintReceipt.transactionDiscount)}</span></div>}
                                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase"><span>Amount Excl. VAT</span><span>{formatCurrency(reprintReceipt.subtotal)}</span></div>
                                <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs font-black text-indigo-600 uppercase tracking-widest">
                                    <span>Calculated VAT ({vatRate}%)</span>
                                    <span>{formatCurrency(reprintReceipt.taxAmount)}</span>
                                </div>
                                <div className="flex justify-between text-4xl font-black uppercase pt-6 tracking-tighter border-t-4 border-slate-900 dark:border-white mt-4">
                                    <span>Total</span>
                                    <span className="text-indigo-600">{formatCurrency(reprintReceipt.totalAmount)}</span>
                                </div>
                            </div>
                            <div className="mt-12 flex gap-4 no-print">
                                <button onClick={() => window.print()} className="flex-1 py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase text-xs shadow-xl"><PrinterIcon className="h-5 w-5 inline mr-3" /> Print Duplicate</button>
                                <button onClick={() => setReprintReceipt(null)} className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 rounded-3xl font-black uppercase text-xs">Dismiss</button>
                            </div>
                        </MotionDiv>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SalesReporting;