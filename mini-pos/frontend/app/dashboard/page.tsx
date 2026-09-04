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
  X,
  CreditCard,
  RefreshCw,
  BookOpen,
  Calendar,
  ChevronDown,
  Tag,
  Sparkles,
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

// Intelligent image mapper based on product name
const getImageUrl = (name: string, id: number) => {
  const EXACT_MAP: Record<string, string> = {
    'Fresh Milk 1L': 'https://cdn.dummyjson.com/product-images/groceries/milk/1.webp',
    'Arabica Coffee Beans 250g': 'https://cdn.dummyjson.com/product-images/groceries/nescafe-coffee/1.webp',
    'Classic Cola 500ml': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Glass_of_Cola.jpg/500px-Glass_of_Cola.jpg',
    'Orange Juice 1L': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Orangejuice.jpg/500px-Orangejuice.jpg',
    'Whole Wheat Bread': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Korb_mit_Br%C3%B6tchen.JPG/500px-Korb_mit_Br%C3%B6tchen.JPG',
    'Butter Croissant': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Croissant-Petr_Kratochvil.jpg/500px-Croissant-Petr_Kratochvil.jpg',
    'Blueberry Muffin': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/02116jfMuffins_in_Philippinesfvf_02.jpg/500px-02116jfMuffins_in_Philippinesfvf_02.jpg',
    'Chocolate Cake Slice': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Pound_layer_cake.jpg/500px-Pound_layer_cake.jpg',
    'Basmati Rice 5kg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Khyma_and_Basmati_rice.jpg/500px-Khyma_and_Basmati_rice.jpg',
    'Olive Oil 500ml': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Oliven_V1.jpg/500px-Oliven_V1.jpg',
    'Pasta Spaghetti 500g': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Spaghettoni.jpg/500px-Spaghettoni.jpg',
    'Tomato Ketchup 400g': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Ketchup_20160918_181342_%28cropped%29.jpg/500px-Ketchup_20160918_181342_%28cropped%29.jpg',
    'Organic Eggs (12 pcs)': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Chicken_egg_2009-06-04.jpg/500px-Chicken_egg_2009-06-04.jpg',
    'Cheddar Cheese 200g': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Somerset-Cheddar.jpg/500px-Somerset-Cheddar.jpg',
    'Greek Yogurt 500g': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Joghurt.jpg/500px-Joghurt.jpg',
    'Salted Butter 250g': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/%C5%A0v%C3%A9dsk%C3%BD_kol%C3%A1%C4%8D_naruby_904_%28cropped%29.JPG/500px-%C5%A0v%C3%A9dsk%C3%BD_kol%C3%A1%C4%8D_naruby_904_%28cropped%29.JPG',
    'Potato Chips Salted': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Potato-Chips.jpg/500px-Potato-Chips.jpg',
    'Dark Chocolate Bar 100g': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Green_and_Black%27s_dark_chocolate_bar_2.jpg/500px-Green_and_Black%27s_dark_chocolate_bar_2.jpg',
    'Mixed Nuts 200g': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Walnuts_-_whole_and_open_with_halved_kernel.jpg/500px-Walnuts_-_whole_and_open_with_halved_kernel.jpg',
    'Granola Bar': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Granola%2C_yogurt%2C_fruit._%2816696981528%29.jpg/500px-Granola%2C_yogurt%2C_fruit._%2816696981528%29.jpg',
  };

  if (EXACT_MAP[name]) {
    return EXACT_MAP[name];
  }

  // Generic fallback if new products are added later
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=500`;
};

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(5); // 5% default for design
  const [processingSale, setProcessingSale] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [completedSale, setCompletedSale] = useState<SaleResult | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  const orderId = '#B' + Math.floor(100000 + Math.random() * 900000);

  // Reset pagination when search or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
    } else {
      setCurrentUser(getUser());
      loadProducts();
    }
    
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }));
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
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
    if (product.stockQuantity <= 0) return;

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          setErrorMessage(`Stock limit reached for "${product.name}"`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setErrorMessage('');
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty > item.product.stockQuantity) return item;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
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

      const sale = await apiFetch('/sales', { method: 'POST', body: JSON.stringify(payload) }) as SaleResult;
      setCompletedSale(sale);
      setCart([]);
      loadProducts(search);
    } catch (err: any) {
      setErrorMessage(err.message || 'Sale transaction failed');
    } finally {
      setProcessingSale(false);
    }
  };

  const categoryOptions = ['All', 'Beverages', 'Grocery', 'Bakery', 'Dairy', 'Snacks'];
  const filteredProducts = selectedCategory === 'All' ? products : products.filter(p => p.category === selectedCategory);
  
  // Apply pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const displayedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="w-full flex flex-col xl:flex-row min-h-screen bg-[#F4F6F8]">
      
      {/* LEFT SECTION (Main Dashboard) */}
      <div className="flex-1 p-6 xl:p-8 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
              <img src="https://ui-avatars.com/api/?name=Hadid+Food&background=0D8ABC&color=fff" alt="User" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                {currentUser?.name || "Hadid's Food"}
                <span className="flex items-center text-xs font-semibold text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200 cursor-pointer hover:bg-slate-50">
                  Open <ChevronDown className="w-3 h-3 ml-1" />
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Cashier Daily Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-slate-600 bg-white px-4 py-2.5 rounded-xl shadow-sm border border-slate-100 text-sm font-medium">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{currentTime || 'Loading...'}</span>
            </div>
          </div>
        </header>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage('')} className="p-1 hover:bg-red-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Category & Search Bar */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
          <div className="flex items-center space-x-3 overflow-x-auto pb-2 custom-scrollbar w-full xl:w-auto">
            <div className="flex items-center space-x-2 mr-2 text-slate-800 font-bold px-2 py-1">
              <BookOpen className="w-5 h-5" />
              <span>Dish Menu</span>
            </div>
            
            {categoryOptions.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                  selectedCategory === cat
                    ? 'bg-[#1C2434] text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat} 
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ml-1 ${selectedCategory === cat ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                  {cat === 'All' ? products.length : products.filter(p => p.category === cat).length}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3 w-full xl:w-auto">
            <button onClick={() => loadProducts()} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </button>
            <div className="relative w-full xl:w-64">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search Menu"
                value={search}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-300 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Product Grid (No internal scrollbar) */}
        <div className="flex-1 pb-6">
          {loadingProducts ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4 py-12">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
                <Sparkles className="w-10 h-10 text-blue-400 animate-spin relative z-10" />
              </div>
              <span className="font-medium tracking-wide">Syncing inventory...</span>
            </div>
          ) : displayedProducts.length === 0 ? (
            <div className="py-20 text-center text-slate-500 font-medium bg-white rounded-3xl border border-slate-200 border-dashed">
              No dishes found.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {displayedProducts.map((product) => {
                  const inCart = cart.find((item) => item.product.id === product.id);
                  const isOutOfStock = product.stockQuantity <= 0;

                  return (
                    <div key={product.id} className="bg-white rounded-[24px] p-3 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                      {/* Image Area */}
                      <div className="relative w-full aspect-[4/3] rounded-[18px] overflow-hidden mb-3 sm:mb-4 bg-slate-100">
                        <img 
                          src={getImageUrl(product.name, product.id)} 
                          alt={product.name} 
                          className={`w-full h-full object-cover transition-transform duration-500 ${isOutOfStock ? 'grayscale opacity-70' : 'hover:scale-105'}`}
                          loading="lazy"
                        />
                        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/95 backdrop-blur-sm px-2 py-1 sm:px-2.5 sm:py-1 rounded-full flex items-center space-x-1 sm:space-x-1.5 shadow-sm border border-white/50">
                          <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                          <span className="text-[9px] sm:text-[10px] font-bold text-slate-700 uppercase">{isOutOfStock ? 'Not Available' : 'Available'}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="px-1 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-4 gap-2">
                          <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2">{product.name}</h3>
                          <span className="font-bold text-slate-800 text-sm whitespace-nowrap">${Number(product.price).toFixed(2)}</span>
                        </div>
                        
                        <div className="mt-auto pt-2">
                          {inCart ? (
                            <div className="flex items-center justify-between">
                              <button onClick={() => updateQuantity(product.id, -1)} className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="font-bold text-slate-800">Add More ({inCart.quantity})</span>
                              <button onClick={() => updateQuantity(product.id, 1)} className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => !isOutOfStock && addToCart(product)}
                              disabled={isOutOfStock}
                              className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                                isOutOfStock 
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                  : 'bg-[#1C2434] text-white hover:bg-slate-800'
                              }`}
                            >
                              {!isOutOfStock && <Plus className="w-4 h-4" />}
                              {isOutOfStock ? 'Not Available' : 'Add to Cart'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-10 space-x-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors font-bold text-sm shadow-sm"
                  >
                    Previous
                  </button>
                  <div className="flex items-center space-x-1 px-2">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${
                          currentPage === i + 1 
                            ? 'bg-[#1C2434] text-white' 
                            : 'text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-5 py-2.5 rounded-xl bg-[#1C2434] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors font-bold text-sm shadow-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* RIGHT SECTION (Cart / Order Summary) */}
      <div className="w-full xl:w-[380px] bg-[#F8F9FB] border-t xl:border-t-0 xl:border-l border-slate-200 p-6 flex flex-col h-auto xl:h-screen xl:sticky top-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-lg text-slate-800">Order Summary</h2>
          <span className="text-sm font-bold text-slate-500">{orderId}</span>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar -mx-2 px-2">
          {cart.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-slate-400 text-sm">
              <ShoppingCart className="w-10 h-10 mb-3 opacity-50" />
              <p>No items in cart</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="flex gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                  <img src={getImageUrl(item.product.name, item.product.id)} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between py-0.5">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm leading-tight">{item.product.name} ({item.quantity})</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Notes: None</p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold text-slate-800 text-sm">${(Number(item.product.price) * item.quantity).toFixed(2)}</span>
                    <div className="flex items-center space-x-1">
                      <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => removeFromCart(item.product.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Calculations */}
        <div className="pt-6 mt-4 border-t border-slate-200/60 space-y-3">
          <div className="flex justify-between text-sm font-medium text-slate-500">
            <span>Subtotal</span>
            <span className="text-slate-800 font-bold">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium text-slate-500">
            <span>Taxes ({taxPercent}%)</span>
            <span className="text-slate-800 font-bold">${taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium text-slate-500">
            <span>Discount ({discountPercent}%)</span>
            <span className="text-emerald-500 font-bold">-${discountAmount.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center pt-3 pb-2">
            <span className="font-bold text-slate-800 text-base">Total Payment</span>
            <span className="font-bold text-slate-800 text-xl">${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-4 space-y-3">


          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm cursor-pointer hover:bg-slate-50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <Tag className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 leading-tight">10% Discount</p>
                <p className="text-[10px] text-slate-400">Minimum Buy $50.00</p>
              </div>
            </div>
            <div className="w-4 h-4 rounded-full border-[4px] border-slate-800"></div>
          </div>

          <button
            onClick={handleCompleteSale}
            disabled={cart.length === 0 || processingSale}
            className="w-full mt-2 py-4 bg-[#1C2434] hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-lg shadow-slate-900/10 transition-colors flex items-center justify-center space-x-2"
          >
            <span>{processingSale ? 'Processing...' : 'Confirm Payment'}</span>
          </button>
        </div>
      </div>

      {completedSale && (
        <ReceiptModal
          completedSale={completedSale}
          currentUserName={currentUser?.name}
          onClose={() => setCompletedSale(null)}
          onPrint={() => window.print()}
        />
      )}
    </div>
  );
}
