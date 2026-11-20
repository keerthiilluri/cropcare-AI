import React from 'react';
import { Sprout, Phone, Heart, Award, ShieldAlert, BookOpen } from 'lucide-react';

export const Footer = ({ setActivePage }) => {
  return (
    <footer className="bg-forest-950 text-white pt-16 pb-12 mt-auto border-t border-forest-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-forest-900/60">
          
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-forest-600 flex items-center justify-center text-white">
                <Sprout className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white font-sans">
                CropCare<span className="text-agricultural-400">AI</span>
              </span>
            </div>
            <p className="text-sm text-forest-200/80 leading-relaxed">
              Empowering farmers with instant computer vision crop disease diagnostics, expert-backed organic treatment regimens, and real-time community outbreak surveillance.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-forest-900/80 border border-forest-800 text-xs text-forest-300 font-medium">
              <Award className="w-4 h-4 text-amber-400" />
              <span>College Community Service Project (CSP)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-agricultural-400">Platform Features</h4>
            <ul className="space-y-2 text-sm text-forest-200/80">
              <li>
                <button onClick={() => setActivePage('detect')} className="hover:text-white transition-colors">
                  AI Disease Detection
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('library')} className="hover:text-white transition-colors">
                  Searchable Disease Library
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('reports')} className="hover:text-white transition-colors">
                  Submit Outbreak Report
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('outbreaks')} className="hover:text-white transition-colors">
                  Community Outbreak Map
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('tips')} className="hover:text-white transition-colors">
                  Seasonal Farming Tips
                </button>
              </li>
            </ul>
          </div>

          {/* Supported Major Crops */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-agricultural-400">Key Crops Supported</h4>
            <div className="flex flex-wrap gap-2 text-xs">
              {['Tomato', 'Potato', 'Rice (Paddy)', 'Corn (Maize)', 'Chilli / Pepper', 'Apple', 'Grape'].map((crop) => (
                <span key={crop} className="px-2.5 py-1 rounded-md bg-forest-900 text-forest-300 border border-forest-800">
                  {crop}
                </span>
              ))}
            </div>
            <p className="text-xs text-forest-300/70 pt-2">
              Trained on 54,000+ benchmark images from the PlantVillage dataset with MobileNetV2 architecture.
            </p>
          </div>

          {/* Emergency & Extension Helplines */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Phone className="w-4 h-4" /> Farmer Help & Support
            </h4>
            <div className="bg-forest-900/60 p-4 rounded-xl border border-forest-800 space-y-2 text-xs text-forest-200">
              <div>
                <p className="text-slate-400 font-medium">National Kisan Call Center (Toll Free):</p>
                <p className="text-base font-bold text-white tracking-wide">1800-180-1551</p>
              </div>
              <div className="pt-2 border-t border-forest-800">
                <p className="text-slate-400 font-medium">Local Extension Office:</p>
                <p className="text-white font-semibold">Krishi Vigyan Kendra (KVK) Network</p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-forest-300/70 gap-4">
          <p>© {new Date().getFullYear()} CropCare AI – Academic & Community Service Demonstration Project. All rights reserved.</p>
          <div className="flex items-center gap-1 text-forest-300/80">
            <span>Built with commitment for Indian Farmers</span>
            <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
          </div>
        </div>
      </div>
    </footer>
  );
};
