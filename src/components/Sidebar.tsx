import React from 'react';
import {
  Home,
  ShoppingCart,
  Pill,
  FileText,
  UserCheck,
  FolderHeart,
  Bell,
  Settings,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { Logo } from './Logo';

export type NavTab =
  | 'home'
  | 'pharmacy'
  | 'meds'
  | 'prescriptions'
  | 'consult'
  | 'records'
  | 'reminders'
  | 'settings';

interface SidebarProps {
  currentView: NavTab;
  onNavigate: (view: NavTab) => void;
  cartCount?: number;
  reminderCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  cartCount = 0,
  reminderCount = 1
}) => {
  const navItems = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'pharmacy' as NavTab, label: 'Pharmacy', icon: ShoppingCart, badge: cartCount > 0 ? cartCount : undefined },
    { id: 'meds' as NavTab, label: 'Medications', icon: Pill },
    { id: 'prescriptions' as NavTab, label: 'Prescriptions', icon: FileText },
    { id: 'consult' as NavTab, label: 'Consult a Doctor', icon: UserCheck },
    { id: 'records' as NavTab, label: 'Health Records', icon: FolderHeart },
    { id: 'reminders' as NavTab, label: 'Reminders', icon: Bell, badge: reminderCount > 0 ? reminderCount : undefined },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-blue-700 via-blue-800 to-slate-900 text-white flex flex-col justify-between shrink-0 min-h-screen p-4 select-none shadow-xl border-r border-blue-600/30">
      <div>
        {/* Brand Logo */}
        <div className="py-4 mb-2">
          <Logo variant="full" />
        </div>

        {/* Navigation list */}
        <nav className="space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Match both pharmacy and meds to highlight if viewed
            const isActive = currentView === item.id || (item.id === 'pharmacy' && currentView === 'meds');
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-blue-700 shadow-md shadow-black/10 scale-[1.02]'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-blue-200'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Priority Card */}
      <div className="pt-4">
        <div className="bg-gradient-to-b from-slate-900/90 to-blue-950/90 rounded-2xl p-4 border border-blue-500/20 shadow-inner flex flex-col items-center text-center relative overflow-hidden">
          <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/40 rounded-xl flex items-center justify-center mb-2.5 shadow-sm">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <h4 className="text-sm font-bold text-white tracking-tight">Your Health</h4>
          <p className="text-xs text-blue-200 font-medium">Our Priority</p>

          {/* ECG line effect at bottom of card */}
          <div className="w-full mt-3 pt-2 border-t border-white/10 flex items-center justify-center text-blue-400">
            <Activity className="w-16 h-4 opacity-80 animate-pulse-subtle" />
          </div>
        </div>

        <div className="text-[11px] text-center text-blue-300/60 mt-3 font-mono">
          Uganda MoH Connected • v2.6
        </div>
      </div>
    </aside>
  );
};
