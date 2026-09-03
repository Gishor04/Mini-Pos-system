'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import {
  BarChart3,
  DollarSign,
  Receipt,
  Package,
  AlertTriangle,
  Search,
  Eye,
  Printer,
  X,
  Calendar,
  User,
  Sparkles,
} from 'lucide-react';

interface SaleItem {
  id: number;
  quantity: number;
  unitPrice: number | string;
  subtotal: number | string;
  product: { id: number; name: string; sku: string };
}

interface Sale {
  id: number;
  invoiceNumber: string;
  totalAmount: number | string;
  createdAt: string;
  user: { id: number; name: string; email: string };
  items: SaleItem[];
}

interface Stats {
  totalRevenue: string;
  totalSalesCount: number;
  totalItemsSold: number;
  lowStockCount: number;
  totalProducts: number;
}

export default function SalesPage() {
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
    } else {
      loadData();
    }
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [salesData, statsData] = await Promise.all([
        apiFetch<Sale[]>('/sales'),
        apiFetch<Stats>('/sales/stats').catch(() => null),
      ]);
      setSales(salesData);
      if (statsData) setStats(statsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load sales history');
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = sales.filter(
    (sale) =>
      sale.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      sale.user?.name.toLowerCase().includes(search.toLowerCase())
  );

  const printReceipt = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            Sales History & Terminal Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor terminal revenue, view completed invoices, and inspect order histories
          </p>
        </div>
      </div>

      {/* KPI Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-emerald-400">
            ${stats ? Number(stats.totalRevenue).toFixed(2) : '0.00'}
          </p>
          <p className="text-[11px] text-slate-500">Cumulative sales earnings</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Sales Count
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-white">
            {stats ? stats.totalSalesCount : sales.length}
          </p>
          <p className="text-[11px] text-slate-500">Completed invoices processed</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Items Sold
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-white">
            {stats ? stats.totalItemsSold : 0}
          </p>
          <p className="text-[11px] text-slate-500">Total units checked out</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Low Stock Alerts
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-amber-400">
            {stats ? stats.lowStockCount : 0}
          </p>
          <p className="text-[11px] text-slate-500">Products requiring restock</p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md space-y-4 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search invoice number or cashier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Total Receipts Found: {filteredSales.length}
          </span>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-400 animate-spin" />
            <span>Loading sales transactions history...</span>
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="py-20 text-center text-slate-500 space-y-2">
            <Receipt className="w-10 h-10 text-slate-700 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No sales transactions found</p>
            <p className="text-xs text-slate-500">Complete sales in the POS terminal to populate history</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Cashier</th>
                  <th className="py-3.5 px-4 text-center">Item Count</th>
                  <th className="py-3.5 px-4 text-right">Total Amount</th>
                  <th className="py-3.5 px-4 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSales.map((sale) => {
                  const itemCount = sale.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

                  return (
                    <tr key={sale.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-400">
                        {sale.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 flex items-center gap-1.5 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(sale.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span className="font-semibold">{sale.user?.name || 'Cashier'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-300 font-semibold">
                        {itemCount} units
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-400 text-sm">
                        ${Number(sale.totalAmount).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedSale(sale)}
                          className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 hover:border-blue-500/40 rounded-lg transition-colors inline-flex items-center space-x-1 font-semibold"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Invoice</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sale Receipt View Modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="font-bold text-base text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-400" />
                Invoice {selectedSale.invoiceNumber}
              </h2>
              <button
                onClick={() => setSelectedSale(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Thermal Receipt */}
            <div
              id="printable-invoice"
              className="bg-white text-slate-950 p-6 rounded-xl shadow-inner font-mono text-xs space-y-4"
            >
              <div className="text-center border-b border-dashed border-slate-400 pb-3 space-y-1">
                <h3 className="font-extrabold text-base tracking-widest uppercase text-black">
                  MINI POS STORE
                </h3>
                <p className="text-[10px] text-slate-600 uppercase">Sales Transaction Record</p>
              </div>

              <div className="space-y-1 text-[11px] text-slate-700">
                <div className="flex justify-between">
                  <span>Invoice No:</span>
                  <span className="font-bold text-black">{selectedSale.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date & Time:</span>
                  <span>{new Date(selectedSale.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cashier:</span>
                  <span>{selectedSale.user?.name || 'Staff'}</span>
                </div>
              </div>

              <table className="w-full text-left border-t border-b border-slate-300 py-2">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600">
                    <th className="py-1.5">Item</th>
                    <th className="py-1.5 text-center">Qty</th>
                    <th className="py-1.5 text-right">Price</th>
                    <th className="py-1.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedSale.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-1.5 font-sans font-semibold text-black">
                        {item.product?.name || `Product #${item.id}`}
                      </td>
                      <td className="py-1.5 text-center">{item.quantity}</td>
                      <td className="py-1.5 text-right">${Number(item.unitPrice).toFixed(2)}</td>
                      <td className="py-1.5 text-right font-bold">${Number(item.subtotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="space-y-1 text-sm pt-1">
                <div className="flex justify-between font-black text-base text-black border-t border-dashed border-slate-400 pt-2">
                  <span>GRAND TOTAL</span>
                  <span>${Number(selectedSale.totalAmount).toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center pt-4 text-[10px] text-slate-500 border-t border-slate-200 uppercase">
                <p>Thank you for your business!</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setSelectedSale(null)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
              >
                Close
              </button>
              <button
                onClick={printReceipt}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
