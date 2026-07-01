import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
  CreditCard, 
  CalendarDays, 
  User, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowLeft 
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
          color: '#0d9488', // Teal accent
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
    <div className="max-w-xl mx-auto py-8 px-4">
      {/* Back button */}
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors text-sm mb-6 cursor-pointer"
      >
        <ArrowLeft size={16} />
        <span>Back to Booking</span>
      </button>

      {/* Main Payment Card */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-teal-500 to-transparent blur-sm" />

        {success ? (
          /* Success Screen */
          <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
            <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 text-emerald-400 rounded-full mb-6 border border-emerald-500/20">
              <CheckCircle2 size={48} className="animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Payment Successful!</h2>
            <p className="text-slate-400 text-sm mb-6">{successMsg}</p>
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 text-left max-w-sm mx-auto text-xs space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Doctor:</span>
                <span className="font-semibold text-slate-200">{doctorName?.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="font-semibold text-slate-200">{new Date(date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Slot:</span>
                <span className="font-semibold text-slate-200">{slot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Paid:</span>
                <span className="font-semibold text-emerald-400">{formattedAmount}</span>
              </div>
            </div>
            <p className="text-slate-500 text-xs mt-8">Redirecting to your bookings page...</p>
          </div>
        ) : (
          /* Payment Summary Form */
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-2xl">
                <CreditCard size={22} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-100">Booking Checkout</h1>
                <p className="text-xs text-slate-500">Secure transaction via Razorpay</p>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-2xl p-4 mb-6">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {loading && (
              <div className="flex items-center gap-2.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs rounded-2xl p-4 mb-6">
                <Loader2 size={16} className="animate-spin shrink-0" />
                <span>{successMsg || 'Processing payment. Please do not close this window...'}</span>
              </div>
            )}

            {/* Invoice Details */}
            <div className="space-y-5">
              {/* Doctor Details */}
              <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4 flex gap-4">
                <div className="p-3 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl flex items-center justify-center shrink-0">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">{doctorName?.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`}</h3>
                  <p className="text-xs text-slate-500">Medical Consultation</p>
                </div>
              </div>

              {/* Schedule Details */}
              <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4 flex gap-4">
                <div className="p-3 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl flex items-center justify-center shrink-0">
                  <CalendarDays size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Selected Slot: <span className="font-semibold text-teal-400">{slot}</span></p>
                </div>
              </div>

              {/* Reason Details */}
              {reason && (
                <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4 flex gap-4">
                  <div className="p-3 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl flex items-center justify-center shrink-0">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs text-slate-500 uppercase font-bold tracking-wider">Reason for Visit</h3>
                    <p className="text-sm text-slate-300 mt-1">{reason}</p>
                  </div>
                </div>
              )}

              {/* Payment Summary */}
              <div className="border-t border-slate-800/80 pt-5 mt-2 space-y-3">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Consultation Fee</span>
                  <span>{formattedAmount}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Booking Charges</span>
                  <span className="text-emerald-400">FREE</span>
                </div>
                <div className="flex justify-between border-t border-slate-800/80 pt-3 text-lg font-bold text-slate-100">
                  <span>Total Payable</span>
                  <span className="text-teal-400">{formattedAmount}</span>
                </div>
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePayNow}
                disabled={loading}
                className="w-full mt-4 py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:from-teal-800 disabled:to-emerald-800 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-teal-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={16} />
                    <span>Proceed to Pay {formattedAmount}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;
