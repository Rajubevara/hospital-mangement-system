import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  Heart, 
  Baby, 
  Sparkles, 
  Brain, 
  Activity, 
  Trash2, 
  Plus, 
  FileText, 
  Smile, 
  AlertCircle,
  X
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Medical Specialties</h1>
          <p className="text-slate-400 mt-1">Configure and manage clinical department specialties.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/10 transition-all duration-200"
        >
          <Plus className="h-5 w-5" />
          <span>Add Specialty</span>
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
      ) : specialties.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
          No specialties found. Click "Add Specialty" to create one.
        </div>
      ) : (
        /* Specialty Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialties.map((spec) => {
            const IconComp = iconMap[spec.icon] || Activity;
            return (
              <div 
                key={spec._id}
                className="bg-slate-900/85 border border-slate-850 hover:border-slate-700/60 rounded-3xl p-6 flex flex-col justify-between shadow-lg transition-all duration-300 group"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl text-blue-500 shadow-inner group-hover:text-blue-400 transition-colors">
                      <IconComp className="h-6 w-6" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEdit(spec)}
                        className="text-xs font-semibold px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(spec._id)}
                        className="text-xs font-semibold p-1.5 bg-slate-850 hover:bg-red-950/30 text-slate-400 hover:text-red-400 border border-transparent hover:border-red-900/30 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{spec.name}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{spec.description}</p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold uppercase tracking-wider">Department</span>
                  <span className="font-mono text-slate-600">{spec.icon}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-6 top-6 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6 border-b border-slate-850">
              <h3 className="text-lg font-bold text-white">
                {editingSpecialty ? 'Edit Specialty' : 'Add Specialty'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Specialty Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cardiology"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 px-4 text-slate-200 placeholder-slate-600 outline-none transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Department Icon</label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 px-4 text-slate-200 outline-none transition-all duration-200"
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
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide a detailed description of the services offered under this department specialty..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 px-4 text-slate-200 placeholder-slate-600 outline-none transition-all duration-200 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-850 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/10 transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Specialties;
