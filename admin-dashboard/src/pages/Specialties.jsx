import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Baby, 
  Sparkles, 
  Brain, 
  Activity, 
  Trash2, 
  Plus, 
  AlertCircle,
  X,
  Stethoscope,
  Smile,
  Info
} from 'lucide-react';

const Specialties = () => {
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', icon: 'Activity' });

  // Map icon strings to components
  const iconMap = {
    HeartIcon: Heart,
    Heart: Heart,
    UserGroupIcon: Baby,
    Baby: Baby,
    SparklesIcon: Sparkles,
    Sparkles: Sparkles,
    CpuChipIcon: Brain,
    Brain: Brain,
    WrenchIcon: Activity,
    Activity: Activity,
    ShieldCheckIcon: Smile,
    Smile: Smile,
  };

  const fetchSpecialties = async () => {
    try {
      const response = await api.get('/admin/specialties');
      if (response.data.success) {
        setSpecialties(response.data.specialties);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading specialties.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const handleOpenCreate = () => {
    setEditingSpecialty(null);
    setFormData({ name: '', description: '', icon: 'Activity' });
    setError('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (spec) => {
    setEditingSpecialty(spec);
    setFormData({ name: spec.name, description: spec.description, icon: spec.icon || 'Activity' });
    setError('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this specialty?')) return;
    setError('');
    setSuccessMsg('');
    try {
      const response = await api.delete(`/admin/specialties/${id}`);
      if (response.data.success) {
        setSuccessMsg('Specialty deleted successfully.');
        setSpecialties(specialties.filter((s) => s._id !== id));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete specialty.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    try {
      if (editingSpecialty) {
        // Update
        const response = await api.put(`/admin/specialties/${editingSpecialty._id}`, formData);
        if (response.data.success) {
          setSuccessMsg('Specialty updated successfully.');
          setSpecialties(specialties.map((s) => s._id === editingSpecialty._id ? response.data.specialty : s));
          setIsModalOpen(false);
        }
      } else {
        // Create
        const response = await api.post('/admin/specialties', formData);
        if (response.data.success) {
          setSuccessMsg('Specialty created successfully.');
          setSpecialties([...specialties, response.data.specialty]);
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save specialty.');
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
            <span>Medical Specialties</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure and manage clinical department specialties and settings.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Add Specialty</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 space-y-4 animate-pulse">
              <div className="flex justify-between">
                <div className="h-12 w-12 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                <div className="h-6 w-12 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
              </div>
              <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
              <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : specialties.length === 0 ? (
        <motion.div 
          variants={itemVariants} 
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-12 text-center text-slate-400 dark:text-slate-500 shadow-xs"
        >
          <Info className="h-10 w-10 text-slate-300 dark:text-slate-650 mx-auto mb-3" />
          <p className="text-sm">No specialties found. Click "Add Specialty" to create one.</p>
        </motion.div>
      ) : (
        /* Specialty Cards Grid */
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {specialties.map((spec) => {
            const IconComp = iconMap[spec.icon] || Activity;
            return (
              <motion.div 
                key={spec._id}
                variants={itemVariants}
                whileHover={{ y: -4, boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.04)' }}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-350 dark:hover:border-slate-700 rounded-3xl p-6 flex flex-col justify-between shadow-xs transition-colors group"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/20 p-3 rounded-2xl text-blue-600 dark:text-blue-400 shadow-inner">
                      <IconComp className="h-5 w-5" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEdit(spec)}
                        className="text-[10px] font-bold px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(spec._id)}
                        className="text-[10px] font-bold p-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-600 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2">{spec.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-3">{spec.description}</p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                  <span className="font-semibold uppercase tracking-wider">Icon</span>
                  <span className="font-mono text-slate-500 dark:text-slate-600">{spec.icon}</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Modal Dialog */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl w-full max-w-md overflow-hidden shadow-xl relative z-10"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                  {editingSpecialty ? 'Modify Specialty' : 'Register Specialty'}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Specialty Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Neurology"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-hidden transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Department Icon</label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-200 outline-hidden transition-all duration-200"
                  >
                    <option value="Heart">Heart (Cardiology)</option>
                    <option value="Baby">Baby (Pediatrics)</option>
                    <option value="Sparkles">Sparkles (Dermatology)</option>
                    <option value="Brain">Brain (Neurology)</option>
                    <option value="Activity">Activity (Orthopedics/General)</option>
                    <option value="Smile">Smile (Oncology/Recovery)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide a detailed description of this clinical specialty..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/85 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-hidden transition-all duration-200 resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    Save Changes
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

export default Specialties;
