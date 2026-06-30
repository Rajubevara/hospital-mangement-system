import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  FileHeart, 
  Download, 
  Calendar, 
  Stethoscope, 
  Activity, 
  AlertCircle,
  FileCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const Prescriptions = () => {
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <span>Clinical Medical Records</span>
          <FileHeart className="h-6 w-6 text-blue-500" />
        </h1>
        <p className="text-slate-400 mt-1">Access diagnoses, lab tests, prescriptions, and official medical documents.</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-950/20 border border-red-900/40 text-red-400 rounded-2xl flex items-center gap-3 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
          No medical records or prescriptions found on your patient profile.
        </div>
      ) : (
        /* Prescriptions Grid */
        <div className="space-y-4">
          {prescriptions.map((pr) => {
            const isExpanded = expandedId === pr._id;
            return (
              <div 
                key={pr._id}
                className="bg-slate-900/85 border border-slate-850 hover:border-slate-750/50 rounded-3xl overflow-hidden shadow-lg transition-all duration-300"
              >
                {/* Accordion Header */}
                <div 
                  onClick={() => toggleExpand(pr._id)}
                  className="p-6 flex justify-between items-center flex-wrap gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-center text-blue-400">
                      <Stethoscope size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Diagnosis: {pr.diagnosis}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span>{pr.doctor?.user?.name} ({pr.doctor?.specialty?.name})</span>
                        <span className="text-slate-700">•</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {new Date(pr.date).toLocaleDateString()}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-auto">
                    <a
                      href={`http://127.0.0.1:5000/${pr.pdfPath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-750 text-slate-200 rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <Download size={13} />
                      <span>Download PDF</span>
                    </a>
                    <button className="text-slate-500 hover:text-slate-350">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* Accordion Expandable Content */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-slate-850 pt-5 bg-slate-950/20 space-y-6">
                    {/* Medicines Table */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Prescribed Medicines</span>
                      <div className="border border-slate-850 rounded-2xl overflow-hidden bg-slate-900/60">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-950/30 border-b border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
                              <th className="py-2.5 px-4">Medicine</th>
                              <th className="py-2.5 px-4 text-center">Dosage</th>
                              <th className="py-2.5 px-4 text-center">Duration</th>
                              <th className="py-2.5 px-4">Instructions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-850/60 text-slate-300">
                            {pr.medicines?.map((med, idx) => (
                              <tr key={idx} className="hover:bg-slate-850/10">
                                <td className="py-2.5 px-4 font-bold text-slate-200">{med.name}</td>
                                <td className="py-2.5 px-4 text-center font-mono">{med.dosage}</td>
                                <td className="py-2.5 px-4 text-center">{med.duration}</td>
                                <td className="py-2.5 px-4 text-slate-400 italic">{med.instructions}</td>
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
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Recommended Lab Assays</span>
                          <div className="flex flex-wrap gap-2">
                            {pr.labTests.map((test, idx) => (
                              <span key={idx} className="text-xs px-2.5 py-1 bg-blue-500/10 border border-blue-500/15 text-blue-400 rounded-lg font-medium flex items-center gap-1.5">
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
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Doctor's Consulting Advice</span>
                          <p className="text-xs text-slate-350 leading-relaxed bg-slate-900/60 p-3 border border-slate-850 rounded-xl">
                            {pr.advice}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Prescriptions;
