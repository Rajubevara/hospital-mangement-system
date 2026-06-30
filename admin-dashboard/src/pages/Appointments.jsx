import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  Calendar, 
  User, 
  Stethoscope, 
  Clock, 
  DollarSign, 
  AlertCircle,
  FileCheck2,
  XCircle,
  CheckCircle2,
  Filter
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Appointment Schedules</h1>
          <p className="text-slate-400 mt-1">Audit, filter, and moderate outpatient visit bookings.</p>
        </div>

        {/* Filters Select */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-850 px-4 py-2 rounded-xl text-slate-300">
          <Filter className="h-4 w-4 text-slate-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-sm font-semibold outline-none text-slate-200 cursor-pointer"
          >
            <option value="All">All Bookings</option>
            <option value="Pending">Pending Approval</option>
            <option value="Confirmed">Confirmed Schedule</option>
            <option value="Completed">Completed Visits</option>
            <option value="Cancelled">Cancelled Visits</option>
          </select>
        </div>
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
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
          No appointments matches found for this filter.
        </div>
      ) : (
        /* Appointment Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAppointments.map((app) => (
            <div 
              key={app._id}
              className="bg-slate-900/80 border border-slate-850 hover:border-slate-750/60 rounded-3xl p-6 shadow-lg flex flex-col justify-between transition-all duration-300"
            >
              {/* Doctor and Patient Info */}
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-center text-blue-400">
                      <Stethoscope size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{app.doctor?.user?.name || 'Doctor'}</h4>
                      <p className="text-xs text-slate-500">Consultant Physician</p>
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

                <div className="flex items-center gap-3 p-3 bg-slate-950/40 border border-slate-850 rounded-2xl">
                  <div className="h-9 w-9 bg-slate-900 rounded-xl flex items-center justify-center text-slate-400">
                    <User size={16} />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-200 text-xs">{app.patient?.user?.name || 'Patient'}</h5>
                    <p className="text-[10px] text-slate-500">{app.patient?.user?.email || 'No email'}</p>
                  </div>
                </div>

                {/* Date & Reason */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-500 font-semibold block uppercase tracking-wider text-[10px]">Date / Slot</span>
                    <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                      <Calendar size={13} className="text-slate-500" />
                      <span>{new Date(app.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 font-mono mt-0.5">
                      <Clock size={13} className="text-slate-600" />
                      <span>{app.slot}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 font-semibold block uppercase tracking-wider text-[10px]">Reason</span>
                    <p className="text-slate-300 truncate font-medium">{app.reason || 'Routine consultation'}</p>
                  </div>
                </div>
              </div>

              {/* Footer Panel */}
              <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center text-xs font-semibold text-slate-400">
                  <DollarSign size={14} className="text-slate-500" />
                  <span>Payment:</span>
                  <span className={`ml-1.5 ${app.paymentStatus === 'Paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {app.paymentStatus || 'Pending'}
                  </span>
                </div>

                {/* Cancel Action */}
                {(app.status === 'Pending' || app.status === 'Confirmed') && (
                  <button
                    onClick={() => handleCancel(app._id)}
                    className="text-xs px-3 py-1.5 bg-slate-850 hover:bg-red-950/20 text-slate-400 hover:text-red-400 border border-transparent hover:border-red-900/30 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Cancel Appointment</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Appointments;
