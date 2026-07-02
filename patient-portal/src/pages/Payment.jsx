import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  CalendarDays, 
  User, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowLeft,
  IndianRupee
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

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract booking/payment details from navigation state
  const paymentDetails = location.state || {};

  const {
    orderId,
    amount,
    currency = 'INR',
    keyId,
    doctorName,
    patientName,
    patientEmail,
    patientPhone,
    doctorId,
    date,
    slot,
    reason
  } = paymentDetails;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Redirect back if payment details are missing
  useEffect(() => {
    if (!orderId || !amount) {
      navigate('/');
    }
  }, [orderId, amount, navigate]);

  const handlePayNow = async () => {
    setLoading(true);
    setError('');
    
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Failed to load Razorpay Checkout script. Check your internet connection.');
        setLoading(false);
        return;
      }

      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'CareFlow Health System',
        description: `Consultation Fee with ${doctorName?.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`}`,
        order_id: orderId,
        handler: async function (razorpayResponse) {
          setLoading(true);
          setError('');
          setSuccessMsg('Verifying your payment transaction...');
          
          try {
            const verifyRes = await api.post('/patient/appointments/verify-payment', {
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_signature: razorpayResponse.razorpay_signature,
              doctorId,
              date,
              slot,
              reason,
            });

            if (verifyRes.data.success) {
              setSuccess(true);
              setSuccessMsg('Payment Verified! Your appointment is successfully booked.');
              setTimeout(() => {
                navigate('/bookings');
              }, 3000);
            }
          } catch (verifyErr) {
            setError(verifyErr.response?.data?.message || 'Payment verification failed.');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: patientName,
          email: patientEmail,
          contact: patientPhone,
        },
        theme: {
          color: '#2563eb', // Blue accent
        },
        modal: {
          ondismiss: function () {
            setError('Payment was cancelled.');
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError('An error occurred while launching Razorpay.');
      setLoading(false);
    }
  };

  const formattedAmount = (amount / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: currency,
  });

  return (
    <div className="max-w-xl mx-auto py-6 px-4">
      {/* Back button */}
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors text-xs mb-6 cursor-pointer font-bold"
      >
        <ArrowLeft size={16} />
        <span>Back to Booking</span>
      </button>

      {/* Main Payment Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-[28px] p-6 md:p-8 shadow-xs relative overflow-hidden transition-colors duration-300">
        
        <AnimatePresence mode="wait">
          {success ? (
            /* Success Screen */
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-8"
            >
              <div className="inline-flex items-center justify-center p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full mb-6 border border-emerald-100 dark:border-emerald-900/10">
                <CheckCircle2 size={40} className="animate-pulse" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Payment Successful!</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">{successMsg}</p>
              <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 text-left max-w-sm mx-auto text-xs space-y-2 text-slate-605 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Doctor:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{doctorName?.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{new Date(date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Slot:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{slot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Paid:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formattedAmount}</span>
                </div>
              </div>
              <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-8 font-medium">Redirecting to your bookings list...</p>
            </motion.div>
          ) : (
            /* Payment Summary Form */
            <motion.div 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/10 rounded-2xl">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Booking Checkout</h1>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Secure transaction via Razorpay</p>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 bg-rose-50 dark:bg-rose-955/20 border border-rose-100 dark:border-rose-900/10 text-rose-655 dark:text-rose-400 text-xs rounded-2xl p-4 mb-6">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {loading && (
                <div className="flex items-center gap-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/10 text-blue-600 dark:text-blue-400 text-xs rounded-2xl p-4 mb-6">
                  <Loader2 size={16} className="animate-spin shrink-0" />
                  <span>{successMsg || 'Processing payment transaction. Please do not close...'}</span>
                </div>
              )}

              {/* Invoice Details */}
              <div className="space-y-4">
                {/* Doctor Details */}
                <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 flex gap-4">
                  <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 rounded-xl flex items-center justify-center shrink-0">
                    <User size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">{doctorName?.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`}</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Medical Consultation Specialist</p>
                  </div>
                </div>

                {/* Schedule Details */}
                <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 flex gap-4">
                  <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 rounded-xl flex items-center justify-center shrink-0">
                    <CalendarDays size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">Selected Slot: <span className="font-semibold text-blue-600 dark:text-blue-400 font-mono">{slot}</span></p>
                  </div>
                </div>

                {/* Reason Details */}
                {reason && (
                  <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 flex gap-4">
                    <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 rounded-xl flex items-center justify-center shrink-0">
                      <FileText size={18} />
                    </div>
                    <div>
                      <h3 className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Reason for Visit</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-350 mt-1 font-medium">{reason}</p>
                    </div>
                  </div>
                )}

                {/* Payment Summary */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-5 mt-2 space-y-3">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Consultation Fee</span>
                    <span>{formattedAmount}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Booking Charges</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">FREE</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-3 text-sm font-bold text-slate-800 dark:text-slate-100">
                    <span>Total Payable</span>
                    <span className="text-blue-605 dark:text-blue-400">{formattedAmount}</span>
                  </div>
                </div>

                {/* Pay Button */}
                <motion.button
                  onClick={handlePayNow}
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard size={14} />
                      <span>Proceed to Pay {formattedAmount}</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Payment;
