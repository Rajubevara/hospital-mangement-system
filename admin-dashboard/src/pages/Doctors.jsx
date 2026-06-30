import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  Stethoscope, 
  Plus, 
  Trash2, 
  Clock, 
  Mail, 
  Phone, 
  Award, 
  DollarSign, 
  UserCheck, 
  UserX,
  X,
  AlertCircle
} from 'lucide-react';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialty: '',
    experience: 5,
    qualification: '',
    biography: '',
    consultationFee: 100,
  });

  const fetchData = async () => {
    try {
      const [docsRes, specsRes] = await Promise.all([
        api.get('/admin/doctors'),
        api.get('/admin/specialties')
      ]);
      if (docsRes.data.success) setDoctors(docsRes.data.doctors);
      if (specsRes.data.success) {
        setSpecialties(specsRes.data.specialties);
        if (specsRes.data.specialties.length > 0) {
          setFormData(f => ({ ...f, specialty: specsRes.data.specialties[0]._id }));
        }
      }
    } catch (err) {
      setError('Failed to fetch doctor profiles or department specialties.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (doc) => {
    setError('');
    setSuccessMsg('');
    const newStatus = !doc.user?.isActive;
    try {
      const response = await api.put(`/admin/doctors/${doc._id}`, { isActive: newStatus });
      if (response.data.success) {
        setDoctors(doctors.map(d => d._id === doc._id ? response.data.doctor : d));
        setSuccessMsg(`Status updated successfully for ${doc.user?.name}.`);
      }
    } catch (err) {
      setError('Failed to update status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this doctor profile? This will also remove the doctor user login.')) return;
    setError('');
    setSuccessMsg('');
    try {
      const response = await api.delete(`/admin/doctors/${id}`);
      if (response.data.success) {
        setSuccessMsg('Doctor removed successfully.');
        setDoctors(doctors.filter(d => d._id !== id));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove doctor.');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Assign simple default availability slots for demo
    const defaultAvailability = [
      { day: 'Monday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
      { day: 'Wednesday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
      { day: 'Friday', slots: ['09:00', '10:00', '11:00'] }
    ];

    try {
      const response = await api.post('/admin/doctors', { ...formData, availability: defaultAvailability });
      if (response.data.success) {
        setSuccessMsg('Doctor profile provisioned successfully.');
        setDoctors([...doctors, response.data.doctor]);
        setIsCreateOpen(false);
        setFormData({
          name: '',
          email: '',
          password: '',
          phone: '',
          specialty: specialties[0]?._id || '',
          experience: 5,
          qualification: '',
          biography: '',
          consultationFee: 100,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create doctor.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Doctor Directory</h1>
          <p className="text-slate-400 mt-1">Manage clinical staff registry, schedules, and active consultation fees.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/10 transition-all duration-200"
        >
          <Plus className="h-5 w-5" />
          <span>Add Doctor</span>
        </button>
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
      ) : doctors.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
          No doctor profiles registered. Click "Add Doctor" to provision one.
        </div>
      ) : (
        /* Doctor list */
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {doctors.map((doc) => (
            <div 
              key={doc._id}
              className="bg-slate-900/80 border border-slate-850 rounded-3xl p-6 flex flex-col justify-between shadow-lg relative group overflow-hidden"
            >
              {/* Top Details */}
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-blue-500/10 shrink-0">
                  {doc.user?.name ? doc.user.name.replace('Dr. ', '').split(' ').map(n => n[0]).join('').toUpperCase() : <Stethoscope />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-white truncate">{doc.user?.name || 'Doctor Name'}</h3>
                    <span className="text-xs px-2.5 py-1 bg-blue-500/10 border border-blue-500/15 text-blue-400 rounded-full font-medium">
                      {doc.specialty?.name || 'General Medicine'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1 truncate">{doc.qualification}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-500" />
                      <span>{doc.user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-500" />
                      <span>{doc.user?.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-3.5 w-3.5 text-slate-500" />
                      <span>{doc.experience} Years Experience</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-3.5 w-3.5 text-slate-500" />
                      <span>Fee: ${doc.consultationFee}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Availability Summary */}
              <div className="mt-6 p-3.5 bg-slate-950/40 border border-slate-850 rounded-2xl">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Availability Schedule</span>
                <div className="flex flex-wrap gap-1.5">
                  {doc.availability?.map((avail, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-medium">
                      {avail.day}: {avail.slots?.length || 0} slots
                    </span>
                  ))}
                  {(!doc.availability || doc.availability.length === 0) && (
                    <span className="text-xs text-slate-600">No schedule slots configured</span>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                <button
                  onClick={() => handleToggleStatus(doc)}
                  className={`text-xs px-3.5 py-1.5 rounded-xl font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                    doc.user?.isActive
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-red-950/20 hover:text-red-400 hover:border-red-900/30'
                      : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-emerald-950/20 hover:text-emerald-400 hover:border-emerald-900/30'
                  }`}
                >
                  {doc.user?.isActive ? (
                    <>
                      <UserCheck className="h-4 w-4" />
                      <span>Active (Disable)</span>
                    </>
                  ) : (
                    <>
                      <UserX className="h-4 w-4" />
                      <span>Disabled (Activate)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDelete(doc._id)}
                  className="text-xs px-3 py-1.5 bg-slate-850 hover:bg-red-950/30 text-slate-400 hover:text-red-400 border border-transparent hover:border-red-900/30 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Remove Profile</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Provision Doctor Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setIsCreateOpen(false)}
              className="absolute right-6 top-6 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6 border-b border-slate-850">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-blue-500" />
                <span>Register & Provision Doctor Profile</span>
              </h3>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Doctor Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Sarah Jenkins"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 px-4 text-slate-200 placeholder-slate-600 outline-none transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="doctor@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 px-4 text-slate-200 placeholder-slate-600 outline-none transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password Login</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 px-4 text-slate-200 placeholder-slate-600 outline-none transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 555-123-4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 px-4 text-slate-200 placeholder-slate-600 outline-none transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Department Specialty</label>
                  <select
                    required
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-855 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 px-4 text-slate-200 outline-none transition-all duration-200"
                  >
                    {specialties.map((spec) => (
                      <option key={spec._id} value={spec._id}>{spec.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Years of Experience</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 px-4 text-slate-200 outline-none transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Academic Qualification</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MD, PhD in Cardiology"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 px-4 text-slate-200 placeholder-slate-600 outline-none transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Consultation Fee ($)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.consultationFee}
                    onChange={(e) => setFormData({ ...formData, consultationFee: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 px-4 text-slate-200 outline-none transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Professional Biography</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide details of past research, special achievements, and focus areas..."
                  value={formData.biography}
                  onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 px-4 text-slate-200 placeholder-slate-600 outline-none transition-all duration-200 resize-none"
                />
              </div>

              <div className="text-xs text-slate-500 bg-slate-950/40 border border-slate-850 rounded-2xl p-4 leading-relaxed">
                <strong>Schedule note:</strong> Creating a doctor profile will automatically allocate a standard template schedule (Mon, Wed, Fri slots: 9 AM - 3 PM) which the doctor can customize from their personal doctor portal profile.
              </div>

              <div className="pt-4 border-t border-slate-850 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/10 transition-colors cursor-pointer"
                >
                  Provision Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;
