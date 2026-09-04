'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clearAuth, getUser, User } from '@/lib/auth';
import {
  LogOut,
  LayoutDashboard,
  ShoppingCart,
  BarChart3,
  CreditCard,
  Settings,
  Package,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  if (pathname === '/login') return null;

  const isAdmin = user?.role === 'ADMIN';

  const navItems = [
    { name: 'Dashboard', href: '/sales', icon: LayoutDashboard, adminOnly: true },
    { name: 'Menu Order', href: '/dashboard', icon: ShoppingCart, adminOnly: false },
    { name: 'Inventory', href: '/products', icon: Package, adminOnly: true },
    { name: 'Analytics', href: '/sales', icon: BarChart3, adminOnly: true },
  ];

  return (
    <aside className="w-full md:w-[240px] bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col md:flex-col h-auto md:h-screen sticky top-0 z-40 flex-shrink-0">
      {/* Brand */}
      <div className="p-4 md:p-6 lg:p-8 flex items-center justify-between md:justify-start">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg md:text-xl shadow-lg">
            P
          </div>
          <div>
            <h1 className="font-extrabold text-lg md:text-xl tracking-tight text-slate-900">Pospay</h1>
            <p className="hidden md:block text-[10px] text-slate-500 font-medium -mt-0.5">Cashier Daily Assistant</p>
          </div>
        </div>
        
        {/* Mobile Settings & Logout (Top Right) */}
        <div className="flex md:hidden items-center space-x-2">
          <button className="p-2 text-slate-400 hover:text-slate-900">
            <Settings className="w-5 h-5" />
          </button>
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-600">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 md:space-y-1.5 flex md:flex-col overflow-x-auto md:overflow-y-auto md:overflow-x-hidden custom-scrollbar pb-2 md:pb-0 gap-2 md:gap-0">
        {navItems.map((item) => {
          if (item.adminOnly && !isAdmin) return null;
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-2 md:space-x-3 px-3 py-2 md:px-4 md:py-3.5 rounded-xl md:rounded-2xl text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 md:w-5 md:h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions (Desktop Only) */}
      <div className="hidden md:block p-4 space-y-1.5 border-t border-slate-100 mt-auto">
        <button className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200">
          <Settings className="w-5 h-5 text-slate-400" />
          <span>Settings</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <LogOut className="w-5 h-5 text-slate-400" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
