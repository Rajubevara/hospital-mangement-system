import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, ShieldAlert, KeyRound, Mail, User, Phone, MapPin, Droplet } from 'lucide-react';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [address, setAddress] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, error } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) navigate('/');
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Split medical history
    const historyArray = medicalHistory
      ? medicalHistory.split(',').map(item => item.trim()).filter(item => item !== '')
      : [];

    const success = await register({
      name,
      email,
      password,
      phone,
      gender,
      dateOfBirth: dob,
      bloodGroup,
      address,
      medicalHistory: historyArray,
    });
    setLoading(false);
    if (success) navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-955 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl"></div>

      <div className="w-full max-w-lg relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-550 p-3 rounded-2xl shadow-xl shadow-blue-500/20 mb-4">
            <Activity className="h-8 w-8 text-white animate-pulse" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">CareFlow</h2>
          <p className="text-slate-400 mt-2 text-sm">Personal Health Portal</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-900/60 p-1.5 rounded-2xl border border-slate-850 mb-6 max-w-sm mx-auto">
          <button
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              !isRegister ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isRegister ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900/70 border border-slate-800 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/30 border border-red-900/50 flex items-start gap-3 text-red-400 text-sm animate-pulse">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!isRegister ? (
            /* Sign In View */
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="patient@hms.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-3 pl-12 pr-4 text-slate-200 placeholder-slate-650 outline-none"
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
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-3 pl-12 pr-4 text-slate-200 placeholder-slate-650 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : 'Sign In'}
              </button>
            </form>
          ) : (
            /* Sign Up View */
            <form onSubmit={handleRegisterSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alice Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 pl-12 pr-4 text-slate-200 placeholder-slate-650 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 px-4 text-slate-200 placeholder-slate-650 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 px-4 text-slate-200 placeholder-slate-650 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. 555-019-2834"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-955 border border-slate-850 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 pl-11 pr-4 text-slate-200 placeholder-slate-650 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-slate-955 border border-slate-850 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 px-4 text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-955 border border-slate-850 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 px-4 text-slate-200 outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full bg-slate-955 border border-slate-850 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 px-4 text-slate-200 outline-none"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Residential Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="12 Main St, Health City"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-955 border border-slate-850 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 pl-11 pr-4 text-slate-200 placeholder-slate-650 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Chronic Conditions (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Asthma, Diabetes"
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  className="w-full bg-slate-955 border border-slate-850 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 px-4 text-slate-200 placeholder-slate-650 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
              >
                {loading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : 'Register'}
              </button>
            </form>
          )}
        </div>

        {/* Demo Credentials Helper */}
        {!isRegister && (
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-600">
              Use seeded Patient credentials:<br />
              <span className="font-mono text-slate-500">patient@hms.com / password123</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
