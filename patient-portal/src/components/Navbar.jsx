import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Menu, Moon, Sun } from 'lucide-react';

const Navbar = ({ onMenuClick, darkMode, setDarkMode }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md px-4 md:px-8 flex items-center justify-between sticky top-0 z-10 transition-colors duration-300">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburg Menu Button */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-all cursor-pointer"
        >
          <Menu size={18} />
        </button>
        <h2 className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">Patient Health Center</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Light / Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
          title="Toggle System Theme"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User profile */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{user?.name || 'Care Patient'}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-none">{user?.email}</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-cyan-500/10 dark:bg-cyan-955/30 border border-cyan-100 dark:border-cyan-900/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold shadow-inner">
            {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : <User size={16} />}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
