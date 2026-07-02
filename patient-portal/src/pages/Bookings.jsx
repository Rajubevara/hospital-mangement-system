import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Stethoscope, 
  Clock, 
  IndianRupee, 
  AlertCircle,
  XCircle,
  FileCheck2,
  Bookmark,
  CheckCircle2,
  Info
} from 'lucide-react';

const Bookings = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchBookings = async () => {
    try {
      const response = await api.get('/patient/appointments');
      if (response.data.success) {
        setAppointments(response.data.appointments);
      }
    } catch (err) {
      setError('Failed to load your consulting bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking slot?')) return;
    setError('');
    setSuccessMsg('');

    try {
      const response = await api.put(`/patient/appointments/${id}/cancel`);
      if (response.data.success) {
        setSuccessMsg('Appointment cancelled successfully.');
        setAppointments(appointments.map(a => a._id === id ? response.data.appointment : a));
        fetchBookings(); // refresh relationships
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel appointment.');
    }
  };

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
            <span>My Scheduled Consultations</span>
            <Bookmark className="h-6 w-6 text-blue-600" />
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review status details, download medical reports, or cancel pending bookings.</p>
        </div>
      </motion.div>

      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3 text-xs"
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
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 space-y-4 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
              </div>
              <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <motion.div 
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-12 text-center text-slate-400 dark:text-slate-500 shadow-xs"
        >
          <Info className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-sm">You do not have any scheduled consultation visits currently.</p>
        </motion.div>
      ) : (
        /* Appointments Grid */
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {appointments.map((app) => (
            <motion.div 
              key={app._id}
              variants={itemVariants}
              whileHover={{ y: -4, boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.04)' }}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-350 dark:hover:border-slate-700/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between transition-colors"
            >
              <div className="space-y-4">
                {/* Doctor and Status */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-blue-50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/10 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Stethoscope size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs">{app.doctor?.user?.name || 'Doctor'}</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">{app.doctor?.specialty?.name || 'Clinical Specialist'}</p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border ${
                    app.status === 'Completed' ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/10 text-emerald-600 dark:text-emerald-400' :
                    app.status === 'Confirmed' ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/10 text-blue-600 dark:text-blue-400' :
                    app.status === 'Cancelled' ? 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/10 text-red-600 dark:text-red-400' :
                    'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/10 text-amber-600 dark:text-amber-400 animate-pulse'
                  }`}>
                    {app.status}
                  </span>
                </div>

                {/* Date & Reason */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-950/40 p-3.5 border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <div>
                    <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 block uppercase tracking-wider mb-1">Consultation Date</span>
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-350 text-[11px] font-semibold">
                      <Calendar size={12} className="text-slate-400" />
                      <span>{new Date(app.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-550 text-[10px] font-mono mt-0.5">
                      <Clock size={12} className="text-slate-400" />
                      <span>{app.slot}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 block uppercase tracking-wider mb-1">Stated Reason</span>
                    <p className="text-slate-700 dark:text-slate-350 text-[11px] font-medium truncate">{app.reason || 'General wellness check'}</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                  <IndianRupee size={11} className="text-slate-400 mr-0.5" />
                  <span>Fee status:</span>
                  <span className={`ml-1.5 ${app.paymentStatus === 'Paid' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {app.paymentStatus || 'Pending'}
                  </span>
                </div>

                {/* Cancel Trigger */}
                {(app.status === 'Pending' || app.status === 'Confirmed') && (
                  <button
                    onClick={() => handleCancel(app._id)}
                    className="text-[10px] font-bold px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-slate-800 hover:border-red-100 dark:hover:border-red-900/10 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Cancel Booking</span>
                  </button>
                )}

                {app.status === 'Completed' && (
                  <span className="text-xs text-slate-400 dark:text-slate-550 flex items-center gap-1">
                    <FileCheck2 size={14} className="text-emerald-500" />
                    <span>Visit Completed</span>
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Bookings;
