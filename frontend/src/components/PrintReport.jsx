import React from 'react';
import { Sprout, ShieldAlert, CheckCircle2, AlertTriangle, Printer, X } from 'lucide-react';

export const PrintReport = ({ result, imageUrl, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const disease = result?.disease_info;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-8 border border-slate-200">
        
        {/* Header Action Bar (Hidden in Print) */}
        <div className="print:hidden flex justify-between items-center px-6 py-4 bg-forest-900 text-white">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-agricultural-400" />
            <span className="font-bold text-sm">Download or Print Crop Diagnostic Report</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-600 hover:bg-forest-500 text-white font-bold text-xs transition-colors shadow"
            >
              <Printer className="w-4 h-4" />
              Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-forest-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div id="printable-report" className="p-8 sm:p-12 space-y-6 text-slate-800 bg-white">
          
          {/* Official Letterhead */}
          <div className="flex justify-between items-start border-b-2 border-forest-800 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-forest-700 text-white flex items-center justify-center">
                <Sprout className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-forest-900 font-sans">
                  CropCare AI Diagnostic Report
                </h1>
                <p className="text-xs text-forest-700 font-semibold">
                  Community Service Project – Agricultural AI Assistance System
                </p>
              </div>
            </div>
            <div className="text-right text-xs text-slate-500 space-y-0.5">
              <p><span className="font-bold text-slate-700">Date:</span> {new Date().toLocaleDateString()}</p>
              <p><span className="font-bold text-slate-700">Time:</span> {new Date().toLocaleTimeString()}</p>
              <p><span className="font-bold text-slate-700">Engine:</span> MobileNetV2-PlantVillage</p>
            </div>
          </div>

          {/* Primary Diagnosis Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 rounded-2xl bg-forest-50/80 border border-forest-100">
            <div className="sm:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Identified Crop:</span>
                <span className="text-base font-extrabold text-slate-900">{result?.crop_name}</span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Diagnosis:</span>
                <h2 className="text-2xl font-black text-forest-900 mt-0.5">{result?.predicted_disease}</h2>
                {result?.scientific_name && (
                  <p className="text-xs text-slate-500 italic mt-0.5">({result.scientific_name})</p>
                )}
              </div>
              <div className="flex items-center gap-4 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white border border-forest-200 text-forest-800 shadow-sm">
                  {result?.is_healthy ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                  {result?.status_label}
                </span>
                <span className="text-xs font-bold text-slate-600">
                  Confidence: <span className="font-black text-forest-700">{result?.confidence_percentage}%</span>
                </span>
              </div>
            </div>

            {/* Thumbnail */}
            {imageUrl && (
              <div className="sm:col-span-1 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 max-h-36 flex items-center justify-center">
                <img src={imageUrl} alt="Leaf specimen" className="max-h-36 object-contain" />
              </div>
            )}
          </div>

          {/* Detailed Findings */}
          {disease && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="font-bold text-forest-900 text-sm border-b border-slate-200 pb-1 mb-1.5">
                  Pathological Overview & Symptoms
                </h3>
                <p className="text-slate-600 leading-relaxed mb-2">{disease.description}</p>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  {disease.symptoms?.map((sym, idx) => (
                    <li key={idx}>{sym}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-forest-900 text-sm border-b border-slate-200 pb-1 mb-1.5">
                  Immediate Emergency Action Steps
                </h3>
                <ol className="list-decimal list-inside space-y-1 text-slate-700">
                  {disease.immediate_steps?.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>

              <div>
                <h3 className="font-bold text-forest-900 text-sm border-b border-slate-200 pb-1 mb-1.5">
                  Organic & Cultural Management Methods
                </h3>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  {disease.organic_cultural_management?.map((m, idx) => (
                    <li key={idx}>{m}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-forest-900 text-sm border-b border-slate-200 pb-1 mb-1.5">
                  Preventive Farming Practices
                </h3>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  {disease.prevention_methods?.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Safety Warning & Disclaimer */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              Agricultural Safety & Regulatory Disclaimer:
            </p>
            <p className="leading-relaxed">
              This report is generated by an artificial intelligence model intended for advisory and educational support in college Community Service Project demonstrations. Chemical application dosages must strictly follow manufacturer labels and state agricultural university recommendations. Never apply unverified pesticide mixtures.
            </p>
          </div>

          {/* Footer Signature Area */}
          <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
            <div>
              <p className="font-bold text-slate-700">CropCare AI Surveillance System</p>
              <p>National Kisan Helpline: 1800-180-1551</p>
            </div>
            <div className="text-right">
              <div className="w-40 border-b border-slate-400 mb-1"></div>
              <p className="text-[10px] text-slate-400">Extension Officer / Agronomist Signature</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
