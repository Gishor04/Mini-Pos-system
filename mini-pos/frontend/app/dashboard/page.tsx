'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { isAuthenticated, getUser, User } from '@/lib/auth';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Printer,
  X,
  CreditCard,
  Tag,
  PackageX,
  Package,
  Sparkles,
  Receipt,
} from 'lucide-react';
import { ReceiptModal } from '@/components/pos/ReceiptModal';

interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number | string;
  stockQuantity: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface SaleResult {
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

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(0);
  const [processingSale, setProcessingSale] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [completedSale, setCompletedSale] = useState<SaleResult | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
    } else {
      setCurrentUser(getUser());
      loadProducts();
    }
  }, [router]);

  const loadProducts = async (query = '') => {
    setLoadingProducts(true);
    try {
      const url = query ? `/products?search=${encodeURIComponent(query)}` : '/products';
      const data = await apiFetch(url) as Product[];
      setProducts(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    loadProducts(value);
  };

  const addToCart = (product: Product) => {
    setErrorMessage('');
    if (product.stockQuantity <= 0) {
      setErrorMessage(`"${product.name}" is currently out of stock`);
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          setErrorMessage(`Stock limit reached (${product.stockQuantity}) for "${product.name}"`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setErrorMessage('');
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.stockQuantity) {
              setErrorMessage(`Cannot exceed available stock (${item.product.stockQuantity})`);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountPercent(0);
    setTaxPercent(0);
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxableSubtotal = subtotal - discountAmount;
  const taxAmount = (taxableSubtotal * taxPercent) / 100;
  const totalAmount = taxableSubtotal + taxAmount;

  const handleCompleteSale = async () => {
    if (cart.length === 0) return;
    setProcessingSale(true);
    setErrorMessage('');

    try {
      const payload = {
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      };

      const sale = await apiFetch('/sales', {
        method: 'POST',
        body: JSON.stringify(payload),
      }) as SaleResult;

      setCompletedSale(sale);
      setCart([]);
      loadProducts(search);
    } catch (err: any) {
      setErrorMessage(err.message || 'Sale transaction failed');
    } finally {
      setProcessingSale(false);
    }
  };

  const printReceipt = () => {
    window.print();
  };

  const categoryOptions = ['All', 'Beverages', 'Grocery', 'Bakery', 'Dairy', 'Snacks'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {errorMessage && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Action & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-blue-400" />
            POS Cashier Terminal
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Select items to add to current bill or scan SKU code
          </p>
          {currentUser?.role === 'ADMIN' && (
            <button
              onClick={() => router.push('/products')}
              className="mt-3 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-bold rounded-lg border border-slate-700 transition-colors flex items-center gap-2 w-fit"
            >
              <Package className="w-4 h-4" />
              Manage Inventory
            </button>
          )}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-inner"
          />
        </div>
      </div>

      {/* Main Grid: Products Grid (Left 7) vs Cart Drawer (Right 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Product Catalog */}
        <div className="lg:col-span-7 space-y-4">
          {/* Category Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {categoryOptions.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Items Grid */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 shadow-xl min-h-[500px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-400" />
                Product Catalog ({products.length})
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Real-time Stock Sync</span>
            </div>

            {loadingProducts ? (
              <div className="py-24 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
                <Sparkles className="w-6 h-6 text-blue-400 animate-spin" />
                <span>Loading available inventory...</span>
              </div>
            ) : products.length === 0 ? (
              <div className="py-24 text-center text-slate-500 space-y-2 flex flex-col items-center">
                <PackageX className="w-10 h-10 text-slate-600" />
                <p className="text-sm font-medium text-slate-300">No products found</p>
                <p className="text-xs text-slate-500">Try searching for another product name or SKU</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[560px] overflow-y-auto pr-1">
                {(selectedCategory === 'All' ? products : products.filter(p => p.category === selectedCategory)).length === 0 ? (
                  <div className="col-span-full py-12 text-center text-slate-500 text-sm">
                    No products found in this category
                  </div>
                ) : (
                  (selectedCategory === 'All' ? products : products.filter(p => p.category === selectedCategory)).map((product) => {
                    const inCart = cart.find((item) => item.product.id === product.id);
                    const isOutOfStock = product.stockQuantity <= 0;
                  const isLowStock = product.stockQuantity > 0 && product.stockQuantity < 5;

                  return (
                    <div
                      key={product.id}
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
                          onClick={() => addToCart(product)}
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
                              <span>In Cart ({inCart.quantity})</span>
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
                }))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Bill / Cart Sidebar */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl flex flex-col min-h-[560px]">
            {/* Cart Header */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/60 rounded-t-2xl">
              <div className="flex items-center space-x-2">
                <Receipt className="w-4 h-4 text-blue-400" />
                <h2 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
                  Current Sale Bill
                </h2>
                {cart.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-mono text-xs font-bold">
                    {cart.reduce((a, c) => a + c.quantity, 0)} items
                  </span>
                )}
              </div>

              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-slate-400 hover:text-red-400 transition-colors flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 divide-y divide-slate-800/50">
              {cart.length === 0 ? (
                <div className="h-full py-20 flex flex-col items-center justify-center text-slate-500 space-y-2">
                  <ShoppingCart className="w-10 h-10 text-slate-700" />
                  <p className="text-sm font-semibold text-slate-300">Bill cart is empty</p>
                  <p className="text-xs text-slate-500 text-center max-w-xs">
                    Click products from the catalog on the left to start building an order
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="pt-3 first:pt-0 flex items-center justify-between">
                    <div className="flex-1 pr-2 space-y-0.5">
                      <p className="font-semibold text-xs text-slate-100 line-clamp-1">
                        {item.product.name}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        ${Number(item.product.price).toFixed(2)} each
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="p-1.5 hover:bg-slate-800 text-slate-300 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 font-mono text-xs font-bold text-slate-100">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="p-1.5 hover:bg-slate-800 text-slate-300 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line Subtotal */}
                      <div className="font-mono font-bold text-xs text-slate-100 w-16 text-right">
                        ${(Number(item.product.price) * item.quantity).toFixed(2)}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations & Checkout Action */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 rounded-b-2xl space-y-3">
              {/* Discount / Tax quick toggles */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                    Discount (%)
                  </label>
                  <select
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value={0}>0% Discount</option>
                    <option value={5}>5% Discount</option>
                    <option value={10}>10% Discount</option>
                    <option value={15}>15% Discount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                    Tax GST (%)
                  </label>
                  <select
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value={0}>No Tax (0%)</option>
                    <option value={5}>5% Tax</option>
                    <option value={8}>8% Tax</option>
                    <option value={12}>12% Tax</option>
                  </select>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs pt-1 border-t border-slate-800/80">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-slate-200">${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount ({discountPercent}%)</span>
                    <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {taxAmount > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>Tax ({taxPercent}%)</span>
                    <span className="font-mono text-slate-200">+${taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm font-black pt-2 border-t border-slate-800 text-white">
                  <span>Grand Total</span>
                  <span className="font-mono text-lg text-emerald-400">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCompleteSale}
                disabled={cart.length === 0 || processingSale}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>{processingSale ? 'Processing Sale...' : 'Complete & Print Sale'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {completedSale && (
        <ReceiptModal
          completedSale={completedSale}
          currentUserName={currentUser?.name}
          onClose={() => setCompletedSale(null)}
          onPrint={printReceipt}
        />
      )}
    </div>
  );
}
