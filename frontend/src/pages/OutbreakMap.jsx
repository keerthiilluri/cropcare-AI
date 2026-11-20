import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  MapPin, 
  Activity, 
  ShieldAlert, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Compass, 
  Radio,
  Clock,
  ArrowRight
} from 'lucide-react';

export const OutbreakMap = ({ setActivePage }) => {
  const [outbreakData, setOutbreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCluster, setSelectedCluster] = useState(null);

  useEffect(() => {
    const fetchOutbreaks = async () => {
      try {
        const data = await api.getOutbreaks();
        setOutbreakData(data);
      } catch (err) {
        console.error("Failed to load outbreak summary:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOutbreaks();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
          <Radio className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          <span>Community Outbreak Surveillance Map</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-forest-950 font-sans tracking-tight">
          Regional Crop Disease Outbreak Tracker
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Real-time epidemiological mapping derived from crowdsourced farmer reports and verified by agricultural extension inspectors.
        </p>
      </div>

      {/* Map Overview Banner */}
      <div className="bg-forest-950 text-white rounded-3xl p-6 sm:p-10 border border-forest-900 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-forest-900">
          <div>
            <h2 className="text-2xl font-black text-white font-sans flex items-center gap-2">
              <Compass className="w-6 h-6 text-agricultural-400" />
              Active Surveillance Radar
            </h2>
            <p className="text-xs text-forest-300/80 mt-1">
              {outbreakData?.total_active_reports || 0} active field incidents logged in database
            </p>
          </div>

          <button
            onClick={() => setActivePage('reports')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-agricultural-500 hover:bg-agricultural-400 text-forest-950 text-xs font-black self-start md:self-auto transition-transform active:scale-95 shadow-md"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Report Outbreak in Your Area</span>
          </button>
        </div>

        {/* Visual Map / Cluster Representation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Simulated Geographic Grid with Real DB Nodes */}
          <div className="md:col-span-2 bg-forest-900/80 rounded-2xl p-6 border border-forest-800 space-y-4">
            <div className="flex justify-between items-center text-xs text-forest-300 font-bold uppercase tracking-wider">
              <span>District Hotspot Clusters</span>
              <span>GPS Verified Data</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {outbreakData?.by_district?.map((dist, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedCluster(dist)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedCluster?.district === dist.district
                      ? 'border-agricultural-400 bg-forest-800 shadow-md'
                      : 'border-forest-800/80 bg-forest-950/60 hover:bg-forest-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-white">{dist.district}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-black text-xs">
                      {dist.count} Outbreaks
                    </span>
                  </div>
                  <p className="text-xs text-forest-300 mt-1">{dist.state}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 text-[11px] text-forest-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Surveillance active across Krishna, Guntur, Annamayya, and neighboring districts</span>
            </div>
          </div>

          {/* Outbreak Status Summary */}
          <div className="bg-forest-900/80 rounded-2xl p-6 border border-forest-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-forest-300">
                Outbreak Containment Status
              </h3>
              <div className="space-y-2 text-xs">
                {outbreakData?.by_status && Object.entries(outbreakData.by_status).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center p-2 rounded-lg bg-forest-950/60 border border-forest-800/60">
                    <span className="text-slate-300 font-medium">{status}</span>
                    <span className="font-extrabold text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800/60 text-amber-200 text-xs space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Containment Advisory:
              </p>
              <p className="text-[11px] leading-relaxed text-amber-300/90">
                Foliar fungal pathogens spread rapidly with humid winds. Farmers in affected districts are advised to inspect lower leaves and initiate organic barrier sprays.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Recent Field Outbreak Feed */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Recent Community Disease Reports</h2>
            <p className="text-xs text-slate-500">Live surveillance feed submitted by local growers</p>
          </div>
          <button
            onClick={() => setActivePage('reports')}
            className="text-xs font-bold text-forest-700 hover:text-forest-900 flex items-center gap-1"
          >
            File a Report <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading outbreak feed...</div>
        ) : outbreakData?.recent_reports?.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No outbreaks currently recorded.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {outbreakData?.recent_reports?.map((rep) => (
              <div key={rep.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-sm">{rep.crop}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    rep.status === 'Resolved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : rep.status === 'Verified'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {rep.status}
                  </span>
                </div>
                <p className="text-forest-800 font-semibold">{rep.disease || 'Unspecified Disease'}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                  <span>📍 {rep.location}</span>
                  <span>{rep.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
