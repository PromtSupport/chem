import React, { useState } from 'react';
import { User, Topic } from '../types';
import { FlaskConical, Home, FolderOpen, Gamepad2, Wrench, BookOpen, User as UserIcon, Shield, Star, Power, Menu, X } from 'lucide-react';
import { useStore } from '../store';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Navbar({ user, onLogout, activeTab, onTabChange }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const bestScore = typeof window !== 'undefined' ? (parseInt(localStorage.getItem('chem_best_score') || '0', 10)) : 0;
  
  const navItems = [
    { id: 'dashboard', label: 'Панель', icon: Home, show: true },
    { id: 'catalog', label: 'Каталог', icon: FolderOpen, show: true },
    { id: 'trainer', label: 'Тренажер', icon: Gamepad2, show: true },
    { id: 'constructor', label: 'Конструктор', icon: Wrench, show: user.role === 'teacher' },
    { id: 'students', label: 'Ученики', icon: UserIcon, show: user.role === 'teacher' },
    { id: 'reference', label: 'Справочник', icon: BookOpen, show: true },
  ];

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="px-4 pt-4 md:px-8 md:pt-6 sticky top-0 z-40 font-sans">
      <header className="glass-panel flex flex-col items-center justify-between w-full rounded-3xl relative">
        <div className="flex items-center justify-between w-full px-6 py-3">
          <button onClick={() => handleTabClick('dashboard')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-md flex items-center justify-center rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/20">
              <FlaskConical className="text-white drop-shadow-md" size={20} />
            </div>
            <h1 className="text-xl font-display font-bold tracking-tight uppercase text-white drop-shadow-md">Chem<span className="text-blueAccent">Studio</span></h1>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex gap-1 bg-black/20 p-1 rounded-full border border-white/10 shadow-inner overflow-x-auto scrollbar-hide shrink-0 max-w-full" style={{ scrollbarWidth: 'none' }}>
            {navItems.filter(item => item.show).map(item => (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`px-5 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === item.id ? 'bg-white/15 text-white shadow-md border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3 justify-end">
            <div className="text-right hidden md:block">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user.role === 'teacher' ? 'Учитель' : 'Ученик'}</p>
              <p className="text-sm font-semibold text-slate-100 drop-shadow-sm">{user.name}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/20 shadow-inner flex items-center justify-center text-white overflow-hidden shrink-0">
              {user.role === 'teacher' ? (
                 <Shield size={18} />
              ) : (
                 <UserIcon size={18} />
              )}
            </div>
            
            {/* Desktop Logout - Hidden on very small screens, integrated into mobile menu */}
            <button 
              onClick={onLogout}
              className="hidden md:flex bg-white/5 text-slate-300 hover:bg-dangerAccent hover:text-white transition-all border border-white/10 p-2.5 rounded-xl text-sm group shrink-0"
              title="Выход"
            >
              <Power size={18} className="group-hover:scale-110 transition-transform" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="xl:hidden flex items-center justify-center w-10 h-10 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMobileMenuOpen && (
          <div className="xl:hidden w-full px-4 pb-4 animate-in slide-in-from-top-2 fade-in duration-200">
            <div className="flex flex-col gap-1 bg-black/40 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-xl">
              {navItems.filter(item => item.show).map(item => {
                const ItemIcon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${
                      activeTab === item.id ? 'bg-white/15 text-white shadow-md border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <ItemIcon size={16} />
                    {item.label}
                  </button>
                )
              })}
              
              {/* Mobile Info & Logout */}
              <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between px-3 md:hidden">
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user.role === 'teacher' ? 'Учитель' : 'Ученик'}</span>
                  <span className="text-sm font-semibold text-slate-200">{user.name}</span>
                </div>
                <button 
                  onClick={onLogout}
                  className="bg-white/5 text-dangerAccent hover:bg-dangerAccent hover:text-white transition-all border border-white/10 p-2 rounded-lg text-sm flex items-center justify-center"
                  title="Выход"
                >
                  <Power size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
