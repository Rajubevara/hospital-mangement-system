import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  CalendarPlus, 
  CalendarRange, 
  FileHeart, 
  MessageCircle, 
  LogOut, 
  X
} from 'lucide-react';
import Logo from './Logo';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { logout } = useAuth();
  const location = useLocation();

  const links = [
    { to: '/', label: 'Book Consult', icon: CalendarPlus },
    { to: '/bookings', label: 'My Bookings', icon: CalendarRange },
    { to: '/prescriptions', label: 'Medical History', icon: FileHeart },
    { to: '/chat', label: 'Doctor Chat', icon: MessageCircle },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 w-64 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col h-screen z-40 transition-transform duration-300 transform lg:translate-x-0 lg:static p-4 shrink-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      {/* Sidebar Floating Container */}
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-[20px] flex flex-col h-full overflow-hidden shadow-xs">
        
        {/* Brand Logo */}
        <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-900">
          <div className="flex items-center gap-3">
            <Logo size="sm" showText={true} />
            <span className="text-[9px] bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0">
              Patient
            </span>
          </div>

          {/* Mobile Close Button */}
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-colors relative group"
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeIndicator"
                    className="absolute inset-0 bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-900/25 rounded-xl"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                
                <Icon className={`h-5 w-5 shrink-0 z-10 transition-transform duration-200 group-hover:scale-105 ${
                  isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-350'
                }`} />
                <span className={`z-10 ${
                  isActive ? 'text-cyan-705 dark:text-cyan-400 font-bold' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-205'
                }`}>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-650 dark:hover:text-red-400 border border-transparent hover:border-red-100 dark:hover:border-red-900/10 font-bold transition-all duration-200 cursor-pointer"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
