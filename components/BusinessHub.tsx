import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useI18n } from '../hooks/useI18n';
import { 
    BuildingOfficeIcon, PlusIcon, TrashIcon, EditIcon, 
    CalculatorIcon, CurrencyDollarIcon, SearchIcon, ClockIcon, 
    XCircleIcon, CheckCircleIcon, ShoppingCartIcon, ExportIcon, ImportIcon, PrinterIcon,
    UserGroupIcon, PhoneIcon, EmailIcon, StarIcon, BellAlertIcon, ArrowTrendingUpIcon,
    ClipboardDocumentListIcon, ChartIcon, Cog8ToothIcon, LogoIcon,
    ExclamationCircleIcon, HashtagIcon, BriefcaseIcon, EllipsisVerticalIcon,
    ArrowPathIcon
} from './icons';
import { motion, AnimatePresence } from 'framer-motion';
import { BusinessProfile, InventoryItem, SaleItem, Supplier, HeldSale, SaleRecord, View } from '../types';
import { DonutChart, BarChart } from './charts';

const MotionDiv = motion.div as any;

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button 
        onClick={onClick} 
        className={`px-6 sm:px-10 py-4 sm:py-6 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] border-b-4 transition-all whitespace-nowrap ${
            isActive 
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
        }`}
    >
        {label}
    </button>
);

