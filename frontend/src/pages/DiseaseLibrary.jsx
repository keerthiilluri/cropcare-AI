import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  BookOpen, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  ShieldAlert, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export const DiseaseLibrary = () => {
  const [diseases, setDiseases] = useState([]);
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [diseasesData, cropsData] = await Promise.all([
          api.getDiseases(),
          api.getCrops()
        ]);
        setDiseases(diseasesData);
        setCrops(['All', ...cropsData]);
      } catch (err) {
        console.error("Failed to load disease library:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredDiseases = diseases.filter((item) => {
    const matchesCrop = selectedCrop === 'All' || item.crop.toLowerCase() === selectedCrop.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      item.crop.toLowerCase().includes(query) ||
      item.disease.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      (item.scientific_name && item.scientific_name.toLowerCase().includes(query)) ||
      (item.description && item.description.toLowerCase().includes(query));

    return matchesCrop && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-100 text-forest-800 text-xs font-bold uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5 text-forest-600" />
          <span>Agricultural Pathology Reference</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-forest-950 font-sans tracking-tight">
          Crop Disease & Healthy Care Library
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Explore comprehensive diagnostic symptoms, causes, organic treatments, and preventive agronomic regimens across {diseases.length} major crop classes.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search crop, disease, or symptom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-forest-600 text-xs font-semibold text-slate-800 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-xs font-bold text-slate-500">
            Showing <span className="text-forest-700">{filteredDiseases.length}</span> verified entries
          </div>
        </div>

        {/* Crop Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {crops.map((crop) => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCrop === crop
                  ? 'bg-forest-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {crop}
            </button>
          ))}
        </div>
      </div>

      {/* Disease Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm font-semibold">
          Loading comprehensive disease knowledge base...
        </div>
      ) : filteredDiseases.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
          <p className="text-base font-bold text-slate-700">No matching crop diseases found</p>
          <p className="text-xs text-slate-500">Try adjusting your search keywords or crop filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDiseases.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedDisease(item)}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-forest-500 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-forest-50 text-forest-800 text-[11px] font-black uppercase tracking-wider">
                    {item.crop}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    item.is_healthy
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.severity === 'Critical'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.is_healthy ? 'Normal' : item.severity}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-forest-700 transition-colors">
                    {item.disease}
                  </h3>
                  {item.scientific_name && (
                    <p className="text-xs text-slate-400 italic">{item.scientific_name}</p>
                  )}
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {item.description}
                </p>

                {item.symptoms && item.symptoms.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Key Symptoms:</p>
                    <p className="text-xs text-slate-700 truncate">
                      • {item.symptoms[0]}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-forest-700 group-hover:text-forest-900">
                <span>View Complete Management Guide</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Disease Detail Modal */}
      {selectedDisease && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-8 border border-slate-200">
            
            {/* Modal Header */}
            <div className={`p-6 sm:p-8 text-white flex justify-between items-start ${
              selectedDisease.is_healthy
                ? 'bg-gradient-to-r from-emerald-700 to-forest-700'
                : 'bg-gradient-to-r from-forest-800 to-amber-700'
            }`}>
              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 text-white">
                  {selectedDisease.crop} • {selectedDisease.category}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white pt-1">
                  {selectedDisease.disease}
                </h2>
                {selectedDisease.scientific_name && (
                  <p className="text-xs text-forest-200 italic font-medium">
                    {selectedDisease.scientific_name}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedDisease(null)}
                className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto text-xs sm:text-sm text-slate-700 leading-relaxed">
              
              <div>
                <h4 className="font-bold text-forest-900 text-sm mb-1">Pathological Description:</h4>
                <p className="text-slate-600 leading-relaxed">{selectedDisease.description}</p>
              </div>

              {selectedDisease.symptoms && (
                <div>
                  <h4 className="font-bold text-forest-900 text-sm mb-2">Visible Diagnostic Symptoms:</h4>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-700">
                    {selectedDisease.symptoms.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedDisease.causes && (
                <div>
                  <h4 className="font-bold text-forest-900 text-sm mb-2">Primary Causes & Vectors:</h4>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-700">
                    {selectedDisease.causes.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedDisease.immediate_steps && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                  <h4 className="font-bold text-amber-900 text-sm">Immediate Actions for Farmers:</h4>
                  <ul className="space-y-1 list-decimal list-inside text-amber-950 font-medium">
                    {selectedDisease.immediate_steps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedDisease.organic_cultural_management && (
                <div>
                  <h4 className="font-bold text-forest-900 text-sm mb-2">Organic & Cultural Regimens:</h4>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-700">
                    {selectedDisease.organic_cultural_management.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedDisease.prevention_methods && (
                <div>
                  <h4 className="font-bold text-forest-900 text-sm mb-2">Long-term Prevention & Agronomic Practices:</h4>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-700">
                    {selectedDisease.prevention_methods.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedDisease.when_to_seek_expert && (
                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 space-y-1">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">When to Seek Extension Assistance:</h4>
                  <p className="text-slate-700">{selectedDisease.when_to_seek_expert}</p>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedDisease(null)}
                className="px-5 py-2 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs"
              >
                Close Guide
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
