import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarDays, 
  Search, 
  Stethoscope, 
  Award, 
  IndianRupee, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  BookmarkPlus,
  Info
} from 'lucide-react';

const BookAppointment = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Booking Flow State
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/patient/doctors');
      if (response.data.success) {
        setDoctors(response.data.doctors);

        // Extract unique specialties
        const uniqueSpecsMap = {};
        response.data.doctors.forEach(doc => {
          if (doc.specialty) {
            uniqueSpecsMap[doc.specialty._id] = doc.specialty;
          }
        });
        setSpecialties(Object.values(uniqueSpecsMap));
      }
    } catch (err) {
      setError('Failed to fetch doctor directory list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Fetch available slots when doctor or date changes
  useEffect(() => {
    if (!selectedDoctor || !bookingDate) {
      setAvailableSlots([]);
      setSelectedSlot('');
      return;
    }

    const fetchSlots = async () => {
      setSlotsLoading(true);
      setError('');
      try {
        const response = await api.get(`/patient/slots?doctorId=${selectedDoctor._id}&date=${bookingDate}`);
        if (response.data.success) {
          setAvailableSlots(response.data.slots);
          setSelectedSlot('');
        }
      } catch (err) {
        setError('Failed to fetch consulting slots.');
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [selectedDoctor, bookingDate]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !bookingDate || !selectedSlot) return;

    setBookingLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await api.post('/patient/appointments', {
        doctorId: selectedDoctor._id,
        date: bookingDate,
        slot: selectedSlot,
        reason,
      });

      if (response.data.success) {
        if (response.data.paymentRequired) {
          setSuccessMsg('Booking slot locked! Redirecting to secure checkout...');
          setTimeout(() => {
            navigate('/payment', {
              state: {
                orderId: response.data.orderId,
                amount: response.data.amount,
                currency: response.data.currency || 'INR',
                keyId: response.data.keyId,
                doctorName: response.data.doctorName,
                patientName: response.data.patientName,
                patientEmail: response.data.patientEmail,
                patientPhone: response.data.patientPhone,
                doctorId: selectedDoctor._id,
                date: bookingDate,
                slot: selectedSlot,
                reason,
              }
            });
          }, 1500);
        } else {
          setSuccessMsg(`Appointment booked successfully for ${new Date(bookingDate).toLocaleDateString()} at ${selectedSlot}. Pending doctor confirmation.`);
          setSelectedDoctor(null);
          setBookingDate('');
          setSelectedSlot('');
          setReason('');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Get filtered doctors
  const filteredDoctors = doctors.filter(doc => {
    const matchSpec = selectedSpecialty === 'All' || doc.specialty?._id === selectedSpecialty;
    const matchName = doc.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSpec && matchName;
  });

  // Calculate today's date in YYYY-MM-DD for date limits
  const todayStr = new Date().toISOString().split('T')[0];

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
            <span>Book Consulting Appointment</span>
            <BookmarkPlus className="h-6 w-6 text-cyan-600" />
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select departments, select medical specialists and lock booking slots.</p>
        </div>
      </motion.div>

      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-50 dark:bg-red-905/20 border border-red-200 dark:border-red-900/30 text-red-650 dark:text-red-450 rounded-xl flex items-center gap-3 text-xs"
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
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl animate-pulse"></div>
              <div className="h-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl animate-pulse"></div>
            </div>
          </div>
          <div className="h-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl animate-pulse"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Doctors Listing */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative w-full sm:flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search doctor name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-hidden"
                />
              </div>

              {/* Specialty filter */}
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold rounded-xl px-4 py-2 text-slate-700 dark:text-slate-350 outline-hidden cursor-pointer w-full sm:w-auto shadow-xs"
              >
                <option value="All">All Departments</option>
                {specialties.map(spec => (
                  <option key={spec._id} value={spec._id}>{spec.name}</option>
                ))}
              </select>
            </motion.div>

            {filteredDoctors.length === 0 ? (
              <motion.div 
                variants={itemVariants}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-12 text-center text-slate-400 dark:text-slate-500 shadow-xs"
              >
                <Info className="h-10 w-10 text-slate-300 dark:text-slate-800 mx-auto mb-3" />
                <p className="text-sm">No medical specialists match your filtering options.</p>
              </motion.div>
            ) : (
              <motion.div 
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {filteredDoctors.map(doc => (
                  <motion.div
                    key={doc._id}
                    variants={itemVariants}
                    whileHover={{ y: -4, boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.04)' }}
                    onClick={() => { setSelectedDoctor(doc); setSuccessMsg(''); }}
                    className={`bg-white dark:bg-slate-900 border hover:border-cyan-500/30 rounded-3xl p-6 shadow-xs flex flex-col justify-between transition-colors cursor-pointer ${
                      selectedDoctor?._id === doc._id ? 'border-cyan-605 dark:border-cyan-500/80 ring-1 ring-cyan-500/50 bg-cyan-50/20 dark:bg-cyan-950/10' : 'border-slate-200/80 dark:border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center text-white text-base font-bold shadow-md shadow-cyan-500/10">
                          {doc.user?.name ? doc.user.name.replace('Dr. ', '').split(' ').map(n => n[0]).join('').toUpperCase() : <Stethoscope />}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-white text-xs">{doc.user?.name}</h4>
                          <span className="text-[9px] px-2 py-0.5 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-900/15 text-cyan-600 dark:text-cyan-400 rounded-full font-bold mt-1 inline-block">
                            {doc.specialty?.name}
                          </span>
                        </div>
                      </div>

                      <p className="text-slate-550 dark:text-slate-400 text-[11px] mt-4 leading-relaxed line-clamp-3 font-medium">{doc.biography}</p>

                      <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800/40 pt-4 font-bold">
                        <div className="flex items-center gap-1.5">
                          <Award size={12} className="text-slate-400 dark:text-slate-500" />
                          <span>{doc.experience} Years Exp</span>
                        </div>
                        <div className="flex items-center gap-1.5 justify-end">
                          <IndianRupee size={11} className="text-slate-400 dark:text-slate-500" />
                          <span>Fee: ₹{doc.consultationFee}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Booking Config Panel */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 h-fit space-y-5 shadow-xs"
          >
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <CalendarDays className="h-4.5 w-4.5 text-cyan-650" />
              <span>Scheduling Details</span>
            </h3>

            {selectedDoctor ? (
              <form onSubmit={handleBook} className="space-y-4">
                {/* Doctor card summary */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800 rounded-2xl flex items-center gap-2.5">
                  <div className="h-8 w-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold text-xs">
                    {selectedDoctor.user?.name?.replace('Dr. ', '')[0]}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-805 dark:text-slate-200 text-xs">{selectedDoctor.user?.name}</h5>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 flex items-center mt-0.5">
                      <IndianRupee size={10} className="mr-0.5" />
                      <span>Fee: ₹{selectedDoctor.consultationFee}</span>
                    </p>
                  </div>
                </div>

                {/* Date Picker */}
                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Select Date</label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-200 outline-hidden"
                  />
                </div>

                {/* Slots display */}
                {bookingDate && (
                  <div>
                    <label className="block text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Available Slots</label>
                    {slotsLoading ? (
                      <div className="flex h-10 items-center justify-center">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent"></div>
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <p className="text-xs text-slate-400 dark:text-slate-500 italic">No slots available for this date.</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {availableSlots.map(slot => (
                          <button
                            type="button"
                            key={slot}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-1.5 rounded-lg border text-center text-xs font-mono font-bold transition-all cursor-pointer ${
                              selectedSlot === slot
                                ? 'bg-cyan-600 text-white border-cyan-500 shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-955 border-slate-205 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Reason */}
                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Reason for Visit</label>
                  <textarea
                    rows={3}
                    placeholder="Describe symptoms briefly..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500 rounded-xl py-2.5 px-3 text-xs text-slate-805 dark:text-slate-200 outline-hidden resize-none"
                  />
                </div>

                {/* Book Action */}
                <button
                  type="submit"
                  disabled={bookingLoading || !selectedSlot}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider"
                >
                  {bookingLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <Clock size={14} />
                      <span>Lock Appointment</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="py-12 text-center text-slate-450 dark:text-slate-500 text-xs italic">
                Choose a consulting physician from the directory to configure date and scheduling details.
              </div>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default BookAppointment;
