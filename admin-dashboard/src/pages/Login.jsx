import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, ShieldAlert, KeyRound, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-3 rounded-2xl shadow-xl shadow-blue-500/20 mb-4">
            <Activity className="h-8 w-8 text-white animate-pulse" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">CareFlow</h2>
          <p className="text-slate-400 mt-2 text-sm">Administrative Management Console</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-905/70 border border-slate-800 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
          <h3 className="text-xl font-semibold text-slate-100 mb-6">Sign In</h3>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/30 border border-red-900/50 flex items-start gap-3 text-red-400 text-sm">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="admin@hms.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-3 pl-12 pr-4 text-slate-200 placeholder-slate-600 outline-none transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-3 pl-12 pr-4 text-slate-200 placeholder-slate-600 outline-none transition-all duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Demo Credentials Helper */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-600">
            Use seeded Admin credentials:<br />
            <span className="font-mono text-slate-500">admin@hms.com / password123</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