const formatCurrency = (val: number) => `M ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const getCategoryColor = (cat: string) => {
    const colors = [
        'bg-blue-50 text-blue-600',
        'bg-emerald-50 text-emerald-600',
        'bg-indigo-50 text-indigo-600',
        'bg-rose-50 text-rose-600',
        'bg-amber-50 text-amber-600',
        'bg-teal-50 text-teal-600',
        'bg-purple-50 text-purple-600',
    ];
    const index = (cat || 'General').length % colors.length;
    return colors[index];
};

const SUGGESTED_CATEGORIES = [
    'General', 'Electronics', 'Apparel', 'Food & Beverage', 'Groceries', 
    'Hardware', 'Health & Beauty', 'Office Supplies', 'Services', 'Automotive'
];

const BusinessHub: React.FC<{ setView: (view: View) => void }> = ({ setView }) => {
    const { 
        businessProfile, updateBusinessProfile, 
        inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem,
        suppliers, addSupplier, updateSupplier, deleteSupplier,
        recordSale, currentUser, heldSales, holdSale, deleteHeldSale, salesHistory, openConfirmModal
    } = useAppContext();
    const { t } = useI18n();

    const [activeTab, setActiveTab] = useState<'pos' | 'inventory' | 'suppliers' | 'summary' | 'profile'>('pos');

    // Registry Modals
    const [isInvModalOpen, setInvModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);
    const [isSupModalOpen, setSupModalOpen] = useState(false);
    const [supToEdit, setSupplierToEdit] = useState<Supplier | null>(null);
    const [isRegModalOpen, setRegModalOpen] = useState(false);

    // Filtering State
    const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('all');

    // POS State
    const [cart, setCart] = useState<SaleItem[]>([]);
    const [posSearch, setPosSearch] = useState('');
    const [checkoutSuccess, setCheckoutSuccess] = useState<SaleRecord & { isExact?: boolean } | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'card' | 'm-pesa' | 'ecocash'>('cash');
    const [cashReceived, setCashReceived] = useState<string>('');
    const [isQuotationMode, setIsQuotationMode] = useState(false);
    const [globalDiscount, setGlobalDiscount] = useState<number>(0);
    const [isHeldModalOpen, setHeldModalOpen] = useState(false);
    const [itemOverrideContext, setItemOverrideContext] = useState<{ item: SaleItem, index: number } | null>(null);

    // Pricing & VAT Engine
    const vatRate = businessProfile?.vatRate || 15;
    const cartSubtotal = useMemo(() => cart.reduce((acc, i) => acc + i.total, 0), [cart]);
    const discountedSubtotal = useMemo(() => Math.max(0, cartSubtotal - globalDiscount), [cartSubtotal, globalDiscount]);
    const cartTax = useMemo(() => discountedSubtotal * (vatRate / 100), [discountedSubtotal, vatRate]);
    const cartTotal = useMemo(() => discountedSubtotal + cartTax, [discountedSubtotal, cartTax]);

    // Barcode Scan Engine
    useEffect(() => {
        if (posSearch.length > 2) {
            const exactMatch = inventory.find(i => i.sku === posSearch.trim());
            if (exactMatch && exactMatch.quantity > 0) {
                handleAddToCart(exactMatch);
                setPosSearch('');
            }
        }
    }, [posSearch, inventory]);

    const handleAddToCart = (item: InventoryItem) => {
        const existing = cart.find(c => c.inventoryItemId === item.id);
        if(existing) {
            setCart(cart.map(c => c.inventoryItemId === item.id ? { ...c, quantity: c.quantity + 1, total: (c.quantity + 1) * c.priceAtSale - c.discountAmount } : c));
        } else {
            setCart([...cart, { inventoryItemId: item.id, itemName: item.itemName, quantity: 1, priceAtSale: item.sellingPrice, discountAmount: 0, total: item.sellingPrice }]);
        }
    };

    const handleRemoveFromCart = (index: number) => {
        setCart(cart.filter((_, i) => i !== index));
    };

    const paymentStatus = useMemo(() => {
        if (selectedPaymentMethod !== 'cash') return 'exact';
        const received = parseFloat(cashReceived);
        if (isNaN(received) || cashReceived === '') return 'pending';
        const diff = received - cartTotal;
        if (diff < -0.01) return 'short';
        if (Math.abs(diff) < 0.01) return 'exact';
        return 'change';
    }, [cashReceived, cartTotal, selectedPaymentMethod]);

    const changeDue = useMemo(() => {
        if (selectedPaymentMethod !== 'cash') return 0;
        const received = parseFloat(cashReceived);
        if (isNaN(received)) return 0;
        const diff = received - cartTotal;
        return diff > 0 ? diff : 0;
    }, [cashReceived, cartTotal, selectedPaymentMethod]);

    const handleCheckout = async () => {
        if(cart.length === 0) return;
        const paymentMethod = isQuotationMode ? 'quotation' : selectedPaymentMethod;
        const isExact = paymentStatus === 'exact';
        const saleData: any = {
            items: cart, 
            subtotal: discountedSubtotal, 
            taxAmount: cartTax, 
            totalAmount: cartTotal, 
            transactionDiscount: globalDiscount, 
            paymentMethod: paymentMethod,
            cashReceived: paymentMethod === 'cash' ? parseFloat(cashReceived) : cartTotal,
            changeDue: paymentMethod === 'cash' ? changeDue : 0,
            processedById: currentUser?.id || 'system'
        };
        try {
            await recordSale(saleData);
            const receipt = { ...saleData, date: new Date().toISOString(), id: Math.random().toString(36).substr(2, 9).toUpperCase(), isExact };
            setCheckoutSuccess(receipt);
            setCart([]); setCashReceived(''); setGlobalDiscount(0); setIsQuotationMode(false);
        } catch (err: any) { alert("Checkout failed: " + err.message); }
    };

    const handleHoldSale = async () => {
        if (cart.length === 0) return;
        const name = prompt("Draft Reference?", "Draft " + (heldSales.length + 1));
        if (name === null) return;
        await holdSale({ items: cart, customerName: name, type: 'draft', total: cartTotal });
        setCart([]); setGlobalDiscount(0);
    };

    const handleItemOverride = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!itemOverrideContext) return;
        const data = new FormData(e.currentTarget);
        const qty = parseFloat(data.get('qty') as string) || 1;
        const price = parseFloat(data.get('price') as string) || 0;
        const disc = parseFloat(data.get('disc') as string) || 0;
        const updated = [...cart];
        updated[itemOverrideContext.index] = {
            ...itemOverrideContext.item,
            quantity: qty, priceAtSale: price, discountAmount: disc,
            total: (qty * price) - disc
        };
        setCart(updated);
        setItemOverrideContext(null);
    };

    const resumeHeld = (held: HeldSale) => {
        setCart(held.items);
        deleteHeldSale(held.id);
        setHeldModalOpen(false);
    };

    const renderPOS = () => (
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 sm:gap-8 animate-fadeIn">
            {/* Terminal Left: Search and Grid */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <HashtagIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-400 h-6 w-6 animate-pulse" />
                        <input 
                            id="pos-search-input"
                            type="text" 
                            placeholder="Scan or Search Registry... [F1]" 
                            value={posSearch}
                            onChange={e => setPosSearch(e.target.value)}
                            className="w-full pl-16 pr-6 py-5 sm:py-6 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[2rem] sm:rounded-[2.5rem] font-black uppercase tracking-widest shadow-xl outline-none focus:ring-8 focus:ring-indigo-500/10 transition-all text-sm sm:text-base"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleHoldSale}
                            title="Draft Current Sale"
                            className="px-6 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl sm:rounded-[2rem] shadow-xl hover:border-amber-500 transition-all flex flex-col items-center justify-center gap-1 group"
                        >
                            <PlusIcon className="h-6 w-6 text-slate-400 group-hover:text-amber-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Draft</span>
                        </button>
                        <button 
                            onClick={() => setHeldModalOpen(true)}
                            className="px-6 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl sm:rounded-[2rem] shadow-xl hover:border-indigo-500 transition-all flex flex-col items-center justify-center gap-1 group"
                        >
                            <ClockIcon className="h-6 w-6 text-slate-400 group-hover:text-indigo-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recall [F7]</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto no-scrollbar pr-1 pb-10">
                    {inventory.filter(i => i.itemName.toLowerCase().includes(posSearch.toLowerCase()) || (i.sku && i.sku.includes(posSearch))).map(item => (
                        <button 
                            key={item.id}
                            disabled={item.quantity <= 0}
                            onClick={() => handleAddToCart(item)}
                            className={`group p-6 bg-white dark:bg-slate-800 rounded-[2rem] sm:rounded-[2.5rem] border-2 border-transparent hover:border-indigo-500 shadow-xl text-left transition-all active:scale-95 ${item.quantity <= 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <p className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${getCategoryColor(item.category)}`}>{item.category || 'General'}</p>
                                {item.sku && <p className="text-[8px] font-black text-slate-300">#{item.sku}</p>}
                            </div>
                            <p className="font-black text-slate-800 dark:text-white uppercase mb-4 h-12 line-clamp-2 leading-tight tracking-tight text-sm sm:text-base">{item.itemName}</p>
                            <div className="flex justify-between items-end border-t dark:border-slate-700 pt-3">
                                <p className="font-black text-indigo-600 text-base sm:text-lg">{formatCurrency(item.sellingPrice)}</p>
                                <p className={`text-[8px] font-black ${item.quantity <= (item.minStockLevel || 0) ? 'text-red-500 animate-pulse' : 'text-slate-300'} uppercase`}>Stock: {item.quantity}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Terminal Right: Cart */}
            <div className={`lg:col-span-4 xl:col-span-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl rounded-[2.5rem] sm:rounded-[3.5rem] shadow-2xl border-4 ${isQuotationMode ? 'border-amber-400' : 'border-white/40'} flex flex-col h-auto lg:h-[85vh] lg:sticky lg:top-8 no-print overflow-hidden`}>
                <div className={`p-6 sm:p-8 border-b dark:border-slate-700 flex items-center justify-between ${isQuotationMode ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-slate-50/50'}`}>
                    <h3 className="text-lg sm:text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                        {isQuotationMode ? <ClipboardDocumentListIcon className="h-6 w-6 text-amber-500" /> : <ShoppingCartIcon className="h-6 w-6 text-indigo-500" />}
                        {isQuotationMode ? 'Estimate [F4]' : 'Cart'}
                    </h3>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setIsQuotationMode(!isQuotationMode)} 
                            title="Toggle Quotation Mode"
                            className={`p-2.5 rounded-xl transition-all shadow-sm ${isQuotationMode ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'}`}
                        >
                            <ClipboardDocumentListIcon className="h-5 w-5"/>
                        </button>
                        <button onClick={() => { setCart([]); setGlobalDiscount(0); }} className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"><TrashIcon className="h-5 w-5"/></button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-4 max-h-[300px] lg:max-h-none no-scrollbar">
                    {cart.map((item, idx) => (
                        <div 
                            key={`${item.inventoryItemId}-${idx}`} 
                            onClick={() => setItemOverrideContext({ item, index: idx })}
                            className="group relative flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] border-2 border-transparent hover:border-indigo-500 cursor-pointer transition-all"
                        >
                            <div className="flex-1 overflow-hidden pr-4">
                                <p className="font-black text-xs sm:text-[13px] uppercase truncate leading-none">{item.itemName}</p>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <p className="text-[10px] font-black text-slate-400">{item.quantity} x {formatCurrency(item.priceAtSale)}</p>
                                    {item.discountAmount > 0 && <span className="text-[8px] font-black text-red-500 uppercase"> -{formatCurrency(item.discountAmount)}</span>}
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="font-black text-indigo-600 text-sm">{formatCurrency(item.total)}</p>
                            </div>
                        </div>
                    ))}
                    {cart.length === 0 && (
                        <div className="py-12 sm:py-24 text-center opacity-30">
                            <ShoppingCartIcon className="h-16 w-16 sm:h-20 sm:w-20 mx-auto mb-4 text-slate-300" />
                            <p className="font-black italic uppercase tracking-widest text-xs">Waiting for Registry Entry</p>
                        </div>
                    )}
                </div>

                <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-900/80 border-t-2 dark:border-slate-700 space-y-6">
                    <div className="space-y-3">
                        <div className="flex justify-between text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                            <span>Subtotal</span>
                            <span>{formatCurrency(cartSubtotal)}</span>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Promo Discount</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300">M</span>
                                <input 
                                    type="number" 
                                    value={globalDiscount || ''} 
                                    onChange={e => setGlobalDiscount(parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                    className="w-20 p-2 pl-6 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg text-right font-black text-xs outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-between p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] sm:text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                            <span>VAT ({vatRate}%)</span>
                            <span>{formatCurrency(cartTax)}</span>
                        </div>
                        <div className="flex justify-between text-2xl sm:text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tighter pt-4 border-t-2 border-dashed dark:border-slate-700 mt-4">
                            <span>{isQuotationMode ? 'Est.' : 'Total'}</span>
                            <span className={isQuotationMode ? 'text-amber-600' : 'text-indigo-600'}>{formatCurrency(cartTotal)}</span>
                        </div>
                    </div>
                    
                    {!isQuotationMode && cart.length > 0 && (
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Settlement Method</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(['cash', 'card', 'm-pesa', 'ecocash'] as const).map(method => (
                                    <button 
                                        key={method}
                                        onClick={() => setSelectedPaymentMethod(method)}
                                        className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter border-2 transition-all ${selectedPaymentMethod === method ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700 hover:border-indigo-200'}`}
                                    >
                                        {method.replace('-', ' ')}
                                    </button>
                                ))}
                            </div>
                            
                            {selectedPaymentMethod === 'cash' && (
                                <MotionDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-2 border-t dark:border-slate-700">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Cash Received</span>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300">M</span>
                                            <input 
                                                type="number" 
                                                value={cashReceived}
                                                onChange={e => setCashReceived(e.target.value)}
                                                placeholder="0.00"
                                                className="w-32 pl-8 pr-3 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl font-black text-right outline-none focus:border-indigo-500 transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>
                                    {paymentStatus === 'change' && (
                                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-xl flex justify-between items-center border border-emerald-100 dark:border-emerald-800 animate-fadeIn">
                                            <span className="text-[9px] font-black uppercase">Change Due</span>
                                            <span className="font-black text-lg">{formatCurrency(changeDue)}</span>
                                        </div>
                                    )}
                                    {paymentStatus === 'exact' && (
                                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl flex justify-center items-center border border-indigo-100 dark:border-indigo-800 animate-fadeIn">
                                            <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                                <CheckCircleIcon className="h-4 w-4" /> Exact Payment Ready
                                            </span>
                                        </div>
                                    )}
                                    {paymentStatus === 'short' && (
                                        <div className="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 rounded-xl flex justify-between items-center border border-rose-100 dark:border-rose-800 animate-fadeIn">
                                            <span className="text-[9px] font-black uppercase tracking-widest">Shortfall</span>
                                            <span className="font-black text-sm">{formatCurrency(cartTotal - parseFloat(cashReceived))}</span>
                                        </div>
                                    )}
                                </MotionDiv>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-3 pb-2">
                        {isQuotationMode ? (
                            <button onClick={handleCheckout} disabled={cart.length === 0} className="w-full py-4 sm:py-5 bg-amber-600 text-white rounded-[1.5rem] sm:rounded-[2rem] font-black uppercase text-[10px] sm:text-[11px] tracking-widest shadow-xl disabled:opacity-50 active:scale-95 transition-all">Generate Proforma</button>
                        ) : (
                            <button 
                                onClick={handleCheckout} 
                                disabled={cart.length === 0 || (selectedPaymentMethod === 'cash' && paymentStatus === 'short')} 
                                className="w-full py-4 sm:py-5 bg-indigo-600 text-white rounded-[1.5rem] sm:rounded-[2rem] font-black uppercase text-[10px] sm:text-[11px] tracking-widest shadow-xl shadow-indigo-500/20 disabled:opacity-50 active:scale-95 transition-all"
                            >
                                Finalize {selectedPaymentMethod.replace('-', ' ')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderInventory = () => <div className="text-center py-20 opacity-50 font-black uppercase tracking-widest italic animate-pulse">Stock Management Module Loading...</div>;
    const renderSuppliers = () => <div className="text-center py-20 opacity-50 font-black uppercase tracking-widest italic animate-pulse">Partner Registry Loading...</div>;
    const renderSummary = () => <div className="text-center py-20 opacity-50 font-black uppercase tracking-widest italic animate-pulse">Commercial Analytics Loading...</div>;
    const renderProfile = () => <div className="text-center py-20 opacity-50 font-black uppercase tracking-widest italic animate-pulse">Business Registry Profile Loading...</div>;

    return (
        <div className="container mx-auto animate-fadeIn pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Business Hub</h1>
                <p className="text-slate-500 font-medium italic">Operational POS, inventory management, and commercial oversight</p>
              </div>
            </div>
            
            <div className="bg-white/70 dark:bg-slate-800/70 rounded-3xl shadow-2xl border border-white/30 backdrop-blur-xl overflow-hidden">
                <div className="flex border-b dark:border-slate-700 overflow-x-auto no-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
                    <TabButton label="Operational POS" isActive={activeTab === 'pos'} onClick={() => setActiveTab('pos')} />
                    <TabButton label="Inventory Registry" isActive={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
                    <TabButton label="Supply Chain" isActive={activeTab === 'suppliers'} onClick={() => setActiveTab('suppliers')} />
                    <TabButton label="Business Summary" isActive={activeTab === 'summary'} onClick={() => setActiveTab('summary')} />
                    <TabButton label="Registry Profile" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                </div>

                <div className="p-6 sm:p-10">
                    {activeTab === 'pos' && renderPOS()}
                    {activeTab === 'inventory' && renderInventory()}
                    {activeTab === 'suppliers' && renderSuppliers()}
                    {activeTab === 'summary' && renderSummary()}
                    {activeTab === 'profile' && renderProfile()}
                </div>
            </div>

            {/* Receipt Modal */}
            <AnimatePresence>
                {checkoutSuccess && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[600] flex items-center justify-center p-4 overflow-y-auto no-print" onClick={() => setCheckoutSuccess(null)}>
                        <MotionDiv 
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} 
                            className="bg-white dark:bg-slate-900 p-10 sm:p-16 rounded-[4rem] shadow-2xl w-full max-w-xl text-center border-8 border-indigo-500"
                            onClick={(e: any) => e.stopPropagation()}
                        >
                            <div className="flex justify-center mb-10">
                                <div className="p-6 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full">
                                    <CheckCircleIcon className="h-16 w-16" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Transaction Finalized</h2>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-10">Reference: #{checkoutSuccess.id}</p>
                            
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border dark:border-slate-700 mb-10 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Amount</span>
                                    <span className="text-xl font-black text-slate-900 dark:text-white">{formatCurrency(checkoutSuccess.totalAmount)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Method</span>
                                    <span className="text-sm font-black uppercase text-indigo-600">{checkoutSuccess.paymentMethod.replace('-', ' ')}</span>
                                </div>
                                
                                {checkoutSuccess.paymentMethod === 'cash' && (
                                    <div className="pt-4 border-t dark:border-slate-700 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase text-slate-400">Cash Rendered</span>
                                            <span className="text-sm font-black">{formatCurrency(checkoutSuccess.cashReceived || 0)}</span>
                                        </div>
                                        {checkoutSuccess.changeDue! > 0 ? (
                                            <div className="flex justify-between items-center pt-2 border-t border-emerald-100 dark:border-emerald-800">
                                                <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Change Issued</span>
                                                <span className="text-xl font-black text-emerald-600">{formatCurrency(checkoutSuccess.changeDue!)}</span>
                                            </div>
                                        ) : checkoutSuccess.isExact && (
                                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                                                <p className="text-[9px] font-black uppercase text-indigo-600">Exact Payment Accepted</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button onClick={() => window.print()} className="py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all">
                                    <PrinterIcon className="h-5 w-5" /> Print Receipt
                                </button>
                                <button onClick={() => setCheckoutSuccess(null)} className="py-5 bg-slate-100 dark:bg-slate-800 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all">
                                    New Transaction
                                </button>
                            </div>
                        </MotionDiv>
                    </div>
                )}
            </AnimatePresence>

            {/* Recall Ledger Modal */}
            <AnimatePresence>
                {isHeldModalOpen && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[400] flex items-center justify-center p-2 sm:p-4 no-print" onClick={() => setHeldModalOpen(false)}>
                        <MotionDiv 
                            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} 
                            className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[4rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                            onClick={(e: any) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-3xl font-black uppercase tracking-tighter">Draft Ledger</h2>
                                <button onClick={() => setHeldModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><XCircleIcon className="h-8 w-8 text-slate-400"/></button>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
                                {heldSales.map(held => (
                                    <div key={held.id} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border-2 border-transparent hover:border-indigo-500 transition-all flex flex-col sm:flex-row justify-between items-center gap-4 group">
                                        <div className="text-center sm:text-left">
                                            <p className="font-black text-lg sm:text-xl uppercase leading-none mb-1">{held.customerName}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(held.date).toLocaleString()} • {held.items.length} Units</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="font-black text-xl text-indigo-600">{formatCurrency(held.total)}</p>
                                            <button onClick={() => resumeHeld(held)} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95">Restore</button>
                                            <button onClick={() => deleteHeldSale(held.id)} className="p-2 text-slate-300 hover:text-red-500"><TrashIcon className="h-5 w-5"/></button>
                                        </div>
                                    </div>
                                ))}
                                {heldSales.length === 0 && <div className="py-20 text-center opacity-30 italic font-black uppercase tracking-widest">No entries found</div>}
                            </div>
                        </MotionDiv>
                    </div>
                )}
            </AnimatePresence>

            {/* POS Item Override Modal */}
            <AnimatePresence>
                {itemOverrideContext && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[500] flex items-center justify-center p-4 no-print" onClick={() => setItemOverrideContext(null)}>
                        <MotionDiv 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} 
                            className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[4.5rem] shadow-2xl w-full max-w-xl border-4 border-indigo-500"
                            onClick={(e: any) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-indigo-600 leading-none mb-2">Item Adjustment</h2>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{itemOverrideContext.item.itemName}</p>
                                </div>
                                <button onClick={() => setItemOverrideContext(null)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"><XCircleIcon className="h-8 w-8 text-slate-400"/></button>
                            </div>

                            <form onSubmit={handleItemOverride} className="space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-[0.3em]">Load Quantity</label>
                                        <input name="qty" type="number" step="0.01" autoFocus defaultValue={itemOverrideContext.item.quantity} className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[1.5rem] font-black text-xl text-center outline-none focus:border-indigo-500 transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-[0.3em]">Unit Price (M)</label>
                                        <input name="price" type="number" step="0.01" defaultValue={itemOverrideContext.item.priceAtSale} className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[1.5rem] font-black text-xl text-center outline-none focus:border-indigo-500 transition-all" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-[0.3em]">Fixed Item Discount (M)</label>
                                    <input name="disc" type="number" step="0.01" defaultValue={itemOverrideContext.item.discountAmount} className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[1.5rem] font-black text-xl text-center outline-none focus:border-indigo-500 transition-all" />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                                    <button type="button" onClick={() => { handleRemoveFromCart(itemOverrideContext.index); setItemOverrideContext(null); }} className="flex-1 py-5 bg-red-50 text-red-600 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all">
                                        <TrashIcon className="h-4 w-4" /> Void Item
                                    </button>
                                    <button type="submit" className="flex-[2] py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all shadow-xl shadow-indigo-500/30">Commit Changes</button>
                                </div>
                            </form>
                        </MotionDiv>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BusinessHub;