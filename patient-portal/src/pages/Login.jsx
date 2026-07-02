import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, KeyRound, Mail, User, Phone, MapPin, Activity, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import Logo from '../components/Logo';
import slide1 from '../assets/slide1.png';
import slide2 from '../assets/slide2.png';
import slide3 from '../assets/slide3.png';

const Login = () => {
  const slides = [slide1, slide2, slide3];
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
  const [slideIndex, setSlideIndex] = useState(0);

  const { login, register, error } = useAuth();
  const navigate = useNavigate();

  // Rotating slide features on the left side
  const features = [
    {
      title: "Performance Dashboard",
      tagline: "Powerful & Easy to Use",
      desc: "Track your health metrics, vitals, and progress indicators in a modern, easy-to-use interface.",
      color: "from-cyan-500/20 to-teal-500/20",
      iconColor: "text-cyan-600 dark:text-cyan-400",
      badge: "Performance Dashboard"
    },
    {
      title: "Med Manager",
      tagline: "Access Your Prescriptions",
      desc: "Access all your prescriptions, chronic conditions, and doctor reports in one unified health vault.",
      color: "from-emerald-500/20 to-teal-500/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      badge: "Med Manager"
    },
    {
      title: "Smart Consultations",
      tagline: "Connect Instantly",
      desc: "Book appointments, chat with top specialists, and manage your follow-ups seamlessly.",
      color: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      badge: "ICD-10 Manager"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
      
      {/* LEFT PANEL: Splendid Visual Slider (Hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden border-r border-slate-200 dark:border-slate-850 bg-slate-950">
        
        {/* Sliding images */}
        <AnimatePresence mode="wait">
          <motion.img
            key={slideIndex}
            src={slides[slideIndex]}
            alt="Patient Care Visual"
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        
        {/* Subtle dark/gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-slate-950/45 z-10" />

        {/* Top Header Overlay */}
        <div className="absolute top-8 left-8 right-8 z-20 flex justify-between items-center">
          <Logo showText={true} size="md" className="text-white" />
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">CareFlow Patient Portal</span>
          </div>
        </div>

        {/* Bottom Text Content & Pagination Overlay */}
        <div className="absolute bottom-12 left-8 right-8 z-20 space-y-6">
          <div className="space-y-2 max-w-md">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
              {features[slideIndex].badge}
            </span>
            <h3 className="text-3xl font-extrabold text-white leading-tight tracking-tight">
              {features[slideIndex].tagline}
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              {features[slideIndex].desc}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/15">
            <p className="text-xs text-slate-400 font-medium">
              CareFlow Medical Systems © 2026
            </p>
            {/* Pagination Indicators */}
            <div className="flex gap-2">
              {features.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlideIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    slideIndex === i ? 'w-8 bg-cyan-455' : 'w-1.5 bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Sleek, high-contrast, modern form container */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 md:p-16 bg-white dark:bg-slate-900 border-l border-transparent dark:border-slate-800 transition-colors duration-300">
        
        {/* Header Logo */}
        <div className="flex justify-between items-center">
          <Logo showText={true} size="md" />
          <Link
            to="/forgot-password"
            className="text-[11px] font-bold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors"
          >
            Need Help?
          </Link>
        </div>

        {/* Form area */}
        <div className="max-w-md w-full mx-auto my-auto py-8">
          
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {isRegister ? "Create your account" : "Login to your account"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium leading-relaxed">
              {isRegister 
                ? "Enter your personal and medical details to register on CareFlow."
                : "Log in now to access the latest insights experience for your health portal."
              }
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 flex items-start gap-3 text-red-700 dark:text-red-400 text-xs">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form tab switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800 mb-6 max-w-xs shadow-xs">
            <button
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                !isRegister ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isRegister ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Register
            </button>
          </div>

          {!isRegister ? (
            /* SIGN IN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-hidden transition-all duration-200 font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400">Password</label>
                  <Link to="/forgot-password" className="text-[11px] font-bold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-hidden transition-all duration-200 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="keepSignedIn"
                  className="h-4 w-4 rounded-sm border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                />
                <label htmlFor="keepSignedIn" className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold cursor-pointer">
                  Keep me signed in
                </label>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
              >
                {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : 'Login'}
              </motion.button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-4 max-h-[48vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alice Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/10 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-hidden font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/10 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. 555-019-2834"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/10 rounded-xl py-2.5 pl-9 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-hidden font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/10 rounded-xl py-2.5 px-3 text-xs text-slate-900 dark:text-white outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/10 rounded-xl py-2.5 px-3 text-xs text-slate-900 dark:text-white outline-hidden cursor-pointer font-medium"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/10 rounded-xl py-2.5 px-3 text-xs text-slate-900 dark:text-white outline-hidden cursor-pointer font-medium"
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
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">Residential Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="12 Main St, Health City"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/10 rounded-xl py-2.5 pl-9 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">Chronic Conditions (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Asthma, Diabetes"
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/10 rounded-xl py-2.5 px-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-hidden font-medium"
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 mt-4 text-xs uppercase tracking-wider"
              >
                {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : 'Register'}
              </motion.button>
            </form>
          )}
        </div>

        {/* Footer Demo Credentials Helper */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          {!isRegister && (
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              Demo Account: <span className="font-mono font-bold text-slate-600 dark:text-slate-350">patient@hms.com / password123</span>
            </p>
          )}
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            CareFlow Health Management System © 2026
          </p>
        </div>

      </div>

    </div>
  );
};

export default Login;
