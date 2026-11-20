import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  User, 
  Activity, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  ArrowRight, 
  MapPin, 
  Sprout, 
  Edit3, 
  Save, 
  X,
  Clock,
  Layers
} from 'lucide-react';

export const FarmerDashboard = ({ setActivePage }) => {
  const { user, token, updateProfile } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    farm_size_acres: user?.profile?.farm_size_acres || 3.0,
    primary_crops: user?.profile?.primary_crops || 'Tomato, Rice, Potato',
    soil_type: user?.profile?.soil_type || 'Loamy Soil',
    irrigation_source: user?.profile?.irrigation_source || 'Borewell / Drip',
    experience_years: user?.profile?.experience_years || 10
  });

  useEffect(() => {
    if (token) {
      loadDashboard();
      loadHistory();
    }
  }, [token]);

  const loadDashboard = async () => {
    try {
      const data = await api.getFarmerDashboard(token);
      setDashboardData(data);
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
    }
  };

  const loadHistory = async () => {
    try {
      const data = await api.getDetectionHistory(token);
      setHistory(data);
    } catch (err) {
      console.error("Failed to load detection history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this detection record?")) return;
    try {
      await api.deleteDetectionHistory(id, token);
      setHistory(prev => prev.filter(item => item.id !== id));
      loadDashboard();
    } catch (err) {
      alert(`Failed to delete record: ${err.message}`);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profileForm);
      setIsEditingProfile(false);
      alert("Farmer profile updated successfully!");
    } catch (err) {
      alert(`Failed to update profile: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Welcome & Farmer Profile Header */}
      <div className="bg-gradient-to-r from-forest-800 via-forest-700 to-agricultural-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 text-white">
                Farmer Workspace
              </span>
              <span className="text-xs text-forest-200">
                Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '2026'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-sans">
              Welcome back, {user?.full_name || 'Farmer'}!
            </h1>
            <p className="text-xs sm:text-sm text-forest-200 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-agricultural-400" />
              <span>{user?.village || 'Gannavaram'}, {user?.district || 'Krishna'}, {user?.state || 'Andhra Pradesh'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold text-white transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Farm Profile</span>
            </button>
            <button
              onClick={() => setActivePage('detect')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-agricultural-500 hover:bg-agricultural-400 text-forest-950 text-xs font-black shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              <Activity className="w-4 h-4" />
              <span>New Diagnosis</span>
            </button>
          </div>
        </div>

        {/* Profile Details Drawer */}
        {isEditingProfile && (
          <form onSubmit={handleSaveProfile} className="relative z-10 mt-6 pt-6 border-t border-white/20 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-forest-200 font-bold">Farm Land Size (Acres)</label>
              <input
                type="number"
                step="0.1"
                value={profileForm.farm_size_acres}
                onChange={(e) => setProfileForm({ ...profileForm, farm_size_acres: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-forest-200 font-bold">Primary Cultivated Crops</label>
              <input
                type="text"
                value={profileForm.primary_crops}
                onChange={(e) => setProfileForm({ ...profileForm, primary_crops: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-forest-200 font-bold">Irrigation Source</label>
              <input
                type="text"
                value={profileForm.irrigation_source}
                onChange={(e) => setProfileForm({ ...profileForm, irrigation_source: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-1.5 rounded-xl bg-white/10 text-white text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold shadow"
              >
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Diagnoses</span>
            <Activity className="w-5 h-5 text-forest-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{dashboardData?.total_detections || history.length}</p>
          <p className="text-[11px] text-slate-400">Total leaf scans by you</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Healthy Foliage</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-emerald-600">{dashboardData?.healthy_detections || 0}</p>
          <p className="text-[11px] text-slate-400">Diagnosed free of disease</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Diseased Samples</span>
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl font-black text-amber-600">{dashboardData?.diseased_detections || 0}</p>
          <p className="text-[11px] text-slate-400">Pathogens identified</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Reports Logged</span>
            <FileText className="w-5 h-5 text-forest-700" />
          </div>
          <p className="text-3xl font-black text-forest-800">{dashboardData?.total_reports || 0}</p>
          <p className="text-[11px] text-slate-400">Field outbreak alerts filed</p>
        </div>
      </div>

      {/* Historical Detections Table / Cards */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Your Disease Detection History</h2>
            <p className="text-xs text-slate-500">Persistent log of every leaf scanned and diagnosed by the MobileNetV2 model</p>
          </div>
          <button
            onClick={() => setActivePage('detect')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-50 hover:bg-forest-100 text-forest-800 text-xs font-bold self-start sm:self-auto transition-colors"
          >
            <Activity className="w-4 h-4" />
            <span>Scan Another Leaf</span>
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-semibold">
            Loading historical detection records...
          </div>
        ) : history.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-sm font-bold text-slate-700">No detection history records found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Scan your first infected crop leaf to build a personalized disease timeline and track treatments.
            </p>
            <button
              onClick={() => setActivePage('detect')}
              className="px-5 py-2.5 rounded-xl bg-forest-700 text-white font-bold text-xs"
            >
              Start First Scan
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Specimen</th>
                  <th className="py-3 px-4">Crop</th>
                  <th className="py-3 px-4">Diagnosis</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                        <img 
                          src={`http://localhost:8000${record.image_path}`} 
                          alt="Specimen" 
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=100&q=80'; }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{record.crop_name}</td>
                    <td className="py-3 px-4 font-bold text-forest-800">{record.predicted_disease}</td>
                    <td className="py-3 px-4 font-bold text-slate-700">
                      {(record.confidence_score * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        record.is_healthy ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {record.is_healthy ? 'Healthy' : 'Diseased'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(record.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteHistory(record.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
