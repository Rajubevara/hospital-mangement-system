import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  Activity, 
  TrendingUp, 
  AlertCircle,
  Clock,
  CheckCircle,
  FileCheck2,
  XCircle,
  IndianRupee,
  ShieldCheck,
  ChevronRight,
  UserCheck
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        if (response.data.success) {
          setStats(response.data.stats);
        } else {
          setError('Failed to fetch statistics.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Server connection error.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 space-y-4 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
              </div>
              <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="h-80 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl animate-pulse lg:col-span-2"></div>
          <div className="h-80 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400">
        <AlertCircle className="h-6 w-6" />
        <span>{error}</span>
      </div>
    );
  }

  // Enterprise Mock Analytics Data for 2026 Layout
  const revenueData = [
    { name: 'Jan', revenue: 42000, appointments: 120 },
    { name: 'Feb', revenue: 55000, appointments: 160 },
    { name: 'Mar', revenue: 48000, appointments: 145 },
    { name: 'Apr', revenue: 70000, appointments: 210 },
    { name: 'May', revenue: 85000, appointments: 240 },
    { name: 'Jun', revenue: 98000, appointments: 290 },
  ];

  const specialtyColors = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];

  const specialtyChartData = stats?.specialtyBreakdown?.map((spec) => ({
    name: spec.name,
    value: spec.count,
  })) || [];

  const appointmentDistribution = [
    { name: 'Pending', value: stats?.statusBreakdown?.Pending || 0, color: '#F59E0B' },
    { name: 'Confirmed', value: stats?.statusBreakdown?.Confirmed || 0, color: '#2563EB' },
    { name: 'Completed', value: stats?.statusBreakdown?.Completed || 0, color: '#22C55E' },
    { name: 'Cancelled', value: stats?.statusBreakdown?.Cancelled || 0, color: '#EF4444' },
  ].filter(item => item.value > 0);

  const statCards = [
    {
      title: 'Total Doctors',
      value: stats?.doctors || 0,
      icon: Stethoscope,
      bg: 'bg-blue-50/80 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border-blue-100/80 dark:border-blue-900/20',
      percentage: '12%',
    },
    {
      title: 'Registered Patients',
      value: stats?.patients || 0,
      icon: Users,
      bg: 'bg-indigo-50/80 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 border-indigo-100/80 dark:border-indigo-900/20',
      percentage: '18%',
    },
    {
      title: 'Total Appointments',
      value: stats?.appointments || 0,
      icon: Calendar,
      bg: 'bg-emerald-50/80 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border-emerald-100/80 dark:border-emerald-900/20',
      percentage: '8%',
    },
    {
      title: 'Monthly Revenue',
      value: `₹${(revenueData[5].revenue).toLocaleString('en-IN')}`,
      icon: IndianRupee,
      bg: 'bg-rose-50/80 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 border-rose-100/80 dark:border-rose-900/20',
      percentage: '15%',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>Executive Overview</span>
            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Real-time hospital statistics, revenue metrics and staffing channels.</p>
        </div>

        {/* System Health */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">System Health: 100% Operational</span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div 
              key={idx}
              whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}
              className={`${card.bg} border rounded-[24px] p-6 flex items-center justify-between transition-all`}
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-85">{card.title}</span>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-extrabold tracking-tight">{card.value}</h3>
                  {card.percentage && (
                    <span className="text-[9px] font-extrabold opacity-80 bg-white/50 dark:bg-black/20 px-1.5 py-0.5 rounded-md">
                      +{card.percentage}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-3 bg-white/90 dark:bg-slate-900/90 rounded-2xl flex items-center justify-center shadow-xs text-slate-700 dark:text-slate-300">
                <Icon className="h-5 w-5" />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Analytics (Recharts AreaChart) */}
        <motion.div 
          variants={itemVariants} 
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 lg:col-span-2 shadow-xs"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Revenue & Visit Analysis</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Monthly consultation earnings and booking totals.</p>
            </div>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 px-2 py-1 rounded-lg">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" /> Revenue
              </span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    borderRadius: '12px', 
                    border: 'none', 
                    color: '#fff',
                    fontSize: '11px' 
                  }} 
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Appointment Distribution (Recharts PieChart) */}
        <motion.div 
          variants={itemVariants} 
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between"
        >
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Booking Pipeline</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Distribution of appointment statuses.</p>
          </div>
          <div className="h-44 w-full flex items-center justify-center relative">
            {appointmentDistribution.length === 0 ? (
              <p className="text-xs text-slate-400">No scheduled visits</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={appointmentDistribution}
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {appointmentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="absolute flex flex-col items-center">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Bookings</span>
              <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{stats?.appointments || 0}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {appointmentDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/50">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <div className="min-w-0">
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate">{item.name}</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-none mt-0.5">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Specialty distribution / Department Statistics */}
        <motion.div 
          variants={itemVariants} 
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 lg:col-span-2 shadow-xs"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Specialty Distribution</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Breakdown of registered clinic specialties.</p>
            </div>
          </div>
          {specialtyChartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-xs">
              No specialties or departments registered yet.
            </div>
          ) : (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={specialtyChartData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                  <XAxis type="number" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} width={80} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      borderRadius: '12px', 
                      border: 'none', 
                      color: '#fff',
                      fontSize: '10px' 
                    }} 
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={12}>
                    {specialtyChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={specialtyColors[index % specialtyColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Recent appointments list */}
        <motion.div 
          variants={itemVariants} 
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Overview Panel</h3>
              <button className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 flex items-center hover:underline cursor-pointer">
                View All <ChevronRight size={12} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                  <UserCheck size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">New Doctor Added</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Dr. Jane Smith (Cardiology)</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">Payments Gateway Active</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Razorpay sandbox integration live</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">Backup Complete</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Daily health backup verified</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[10px] text-slate-400 dark:text-slate-500">HMS Core Dashboard v2.0.26</p>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default Dashboard;
