'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clearAuth, getUser, User } from '@/lib/auth';
import {
  ShoppingCart,
  Package,
  BarChart3,
  LogOut,
  Clock,
  Store,
  User as UserIcon,
  Shield,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    setUser(getUser());

    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  if (pathname === '/login') return null;

  const isAdmin = user?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Nav */}
        <div className="flex items-center space-x-8">
          <Link href="/dashboard" className="flex items-center space-x-2.5 group">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-blue-300 bg-clip-text text-transparent">
                MINI POS
              </span>
              <span className="block text-[10px] text-blue-400 font-semibold tracking-wider uppercase -mt-1">
                Terminal v1.0
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex space-x-1">
            <Link
              href="/dashboard"
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                pathname === '/dashboard'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>POS Terminal</span>
            </Link>

            {isAdmin && (
              <>
                <Link
                  href="/products"
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    pathname === '/products'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Products</span>
                </Link>

                <Link
                  href="/sales"
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    pathname === '/sales'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Sales & Analytics</span>
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Right Info: Live Clock, User Profile & Logout */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>{time || '--:--:--'}</span>
          </div>

          {user && (
            <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-200 text-xs font-medium">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">
                <UserIcon className="w-3.5 h-3.5" />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="font-semibold text-slate-100 text-xs leading-none">{user.name}</span>
                <span
                  className={`text-[9px] font-extrabold uppercase mt-0.5 tracking-wider ${
                    isAdmin ? 'text-amber-400' : 'text-blue-400'
                  }`}
                >
                  {isAdmin ? 'ADMIN' : 'CASHIER'}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-lg text-xs font-semibold transition-all"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
