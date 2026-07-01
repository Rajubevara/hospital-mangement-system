import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
  CalendarDays, 
  Search, 
  Stethoscope, 
  Award, 
  DollarSign, 
  Clock, 
  AlertCircle,
  FileCheck,
  CheckCircle2,
  BookmarkPlus
} from 'lucide-react';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <span>Book Consulting Appointment</span>
          <BookmarkPlus className="h-6 w-6 text-blue-500" />
        </h1>
        <p className="text-slate-400 mt-1">Select clinical departments, choose expert doctors, and lock scheduling slots.</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-950/20 border border-red-900/40 text-red-400 rounded-2xl flex items-center gap-3 text-sm animate-pulse">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 rounded-2xl flex items-center gap-3 text-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Doctors Listing */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative w-full sm:flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search doctor name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 pl-11 pr-4 text-slate-200 placeholder-slate-600 outline-none"
                />
              </div>

              {/* Specialty filter */}
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="bg-slate-900 border border-slate-850 text-sm font-semibold rounded-xl px-4 py-2.5 text-slate-350 outline-none cursor-pointer w-full sm:w-auto"
              >
                <option value="All">All Departments</option>
                {specialties.map(spec => (
                  <option key={spec._id} value={spec._id}>{spec.name}</option>
                ))}
              </select>
            </div>

            {filteredDoctors.length === 0 ? (
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
                No active doctor profiles match your requirements.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredDoctors.map(doc => (
                  <div
                    key={doc._id}
                    onClick={() => { setSelectedDoctor(doc); setSuccessMsg(''); }}
                    className={`bg-slate-905/80 border hover:border-blue-500/30 rounded-3xl p-6 shadow-lg flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                      selectedDoctor?._id === doc._id ? 'border-blue-600 ring-1 ring-blue-500/50 bg-blue-600/5' : 'border-slate-850'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-lg font-bold shadow-md shadow-blue-500/10">
                          {doc.user?.name ? doc.user.name.replace('Dr. ', '').split(' ').map(n => n[0]).join('').toUpperCase() : <Stethoscope />}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{doc.user?.name}</h4>
                          <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 border border-blue-500/15 text-blue-400 rounded-full font-medium mt-1 inline-block">
                            {doc.specialty?.name}
                          </span>
                        </div>
                      </div>

                      <p className="text-slate-400 text-xs mt-4 leading-relaxed line-clamp-3">{doc.biography}</p>

                      <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] text-slate-400 border-t border-slate-800/40 pt-4">
                        <div className="flex items-center gap-1.5">
                          <Award size={12} className="text-slate-500" />
                          <span>{doc.experience} Years Exp</span>
                        </div>
                        <div className="flex items-center gap-1.5 justify-end">
                          <DollarSign size={12} className="text-slate-500" />
                          <span>Fee: ${doc.consultationFee}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Booking Config Panel */}
          <div className="bg-slate-900/80 border border-slate-850 rounded-3xl p-6 h-fit space-y-6">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-850">
              <CalendarDays className="h-5 w-5 text-blue-500" />
              <span>Scheduling Slots</span>
            </h3>

            {selectedDoctor ? (
              <form onSubmit={handleBook} className="space-y-4">
                {/* Doctor card summary */}
                <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-2xl flex items-center gap-2.5">
                  <div className="h-9 w-9 bg-slate-900 rounded-xl flex items-center justify-center text-blue-400 font-bold text-xs">
                    {selectedDoctor.user?.name?.replace('Dr. ', '')[0]}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-200 text-xs">{selectedDoctor.user?.name}</h5>
                    <p className="text-[10px] text-slate-500">Consultation Fee: ${selectedDoctor.consultationFee}</p>
                  </div>
                </div>

                {/* Date Picker */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Select Date</label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2 px-3 text-sm text-slate-200 outline-none"
                  />
                </div>

                {/* Slots display */}
                {bookingDate && (
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Available Slots</label>
                    {slotsLoading ? (
                      <div className="flex h-10 items-center justify-center">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No available consulting hours for this date.</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {availableSlots.map(slot => (
                          <button
                            type="button"
                            key={slot}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-1.5 rounded-lg border text-center text-xs font-mono font-bold transition-all cursor-pointer ${
                              selectedSlot === slot
                                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/10'
                                : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-250 hover:bg-slate-900'
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
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Reason for Visit</label>
                  <textarea
                    rows={3}
                    placeholder="Describe symptoms briefly..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2 px-3 text-xs text-slate-200 outline-none resize-none"
                  />
                </div>

                {/* Book Action */}
                <button
                  type="submit"
                  disabled={bookingLoading || !selectedSlot}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-blue-500/10 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {bookingLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <Clock size={14} />
                      <span>Lock Appointment</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="py-12 text-center text-slate-550 text-xs italic">
                Choose a consulting physician from the directory to configure date and scheduling details.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookAppointment;
