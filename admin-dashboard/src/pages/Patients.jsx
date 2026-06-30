import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  Users, 
  Search, 
  MapPin, 
  Droplet, 
  Heart, 
  ChevronRight, 
  X, 
  Calendar,
  AlertCircle,
  FolderHeart
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

  return (
    <div className="relative">
      <div className={`space-y-8 transition-all duration-300 ${selectedPatientId ? 'pr-96' : ''}`}>
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Patient Directory</h1>
            <p className="text-slate-400 mt-1 font-medium text-sm">View registered patient accounts and clinical histories.</p>
          </div>
          
          <div className="relative w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-850 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 pl-11 pr-4 text-slate-200 placeholder-slate-600 outline-none transition-all duration-200"
            />
          </div>
        </div>

        {/* Content */}
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
        ) : filteredPatients.length === 0 ? (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
            {searchTerm ? 'No matches found for search term.' : 'No registered patient records available.'}
          </div>
        ) : (
          /* Patients Table List */
          <div className="bg-slate-900/80 border border-slate-850 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/20">
                    <th className="py-4 px-6">Patient Name</th>
                    <th className="py-4 px-6">Email / Contact</th>
                    <th className="py-4 px-6">Gender / Age</th>
                    <th className="py-4 px-6 text-center">Blood</th>
                    <th className="py-4 px-6 text-right">Records</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {filteredPatients.map((p) => {
                    const dob = p.dateOfBirth ? new Date(p.dateOfBirth) : null;
                    const age = dob ? new Date().getFullYear() - dob.getFullYear() : 'N/A';
                    return (
                      <tr 
                        key={p._id} 
                        onClick={() => handleOpenDetail(p._id)}
                        className={`hover:bg-slate-850/40 transition-colors cursor-pointer group ${selectedPatientId === p._id ? 'bg-blue-600/5' : ''}`}
                      >
                        <td className="py-4 px-6 font-bold text-white flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-slate-850 flex items-center justify-center text-blue-400 font-semibold group-hover:bg-slate-800 transition-colors">
                            {p.user?.name ? p.user.name.split(' ').map(n => n[0]).join('').toUpperCase() : <Users size={16} />}
                          </div>
                          <span>{p.user?.name}</span>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-slate-300 font-medium">{p.user?.email}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{p.user?.phone || 'No phone'}</p>
                        </td>
                        <td className="py-4 px-6 text-slate-300">
                          {p.gender || 'Unknown'} / {age} Yrs
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/15 text-red-400">
                            <Droplet size={10} className="fill-red-400/20" />
                            {p.bloodGroup || 'N/A'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <ChevronRight className="inline h-5 w-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Patient Detail Drawer */}
      {selectedPatientId && (
        <div className="fixed top-16 right-0 bottom-0 w-96 bg-slate-900 border-l border-slate-850 shadow-2xl z-20 flex flex-col justify-between">
          {/* Drawer Header */}
          <div className="p-6 border-b border-slate-850 flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2">
              <FolderHeart className="h-5 w-5 text-blue-500" />
              <span>Patient Profile</span>
            </h3>
            <button 
              onClick={() => setSelectedPatientId(null)}
              className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
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
                    <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-blue-500/15 mb-3">
                      {detailData.patient.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <h4 className="font-bold text-white text-lg">{detailData.patient.user?.name}</h4>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {detailData.patient._id}</p>
                  </div>

                  <div className="space-y-2.5 text-sm text-slate-300 bg-slate-950/40 p-4 border border-slate-850 rounded-2xl">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Gender</span>
                      <span>{detailData.patient.gender || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Age</span>
                      <span>{detailData.patient.dateOfBirth ? `${new Date().getFullYear() - new Date(detailData.patient.dateOfBirth).getFullYear()} years` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Blood Group</span>
                      <span className="text-red-400 font-semibold">{detailData.patient.bloodGroup || 'N/A'}</span>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-slate-500 shrink-0">Address</span>
                      <span className="text-right flex items-center gap-1 text-xs">
                        <MapPin size={12} className="text-slate-500 shrink-0" />
                        {detailData.patient.address || 'No address added'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Medical History Conditions */}
                <div className="space-y-3">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Chronic Conditions</span>
                  <div className="flex flex-wrap gap-1.5">
                    {detailData.patient.medicalHistory?.map((condition, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 bg-red-500/10 border border-red-500/15 text-red-400 rounded-lg font-medium">
                        {condition}
                      </span>
                    ))}
                    {(!detailData.patient.medicalHistory || detailData.patient.medicalHistory.length === 0) && (
                      <span className="text-xs text-slate-500 italic">No medical history conditions declared</span>
                    )}
                  </div>
                </div>

                {/* Appointments History */}
                <div className="space-y-3">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Clinical Visit Log</span>
                  {detailData.appointments?.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No recorded clinical appointments.</p>
                  ) : (
                    <div className="space-y-2">
                      {detailData.appointments?.map((app) => (
                        <div key={app._id} className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-slate-200">{app.doctor?.user?.name || 'Doctor'}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              app.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' :
                              app.status === 'Confirmed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/15' :
                              'bg-amber-500/10 text-amber-400 border border-amber-500/15'
                            }`}>
                              {app.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                            <Calendar size={12} />
                            <span>{new Date(app.date).toLocaleDateString()} at {app.slot}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">Failed to load detail report.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
