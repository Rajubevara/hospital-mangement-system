import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  Calendar, 
  Stethoscope, 
  Clock, 
  DollarSign, 
  AlertCircle,
  XCircle,
  FileCheck2,
  Bookmark,
  CheckCircle2
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <span>My Scheduled Consultations</span>
          <Bookmark className="h-6 w-6 text-blue-500" />
        </h1>
        <p className="text-slate-400 mt-1">Review status details, download reports, or cancel pending bookings.</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-950/20 border border-red-900/40 text-red-400 rounded-2xl flex items-center gap-3 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 rounded-2xl flex items-center gap-3 text-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
          You do not have any appointments booked.
        </div>
      ) : (
        /* Appointments Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {appointments.map((app) => (
            <div 
              key={app._id}
              className="bg-slate-900/80 border border-slate-850 hover:border-slate-750/60 rounded-3xl p-6 shadow-lg flex flex-col justify-between transition-all duration-300"
            >
              <div className="space-y-4">
                {/* Doctor and Status */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-center text-blue-400">
                      <Stethoscope size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{app.doctor?.user?.name || 'Doctor'}</h4>
                      <p className="text-[10px] text-slate-500">{app.doctor?.specialty?.name || 'Clinical Specialist'}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                    app.status === 'Completed' ? 'bg-emerald-500/10 border-emerald-500/15 text-emerald-400' :
                    app.status === 'Confirmed' ? 'bg-blue-500/10 border-blue-500/15 text-blue-400' :
                    app.status === 'Cancelled' ? 'bg-red-500/10 border-red-500/15 text-red-400' :
                    'bg-amber-500/10 border-amber-500/15 text-amber-400 animate-pulse'
                  }`}>
                    {app.status}
                  </span>
                </div>

                {/* Date & Reason */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-950/40 p-3.5 border border-slate-850 rounded-2xl">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 block uppercase tracking-wider mb-1">Consultation Date</span>
                    <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                      <Calendar size={13} className="text-slate-500" />
                      <span>{new Date(app.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 font-mono mt-0.5 ml-0.5">
                      <Clock size={12} className="text-slate-655" />
                      <span>{app.slot}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 block uppercase tracking-wider mb-1">Stated Reason</span>
                    <p className="text-slate-300 font-medium truncate">{app.reason || 'General wellness check'}</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center text-xs font-semibold text-slate-450">
                  <DollarSign size={14} className="text-slate-550" />
                  <span>Fee status:</span>
                  <span className={`ml-1 ${app.paymentStatus === 'Paid' ? 'text-emerald-450' : 'text-amber-450'}`}>
                    {app.paymentStatus || 'Pending'}
                  </span>
                </div>

                {/* Cancel Trigger */}
                {(app.status === 'Pending' || app.status === 'Confirmed') && (
                  <button
                    onClick={() => handleCancel(app._id)}
                    className="text-xs px-3 py-1.5 bg-slate-855 hover:bg-red-955/20 text-slate-400 hover:text-red-400 border border-transparent hover:border-red-900/30 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Cancel booking</span>
                  </button>
                )}

                {app.status === 'Completed' && (
                  <span className="text-xs text-slate-550 flex items-center gap-1">
                    <FileCheck2 size={14} className="text-emerald-500" />
                    <span>Visit Completed</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;
