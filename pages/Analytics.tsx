
import React, { useEffect, useState } from 'react';
import { Loader2, Activity, Info } from 'lucide-react';
import { dataService } from '../services/dataService';

const Analytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataService.getAnalyticsPrediction()
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-navy-900 pt-20 flex flex-col justify-center items-center">
        <Loader2 className="w-10 h-10 text-gold-500 animate-spin mb-4" />
        <p className="text-slate-500 font-serif tracking-widest animate-pulse">RUNNING AI PROJECTIONS</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-navy-900 pt-20">
      <div className="bg-navy-950 py-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-serif text-white mb-2">Predictive Analytics</h1>
          <p className="text-slate-400">AI-driven forecasts and market sentiment analysis.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
                <div className="bg-navy-800 border border-white/5 rounded-lg p-6">
                    <h3 className="text-white font-serif text-lg mb-6 flex items-center gap-2"><Activity size={18} className="text-gold-500" /> Market Sentiment</h3>
                    <div className="flex items-center justify-center mb-6 relative">
                        <div className="w-32 h-16 overflow-hidden relative">
                             <div className="w-32 h-32 rounded-full border-8 border-slate-700 absolute top-0 left-0 border-l-transparent border-b-transparent transform rotate-45"></div>
                             <div className={`w-32 h-32 rounded-full border-8 absolute top-0 left-0 border-l-transparent border-b-transparent transform transition-all duration-1000 ${
                                 data?.sentiment?.score > 50 ? 'border-emerald-500' : 'border-rose-500'
                             }`} style={{ transform: `rotate(${45 + (data?.sentiment?.score / 100) * 180}deg)` }}></div>
                        </div>
                        <div className="absolute top-10 text-center">
                            <span className="text-2xl font-bold text-white">{data?.sentiment?.score || '--'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-2 bg-navy-800 border border-white/5 rounded-lg p-8">
                <h3 className="text-xl font-serif text-white mb-8">Portfolio Simulation (5Y)</h3>
                <div className="h-80 w-full relative">
                    <svg viewBox="0 0 500 300" className="w-full h-full overflow-visible">
                        <line x1="0" y1="250" x2="500" y2="250" stroke="#334155" strokeWidth="1" />
                        {data?.simulation && data.simulation.length > 0 && (
                            <polyline
                                points={data.simulation.map((d: any, i: number) => `${i * 100},${250 - (d.moderate - 10000)/200}`).join(' ')} // Scaling basic logic for viz
                                fill="none"
                                stroke="#fbbf24"
                                strokeWidth="2"
                            />
                        )}
                    </svg>
                </div>
                <div className="mt-6 p-4 bg-navy-900/50 rounded border border-white/5 flex gap-3 items-start">
                    <Info className="text-gold-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-400">Processing live market feeds. Diversification scores will update upon ledger finalization.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
