import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, 
  Clock, 
  MessageSquare, 
  LogOut, 
  Activity 
} from 'lucide-react';

const Sidebar = () => {
  const { logout } = useAuth();

  const links = [
    { to: '/', label: 'Appointments', icon: Calendar },
    { to: '/schedule', label: 'My Schedule', icon: Clock },
    { to: '/chat', label: 'Patient Chat', icon: MessageSquare },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col h-screen sticky top-0">
      {/* Brand Logo */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-gradient-to-tr from-teal-600 to-emerald-500 p-2.5 rounded-xl shadow-lg shadow-teal-500/20">
          <Activity className="h-6 w-6 text-white animate-pulse" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-wide bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">CareFlow</h1>
          <p className="text-[10px] text-teal-400 font-semibold uppercase tracking-wider">Doctor Portal</p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group ${
                  isActive 
                    ? 'bg-teal-600/10 text-teal-400 border border-teal-500/25 shadow-inner' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                }`
              }
            >
              <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-950/20 hover:text-red-400 border border-transparent hover:border-red-900/30 font-medium transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
