import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  User, 
  Clock, 
  Check, 
  X, 
  FileText, 
  Plus, 
  Trash2, 
  Download,
  AlertCircle,
  FileCheck,
  Info
} from 'lucide-react';

const Appointments = () => {
  const serverBaseUrl = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://127.0.0.1:5000';

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Prescription Modal Form State
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [advice, setAdvice] = useState('');
  const [labTests, setLabTests] = useState(['']);
  const [medicines, setMedicines] = useState([
    { name: '', dosage: '1-0-1', duration: '5 days', instructions: 'After food' }
  ]);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/doctor/appointments');
      if (response.data.success) {
        setAppointments(response.data.appointments);
      }
    } catch (err) {
      setError('Failed to fetch appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    setError('');
    setSuccessMsg('');
    try {
      const response = await api.put(`/doctor/appointments/${id}/status`, { status });
      if (response.data.success) {
        setSuccessMsg(`Appointment status updated to ${status}.`);
        setAppointments(appointments.map(a => a._id === id ? response.data.appointment : a));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    }
  };

  // Medicine Handlers
  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '1-0-1', duration: '5 days', instructions: 'After food' }]);
  };
  const handleRemoveMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };
  const handleMedicineChange = (index, field, val) => {
    setMedicines(medicines.map((med, i) => i === index ? { ...med, [field]: val } : med));
  };

  // Lab Test Handlers
  const handleAddLabTest = () => setLabTests([...labTests, '']);
  const handleRemoveLabTest = (index) => setLabTests(labTests.filter((_, i) => i !== index));
  const handleLabTestChange = (index, val) => {
    setLabTests(labTests.map((t, i) => i === index ? val : t));
  };

  // Submit Prescription
  const handleOpenPrescriptionModal = (app) => {
    setActiveAppointment(app);
    setDiagnosis('');
    setAdvice('');
    setLabTests(['']);
    setMedicines([{ name: '', dosage: '1-0-1', duration: '5 days', instructions: 'After food' }]);
    setError('');
    setSuccessMsg('');
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Clean empty lab tests
    const filteredLabTests = labTests.filter(t => t.trim() !== '');

    try {
      const response = await api.post(`/doctor/appointments/${activeAppointment._id}/prescription`, {
        diagnosis,
        advice,
        labTests: filteredLabTests,
        medicines: medicines.filter(m => m.name.trim() !== ''),
      });

      if (response.data.success) {
        setSuccessMsg('Prescription written and saved. PDF generated.');
        setActiveAppointment(null);
        fetchAppointments(); // Refresh status to Completed
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save prescription.');
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
            <span>Consultation Schedules</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review patient bookings, accept consultations and manage electronic prescriptions.</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          <Info className="h-10 w-10 text-slate-300 dark:text-slate-650 mx-auto mb-3" />
          <p className="text-sm">No scheduled consultations or visit history recorded.</p>
        </motion.div>
      ) : (
        /* Appointment Cards list */
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {appointments.map((app) => {
            const statusStyles = {
              Completed: 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100/70 dark:border-emerald-900/20 text-emerald-800 dark:text-emerald-300',
              Confirmed: 'bg-teal-50/50 dark:bg-teal-950/10 border-teal-100/70 dark:border-teal-900/20 text-teal-800 dark:text-teal-300',
              Cancelled: 'bg-rose-50/40 dark:bg-rose-950/10 border-rose-100/70 dark:border-rose-900/20 text-rose-800 dark:text-rose-300',
              Pending: 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-100/70 dark:border-amber-900/20 text-amber-800 dark:text-amber-300',
            };
            const activeStyle = statusStyles[app.status] || statusStyles.Pending;

            return (
              <motion.div 
                key={app._id}
                variants={itemVariants}
                whileHover={{ y: -4, boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.04)' }}
                className={`${activeStyle} border rounded-3xl p-6 shadow-xs flex flex-col justify-between transition-all`}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-white/80 dark:bg-slate-900/80 rounded-xl flex items-center justify-center shadow-xs">
                        <User size={16} className="opacity-80" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs">{app.patient?.user?.name || 'Patient'}</h4>
                        <p className="text-[10px] opacity-75">{app.patient?.user?.phone || 'No phone'}</p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-lg text-[9px] font-extrabold bg-white/70 dark:bg-slate-800/75 border border-black/5 dark:border-white/5 uppercase tracking-wider">
                      {app.status}
                    </span>
                  </div>

                {/* Date slot */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-950/40 p-3.5 border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <div>
                    <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 block uppercase tracking-wider mb-1">Appointment Slot</span>
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
                    <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 block uppercase tracking-wider mb-1">Symptoms / Reason</span>
                    <p className="text-slate-700 dark:text-slate-350 text-[11px] font-medium truncate">{app.reason || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                {/* Pending Actions */}
                {app.status === 'Pending' && (
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => handleUpdateStatus(app._id, 'Confirmed')}
                      className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Check size={14} />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(app._id, 'Cancelled')}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <X size={14} />
                      <span>Decline</span>
                    </button>
                  </div>
                )}

                {/* Confirmed actions -> Write Prescription */}
                {app.status === 'Confirmed' && (
                  <button
                    onClick={() => handleOpenPrescriptionModal(app)}
                    className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <FileText size={14} />
                    <span>Prescribe Medication & Complete</span>
                  </button>
                )}

                {/* Completed Actions -> Download PDF */}
                {app.status === 'Completed' && (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <FileCheck size={14} className="text-emerald-500" />
                      <span>Prescription Generated</span>
                    </span>
                    <a
                      href={`${serverBaseUrl}/${app.prescriptionPdfPath || 'uploads/prescription-' + app._id + '.pdf'}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold border border-slate-200 dark:border-slate-800 transition-colors flex items-center gap-1.5"
                    >
                      <Download size={13} />
                      <span>View PDF</span>
                    </a>
                  </div>
                )}

                {/* Cancelled placeholder */}
                {app.status === 'Cancelled' && (
                  <span className="text-xs text-slate-400 dark:text-slate-600 italic">No actions available</span>
                )}
              </div>
            </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Prescription Form Modal */}
      <AnimatePresence>
        {activeAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveAppointment(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl w-full max-w-2xl overflow-hidden shadow-xl relative z-10"
            >
              <button 
                onClick={() => setActiveAppointment(null)}
                className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-teal-600" />
                  <span>Write Clinical Prescription</span>
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Patient: {activeAppointment.patient?.user?.name}</p>
              </div>

              <form onSubmit={handlePrescriptionSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Diagnosis */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Diagnosis / Findings</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acute bronchitis, patient needs rest"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-hidden transition-all duration-200"
                  />
                </div>

                {/* Medicines block */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Prescribed Medicines</label>
                    <button
                      type="button"
                      onClick={handleAddMedicine}
                      className="text-xs font-bold text-teal-605 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Add Medicine</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {medicines.map((med, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800 rounded-2xl items-center relative pr-10 md:pr-3">
                        <div className="md:col-span-4">
                          <label className="md:hidden block text-[9px] text-slate-400 font-bold mb-1">Medicine Name</label>
                          <input
                            type="text"
                            required
                            placeholder="Medicine name"
                            value={med.name}
                            onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-hidden"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="md:hidden block text-[9px] text-slate-400 font-bold mb-1">Dosage</label>
                          <input
                            type="text"
                            required
                            placeholder="Dosage (1-0-1)"
                            value={med.dosage}
                            onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-2 text-xs md:text-center text-slate-800 dark:text-slate-200 outline-hidden"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="md:hidden block text-[9px] text-slate-400 font-bold mb-1">Duration</label>
                          <input
                            type="text"
                            required
                            placeholder="Duration"
                            value={med.duration}
                            onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-2 text-xs md:text-center text-slate-800 dark:text-slate-200 outline-hidden"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="md:hidden block text-[9px] text-slate-400 font-bold mb-1">Instructions</label>
                          <input
                            type="text"
                            placeholder="Instructions"
                            value={med.instructions}
                            onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-800 dark:text-slate-200 outline-hidden"
                          />
                        </div>
                        <div className="absolute right-3 top-[32px] md:static md:col-span-1 text-center">
                          <button
                            type="button"
                            disabled={medicines.length === 1}
                            onClick={() => handleRemoveMedicine(idx)}
                            className="text-red-500 hover:text-red-600 disabled:opacity-30 cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lab Tests */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Required Lab Tests</label>
                    <button
                      type="button"
                      onClick={handleAddLabTest}
                      className="text-xs font-bold text-teal-605 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Add Test</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {labTests.map((test, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. CBC, Serum Creatinine"
                          value={test}
                          onChange={(e) => handleLabTestChange(idx, e.target.value)}
                          className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-200 outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveLabTest(idx)}
                          className="text-red-500 hover:text-red-600 cursor-pointer p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Advice */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Advice / Instructions</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Drink plenty of water, check temperature every 4 hours..."
                    value={advice}
                    onChange={(e) => setAdvice(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-hidden resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveAppointment(null)}
                    className="px-4 py-2.5 bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    Confirm & Save Prescription
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Appointments;
