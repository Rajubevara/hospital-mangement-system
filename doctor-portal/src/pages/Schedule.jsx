import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Plus, 
  Trash2, 
  Save, 
  AlertCircle,
  FileCheck,
  UserCheck,
  CalendarDays,
  Info
} from 'lucide-react';

const Schedule = () => {
  const [profile, setProfile] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Profile Edit fields
  const [consultationFee, setConsultationFee] = useState(100);
  const [experience, setExperience] = useState(5);
  const [qualification, setQualification] = useState('');
  const [biography, setBiography] = useState('');

  const fetchProfile = async () => {
    try {
      const response = await api.get('/doctor/profile');
      if (response.data.success && response.data.doctor) {
        const doc = response.data.doctor;
        setProfile(doc);
        setAvailability(doc.availability || []);
        setConsultationFee(doc.consultationFee);
        setExperience(doc.experience);
        setQualification(doc.qualification);
        setBiography(doc.biography);
      }
    } catch (err) {
      setError('Failed to fetch doctor profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle availability update
  const handleAddDay = () => {
    const availableDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const currentDays = availability.map(a => a.day);
    const nextDay = availableDays.find(d => !currentDays.includes(d));

    if (!nextDay) {
      setError('All days have already been configured.');
      return;
    }

    setAvailability([...availability, { day: nextDay, slots: ['09:00', '10:00', '11:00'] }]);
  };

  const handleRemoveDay = (index) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const handleDayChange = (index, newDay) => {
    if (availability.some((a, i) => i !== index && a.day === newDay)) {
      setError(`Availability for ${newDay} is already configured.`);
      return;
    }
    setAvailability(availability.map((a, i) => i === index ? { ...a, day: newDay } : a));
  };

  const handleAddSlot = (dayIndex) => {
    const currentSlots = [...availability[dayIndex].slots];
    // Suggest next hourly slot
    let newSlot = '09:00';
    if (currentSlots.length > 0) {
      const lastSlot = currentSlots[currentSlots.length - 1];
      const [hour, min] = lastSlot.split(':').map(Number);
      const nextHour = String(hour + 1).padStart(2, '0');
      newSlot = `${nextHour}:00`;
    }
    setAvailability(availability.map((a, i) => i === dayIndex ? { ...a, slots: [...a.slots, newSlot] } : a));
  };

  const handleRemoveSlot = (dayIndex, slotIndex) => {
    setAvailability(availability.map((a, i) => {
      if (i === dayIndex) {
        return { ...a, slots: a.slots.filter((_, si) => si !== slotIndex) };
      }
      return a;
    }));
  };

  const handleSlotChange = (dayIndex, slotIndex, newVal) => {
    setAvailability(availability.map((a, i) => {
      if (i === dayIndex) {
        const newSlots = [...a.slots];
        newSlots[slotIndex] = newVal;
        return { ...a, slots: newSlots };
      }
      return a;
    }));
  };

  const handleSave = async () => {
    setError('');
    setSuccessMsg('');
    setSaving(true);
    try {
      const response = await api.put('/doctor/profile', {
        consultationFee,
        experience,
        qualification,
        biography,
        availability,
      });
      if (response.data.success) {
        setSuccessMsg('Profile and schedule updated successfully.');
        setProfile(response.data.doctor);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile changes.');
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl animate-pulse"></div>
          <div className="h-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl animate-pulse lg:col-span-2"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>Schedule & Profile</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure your weekly consulting hours, fee structures, and biography details.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={saving}
          className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors duration-200 w-full sm:w-auto"
        >
          {saving ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save Schedule</span>
            </>
          )}
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
            <FileCheck className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Details Form */}
        <motion.div 
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 lg:col-span-1 space-y-4 shadow-xs"
        >
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <UserCheck className="h-4 w-4 text-teal-600" />
            <span>Consultant Details</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Qualifications</label>
              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-200 outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Experience (Yrs)</label>
                <input
                  type="number"
                  min={0}
                  value={experience}
                  onChange={(e) => setExperience(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-200 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Consultation Fee (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-200 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Biography Profile</label>
              <textarea
                rows={5}
                value={biography}
                onChange={(e) => setBiography(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-200 outline-hidden resize-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Schedule Slots Form */}
        <motion.div 
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 lg:col-span-2 space-y-6 shadow-xs"
        >
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-teal-600" />
              <span>Weekly Availability Slots</span>
            </h3>
            <button
              onClick={handleAddDay}
              className="text-xs font-bold text-teal-605 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Day</span>
            </button>
          </div>

          {availability.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
              <Info className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p>No consulting availability configured. Click "Add Day" to add slots.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {availability.map((avail, dayIdx) => (
                <div key={dayIdx} className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-3">
                  {/* Day Header */}
                  <div className="flex justify-between items-center">
                    <select
                      value={avail.day}
                      onChange={(e) => handleDayChange(dayIdx, e.target.value)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 px-3 text-xs text-slate-800 dark:text-slate-200 outline-hidden font-bold cursor-pointer"
                    >
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                      <option value="Sunday">Sunday</option>
                    </select>

                    <button
                      onClick={() => handleRemoveDay(dayIdx)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Slots list */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Configured Hours (24-Hour Format)</span>
                      <button
                        type="button"
                        onClick={() => handleAddSlot(dayIdx)}
                        className="text-[10px] font-bold text-teal-605 hover:text-teal-700 flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus size={12} />
                        <span>Add Slot</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {avail.slots?.map((slot, slotIdx) => (
                        <div key={slotIdx} className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-1.5 px-2.5 rounded-xl">
                          <Clock size={12} className="text-slate-400 dark:text-slate-500" />
                          <input
                            type="text"
                            placeholder="09:00"
                            value={slot}
                            onChange={(e) => handleSlotChange(dayIdx, slotIdx, e.target.value)}
                            className="bg-transparent text-xs font-mono font-bold text-slate-700 dark:text-slate-200 outline-hidden w-10 text-center"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveSlot(dayIdx, slotIdx)}
                            className="text-slate-400 hover:text-red-500 p-0.5"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Schedule;
