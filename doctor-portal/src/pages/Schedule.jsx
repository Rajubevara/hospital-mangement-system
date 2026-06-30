import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  Clock, 
  Plus, 
  Trash2, 
  Save, 
  AlertCircle,
  FileCheck,
  UserCheck,
  CalendarDays
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

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Schedule & Profile</h1>
          <p className="text-slate-400 mt-1">Configure your weekly consulting hours, fee structures, and biography details.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-teal-500/10 transition-all duration-200"
        >
          {saving ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          ) : (
            <>
              <Save className="h-5 w-5" />
              <span>Save Schedule</span>
            </>
          )}
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
          <FileCheck className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Details Form */}
        <div className="bg-slate-900/80 border border-slate-850 rounded-3xl p-6 lg:col-span-1 space-y-5">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-850">
            <UserCheck className="h-5 w-5 text-teal-400" />
            <span>Consultant Card</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">Qualifications</label>
              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500 rounded-xl py-2 px-3 text-sm text-slate-200 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-455 uppercase tracking-wider mb-2">Experience (Yrs)</label>
                <input
                  type="number"
                  min={0}
                  value={experience}
                  onChange={(e) => setExperience(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500 rounded-xl py-2 px-3 text-sm text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-455 uppercase tracking-wider mb-2">Consultation Fee ($)</label>
                <input
                  type="number"
                  min={0}
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500 rounded-xl py-2 px-3 text-sm text-slate-200 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">Biography Profile</label>
              <textarea
                rows={5}
                value={biography}
                onChange={(e) => setBiography(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500 rounded-xl py-2 px-3 text-sm text-slate-200 outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Schedule Slots Form */}
        <div className="bg-slate-900/80 border border-slate-850 rounded-3xl p-6 lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-slate-850">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-teal-400" />
              <span>Weekly Availability Slots</span>
            </h3>
            <button
              onClick={handleAddDay}
              className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Day</span>
            </button>
          </div>

          {availability.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No consulting availability configured. Click "Add Day" to add hours.
            </div>
          ) : (
            <div className="space-y-6">
              {availability.map((avail, dayIdx) => (
                <div key={dayIdx} className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl space-y-4">
                  {/* Day Header */}
                  <div className="flex justify-between items-center">
                    <select
                      value={avail.day}
                      onChange={(e) => handleDayChange(dayIdx, e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl py-1.5 px-3 text-sm text-slate-200 outline-none font-semibold cursor-pointer"
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
                      className="text-slate-500 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Slots list */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Configured Hours (24-Hour Format)</span>
                      <button
                        type="button"
                        onClick={() => handleAddSlot(dayIdx)}
                        className="text-[10px] font-bold text-teal-400 hover:text-teal-350 flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus size={12} />
                        <span>Add Slot</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      {avail.slots?.map((slot, slotIdx) => (
                        <div key={slotIdx} className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 py-1.5 px-3 rounded-xl">
                          <Clock size={12} className="text-slate-500" />
                          <input
                            type="text"
                            placeholder="09:00"
                            value={slot}
                            onChange={(e) => handleSlotChange(dayIdx, slotIdx, e.target.value)}
                            className="bg-transparent text-xs font-mono font-semibold text-slate-200 outline-none w-10 text-center"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveSlot(dayIdx, slotIdx)}
                            className="text-slate-500 hover:text-red-400 p-0.5"
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
        </div>
      </div>
    </div>
  );
};

export default Schedule;
