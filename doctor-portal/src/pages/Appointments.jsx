import React, { useState, useEffect } from 'react';
import api from '../utils/api';
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
  Activity
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Consultation Schedules</h1>
        <p className="text-slate-400 mt-1">Review Patient bookings, confirm schedules, and write clinical prescriptions.</p>
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
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
          No appointments recorded in your schedule history.
        </div>
      ) : (
        /* Appointment Cards list */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {appointments.map((app) => (
            <div 
              key={app._id}
              className="bg-slate-900/80 border border-slate-850 hover:border-slate-750/50 rounded-3xl p-6 shadow-lg flex flex-col justify-between transition-all duration-300"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-center text-teal-400">
                      <User size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{app.patient?.user?.name || 'Patient'}</h4>
                      <p className="text-[10px] text-slate-500">{app.patient?.user?.phone || 'No phone'}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                    app.status === 'Completed' ? 'bg-emerald-500/10 border-emerald-500/15 text-emerald-400' :
                    app.status === 'Confirmed' ? 'bg-teal-500/10 border-teal-500/15 text-teal-400' :
                    app.status === 'Cancelled' ? 'bg-red-500/10 border-red-500/15 text-red-400' :
                    'bg-amber-500/10 border-amber-500/15 text-amber-400'
                  }`}>
                    {app.status}
                  </span>
                </div>

                {/* Date slot */}
                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950/40 p-3.5 border border-slate-850 rounded-2xl">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 block uppercase tracking-wider mb-1">Appointment Slot</span>
                    <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                      <Calendar size={13} className="text-slate-500" />
                      <span>{new Date(app.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-450 font-mono mt-0.5 ml-0.5">
                      <Clock size={12} className="text-slate-600" />
                      <span>{app.slot}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 block uppercase tracking-wider mb-1">Symptoms / Reason</span>
                    <p className="text-slate-300 font-medium truncate">{app.reason || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                {/* Pending Actions */}
                {app.status === 'Pending' && (
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => handleUpdateStatus(app._id, 'Confirmed')}
                      className="flex-1 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-teal-500/10"
                    >
                      <Check size={14} />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(app._id, 'Cancelled')}
                      className="flex-1 py-2 bg-slate-850 hover:bg-red-950/20 text-slate-400 hover:text-red-400 border border-transparent hover:border-red-900/30 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
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
                    className="w-full py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-teal-500/10"
                  >
                    <FileText size={14} />
                    <span>Prescribe Medication & Complete</span>
                  </button>
                )}

                {/* Completed Actions -> Download PDF */}
                {app.status === 'Completed' && (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <FileCheck size={14} className="text-emerald-500" />
                      <span>Prescription Generated</span>
                    </span>
                    <a
                      href={`${serverBaseUrl}/${app.prescriptionPdfPath || 'uploads/prescription-' + app._id + '.pdf'}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl font-semibold border border-slate-750 transition-colors flex items-center gap-1.5"
                    >
                      <Download size={13} />
                      <span>View PDF</span>
                    </a>
                  </div>
                )}

                {/* Cancelled placeholder */}
                {app.status === 'Cancelled' && (
                  <span className="text-xs text-slate-600 italic">No actions available</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Prescription Form Modal */}
      {activeAppointment && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setActiveAppointment(null)}
              className="absolute right-6 top-6 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6 border-b border-slate-850">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-teal-400" />
                <span>Write Clinical Prescription</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Patient: {activeAppointment.patient?.user?.name}</p>
            </div>

            <form onSubmit={handlePrescriptionSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Diagnosis */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Diagnosis / Findings</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acute hypertension, needs sodium restriction"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500 rounded-xl py-2.5 px-4 text-slate-200 placeholder-slate-650 outline-none transition-all duration-200"
                />
              </div>

              {/* Medicines block */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Prescribed Medicines</label>
                  <button
                    type="button"
                    onClick={handleAddMedicine}
                    className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add Medicine</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {medicines.map((med, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 p-3 bg-slate-950/40 border border-slate-850 rounded-2xl items-center relative pr-10 md:pr-3">
                      <div className="md:col-span-4">
                        <label className="md:hidden block text-[10px] text-slate-500 font-medium mb-1">Medicine Name</label>
                        <input
                          type="text"
                          required
                          placeholder="Medicine name"
                          value={med.name}
                          onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-200 placeholder-slate-600 outline-none"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="md:hidden block text-[10px] text-slate-500 font-medium mb-1">Dosage</label>
                        <input
                          type="text"
                          required
                          placeholder="Dosage (1-0-1)"
                          value={med.dosage}
                          onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2 text-xs md:text-center text-slate-350 outline-none"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="md:hidden block text-[10px] text-slate-500 font-medium mb-1">Duration</label>
                        <input
                          type="text"
                          required
                          placeholder="Duration"
                          value={med.duration}
                          onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2 text-xs md:text-center text-slate-350 outline-none"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="md:hidden block text-[10px] text-slate-500 font-medium mb-1">Instructions</label>
                        <input
                          type="text"
                          placeholder="Instructions"
                          value={med.instructions}
                          onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-350 outline-none"
                        />
                      </div>
                      <div className="absolute right-3 top-[32px] md:static md:col-span-1 text-center">
                        <button
                          type="button"
                          disabled={medicines.length === 1}
                          onClick={() => handleRemoveMedicine(idx)}
                          className="text-red-500 hover:text-red-400 disabled:opacity-30 cursor-pointer"
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
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Required Lab Tests</label>
                  <button
                    type="button"
                    onClick={handleAddLabTest}
                    className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer"
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
                        placeholder="e.g. ECG, Lipid Profile"
                        value={test}
                        onChange={(e) => handleLabTestChange(idx, e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-200 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveLabTest(idx)}
                        className="text-red-500 hover:text-red-400 cursor-pointer p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advice */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Advice / Instructions</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Avoid high cholesterol diet, return for follow-up checkup in 2 weeks..."
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500 rounded-xl py-2.5 px-4 text-slate-200 placeholder-slate-650 outline-none resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-850 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveAppointment(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-semibold shadow-lg shadow-teal-500/10 transition-colors cursor-pointer"
                >
                  Confirm & Generate PDF
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
