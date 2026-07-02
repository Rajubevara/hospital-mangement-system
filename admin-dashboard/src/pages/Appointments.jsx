import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  User, 
  Stethoscope, 
  Clock, 
  IndianRupee, 
  AlertCircle,
  XCircle,
  Filter,
  Info
} from 'lucide-react';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/admin/appointments');
      if (response.data.success) {
        setAppointments(response.data.appointments);
      }
    } catch (err) {
      setError('Failed to fetch appointment schedules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment slot?')) return;
    setError('');
    setSuccessMsg('');
    try {
      const response = await api.put(`/admin/appointments/${id}/cancel`);
      if (response.data.success) {
        setSuccessMsg('Appointment cancelled successfully.');
        setAppointments(appointments.map(a => a._id === id ? response.data.appointment : a));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel appointment.');
    }
  };

  const filteredAppointments = appointments.filter(a => 
    statusFilter === 'All' ? true : a.status === statusFilter
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.04 }
    }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 350, damping: 25 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>Appointment Registry</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Audit, moderate and manage patient booking schedules.</p>
        </div>

        {/* Filters Select */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl shadow-xs">
          <Filter className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-xs font-semibold outline-hidden text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <option value="All">All Bookings</option>
            <option value="Pending">Pending Approval</option>
            <option value="Confirmed">Confirmed Schedule</option>
            <option value="Completed">Completed Visits</option>
            <option value="Cancelled">Cancelled Visits</option>
          </select>
        </div>
      </motion.div>

      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-650 dark:text-red-400 rounded-xl flex items-center gap-3 text-xs"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center gap-3 text-xs"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 space-y-4 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
              </div>
              <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : filteredAppointments.length === 0 ? (
        <motion.div 
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-12 text-center text-slate-400 dark:text-slate-500 shadow-xs"
        >
          <Info className="h-10 w-10 text-slate-300 dark:text-slate-650 mx-auto mb-3" />
          <p className="text-sm">No scheduled appointments found matching this status filter.</p>
        </motion.div>
      ) : (
        /* Appointment Cards Grid */
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {filteredAppointments.map((app) => (
            <motion.div 
              key={app._id}
              variants={itemVariants}
              whileHover={{ y: -4, boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.04)' }}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between transition-colors"
            >
              {/* Doctor and Patient Info */}
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-blue-50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/10 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Stethoscope size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs">{app.doctor?.user?.name || 'Doctor'}</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">Consultant Physician</p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border ${
                    app.status === 'Completed' ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/10 text-emerald-600 dark:text-emerald-400' :
                    app.status === 'Confirmed' ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/10 text-blue-600 dark:text-blue-400' :
                    app.status === 'Cancelled' ? 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/10 text-red-650 dark:text-red-400' :
                    'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/10 text-amber-600 dark:text-amber-400 animate-pulse'
                  }`}>
                    {app.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <div className="h-8 w-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                    <User size={14} />
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">{app.patient?.user?.name || 'Patient'}</h5>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate">{app.patient?.user?.email || 'No email'}</p>
                  </div>
                </div>

                {/* Date & Reason */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Date & Slot</span>
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-350 text-[11px] font-medium">
                      <Calendar size={12} className="text-slate-400" />
                      <span>{new Date(app.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-500 text-[10px] font-mono mt-0.5">
                      <Clock size={12} className="text-slate-400" />
                      <span>{app.slot}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Reason</span>
                    <p className="text-slate-700 dark:text-slate-350 text-[11px] truncate font-medium">{app.reason || 'Routine Consultation'}</p>
                  </div>
                </div>
              </div>

              {/* Footer Panel */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase">
                  <IndianRupee size={12} className="text-slate-400 mr-0.5" />
                  <span>Fee Status:</span>
                  <span className={`ml-1.5 ${app.paymentStatus === 'Paid' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {app.paymentStatus || 'Pending'}
                  </span>
                </div>

                {/* Cancel Action */}
                {(app.status === 'Pending' || app.status === 'Confirmed') && (
                  <button
                    onClick={() => handleCancel(app._id)}
                    className="text-[10px] font-bold px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-500 dark:text-slate-400 hover:text-red-650 dark:hover:text-red-400 border border-slate-200 dark:border-slate-800 hover:border-red-100 dark:hover:border-red-900/10 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Cancel Booking</span>
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Appointments;
