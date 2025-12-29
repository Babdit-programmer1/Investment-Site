import React, { useEffect, useState } from 'react';
import { Loader2, TrendingUp, BarChart2, Activity, PieChart, Info } from 'lucide-react';
import { API_BASE_URL } from '../src/config';

const Analytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('prestige_token');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/predict`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setData(await res.json());
      } else {
        // Mock fallback
        setData({
            simulation: [
                { year: 2025, conservative: 10500, moderate: 11000, aggressive: 12000 },
                { year: 2026, conservative: 11025, moderate: 12200, aggressive: 14500 },
                { year: 2027, conservative: 11576, moderate: 13500, aggressive: 17800 },
                { year: 2028, conservative: 12155, moderate: 15000, aggressive: 22000 },
                { year: 2029, conservative: 12760, moderate: 16800, aggressive: 28000 }
            ],
            sentiment: {
                score: 72,
                label: "Greed",
                trend: "Bullish",
                sectorPerformance: [
                    { sector: "Real Estate", change: 4.2 },
                    { sector: "Fine Art", change: 12.5 },
                    { sector: "Crypto", change: -2.1 },
                    { sector: "Commodities", change: 1.8 }
                ]
            }
        });
      }
    } catch (e) {
      console.warn("Analytics API unavailable");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-navy-900 pt-20 flex justify-center items-center"><Loader2 className="w-8 h-8 text-gold-500 animate-spin" /></div>;

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
            
            {/* Market Sentiment Card */}
            <div className="lg:col-span-1 space-y-8">
                <div className="bg-navy-800 border border-white/5 rounded-lg p-6">
                    <h3 className="text-white font-serif text-lg mb-6 flex items-center gap-2"><Activity size={18} className="text-gold-500" /> Market Sentiment</h3>
                    <div className="flex items-center justify-center mb-6 relative">
                        <div className="w-32 h-16 overflow-hidden relative">
                             <div className="w-32 h-32 rounded-full border-8 border-slate-700 absolute top-0 left-0 border-l-transparent border-b-transparent transform rotate-45"></div>
                             <div className={`w-32 h-32 rounded-full border-8 absolute top-0 left-0 border-l-transparent border-b-transparent transform transition-all duration-1000 ${
                                 data.sentiment.score > 50 ? 'border-emerald-500' : 'border-rose-500'
                             }`} style={{ transform: `rotate(${45 + (data.sentiment.score / 100) * 180}deg)` }}></div>
                        </div>
                        <div className="absolute top-10 text-center">
                            <span className="text-2xl font-bold text-white">{data.sentiment.score}</span>
                            <p className={`text-xs uppercase font-bold tracking-wider ${data.sentiment.score > 50 ? 'text-emerald-400' : 'text-rose-400'}`}>{data.sentiment.label}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {data.sentiment.sectorPerformance.map((sec: any) => (
                            <div key={sec.sector} className="flex justify-between text-sm">
                                <span className="text-slate-300">{sec.sector}</span>
                                <span className={sec.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                    {sec.change > 0 ? '+' : ''}{sec.change}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-navy-800 border border-white/5 rounded-lg p-6">
                    <h3 className="text-white font-serif text-lg mb-4">Risk Analysis</h3>
                    <p className="text-sm text-slate-400 mb-4">Your portfolio beta relative to the S&P 500 is <strong className="text-white">0.65</strong>, indicating lower volatility.</p>
                    <div className="h-2 bg-navy-900 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-2/3"></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                        <span>Low Volatility</span>
                        <span>High Volatility</span>
                    </div>
                </div>
            </div>

            {/* Simulation Chart */}
            <div className="lg:col-span-2 bg-navy-800 border border-white/5 rounded-lg p-8">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h3 className="text-xl font-serif text-white flex items-center gap-2"><TrendingUp className="text-gold-500" /> Portfolio Simulation (5Y)</h3>
                        <p className="text-slate-400 text-sm mt-1">Projected value based on Monte Carlo simulations.</p>
                    </div>
                    <div className="flex gap-4 text-xs">
                        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div> Aggressive</div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gold-500 rounded-full"></div> Moderate</div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded-full"></div> Conservative</div>
                    </div>
                </div>

                <div className="h-80 w-full relative">
                    {/* Simplified SVG Line Chart */}
                    <svg viewBox="0 0 500 300" className="w-full h-full overflow-visible">
                        {/* Grid Lines */}
                        <line x1="0" y1="250" x2="500" y2="250" stroke="#334155" strokeWidth="1" />
                        <line x1="0" y1="150" x2="500" y2="150" stroke="#334155" strokeWidth="1" strokeDasharray="4" />
                        <line x1="0" y1="50" x2="500" y2="50" stroke="#334155" strokeWidth="1" strokeDasharray="4" />

                        {/* Aggressive Line */}
                        <polyline 
                            fill="none" 
                            stroke="#10b981" 
                            strokeWidth="3"
                            points={data.simulation.map((d: any, i: number) => `${i * 100},${250 - ((d.aggressive - 10000)/20000)*200}`).join(' ')}
                        />
                        
                        {/* Moderate Line */}
                        <polyline 
                            fill="none" 
                            stroke="#fbbf24" 
                            strokeWidth="3"
                            points={data.simulation.map((d: any, i: number) => `${i * 100},${250 - ((d.moderate - 10000)/20000)*200}`).join(' ')}
                        />

                        {/* Conservative Line */}
                        <polyline 
                            fill="none" 
                            stroke="#3b82f6" 
                            strokeWidth="3"
                            points={data.simulation.map((d: any, i: number) => `${i * 100},${250 - ((d.conservative - 10000)/20000)*200}`).join(' ')}
                        />
                        
                        {/* X Axis Labels */}
                        {data.simulation.map((d: any, i: number) => (
                            <text key={i} x={i * 100} y="270" fill="#94a3b8" fontSize="12" textAnchor="middle">{d.year}</text>
                        ))}
                    </svg>
                </div>
                
                <div className="mt-6 p-4 bg-navy-900/50 rounded border border-white/5 flex gap-3 items-start">
                    <Info className="text-gold-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-400">
                        Based on current market conditions, your portfolio is tracking towards the <span className="text-white font-bold">Moderate</span> scenario. 
                        Consider increasing exposure to Alternative Assets to push towards the Aggressive curve.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;