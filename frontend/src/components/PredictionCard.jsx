import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Printer, 
  FileText, 
  BookOpen, 
  ShieldAlert, 
  Sparkles, 
  Layers, 
  ArrowRight,
  Info
} from 'lucide-react';
import { PrintReport } from './PrintReport';

export const PredictionCard = ({ result, imageUrl, onReportOutbreak, onViewLibrary }) => {
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [activeTab, setActiveTab] = useState('immediate');

  if (!result) return null;

  const isReliable = result.is_reliable;
  const isHealthy = result.is_healthy;
  const disease = result.disease_info;

  return (
    <>
      <div className="bg-white rounded-3xl border border-forest-100 shadow-xl overflow-hidden transition-all duration-300">
        
        {/* Unreliable or Low Confidence State */}
        {!isReliable ? (
          <div className="p-8 sm:p-10 space-y-6">
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-amber-50 border border-amber-200">
              <AlertTriangle className="w-7 h-7 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-amber-900">
                  Unable to Identify Reliably
                </h3>
                <p className="text-sm text-amber-800 leading-relaxed">
                  {result.message || 'Please upload a clearer image of a plant leaf taken in natural light.'}
                </p>
                <div className="pt-2 text-xs text-amber-700">
                  Confidence Score: <span className="font-bold">{result.confidence_percentage}%</span> (below required 55% threshold)
                </div>
              </div>
            </div>

            {/* Factors Explanations */}
            <div className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-forest-600" /> Key Factors Influencing AI Accuracy:
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-forest-600"></span>
                  Natural, uniform daylight without intense glares or harsh dark shadows.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-forest-600"></span>
                  Close-up view focused directly on individual leaf lesions.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-forest-600"></span>
                  Single leaf in view rather than distant multi-row field canopy.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-forest-600"></span>
                  Clean background free of hands, tools, soil clutter, or documents.
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div>
            {/* Reliable Result Header Banner */}
            <div className={`p-6 sm:p-8 text-white ${
              isHealthy 
                ? 'bg-gradient-to-r from-emerald-700 via-forest-600 to-emerald-600' 
                : 'bg-gradient-to-r from-forest-800 via-forest-700 to-amber-700'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/20">
                      {result.crop_name}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      isHealthy 
                        ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30' 
                        : 'bg-amber-400/20 text-amber-200 border border-amber-400/30'
                    }`}>
                      {isHealthy ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                      {result.status_label}
                    </span>
                  </div>
                  
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-sans">
                    {result.predicted_disease}
                  </h2>
                  
                  {result.scientific_name && (
                    <p className="text-xs text-forest-200/90 italic mt-1 font-medium">
                      Pathogen: {result.scientific_name}
                    </p>
                  )}
                </div>

                {/* Confidence Circular / Metric Badge */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-right sm:min-w-[140px]">
                  <p className="text-[11px] font-bold text-forest-200 uppercase tracking-wider">AI Confidence</p>
                  <p className="text-3xl font-black text-white tracking-tight">{result.confidence_percentage}%</p>
                  <div className="w-full bg-white/20 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div 
                      className="bg-agricultural-300 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, result.confidence_percentage)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Alternative Diagnostics (Transparency) */}
              {result.top_alternatives && result.top_alternatives.length > 0 && (
                <div className="p-4 rounded-2xl bg-forest-50/60 border border-forest-100 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-forest-900 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-forest-600" />
                    Alternative Possibilities Considered by Neural Network:
                  </h4>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {result.top_alternatives.map((alt, i) => (
                      <span 
                        key={i} 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-forest-100 text-xs text-slate-700 shadow-sm"
                      >
                        <span className="font-semibold">{alt.crop} – {alt.disease}:</span>
                        <span className="font-extrabold text-forest-700">{alt.confidence}%</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Disease Guide Tabs */}
              {disease && (
                <div className="space-y-4">
                  {/* Tab Navigation */}
                  <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
                    {[
                      { id: 'immediate', label: 'Immediate Steps' },
                      { id: 'organic', label: 'Organic Management' },
                      { id: 'prevention', label: 'Prevention Methods' },
                      { id: 'symptoms', label: 'Symptoms & Causes' },
                      { id: 'expert', label: 'Expert Help & Safety' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          activeTab === tab.id
                            ? 'bg-forest-700 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab Contents */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm leading-relaxed">
                    {activeTab === 'immediate' && (
                      <div className="space-y-3">
                        <h5 className="font-bold text-forest-900 text-sm">Immediate Actions to Take in Your Field:</h5>
                        <ul className="space-y-2">
                          {disease.immediate_steps?.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-forest-200 text-forest-800 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {activeTab === 'organic' && (
                      <div className="space-y-3">
                        <h5 className="font-bold text-forest-900 text-sm">Organic & Cultural Regimens:</h5>
                        <ul className="space-y-2">
                          {disease.organic_cultural_management?.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {activeTab === 'prevention' && (
                      <div className="space-y-3">
                        <h5 className="font-bold text-forest-900 text-sm">Preventive Agronomic Measures:</h5>
                        <ul className="space-y-2">
                          {disease.prevention_methods?.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <span className="w-2 h-2 rounded-full bg-forest-600 flex-shrink-0 mt-1.5"></span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {activeTab === 'symptoms' && (
                      <div className="space-y-3">
                        <h5 className="font-bold text-forest-900 text-sm">Description & Key Diagnostic Symptoms:</h5>
                        <p className="text-slate-600 mb-2">{disease.description}</p>
                        <ul className="space-y-2">
                          {disease.symptoms?.map((s, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 mt-1.5"></span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {activeTab === 'expert' && (
                      <div className="space-y-3">
                        <h5 className="font-bold text-forest-900 text-sm">Safe Handling & When to Involve Agronomists:</h5>
                        <div className="p-3 bg-white rounded-xl border border-slate-200">
                          <p className="font-bold text-amber-800 mb-1">When to Seek Extension Assistance:</p>
                          <p className="text-slate-700">{disease.when_to_seek_expert}</p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-900 text-xs">
                          <p className="font-bold mb-1 flex items-center gap-1.5">
                            <ShieldAlert className="w-4 h-4 text-red-600" /> Safe Chemical Application Notice:
                          </p>
                          <p>
                            Never apply arbitrary pesticide doses or unverified concoctions. Verify label instructions, local Krishi Vigyan Kendra (KVK) guidance, and observe Pre-Harvest Intervals (PHI).
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPrintModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:border-forest-600 text-slate-700 hover:text-forest-800 text-xs font-bold transition-colors bg-white shadow-sm"
                >
                  <Printer className="w-4 h-4 text-forest-600" />
                  Print / Download PDF Report
                </button>

                <div className="flex items-center gap-2">
                  {disease && (
                    <button
                      type="button"
                      onClick={() => onViewLibrary(disease.id)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-forest-50 hover:bg-forest-100 text-forest-800 text-xs font-bold transition-colors"
                    >
                      <BookOpen className="w-4 h-4" />
                      View Library Entry
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onReportOutbreak(result)}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold shadow-md shadow-forest-700/20 transition-all hover:shadow"
                  >
                    <FileText className="w-4 h-4" />
                    Report Outbreak to Extension
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Printable Modal Sheet */}
      {showPrintModal && (
        <PrintReport
          result={result}
          imageUrl={imageUrl}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </>
  );
};
