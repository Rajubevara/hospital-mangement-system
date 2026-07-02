import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Stethoscope, 
  HeartPulse, 
  Calendar, 
  Users, 
  LogOut, 
  X
} from 'lucide-react';
import Logo from './Logo';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { logout } = useAuth();
  const location = useLocation();

  const links = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/specialties', label: 'Specialties', icon: HeartPulse },
    { to: '/doctors', label: 'Doctors', icon: Stethoscope },
    { to: '/patients', label: 'Patients', icon: Users },
    { to: '/appointments', label: 'Appointments', icon: Calendar },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 border-r lg:border border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-100 flex flex-col h-screen lg:h-[calc(100vh-2rem)] z-40 transition-transform duration-300 transform lg:translate-x-0 lg:m-4 lg:rounded-[20px] lg:shadow-xs ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      {/* Brand Logo */}
      <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <Logo size="sm" showText={true} />
          <span className="text-[9px] bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0">
            Admin
          </span>
        </div>

        {/* Mobile Close Button */}
        <button 
          onClick={() => setIsOpen(false)}
          className="lg:hidden text-slate-400 hover:text-slate-800 dark:hover:text-white p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 relative overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setIsOpen(false)}
              className={() => 
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group relative border border-transparent ${
                  isActive 
                    ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/50 dark:bg-blue-950/20' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
                }`
              }
            >
              {/* Active Item Background Slide Indicator */}
              {isActive && (
                <motion.div 
                  layoutId="activeAdminNavIndicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-blue-500 rounded-r-full"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-105 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
              <span className="text-sm">{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/10 hover:text-red-600 dark:hover:text-red-400 border border-transparent hover:border-red-100 dark:hover:border-red-900/10 font-medium transition-all duration-200 cursor-pointer"
        >
          <LogOut className="h-5 w-5 text-red-500" />
          <span className="text-sm">Sign Out</span>
        </motion.button>
      </div>
    </aside>
  );
};

export default Sidebar;
