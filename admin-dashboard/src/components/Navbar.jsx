import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Menu, Sun, Moon, Bell, Search } from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <header className="h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md px-4 md:px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3 flex-1">
        {/* Mobile Hamburg Menu Button */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden text-slate-500 hover:text-slate-900 dark:hover:text-white p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
        >
          <Menu size={20} />
        </button>
        
        {/* Search box - Modern 2026 UI */}
        <div className="relative max-w-xs w-full hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4" />
          <input 
            type="text" 
            placeholder="Search dashboard..." 
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition-all cursor-pointer"
          title="Toggle Dark Mode"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Notifications */}
        <button className="p-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition-all cursor-pointer relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
        </button>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

        {/* User profile */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{user?.name || 'HMS Administrator'}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{user?.email}</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-blue-600/10 dark:bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shadow-xs">
            {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : <User size={16} />}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
