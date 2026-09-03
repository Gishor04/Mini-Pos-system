import { CheckCircle2, X, Printer } from 'lucide-react';

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
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-base text-white">Transaction Completed</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Frame */}
        <div
          id="printable-invoice"
          className="bg-white text-slate-950 p-6 rounded-xl shadow-inner font-mono text-xs space-y-4"
        >
          <div className="text-center border-b border-dashed border-slate-400 pb-3 space-y-1">
            <h3 className="font-extrabold text-base tracking-widest uppercase text-black">
              MINI POS STORE
            </h3>
            <p className="text-[10px] text-slate-600 uppercase">Official Sale Receipt</p>
          </div>

          <div className="space-y-1 text-[11px] text-slate-700">
            <div className="flex justify-between">
              <span>Invoice No:</span>
              <span className="font-bold text-black">{completedSale.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Date &amp; Time:</span>
              <span>{new Date(completedSale.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span>{completedSale.user?.name || currentUserName || 'Staff'}</span>
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
              {completedSale.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-1.5 font-sans font-semibold text-black">
                    {item.product.name}
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
              <span>TOTAL PAID</span>
              <span>${Number(completedSale.totalAmount).toFixed(2)}</span>
            </div>
          </div>

          <div className="text-center pt-4 text-[10px] text-slate-500 border-t border-slate-200 uppercase">
            <p>Thank you for shopping with us!</p>
            <p>Please keep this receipt for returns</p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end space-x-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
          >
            Close
          </button>
          <button
            onClick={onPrint}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Thermal Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
