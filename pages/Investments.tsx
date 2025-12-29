import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Investment } from '../types';
import { TrendingUp, Info, ChevronRight, Filter, Loader2 } from 'lucide-react';

const API_URL = 'http://localhost:3001/api/v1/investments';

// Simple SVG Component for ROI Chart
const GrowthChart: React.FC<{ scenarios: { conservative: number, moderate: number, aggressive: number } }> = ({ scenarios }) => {
  const width = 100;
  const height = 40;
  const getY = (val: number) => Math.max(0, Math.min(40, 40 - (val + 10)));
  const cY = getY(scenarios.conservative);
  const mY = getY(scenarios.moderate);
  const aY = getY(scenarios.aggressive);

  return (
    <svg width="100%" height="40" viewBox="0 0 100 40" preserveAspectRatio="none" className="overflow-visible">
      <line x1="0" y1="20" x2="100" y2="20" stroke="#334155" strokeWidth="0.5" strokeDasharray="2" />
      <path d={`M0,35 Q50,35 100,${aY}`} fill="none" stroke="#fbbf24" strokeWidth="1.5" />
      <path d={`M0,35 Q50,35 100,${mY}`} fill="none" stroke="#10b981" strokeWidth="1.5" />
      <path d={`M0,35 Q50,35 100,${cY}`} fill="none" stroke="#94a3b8" strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
};

const Investments: React.FC = () => {
  const [filter, setFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        setInvestments(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  const categories = ['All', 'Real Estate', 'Art', 'Jewelry', 'Artifacts', 'Alternative'];
  const risks = ['All', 'Low', 'Medium', 'High'];

  const filteredInvestments = investments.filter(item => {
    const categoryMatch = filter === 'All' || item.category === filter;
    const riskMatch = riskFilter === 'All' || item.riskLevel === riskFilter;
    return categoryMatch && riskMatch;
  });

  if (loading) return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-gold-500 animate-spin" />
    </div>
  );

  return (
    <div className="pt-20 min-h-screen bg-navy-900">
      <div className="bg-navy-950 py-16 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-gold-500 font-mono text-xs tracking-widest uppercase mb-2 block">Marketplace</span>
          <h1 className="font-serif text-4xl md:text-5xl text-white mb-6">Investment Opportunities</h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg font-light">
            Institutional-grade assets vetted for legal clarity, valuation accuracy, and ROI potential.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12 pb-4 border-b border-white/10">
          <div className="space-y-4 w-full md:w-auto">
             <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-2 rounded text-xs font-mono uppercase tracking-wider transition-all ${filter === cat ? 'bg-gold-600 text-white' : 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5'}`}>{cat}</button>
                ))}
             </div>
             <div className="flex items-center gap-3 pl-1">
                <span className="text-xs text-slate-500 flex items-center"><Filter size={12} className="mr-1"/> Risk Level:</span>
                {risks.map((risk) => (
                  <button key={risk} onClick={() => setRiskFilter(risk)} className={`text-xs font-medium px-2 py-1 rounded transition-colors ${riskFilter === risk ? 'text-white bg-white/10' : 'text-slate-500 hover:text-white'}`}>{risk}</button>
                ))}
             </div>
          </div>
          <div className="text-slate-500 text-xs font-mono whitespace-nowrap self-end md:self-center">
            SHOWING {filteredInvestments.length} ASSETS
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredInvestments.map((inv) => (
            <div key={inv.id} className="bg-navy-800 rounded-sm overflow-hidden border border-white/5 hover:border-gold-500/50 transition-all duration-300 flex flex-col md:flex-row h-auto md:h-72 shadow-xl">
              <div className="w-full md:w-2/5 relative">
                <img src={inv.imageUrl} alt={inv.title} className="w-full h-full object-cover" />
                <div className="absolute top-0 left-0 bg-navy-900/90 backdrop-blur px-3 py-1.5 border-b border-r border-white/10">
                  <span className="text-xs font-mono text-gold-500">{inv.ticker}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-navy-900 to-transparent p-4">
                  <span className="inline-block px-2 py-0.5 rounded-sm bg-navy-950/80 border border-white/10 text-[10px] font-bold text-slate-300 uppercase">{inv.category}</span>
                </div>
              </div>

              <div className="w-full md:w-3/5 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-serif text-white truncate pr-2">{inv.title}</h3>
                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${inv.riskLevel === 'Low' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : inv.riskLevel === 'Medium' ? 'border-gold-500/30 text-gold-500 bg-gold-500/10' : 'border-rose-500/30 text-rose-400 bg-rose-500/10'}`}>{inv.riskLevel} Risk</div>
                  </div>
                  <div className="space-y-3 mb-4">
                    <div>
                      <span className="block text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-1">Fund Strategy</span>
                      <div className="flex items-center text-sm text-gold-500 font-medium"><TrendingUp className="w-4 h-4 mr-2" />{inv.fundStrategy}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-navy-900/50 rounded p-3 border border-white/5 mb-4">
                   <div className="grid grid-cols-3 gap-2 text-center">
                      <div><span className="block text-[10px] text-slate-500 uppercase">Min Invest</span><span className="block text-white font-medium text-sm">{inv.price}</span></div>
                      <div className="border-x border-white/5"><span className="block text-[10px] text-slate-500 uppercase">Target IRR</span><span className="block text-emerald-400 font-medium text-sm">{inv.returnRate}</span></div>
                      <div><span className="block text-[10px] text-slate-500 uppercase">Term</span><span className="block text-white font-medium text-sm">{inv.term}</span></div>
                   </div>
                </div>

                <div className="mb-4 pr-12">
                   <GrowthChart scenarios={inv.scenarios} />
                </div>

                <div className="flex items-center justify-between mt-auto">
                   <button className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"><Info size={14} /><span>Fact Sheet</span></button>
                   <Link to="/contact" className="bg-gold-600 hover:bg-gold-500 text-white text-xs font-bold uppercase tracking-wide py-2 px-6 rounded-sm transition-colors flex items-center">Invest Now <ChevronRight size={14} className="ml-1" /></Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Investments;
