
import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export function Home({ setActivePage }) {
  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 space-y-4">

        <ul className="space-y-3 text-sm text-slate-700">

          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Reduces unnecessary pesticide expenditure.
          </li>

          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Supports Telugu and English languages.
          </li>

          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Tracks regional crop disease outbreaks.
          </li>

        </ul>
      </div>

      <div className="mt-6 bg-white rounded-2xl p-6 shadow-md border border-slate-200">

        <h2 className="text-lg font-bold text-slate-900 mb-4">
          Demonstration Quick Links
        </h2>

        <button
          onClick={() => setActivePage('detect')}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-green-100 hover:bg-green-200 text-green-800 text-sm font-bold"
        >
          <span>1. Launch AI Detection Studio</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>

    </div>
  );
}
