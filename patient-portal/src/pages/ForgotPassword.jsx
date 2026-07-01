import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [demoResetLink, setDemoResetLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setDemoResetLink('');
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
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-955 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-white tracking-tight">
          Forgot Password?
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Enter your email address and we'll send you a password reset link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 border border-slate-850 py-8 px-4 shadow-xl rounded-3xl sm:px-10">
          {error && (
            <div className="mb-4 p-4 bg-red-950/20 border border-red-900/40 text-red-400 rounded-2xl flex items-center gap-3 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 rounded-2xl flex items-center gap-3 text-sm flex-col items-start gap-2">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                <span>{success}</span>
              </div>
              {demoResetLink && (
                <div className="mt-3 w-full p-4 bg-blue-500/10 border border-blue-550/25 rounded-2xl space-y-2.5 text-xs text-slate-350">
                  <span className="font-bold text-blue-450 block uppercase tracking-wider text-[10px]">Demo Mode Access Link:</span>
                  <p className="leading-relaxed">To simplify client testing without setting up real SMTP credentials, you can proceed directly to password reset using the link below:</p>
                  <a
                    href={demoResetLink}
                    className="block w-full py-2 px-3 bg-blue-600 hover:bg-blue-550 text-white text-center font-bold rounded-xl transition-all shadow-md shadow-blue-500/10"
                  >
                    Reset Password Now
                  </a>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-650 outline-none transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/10 transition-colors cursor-pointer"
              >
                {loading ? 'Sending link...' : 'Send Reset Link'}
              </button>
            </div>
          </form>

          <div className="mt-6 flex items-center justify-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
