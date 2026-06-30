import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Menu } from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-4 md:px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburg Menu Button */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden text-slate-400 hover:text-white p-2 hover:bg-slate-800/60 rounded-xl transition-all cursor-pointer"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-sm md:text-lg font-semibold text-slate-100 truncate">Management Panel</h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-200">{user?.name || 'HMS Administrator'}</p>
          <p className="text-xs text-slate-500">{user?.email}</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/10">
          {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : <User size={18} />}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
