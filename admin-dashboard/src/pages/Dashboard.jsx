import React, { useState, useEffect } from 'react';
import api from '../utils/api';
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
  XCircle
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
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-950/20 border border-red-900/40 rounded-2xl flex items-center gap-3 text-red-400">
        <AlertCircle className="h-6 w-6" />
        <span>{error}</span>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Doctors',
      value: stats?.doctors || 0,
      icon: Stethoscope,
      color: 'from-blue-600 to-cyan-500',
      shadow: 'shadow-blue-500/10',
    },
    {
      title: 'Registered Patients',
      value: stats?.patients || 0,
      icon: Users,
      color: 'from-indigo-600 to-purple-500',
      shadow: 'shadow-indigo-500/10',
    },
    {
      title: 'Total Appointments',
      value: stats?.appointments || 0,
      icon: Calendar,
      color: 'from-emerald-600 to-teal-500',
      shadow: 'shadow-emerald-500/10',
    },
    {
      title: "Today's Bookings",
      value: stats?.todayAppointments || 0,
      icon: Activity,
      color: 'from-orange-600 to-amber-500',
      shadow: 'shadow-orange-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <span>Dashboard Overview</span>
          <TrendingUp className="h-6 w-6 text-blue-500" />
        </h1>
        <p className="text-slate-400 mt-1">Real-time clinical and operational key metrics.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx}
              className={`bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex items-center justify-between shadow-lg ${card.shadow} hover:border-slate-700/50 transition-all duration-300`}
            >
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.title}</span>
                <h3 className="text-3xl font-extrabold text-white">{card.value}</h3>
              </div>
              <div className={`bg-gradient-to-tr ${card.color} p-4 rounded-2xl text-white shadow-lg`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Appointment Status breakdown */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 lg:col-span-1">
          <h3 className="text-base font-bold text-slate-100 mb-6">Appointment Distribution</h3>
          <div className="space-y-5">
            {[
              { label: 'Pending Approval', count: stats?.statusBreakdown?.Pending || 0, icon: Clock, color: 'text-amber-500 bg-amber-500/10 border-amber-500/15' },
              { label: 'Confirmed Schedule', count: stats?.statusBreakdown?.Confirmed || 0, icon: CheckCircle, color: 'text-blue-500 bg-blue-500/10 border-blue-500/15' },
              { label: 'Completed Visits', count: stats?.statusBreakdown?.Completed || 0, icon: FileCheck2, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/15' },
              { label: 'Cancelled Visits', count: stats?.statusBreakdown?.Cancelled || 0, icon: XCircle, color: 'text-red-500 bg-red-500/10 border-red-500/15' },
            ].map((status, i) => {
              const Icon = status.icon;
              return (
                <div key={i} className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-850 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl border ${status.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-slate-300">{status.label}</span>
                  </div>
                  <span className="text-base font-bold text-white">{status.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Specialty distribution */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 lg:col-span-2">
          <h3 className="text-base font-bold text-slate-100 mb-6">Specialty Staffing</h3>
          {stats?.specialtyBreakdown?.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
              No doctors or specialties registered yet.
            </div>
          ) : (
            <div className="space-y-5">
              {stats?.specialtyBreakdown?.map((spec, idx) => {
                const totalDocs = stats?.doctors || 1;
                const percentage = Math.round((spec.count / totalDocs) * 100);
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-slate-300">{spec.name}</span>
                      <span className="text-slate-400">{spec.count} {spec.count === 1 ? 'Doctor' : 'Doctors'} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
