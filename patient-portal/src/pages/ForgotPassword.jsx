import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [demoResetLink, setDemoResetLink] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setDemoResetLink('');
    setShowErrorModal(false);
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      if (response.data.success) {
        setSuccess(response.data.message || 'Reset link sent! Please check your email inbox.');
        if (response.data.resetLink) {
          setDemoResetLink(response.data.resetLink);
        }
        setEmail('');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(msg);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-3xl"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Forgot Password?
          </h2>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 font-medium">
            Enter your email address and we'll send you a password reset link.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-8 shadow-xs">
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-450 rounded-xl flex items-center gap-3 text-xs"
              >
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex flex-col items-start gap-2 text-xs"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{success}</span>
                </div>
                {demoResetLink && (
                  <div className="mt-3 w-full p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/25 rounded-2xl space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-bold text-blue-600 dark:text-blue-450 block uppercase tracking-wider text-[9px]">Demo Mode Access Link:</span>
                    <p className="leading-relaxed">To simplify client testing without setting up real SMTP credentials, you can proceed directly to password reset using the link below:</p>
                    <a
                      href={demoResetLink}
                      className="block w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-center font-bold rounded-xl transition-colors shadow-xs"
                    >
                      Reset Password Now
                    </a>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[10px] font-semibold text-slate-400 dark:text-slate-550 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-hidden transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                {loading ? 'Sending link...' : 'Send Reset Link'}
              </motion.button>
            </div>
          </form>

          <div className="mt-6 flex items-center justify-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Premium Error Popup Modal */}
      <AnimatePresence>
        {showErrorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 max-w-sm w-full shadow-xs space-y-4 text-center"
            >
              <div className="mx-auto h-12 w-12 rounded-full bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/10 flex items-center justify-center text-red-600 shadow-xs">
                <AlertCircle size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white tracking-tight">Email Not Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {error}
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="w-full py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer border border-slate-200 dark:border-slate-800"
                >
                  Close & Re-check
                </button>
                <Link
                  to="/login"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-750 text-white text-center rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  Create Account
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ForgotPassword;
