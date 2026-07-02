import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  MapPin, 
  Droplet, 
  ChevronRight, 
  X, 
  Calendar,
  AlertCircle,
  FolderHeart,
  User,
  HeartPulse,
  Info
} from 'lucide-react';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected Patient Details Side-Drawer
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/admin/patients');
      if (response.data.success) {
        setPatients(response.data.patients);
      }
    } catch (err) {
      setError('Failed to load patient records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleOpenDetail = async (id) => {
    setSelectedPatientId(id);
    setDetailLoading(true);
    setDetailData(null);
    try {
      const response = await api.get(`/admin/patients/${id}`);
      if (response.data.success) {
        setDetailData(response.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.user?.phone?.includes(searchTerm)
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.04 }
    }
  };

  const itemVariants = {
    hidden: { y: 12, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 350, damping: 25 } }
  };

  return (
    <div className="relative">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className={`space-y-6 max-w-7xl mx-auto transition-all duration-300 ${selectedPatientId ? 'lg:pr-96' : ''}`}
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>Patient Directory</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">View registered patient accounts, details and medical records.</p>
          </div>
          
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-hidden transition-all duration-200"
            />
          </div>
        </motion.div>

        {/* Content */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-650 dark:text-red-400 rounded-xl flex items-center gap-3 text-xs"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {loading ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 space-y-4 animate-pulse shadow-xs">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-full"></div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between items-center gap-4 py-2">
                <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : filteredPatients.length === 0 ? (
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-12 text-center text-slate-400 dark:text-slate-500 shadow-xs"
          >
            <Info className="h-10 w-10 text-slate-300 dark:text-slate-650 mx-auto mb-3" />
            <p className="text-sm">{searchTerm ? 'No matching patient records found.' : 'No registered patient records available.'}</p>
          </motion.div>
        ) : (
          /* Patients Table List */
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-xs"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-950/20">
                    <th className="py-3 px-6">Patient Details</th>
                    <th className="py-3 px-6">Contact Info</th>
                    <th className="py-3 px-6">Gender / Age</th>
                    <th className="py-3 px-6 text-center">Blood Type</th>
                    <th className="py-3 px-6 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {filteredPatients.map((p) => {
                    const dob = p.dateOfBirth ? new Date(p.dateOfBirth) : null;
                    const age = dob ? new Date().getFullYear() - dob.getFullYear() : 'N/A';
                    return (
                      <tr 
                        key={p._id} 
                        onClick={() => handleOpenDetail(p._id)}
                        className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group ${selectedPatientId === p._id ? 'bg-blue-50/30 dark:bg-blue-950/10' : ''}`}
                      >
                        <td className="py-3 px-6 font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                          <div className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/10 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold group-hover:scale-105 transition-transform">
                            {p.user?.name ? p.user.name.split(' ').map(n => n[0]).join('').toUpperCase() : <User size={14} />}
                          </div>
                          <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{p.user?.name}</span>
                        </td>
                        <td className="py-3 px-6">
                          <p className="text-slate-700 dark:text-slate-350">{p.user?.email}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{p.user?.phone || 'No phone record'}</p>
                        </td>
                        <td className="py-3 px-6 text-slate-600 dark:text-slate-400">
                          {p.gender || 'Unknown'} / {age} Yrs
                        </td>
                        <td className="py-3 px-6 text-center">
                          {p.bloodGroup ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/20 text-red-650 dark:text-red-400">
                              <Droplet size={9} className="fill-red-500/20" />
                              {p.bloodGroup}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-6 text-right">
                          <ChevronRight className="inline h-4 w-4 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-500 transition-all" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Patient Detail Drawer */}
      <AnimatePresence>
        {selectedPatientId && (
          <div className="fixed top-16 right-0 bottom-0 z-20 flex">
            {/* Mobile overlay backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPatientId(null)}
              className="fixed inset-0 bg-slate-900/10 backdrop-blur-xs lg:hidden"
            />
            
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl h-full flex flex-col justify-between relative"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm">
                  <FolderHeart className="h-4 w-4 text-blue-600" />
                  <span>Patient Medical Dossier</span>
                </h3>
                <button 
                  onClick={() => setSelectedPatientId(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {detailLoading ? (
                  <div className="flex h-64 items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-3 border-blue-500 border-t-transparent"></div>
                  </div>
                ) : detailData ? (
                  <>
                    {/* General Bio */}
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="h-14 w-14 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/15 flex items-center justify-center text-blue-600 dark:text-blue-400 text-lg font-bold shadow-inner mb-3">
                          {detailData.patient.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <h4 className="font-bold text-slate-800 dark:text-white text-base">{detailData.patient.user?.name}</h4>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">UID: {detailData.patient._id}</p>
                      </div>

                      <div className="space-y-2 text-xs text-slate-700 dark:text-slate-350 bg-slate-50 dark:bg-slate-950/40 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Gender</span>
                          <span className="font-medium">{detailData.patient.gender || 'Not declared'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Age</span>
                          <span className="font-medium">{detailData.patient.dateOfBirth ? `${new Date().getFullYear() - new Date(detailData.patient.dateOfBirth).getFullYear()} Yrs` : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Blood Type</span>
                          <span className="text-red-500 dark:text-red-400 font-semibold">{detailData.patient.bloodGroup || 'N/A'}</span>
                        </div>
                        <div className="flex items-start justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/50">
                          <span className="text-slate-400 shrink-0">Home Address</span>
                          <span className="text-right flex items-center gap-1 text-[11px]">
                            <MapPin size={11} className="text-slate-400 shrink-0" />
                            {detailData.patient.address || 'No registered address'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Medical History Conditions */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Chronic Conditions</span>
                      <div className="flex flex-wrap gap-1">
                        {detailData.patient.medicalHistory?.map((condition, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 bg-red-50 dark:bg-red-950/15 border border-red-100/50 dark:border-red-900/10 text-red-650 dark:text-red-400 rounded-md font-medium">
                            {condition}
                          </span>
                        ))}
                        {(!detailData.patient.medicalHistory || detailData.patient.medicalHistory.length === 0) && (
                          <span className="text-xs text-slate-400 italic">No medical history conditions declared</span>
                        )}
                      </div>
                    </div>

                    {/* Appointments History */}
                    <div className="space-y-3">
                      <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Clinical Visit Log</span>
                      {detailData.appointments?.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No recorded clinical appointments.</p>
                      ) : (
                        <div className="space-y-2">
                          {detailData.appointments?.map((app) => (
                            <div key={app._id} className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1.5">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{app.doctor?.user?.name || 'Doctor'}</span>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                  app.status === 'Completed' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/10' :
                                  app.status === 'Confirmed' ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/10' :
                                  'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/10'
                                }`}>
                                  {app.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
                                <Calendar size={11} />
                                <span>{new Date(app.date).toLocaleDateString()} at {app.slot}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-500">Failed to load dossier report.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Patients;
