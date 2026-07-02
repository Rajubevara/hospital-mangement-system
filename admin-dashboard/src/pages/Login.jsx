import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, KeyRound, Mail, Activity } from 'lucide-react';
import Logo from '../components/Logo';
import slide1 from '../assets/slide1.png';
import slide2 from '../assets/slide2.png';
import slide3 from '../assets/slide3.png';

const Login = () => {
  const slides = [slide1, slide2, slide3];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  const { login, error } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      title: "Hospital Management",
      tagline: "Central Console",
      desc: "Manage departments, doctors, patient lists, and core hospital settings in one unified workspace.",
      color: "from-blue-500/20 to-indigo-500/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      badge: "System Configuration"
    },
    {
      title: "Clinical Performance",
      tagline: "Live telemetry dashboard",
      desc: "Monitor telemedicine operations, delay statistics, completed visits, and active room metrics in real time.",
      color: "from-cyan-500/20 to-blue-500/20",
      iconColor: "text-cyan-600 dark:text-cyan-400",
      badge: "Real-time Metrics"
    },
    {
      title: "Specialties & Services",
      tagline: "Dynamic Management",
      desc: "Assign clinical specialties, set operational queues, and update clinic service listings instantly.",
      color: "from-purple-500/20 to-indigo-500/20",
      iconColor: "text-purple-600 dark:text-purple-400",
      badge: "Access Controls"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
      
      {/* LEFT PANEL: Splendid Visual Slider (Hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden border-r border-slate-200 dark:border-slate-855 bg-slate-950">
        
        {/* Sliding images */}
        <AnimatePresence mode="wait">
          <motion.img
            key={slideIndex}
            src={slides[slideIndex]}
            alt="Administrative Dashboard"
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
            <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">CareFlow Admin Portal</span>
          </div>
        </div>

        {/* Bottom Text Content & Pagination Overlay */}
        <div className="absolute bottom-12 left-8 right-8 z-20 space-y-6">
          <div className="space-y-2 max-w-md">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
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
                    slideIndex === i ? 'w-8 bg-blue-455' : 'w-1.5 bg-white/30 hover:bg-white/50'
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
            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-450 dark:hover:text-blue-300 transition-colors"
          >
            Need Help?
          </Link>
        </div>

        {/* Form area */}
        <div className="max-w-md w-full mx-auto my-auto py-8">
          
          <div className="mb-6">
            <span className="text-[10px] font-extrabold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full uppercase tracking-wider">
              Administration Portal
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-3">
              Sign In
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium leading-relaxed">
              Log in with your administrator credentials to manage staff, clinical queues, and dashboard policies.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 flex items-start gap-3 text-red-700 dark:text-red-400 text-xs">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="Enter administrator email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-hidden transition-all duration-200 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 font-medium">Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-hidden transition-all duration-200 font-medium"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.995 }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
            >
              {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : 'Sign In'}
            </motion.button>
          </form>
        </div>

        {/* Footer Demo Credentials Helper */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            Demo Account: <span className="font-mono font-bold text-slate-600 dark:text-slate-350">admin@hms.com / password123</span>
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            CareFlow Administrative Console © 2026
          </p>
        </div>

      </div>

    </div>
  );
};

export default Login;
