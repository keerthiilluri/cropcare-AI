
<>
  <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 space-y-4">
    <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
      <li className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        Reduces unnecessary pesticide expenditure through early organic intervention.
      </li>

      <li className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        Multilingual interface (Telugu & English) ensures non-technical farmers can easily use it.
      </li>

      <li className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        Crowdsourced outbreak tracking helps Krishi Vigyan Kendras isolate regional crop epidemics.
      </li>
    </ul>
  </div>

  <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 space-y-4">
    <h4 className="text-base font-bold text-slate-900">
      Demonstration Quick Links
    </h4>

    <div className="space-y-2">
      <button
        onClick={() => setActivePage("detect")}
        className="w-full flex items-center justify-between p-3 rounded-xl bg-forest-50 hover:bg-forest-100 text-forest-800 text-xs font-bold transition-colors"
      >
        <span>1. Launch AI Detection Studio</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  </div>
</>
export default { Home };
