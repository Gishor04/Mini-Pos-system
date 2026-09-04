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
          unitPrice: Number(item.product.price),
          productName: item.product.name,
          productSku: item.product.sku
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
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
      {errorMessage && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-2xl flex items-center justify-between shadow-lg shadow-red-500/5 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500/20 rounded-full">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            </div>
            <span className="font-medium">{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="p-1 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Top Action & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-slate-900/60 p-6 rounded-3xl border border-slate-700/50 backdrop-blur-xl shadow-2xl">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3 drop-shadow-sm">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.5)] border border-blue-400/30">
              <ShoppingCart className="w-7 h-7 text-white" />
            </div>
            Smart POS Terminal
          </h1>
          <p className="text-sm text-slate-300 font-medium ml-1">
            Streamlined checkout experience • Welcome back, <span className="text-blue-300">{currentUser?.name || 'Cashier'}</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {/* Search input */}
          <div className="relative w-full sm:w-[320px] group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={search}
              onChange={handleSearch}
              className="w-full pl-11 pr-4 py-3.5 bg-slate-950/50 border border-slate-700/50 rounded-2xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
            />
            {search && (
              <button 
                onClick={() => { setSearch(''); loadProducts(''); }}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {currentUser?.role === 'ADMIN' && (
            <button
              onClick={() => router.push('/products')}
              className="w-full sm:w-auto px-5 py-3.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-sm font-bold rounded-2xl border border-indigo-500/30 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.1)] hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]"
            >
              <Package className="w-4 h-4" />
              Inventory
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Products Grid (Left 8) vs Cart Drawer (Right 4) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Product Catalog */}
        <div className="xl:col-span-8 space-y-6">
          {/* Category Filter Pills */}
          <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-none">
            {categoryOptions.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/40 border border-blue-400/50 scale-105'
                    : 'bg-slate-900/60 border border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 hover:border-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Items Grid */}
          <div className="bg-slate-900/40 rounded-3xl border border-slate-800/60 p-6 shadow-2xl backdrop-blur-xl min-h-[600px] flex flex-col">
            <div className="flex items-center justify-between pb-5 border-b border-slate-800/80 mb-6">
              <span className="text-sm font-bold uppercase tracking-widest text-slate-300 flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-400" />
                Product Catalog <span className="px-2 py-0.5 bg-slate-800 rounded-md text-xs text-slate-400 ml-2">{products.length}</span>
              </span>
              <span className="text-xs text-emerald-400 font-mono font-medium flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                Live Sync
              </span>
            </div>

            {loadingProducts ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
                  <Sparkles className="w-10 h-10 text-blue-400 animate-spin relative z-10" />
                </div>
                <span className="font-medium tracking-wide">Syncing inventory...</span>
              </div>
            ) : products.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-4">
                <div className="p-6 bg-slate-800/30 rounded-full border border-slate-700/50">
                  <PackageX className="w-12 h-12 text-slate-600" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-300">No products found</p>
                  <p className="text-sm text-slate-500 mt-1">Try adjusting your search or category filter</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 max-h-[650px] overflow-y-auto pr-2 custom-scrollbar">
                {(selectedCategory === 'All' ? products : products.filter(p => p.category === selectedCategory)).length === 0 ? (
                  <div className="col-span-full py-20 text-center text-slate-500 font-medium">
                    No products found in the "{selectedCategory}" category.
                  </div>
                ) : (
                  (selectedCategory === 'All' ? products : products.filter(p => p.category === selectedCategory)).map((product) => {
                    const inCart = cart.find((item) => item.product.id === product.id);
                    const isOutOfStock = product.stockQuantity <= 0;
                    const isLowStock = product.stockQuantity > 0 && product.stockQuantity < 5;

                    return (
                      <div
                        key={product.id}
                        onClick={() => !isOutOfStock && addToCart(product)}
                        className={`group relative p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between cursor-pointer overflow-hidden min-h-[200px] ${
                          isOutOfStock
                            ? 'bg-slate-950/40 border-slate-800/30 opacity-60 grayscale-[0.5]'
                            : inCart
                            ? 'bg-blue-900/20 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/20 transform scale-[1.02]'
                            : 'bg-slate-900/60 border-slate-700/50 hover:border-indigo-500/40 hover:bg-slate-800/80 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:-translate-y-1'
                        }`}
                      >
                        {/* Glow effect on hover */}
                        {!isOutOfStock && !inCart && (
                           <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        )}

                        <div className="relative z-10 space-y-3">
                          {/* Badge & Price */}
                          <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                            <span
                              className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider whitespace-nowrap w-fit ${
                                isOutOfStock
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                  : isLowStock
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}
                            >
                              {isOutOfStock ? 'Empty' : isLowStock ? `Only ${product.stockQuantity}` : `${product.stockQuantity} in stock`}
                            </span>
                            <span className="font-mono font-black text-lg text-white bg-slate-950/50 px-2 py-0.5 rounded-lg border border-slate-800 whitespace-nowrap self-start">
                              ${Number(product.price).toFixed(2)}
                            </span>
                          </div>

                          {/* Product Info */}
                          <div>
                            <h3 className="font-bold text-slate-100 text-base leading-tight line-clamp-2 group-hover:text-indigo-300 transition-colors">
                              {product.name}
                            </h3>
                            <p className="text-[11px] text-slate-500 font-mono mt-1.5 uppercase tracking-wide">
                              SKU: {product.sku}
                            </p>
                          </div>
                        </div>

                        <div className="relative z-10 pt-3 sm:pt-4 mt-auto border-t border-slate-700/50">
                          <button
                            disabled={isOutOfStock}
                            className={`w-full py-2.5 px-2 sm:px-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center space-x-1.5 sm:space-x-2 ${
                              isOutOfStock
                                ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                                : inCart
                                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                                : 'bg-slate-800 text-slate-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                            }`}
                          >
                            {isOutOfStock ? (
                              <span>Out of Stock</span>
                            ) : inCart ? (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>In Cart ({inCart.quantity})</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4" />
                                <span>Add Item</span>
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
        <div className="xl:col-span-4">
          <div className="bg-slate-900/60 rounded-3xl border border-slate-700/50 shadow-[0_8px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl flex flex-col h-[750px] overflow-hidden sticky top-6">
            
            {/* Cart Header */}
            <div className="p-5 border-b border-slate-700/50 bg-gradient-to-b from-slate-800/80 to-transparent flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
              
              <div className="flex items-center space-x-3 relative z-10">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Receipt className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="font-black text-base text-slate-100 uppercase tracking-widest">
                    Current Order
                  </h2>
                  <p className="text-xs text-blue-400 font-medium">
                    {cart.reduce((a, c) => a + c.quantity, 0)} items selected
                  </p>
                </div>
              </div>

              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="relative z-10 p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                  title="Clear Cart"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                  <div className="p-6 bg-slate-800/40 rounded-full border border-slate-700/50 shadow-inner">
                    <ShoppingCart className="w-12 h-12 text-slate-600" />
                  </div>
                  <div className="text-center px-4">
                    <p className="text-base font-bold text-slate-300">Cart is empty</p>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Select products from the catalog to build the customer's order.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.product.id} className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-colors group">
                      <div className="flex justify-between items-start mb-3">
                        <div className="pr-3">
                          <p className="font-bold text-sm text-slate-100 leading-tight">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-slate-400 font-mono mt-1">
                            ${Number(item.product.price).toFixed(2)} each
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-1 shadow-inner">
                          <button
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="p-1 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-mono text-sm font-bold text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="p-1 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Line Subtotal */}
                        <div className="font-mono font-black text-sm text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                          ${(Number(item.product.price) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Calculations & Checkout Action */}
            <div className="p-6 bg-slate-950/80 border-t border-slate-700/80 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 to-transparent pointer-events-none"></div>
              
              <div className="relative z-10 space-y-5">
                {/* Modifiers */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                      Discount
                    </label>
                    <select
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer"
                    >
                      <option value={0}>None (0%)</option>
                      <option value={5}>5% Off</option>
                      <option value={10}>10% Off</option>
                      <option value={15}>15% Off</option>
                      <option value={20}>20% Off</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                      Tax (GST)
                    </label>
                    <select
                      value={taxPercent}
                      onChange={(e) => setTaxPercent(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer"
                    >
                      <option value={0}>No Tax</option>
                      <option value={5}>5% Tax</option>
                      <option value={8}>8% Tax</option>
                      <option value={12}>12% Tax</option>
                    </select>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2.5 pt-4 border-t border-slate-800/80">
                  <div className="flex justify-between text-sm text-slate-400 font-medium">
                    <span>Subtotal</span>
                    <span className="font-mono text-slate-300">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-400 font-medium">
                      <span>Discount ({discountPercent}%)</span>
                      <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {taxAmount > 0 && (
                    <div className="flex justify-between text-sm text-amber-400 font-medium">
                      <span>Tax ({taxPercent}%)</span>
                      <span className="font-mono">+${taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-end pt-4 pb-2">
                    <span className="text-sm font-black text-slate-200 uppercase tracking-widest">Total</span>
                    <span className="font-mono text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCompleteSale}
                  disabled={cart.length === 0 || processingSale}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:via-blue-500 hover:to-cyan-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:border-slate-700 disabled:cursor-not-allowed text-white font-black text-lg rounded-2xl shadow-[0_0_30px_rgba(79,70,229,0.3)] transition-all flex items-center justify-center space-x-3 border border-indigo-400/30 transform active:scale-[0.98]"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>{processingSale ? 'Processing...' : 'Charge Customer'}</span>
                </button>
              </div>
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
