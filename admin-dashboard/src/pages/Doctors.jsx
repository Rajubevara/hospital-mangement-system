import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
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
  AlertCircle,
  Briefcase,
  BookOpen,
  Info
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
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
            <span>Doctor Directory</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage clinical staff registry, schedules, and active consultation fees.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsCreateOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Add Doctor</span>
        </motion.button>
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
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 space-y-4 animate-pulse">
              <div className="flex gap-4">
                <div className="h-16 w-16 bg-slate-200 dark:bg-slate-800 rounded-2xl shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                  <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                </div>
              </div>
              <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            </div>
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <motion.div 
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-12 text-center text-slate-400 dark:text-slate-500 shadow-xs"
        >
          <Info className="h-10 w-10 text-slate-300 dark:text-slate-650 mx-auto mb-3" />
          <p className="text-sm">No doctor profiles registered. Click "Add Doctor" to provision one.</p>
        </motion.div>
      ) : (
        /* Doctor list */
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 xl:grid-cols-2 gap-6"
        >
          {doctors.map((doc) => (
            <motion.div 
              key={doc._id}
              variants={itemVariants}
              whileHover={{ y: -4, boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.04)' }}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80 rounded-3xl p-6 flex flex-col justify-between shadow-xs transition-colors relative group overflow-hidden"
            >
              {/* Top Details */}
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-lg font-bold shadow-inner shrink-0">
                  {doc.user?.name ? doc.user.name.replace('Dr. ', '').split(' ').map(n => n[0]).join('').toUpperCase() : <Stethoscope />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 truncate">{doc.user?.name || 'Doctor Name'}</h3>
                    <span className="text-[10px] px-2 py-0.5 bg-blue-50 dark:bg-blue-950/35 border border-blue-100 dark:border-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full font-semibold">
                      {doc.specialty?.name || 'General Medicine'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 truncate">{doc.qualification}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">{doc.user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{doc.user?.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                      <span>{doc.experience} Years Experience</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                      <span>Fee: ₹{doc.consultationFee}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Availability Summary */}
              <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-2xl">
                <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">Availability Schedule</span>
                <div className="flex flex-wrap gap-1">
                  {doc.availability?.map((avail, i) => (
                    <span key={i} className="text-[9px] px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-md font-medium">
                      {avail.day}: {avail.slots?.length || 0} slots
                    </span>
                  ))}
                  {(!doc.availability || doc.availability.length === 0) && (
                    <span className="text-xs text-slate-400">No schedule slots configured</span>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => handleToggleStatus(doc)}
                  className={`text-[10px] px-3 py-1.5 rounded-xl font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                    doc.user?.isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/10 text-emerald-600 dark:text-emerald-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/20'
                      : 'bg-red-50 dark:bg-red-950/10 border-red-200 dark:border-red-900/10 text-red-600 dark:text-red-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-900/20'
                  }`}
                >
                  {doc.user?.isActive ? (
                    <>
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Active (Disable)</span>
                    </>
                  ) : (
                    <>
                      <UserX className="h-3.5 w-3.5" />
                      <span>Disabled (Activate)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDelete(doc._id)}
                  className="text-[10px] px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-slate-800 hover:border-red-100 dark:hover:border-red-900/10 rounded-xl transition-all cursor-pointer flex items-center gap-1 font-bold"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove Profile</span>
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Provision Doctor Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl w-full max-w-xl overflow-hidden shadow-xl relative z-10"
            >
              <button 
                onClick={() => setIsCreateOpen(false)}
                className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="p-6 border-b border-slate-100 dark:border-slate-900">
                <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-blue-600" />
                  <span>Register Doctor Profile</span>
                </h3>
              </div>

              <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Doctor Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Sarah Jenkins"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-hidden transition-all duration-205"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="doctor@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-hidden transition-all duration-205"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Password Login</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-hidden transition-all duration-205"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 555-123-4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-hidden transition-all duration-205"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Department Specialty</label>
                    <select
                      required
                      value={formData.specialty}
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-200 outline-hidden transition-all duration-205"
                    >
                      {specialties.map((spec) => (
                        <option key={spec._id} value={spec._id}>{spec.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Years of Experience</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-200 outline-hidden transition-all duration-205"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Academic Qualification</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MD, PhD in Cardiology"
                      value={formData.qualification}
                      onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-hidden transition-all duration-205"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Consultation Fee (₹)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.consultationFee}
                      onChange={(e) => setFormData({ ...formData, consultationFee: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-200 outline-hidden transition-all duration-205"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Professional Biography</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide details of past credentials, experience, and clinical focus..."
                    value={formData.biography}
                    onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-hidden transition-all duration-205 resize-none"
                  />
                </div>

                <div className="text-[10px] text-slate-500 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 leading-relaxed">
                  <strong>Schedule note:</strong> Creating a doctor profile will automatically allocate a standard template schedule (Mon, Wed, Fri slots: 9 AM - 3 PM) which the doctor can customize from their personal doctor portal profile.
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    Provision Profile
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

export default Doctors;
