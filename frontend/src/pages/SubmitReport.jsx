import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { 
  FileText, 
  MapPin, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Check, 
  ShieldCheck, 
  Loader2,
  Navigation
} from 'lucide-react';

export const SubmitReport = () => {
  const { user, token, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    reporter_name: user?.full_name || '',
    contact_number: user?.phone || '',
    crop_name: 'Tomato',
    suspected_disease: '',
    village: user?.village || 'Gannavaram',
    district: user?.district || 'Krishna',
    state: user?.state || 'Andhra Pradesh',
    latitude: '',
    longitude: '',
    symptoms_description: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [myReports, setMyReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // Keep form data synced with logged in user
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        reporter_name: user.full_name || prev.reporter_name,
        contact_number: user.phone || prev.contact_number,
        village: user.village || prev.village,
        district: user.district || prev.district,
        state: user.state || prev.state
      }));
    }
  }, [user]);

  // Load user's previous reports
  useEffect(() => {
    if (isAuthenticated && token) {
      loadMyReports();
    }
  }, [isAuthenticated, token]);

  const loadMyReports = async () => {
    setLoadingReports(true);
    try {
      const reports = await api.getMyReports(token);
      setMyReports(reports);
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleAcquireGPS = () => {
    if (!navigator.geolocation) {
      setGpsStatus({ error: "Geolocation is not supported by your browser." });
      return;
    }

    setGpsLoading(true);
    setGpsStatus(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        }));
        setGpsLoading(false);
        setGpsStatus({ success: "GPS coordinates recorded with your consent." });
      },
      (error) => {
        setGpsLoading(false);
        setGpsStatus({ error: `GPS access denied or unavailable (${error.message}). You may proceed without GPS.` });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.reporter_name || !formData.crop_name || !formData.symptoms_description) {
      alert("Please fill all required fields (Name, Crop, Symptoms).");
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '') {
          data.append(key, formData[key]);
        }
      });
      if (selectedFile) {
        data.append('file', selectedFile);
      }

      await api.submitReport(data, token);
      setSubmitSuccess(true);
      
      // Reset form
      setFormData(prev => ({
        ...prev,
        suspected_disease: '',
        symptoms_description: '',
        latitude: '',
        longitude: ''
      }));
      setSelectedFile(null);
      setPreviewUrl(null);
      setGpsStatus(null);

      // Refresh list
      if (token) {
        loadMyReports();
      }
    } catch (err) {
      console.error("Submission Error:", err);
      alert(`Report Submission Failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-100 text-forest-800 text-xs font-bold uppercase tracking-wider">
          <FileText className="w-3.5 h-3.5 text-forest-600" />
          <span>Regional Pest & Disease Surveillance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-forest-950 font-sans tracking-tight">
          {t('report.title')}
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          {t('report.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Report Submission Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
            Submit New Field Disease Report
          </h2>

          {submitSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-bold">Disease report successfully logged!</p>
                <p className="text-emerald-700">Status set to "Submitted". Agricultural extension officers have been notified.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
            
            {/* Reporter Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-600">Farmer / Reporter Name *</label>
                <input
                  type="text"
                  required
                  value={formData.reporter_name}
                  onChange={(e) => setFormData({ ...formData, reporter_name: e.target.value })}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-forest-600 text-xs text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600">Contact Number (Phone)</label>
                <input
                  type="text"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                  placeholder="e.g. +91 94401 23456"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-forest-600 text-xs text-slate-800"
                />
              </div>
            </div>

            {/* Crop & Suspected Disease */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-600">{t('report.cropName')} *</label>
                <select
                  value={formData.crop_name}
                  onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-forest-600 text-xs text-slate-800 bg-white"
                >
                  <option value="Tomato">Tomato</option>
                  <option value="Potato">Potato</option>
                  <option value="Rice (Paddy)">Rice (Paddy)</option>
                  <option value="Corn (Maize)">Corn (Maize)</option>
                  <option value="Pepper Bell (Chilli)">Pepper Bell (Chilli)</option>
                  <option value="Apple">Apple</option>
                  <option value="Grape">Grape</option>
                  <option value="Other">Other Crop</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-600">{t('report.suspectedDisease')}</label>
                <input
                  type="text"
                  value={formData.suspected_disease}
                  onChange={(e) => setFormData({ ...formData, suspected_disease: e.target.value })}
                  placeholder="e.g. Early Blight, Bacterial Spot"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-forest-600 text-xs text-slate-800"
                />
              </div>
            </div>

            {/* Location (Village, District, State) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-slate-600">{t('report.village')} *</label>
                <input
                  type="text"
                  required
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  placeholder="e.g. Gannavaram"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-forest-600 text-xs text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600">{t('report.district')} *</label>
                <input
                  type="text"
                  required
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="e.g. Krishna"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-forest-600 text-xs text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600">{t('report.state')} *</label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="e.g. Andhra Pradesh"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-forest-600 text-xs text-slate-800"
                />
              </div>
            </div>

            {/* GPS Location (Optional with Explicit Consent) */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-forest-600" />
                    Field GPS Geolocation (Optional)
                  </p>
                  <p className="text-[11px] text-slate-500 font-normal">
                    Helps agronomists map outbreak clusters on district surveillance map.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAcquireGPS}
                  disabled={gpsLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-forest-600 text-slate-700 text-xs font-bold transition-colors shadow-sm self-start sm:self-auto"
                >
                  {gpsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5 text-forest-600" />}
                  <span>Acquire GPS</span>
                </button>
              </div>

              {formData.latitude && formData.longitude && (
                <div className="text-[11px] font-mono text-forest-800 bg-forest-100/60 p-2 rounded-lg">
                  📍 Coordinates: {formData.latitude}, {formData.longitude}
                </div>
              )}

              {gpsStatus?.error && (
                <p className="text-[11px] text-amber-700">{gpsStatus.error}</p>
              )}
            </div>

            {/* Symptoms Description */}
            <div className="space-y-1">
              <label className="text-slate-600">{t('report.symptoms')} *</label>
              <textarea
                required
                rows={3}
                value={formData.symptoms_description}
                onChange={(e) => setFormData({ ...formData, symptoms_description: e.target.value })}
                placeholder="Describe visible spots, leaf curling, color changes, affected plant percentage, and field conditions..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-forest-600 text-xs text-slate-800"
              ></textarea>
            </div>

            {/* Photo Attachment */}
            <div className="space-y-1">
              <label className="text-slate-600">{t('report.photo')} (Optional)</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleFileChange}
                  className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-forest-50 file:text-forest-700 hover:file:bg-forest-100"
                />
                {previewUrl && (
                  <img src={previewUrl} alt="Report attachment" className="w-10 h-10 object-cover rounded-lg border border-slate-300" />
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-sm shadow-md shadow-forest-700/20 transition-all active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting to Database...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>{t('report.submitBtn')}</span>
                </>
              )}
            </button>

          </form>
        </div>

        {/* Previous Reports / Status Tracker */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {t('report.myReports')}
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-forest-50 text-forest-700 font-bold">
                {myReports.length} reports
              </span>
            </div>

            {!isAuthenticated ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <p className="text-xs text-slate-600">
                  Log in as a farmer to track and manage all your historical field disease reports.
                </p>
              </div>
            ) : loadingReports ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading reports...</div>
            ) : myReports.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No reports submitted yet. Submit a report on the left to track its review status.
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {myReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-forest-500 bg-slate-50/50 space-y-2 text-xs transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 text-sm">
                        {report.crop_name}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        report.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : report.status === 'Verified'
                          ? 'bg-blue-100 text-blue-800'
                          : report.status === 'Under Review'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-800'
                      }`}>
                        {report.status}
                      </span>
                    </div>

                    <p className="text-slate-600 line-clamp-2">
                      {report.symptoms_description}
                    </p>

                    <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <span>📍 {report.village}, {report.district}</span>
                      <span>{new Date(report.created_at).toLocaleDateString()}</span>
                    </div>

                    {report.admin_notes && (
                      <div className="p-2 rounded-lg bg-white border border-forest-100 text-[11px] text-forest-800">
                        <span className="font-bold">Officer Note:</span> {report.admin_notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
