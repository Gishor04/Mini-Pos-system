import { CheckCircle2, X, Printer, Download } from 'lucide-react';
import html2canvas from 'html2canvas';

export interface SaleResult {
  id: number;
  invoiceNumber: string;
  totalAmount: number | string;
  createdAt: string;
  user: { name: string; email: string };
  items: Array<{
    id: number;
    quantity: number;
    unitPrice: number | string;
    subtotal: number | string;
    product: { name: string; sku: string };
  }>;
}

interface ReceiptModalProps {
  completedSale: SaleResult;
  currentUserName?: string;
  onClose: () => void;
  onPrint: () => void;
}

export function ReceiptModal({ completedSale, currentUserName, onClose, onPrint }: ReceiptModalProps) {
  const handleDownload = async () => {
    const element = document.getElementById('printable-invoice');
    if (!element) return;
    
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Receipt-${completedSale.invoiceNumber}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download receipt', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900/90 rounded-3xl max-w-md w-full p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-slate-700/50 flex flex-col items-center max-h-[90vh] overflow-y-auto">
        
        {/* Success Header */}
        <div className="flex flex-col items-center space-y-3 mb-6 w-full relative">
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 p-2 bg-slate-800/80 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-all shadow-md"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center ring-4 ring-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="font-black text-xl text-white tracking-tight">Sale Successful</h2>
          <p className="text-xs text-slate-400">Order has been recorded and processed.</p>
        </div>

        {/* Printable Receipt Wrapper with Zig-Zag borders */}
        <div className="w-full relative px-2 drop-shadow-xl">
          {/* Top zig-zag */}
          <div className="w-full h-3 bg-white" style={{ clipPath: 'polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%)' }}></div>
          
          {/* Receipt Body */}
          <div
            id="printable-invoice"
            className="bg-white text-slate-900 px-6 py-8 font-mono text-xs w-full"
          >
            <div className="text-center pb-4 border-b-2 border-dashed border-slate-300">
              <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center mx-auto mb-3 font-bold text-xl">
                MP
              </div>
              <h3 className="font-black text-lg tracking-widest uppercase text-black mb-1">
                MINI POS STORE
              </h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">123 Commerce St, Tech City</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">Tel: +1 234 567 8900</p>
            </div>

            <div className="py-4 space-y-2 text-[11px] text-slate-600 border-b-2 border-dashed border-slate-300">
              <div className="flex justify-between">
                <span>Receipt No:</span>
                <span className="font-bold text-black">{completedSale.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span className="font-medium text-black">{new Date(completedSale.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Served By:</span>
                <span className="font-medium text-black uppercase">{completedSale.user?.name || currentUserName || 'Cashier'}</span>
              </div>
            </div>

            <table className="w-full text-left my-4">
              <thead>
                <tr className="border-b-2 border-slate-300 text-[10px] uppercase text-slate-500 tracking-wider">
                  <th className="py-2 w-1/2">Description</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Amt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {completedSale.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 font-sans font-bold text-black pr-2 align-top">
                      <div className="break-words">{item.product.name}</div>
                      <div className="font-mono text-[9px] text-slate-500 font-normal mt-1">@{Number(item.unitPrice).toFixed(2)}/ea</div>
                    </td>
                    <td className="py-3 text-center font-bold text-black align-top">{item.quantity}</td>
                    <td className="py-2.5 text-right font-bold text-black align-top">${Number(item.subtotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t-2 border-slate-300 pt-3 space-y-2">
              <div className="flex justify-between font-black text-xl text-black">
                <span>TOTAL</span>
                <span>${Number(completedSale.totalAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-bold pt-1">
                <span>PAYMENT METHOD</span>
                <span className="uppercase">Credit Card</span>
              </div>
            </div>

            {/* Fake Barcode */}
            <div className="mt-8 pt-4 border-t-2 border-dashed border-slate-300 text-center flex flex-col items-center">
              <div className="h-10 w-4/5 bg-slate-900 opacity-80" style={{ 
                backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, #000 2px, #000 4px, transparent 4px, transparent 7px, #000 7px, #000 9px, transparent 9px, transparent 11px, #000 11px, #000 15px)' 
              }}></div>
              <p className="mt-2 text-[10px] text-slate-500 tracking-[0.2em]">{completedSale.invoiceNumber.replace('INV-', '')}</p>
            </div>

            <div className="text-center pt-6 text-[10px] text-slate-500 uppercase font-medium">
              <p>Thank you for shopping with us!</p>
              <p className="mt-1">Returns accepted within 30 days</p>
            </div>
          </div>
          
          {/* Bottom zig-zag */}
          <div className="w-full h-3 bg-white" style={{ clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)' }}></div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col sm:flex-row w-full gap-3 mt-8">
          <button
            onClick={onPrint}
            className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center space-x-2 border border-blue-400/30"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center space-x-2 border border-emerald-400/30"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold rounded-xl border border-slate-700 transition-colors shadow-inner"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
