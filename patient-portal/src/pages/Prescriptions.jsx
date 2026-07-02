import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileHeart, 
  Download, 
  Calendar, 
  Stethoscope, 
  Activity, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';

const Prescriptions = () => {
  const serverBaseUrl = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://127.0.0.1:5000';

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const fetchPrescriptions = async () => {
    try {
      const response = await api.get('/patient/prescriptions');
      if (response.data.success) {
        setPrescriptions(response.data.prescriptions);
      }
    } catch (err) {
      setError('Failed to fetch your medical prescriptions history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

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
            <span>Clinical Medical Records</span>
            <FileHeart className="h-6 w-6 text-blue-600" />
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Access diagnoses, lab tests, prescriptions, and official medical records documents.</p>
        </div>
      </motion.div>

      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3 text-xs"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : prescriptions.length === 0 ? (
        <motion.div 
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-12 text-center text-slate-400 dark:text-slate-500 shadow-xs"
        >
          <Info className="h-10 w-10 text-slate-350 dark:text-slate-750 mx-auto mb-3" />
          <p className="text-sm">No medical records or prescriptions found on your patient profile.</p>
        </motion.div>
      ) : (
        /* Prescriptions list */
        <motion.div 
          variants={containerVariants}
          className="space-y-4"
        >
          {prescriptions.map((pr) => {
            const isExpanded = expandedId === pr._id;
            return (
              <motion.div 
                key={pr._id}
                variants={itemVariants}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-xs transition-colors duration-300"
              >
                {/* Accordion Header */}
                <div 
                  onClick={() => toggleExpand(pr._id)}
                  className="p-6 flex justify-between items-center flex-wrap gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-blue-50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/10 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Stethoscope size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white text-xs">Diagnosis: {pr.diagnosis}</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mt-1 font-medium">
                        <span>{pr.doctor?.user?.name} ({pr.doctor?.specialty?.name})</span>
                        <span className="text-slate-300 dark:text-slate-800">•</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {new Date(pr.date).toLocaleDateString()}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-auto">
                    <a
                      href={`${serverBaseUrl}/${pr.pdfPath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[10px] font-bold px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors flex items-center gap-1.5"
                    >
                      <Download size={12} />
                      <span>Download PDF</span>
                    </a>
                    <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Accordion Expandable Content */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-slate-100 dark:border-slate-800"
                    >
                      <div className="p-6 bg-slate-50/50 dark:bg-slate-950/20 space-y-6">
                        {/* Medicines Table */}
                        <div className="space-y-2">
                          <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Prescribed Medicines</span>
                          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto bg-white dark:bg-slate-900/60">
                            <table className="w-full text-left border-collapse text-xs min-w-[500px]">
                              <thead>
                                <tr className="bg-slate-50 dark:bg-slate-950/30 border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                                  <th className="py-2.5 px-4 text-[10px]">Medicine</th>
                                  <th className="py-2.5 px-4 text-center text-[10px]">Dosage</th>
                                  <th className="py-2.5 px-4 text-center text-[10px]">Duration</th>
                                  <th className="py-2.5 px-4 text-[10px]">Instructions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-600 dark:text-slate-300">
                                {pr.medicines?.map((med, idx) => (
                                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                                    <td className="py-2.5 px-4 font-bold text-slate-700 dark:text-slate-200">{med.name}</td>
                                    <td className="py-2.5 px-4 text-center font-mono text-[11px]">{med.dosage}</td>
                                    <td className="py-2.5 px-4 text-center">{med.duration}</td>
                                    <td className="py-2.5 px-4 text-slate-400 dark:text-slate-400 italic">{med.instructions}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Labs and Advice Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                          {/* Lab Tests */}
                          {pr.labTests?.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Recommended Lab Tests</span>
                              <div className="flex flex-wrap gap-2">
                                {pr.labTests.map((test, idx) => (
                                  <span key={idx} className="text-xs px-2.5 py-1 bg-blue-50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/10 text-blue-600 dark:text-blue-400 rounded-lg font-bold flex items-center gap-1.5">
                                    <Activity size={12} />
                                    {test}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Doctor's Advice */}
                          {pr.advice && (
                            <div className="space-y-2">
                              <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Doctor's Consulting Advice</span>
                              <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed bg-white dark:bg-slate-900/60 p-3 border border-slate-200 dark:border-slate-800 rounded-xl">
                                {pr.advice}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Prescriptions;
