import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  LayoutDashboard, 
  Boxes, 
  ArrowLeftRight, 
  History, 
  Warehouse, 
  LogOut, 
  Plus, 
  Database,
  Radio,
  User as UserIcon
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'inventory' | 'movements' | 'transactions' | 'zones';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenMovementModal: (defaultType?: 'IN' | 'OUT') => void;
  onOpenAddProductModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenMovementModal,
  onOpenAddProductModal
}) => {
  const { user, userProfile, signOutUser } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'แดชบอร์ดสรุปผล', icon: LayoutDashboard },
    { id: 'inventory', label: 'สต็อกวัสดุก่อสร้าง', icon: Boxes },
    { id: 'movements', label: 'รับเข้า / เบิกจ่าย', icon: ArrowLeftRight },
    { id: 'transactions', label: 'ประวัติการเคลื่อนไหว', icon: History },
    { id: 'zones', label: 'แผนผังโกดัง / ลานกอง', icon: Warehouse },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      {/* Top tier: Brand, status, and user */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">WMS MKC</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                  วัสดุก่อสร้าง
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                ระบบจัดการคลังสินค้าแบบเรียลไทม์
              </p>
            </div>
          </div>

          {/* Center: Live Connection status to wms-mkc */}
          <div className="hidden md:flex items-center gap-2 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-full text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-400">Firebase:</span>
            <span className="font-mono text-emerald-400 font-medium">wms-mkc</span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <Radio className="w-3 h-3" /> Realtime Active
            </span>
          </div>

          {/* Right: Quick actions & User */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Inbound / Outbound buttons */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => onOpenMovementModal('IN')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>รับเข้าวัสดุ</span>
              </button>

              <button
                onClick={() => onOpenMovementModal('OUT')}
                className="px-3 py-1.5 rounded-lg bg-rose-600/20 border border-rose-500/30 text-rose-300 hover:bg-rose-600/30 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>เบิกจ่ายวัสดุ</span>
              </button>
            </div>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-xl px-2.5 py-1.5">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-7 h-7 rounded-full border border-amber-500/40 object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold border border-amber-500/30">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}

              <div className="hidden xl:block text-left">
                <div className="text-xs font-medium text-white truncate max-w-[130px]">
                  {user?.displayName || 'ผู้ดูแลคลัง'}
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[130px] font-mono">
                  {user?.email}
                </div>
              </div>

              <button
                onClick={signOutUser}
                title="ออกจากระบบ"
                className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 transition-colors ml-1 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation tabs row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/60">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
