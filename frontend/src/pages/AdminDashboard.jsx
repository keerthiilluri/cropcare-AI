import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  ShieldCheck, 
  Users, 
  FileText, 
  Activity, 
  Filter, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Edit3, 
  X, 
  Save, 
  BarChart3,
  MapPin,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export const AdminDashboard = () => {
  const { token, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('reports');
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterCrop, setFilterCrop] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Status Update Modal State
  const [editingReport, setEditingReport] = useState(null);
  const [newStatus, setNewStatus] = useState('Under Review');
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (token) {
      loadAllAdminData();
    }
  }, [token]);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, reportsData, farmersData, detectionsData] = await Promise.all([
        api.getAdminStats(token),
        api.getAdminReports({}, token),
        api.getAdminFarmers(token),
        api.getAdminDetections(token)
      ]);
      setStats(statsData);
      setReports(reportsData);
      setFarmers(farmersData);
      setDetections(detectionsData);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = async () => {
    setLoading(true);
    try {
      const filtered = await api.getAdminReports({
        crop: filterCrop || undefined,
        district: filterDistrict || undefined,
        status: filterStatus || undefined
      }, token);
      setReports(filtered);
    } catch (err) {
      console.error("Filter failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!editingReport) return;
    setIsUpdating(true);
    try {
      const updated = await api.updateReportStatus(
        editingReport.id,
        { status: newStatus, notes: adminNotes },
        token
      );
      setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
      setEditingReport(null);
      // Reload stats
      const newStats = await api.getAdminStats(token);
      setStats(newStats);
      alert(`Report #${updated.id} status updated to ${newStatus}`);
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
            <span>Administrative Command Portal</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 font-sans tracking-tight">
            Agricultural Extension & Disease Surveillance
          </h1>
          <p className="text-xs text-slate-500">
            District officer dashboard for reviewing field outbreaks, verifying plant pathogens, and monitoring community trends.
          </p>
        </div>

        <button
          onClick={loadAllAdminData}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Farmers</span>
            <Users className="w-5 h-5 text-forest-700" />
          </div>
          <p className="text-3xl font-black text-slate-900">{stats?.total_farmers ?? farmers.length}</p>
          <p className="text-[11px] text-slate-400">Active accounts in portal</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Field Reports</span>
            <FileText className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl font-black text-amber-600">{stats?.total_reports ?? reports.length}</p>
          <p className="text-[11px] text-slate-400">
            {stats?.reports_submitted ?? 0} Pending • {stats?.reports_verified ?? 0} Verified
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Scans Run</span>
            <Activity className="w-5 h-5 text-forest-600" />
          </div>
          <p className="text-3xl font-black text-forest-800">{stats?.total_detections ?? detections.length}</p>
          <p className="text-[11px] text-slate-400">MobileNetV2 inferences</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Resolved Outbreaks</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-emerald-600">{stats?.reports_resolved ?? 0}</p>
          <p className="text-[11px] text-slate-400">Arrested and treated</p>
        </div>
      </div>

      {/* Outbreak Breakdown Charts (Genuine Data from DB) */}
      {stats && (stats.crop_breakdown?.length > 0 || stats.district_breakdown?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Crop Outbreak Distribution */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-forest-600" />
              Reported Outbreaks by Crop
            </h3>
            <div className="space-y-3 pt-2">
              {stats.crop_breakdown?.map((item, idx) => {
                const total = stats.total_reports || 1;
                const pct = Math.round((item.count / total) * 100);
                return (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>{item.crop}</span>
                      <span>{item.count} reports ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-forest-600 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* District Surveillance Distribution */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-600" />
              Active Surveillance by District
            </h3>
            <div className="space-y-3 pt-2">
              {stats.district_breakdown?.map((item, idx) => {
                const total = stats.total_reports || 1;
                const pct = Math.round((item.count / total) * 100);
                return (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>{item.district}</span>
                      <span>{item.count} outbreaks ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-colors ${
            activeTab === 'reports'
              ? 'bg-forest-800 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Field Outbreak Reports ({reports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('farmers')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-colors ${
            activeTab === 'farmers'
              ? 'bg-forest-800 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Registered Farmers Directory ({farmers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('detections')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-colors ${
            activeTab === 'detections'
              ? 'bg-forest-800 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Recent AI Inferences ({detections.length})</span>
        </button>
      </div>

      {/* Tab 1: Field Outbreak Reports Review */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
          
          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase">Crop Filter</label>
              <input
                type="text"
                placeholder="e.g. Tomato, Rice"
                value={filterCrop}
                onChange={(e) => setFilterCrop(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase">District Filter</label>
              <input
                type="text"
                placeholder="e.g. Krishna, Guntur"
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase">Status Filter</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white"
              >
                <option value="">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Verified">Verified</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleApplyFilters}
                className="w-full py-2 bg-forest-700 hover:bg-forest-800 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Filter Reports
              </button>
              <button
                onClick={() => { setFilterCrop(''); setFilterDistrict(''); setFilterStatus(''); loadAllAdminData(); }}
                className="py-2 px-3 border border-slate-300 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition-colors"
                title="Reset Filters"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Reports Table */}
          {reports.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No field outbreak reports match current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Reporter</th>
                    <th className="py-3 px-4">Crop & Disease</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {reports.map((rep) => (
                    <tr key={rep.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">#{rep.id}</td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-800">{rep.reporter_name}</p>
                        {rep.contact_number && (
                          <p className="text-[11px] text-slate-400">{rep.contact_number}</p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-forest-800">{rep.crop_name}</p>
                        <p className="text-[11px] text-slate-500">{rep.suspected_disease || 'Unspecified'}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-700">{rep.village}, {rep.district}</p>
                        {rep.latitude && rep.longitude && (
                          <p className="text-[10px] text-forest-700 font-mono">📍 GPS Verified</p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          rep.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rep.status === 'Verified'
                            ? 'bg-blue-100 text-blue-800'
                            : rep.status === 'Under Review'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-200 text-slate-800'
                        }`}>
                          {rep.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(rep.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setEditingReport(rep);
                            setNewStatus(rep.status);
                            setAdminNotes(rep.admin_notes || '');
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-forest-50 hover:bg-forest-100 text-forest-800 font-bold text-[11px] ml-auto transition-colors"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Review & Action</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* Tab 2: Registered Farmers Directory */}
      {activeTab === 'farmers' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            Registered Community Farmers ({farmers.length})
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {farmers.map((farmer) => (
              <div key={farmer.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{farmer.full_name}</span>
                  <span className="px-2 py-0.5 rounded bg-forest-100 text-forest-800 text-[10px] font-bold">
                    ID #{farmer.id}
                  </span>
                </div>
                <p className="text-slate-500 font-mono text-[11px]">@{farmer.username} • {farmer.email}</p>
                <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <p>📍 {farmer.village || 'Village'}, {farmer.district || 'District'}, {farmer.state || 'State'}</p>
                  {farmer.profile && (
                    <p>🌾 Primary crops: <span className="font-semibold">{farmer.profile.primary_crops}</span></p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: System Detections Log */}
      {activeTab === 'detections' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            Recent AI Detections Log ({detections.length})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Crop</th>
                  <th className="py-3 px-4">Diagnosis</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {detections.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-900">{d.crop}</td>
                    <td className="py-3 px-4 font-bold text-forest-800">{d.disease}</td>
                    <td className="py-3 px-4 font-bold">{d.confidence}%</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        d.is_healthy ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {d.is_healthy ? 'Healthy' : 'Diseased'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{d.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {editingReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl p-6 sm:p-8 space-y-6 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Review & Action Report #{editingReport.id}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingReport.crop_name} • {editingReport.village}, {editingReport.district}
                </p>
              </div>
              <button onClick={() => setEditingReport(null)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <p><span className="font-bold text-slate-800">Reporter:</span> {editingReport.reporter_name}</p>
              <p><span className="font-bold text-slate-800">Suspected Pathogen:</span> {editingReport.suspected_disease}</p>
              <p><span className="font-bold text-slate-800">Symptoms:</span> {editingReport.symptoms_description}</p>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="space-y-1">
                <label className="text-slate-600">Update Outbreak Status *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-forest-600 text-xs bg-white"
                >
                  <option value="Submitted">Submitted (Received)</option>
                  <option value="Under Review">Under Review (Specimen Collected)</option>
                  <option value="Verified">Verified (Confirmed by Extension Officer)</option>
                  <option value="Resolved">Resolved (Foliar Treatment Completed)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-600">Extension Officer Notes / Advisory</label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Enter laboratory assay result, treatment guidance provided to the farmer, or containment advisory..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-forest-600 text-xs text-slate-800"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingReport(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold shadow transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isUpdating ? 'Saving...' : 'Save & Publish Update'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
