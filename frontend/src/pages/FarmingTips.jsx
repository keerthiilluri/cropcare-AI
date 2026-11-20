import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Lightbulb, 
  ShieldCheck, 
  Droplets, 
  Sprout, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  PhoneCall
} from 'lucide-react';

export const FarmingTips = () => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const data = await api.getTips();
        setTips(data);
      } catch (err) {
        console.error("Failed to load farming tips:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTips();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-agricultural-100 text-agricultural-900 text-xs font-bold uppercase tracking-wider">
          <Lightbulb className="w-3.5 h-3.5 text-agricultural-700" />
          <span>Agricultural Extension Advisory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-forest-950 font-sans tracking-tight">
          Good Agricultural Practices & Farming Tips
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Scientifically backed management protocols to prevent disease outbreaks, improve soil fertility, and ensure farmer safety.
        </p>
      </div>

      {/* Kisan Helpline Callout */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-forest-800 to-forest-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-agricultural-400 flex-shrink-0">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Need Live Agricultural Advice?</h3>
            <p className="text-xs text-forest-200">Call the National Kisan Call Center toll-free to speak with an agronomist.</p>
          </div>
        </div>
        <div className="px-5 py-2.5 rounded-xl bg-agricultural-500 text-forest-950 font-black text-sm tracking-wide self-start sm:self-auto">
          📞 1800-180-1551 (Toll Free)
        </div>
      </div>

      {/* Tips Cards */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading agronomy tips...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tips.map((tip) => (
            <div
              key={tip.id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <span className="px-3 py-1 rounded-full bg-forest-50 text-forest-800 text-[11px] font-black uppercase tracking-wider">
                  {tip.category}
                </span>

                <h3 className="text-xl font-bold text-slate-900">
                  {tip.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  {tip.summary}
                </p>

                <ul className="space-y-2 pt-2 text-xs text-slate-700">
                  {tip.tips?.map((t, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
