'use client';

import React, { useEffect, useState } from 'react';
import { User, Shield, Info, CreditCard } from 'lucide-react';
import { getUser, User as AuthUser } from '@/lib/auth';
import Navbar from '@/components/layout/navbar';

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setCurrentUser(getUser());
  }, []);

  return (
    <div className="flex h-screen bg-[#F4F6F8]">
      <Navbar />
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">Settings</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Settings */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <User className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Profile</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Name</label>
                <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium">
                  {currentUser?.name || 'Not signed in'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Email</label>
                <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium">
                  {currentUser?.email || 'N/A'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Role</label>
                <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium uppercase">
                  {currentUser?.role || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Tax & Financial Settings */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 opacity-70">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <CreditCard className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Financials</h2>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Financial settings (Tax, Discounts) are currently managed directly in the POS Dashboard. Advanced financial config is coming soon.
            </p>
            <div className="px-4 py-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-sm font-medium">
              Coming Soon
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 opacity-70">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">System</h2>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              System configuration and user role management are restricted to Super Admins.
            </p>
            <div className="px-4 py-2.5 bg-purple-50 border border-purple-100 rounded-lg text-purple-700 text-sm font-medium">
              Restricted Access
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
