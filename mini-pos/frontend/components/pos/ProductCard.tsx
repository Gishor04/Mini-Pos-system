import { CheckCircle2, Plus } from 'lucide-react';

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number | string;
  stockQuantity: number;
}

interface ProductCardProps {
  product: Product;
  inCartQuantity?: number;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, inCartQuantity = 0, onAddToCart }: ProductCardProps) {
  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity < 5;
  const inCart = inCartQuantity > 0;

  return (
    <div
      className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
        isOutOfStock
          ? 'bg-slate-950/40 border-slate-800/50 opacity-60'
          : inCart
          ? 'bg-blue-950/20 border-blue-500/40 shadow-md shadow-blue-500/5'
          : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950'
      }`}
    >
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-slate-100 text-sm leading-snug line-clamp-1">
            {product.name}
          </h3>
          <span className="font-mono font-black text-sm text-blue-400">
            ${Number(product.price).toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 font-mono">
          <span className="text-[11px] text-slate-500">SKU: {product.sku}</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isOutOfStock
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : isLowStock
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {isOutOfStock
              ? 'Out of stock'
              : isLowStock
              ? `Low (${product.stockQuantity})`
              : `Stock: ${product.stockQuantity}`}
          </span>
        </div>
      </div>

      <div className="pt-3 mt-2 border-t border-slate-800/60 flex justify-end">
        <button
          onClick={() => onAddToCart(product)}
          disabled={isOutOfStock}
          className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
            isOutOfStock
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : inCart
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20'
          }`}
        >
          {isOutOfStock ? (
            <span>Out of Stock</span>
          ) : inCart ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>In Cart ({inCartQuantity})</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
