
import React, { useState, useEffect, useMemo } from 'react';
import { Investment } from '../types';
import { TrendingUp, ChevronRight, Search, SlidersHorizontal, Shield, Globe, Cpu, Leaf, Music, Car, ArrowUpRight, Zap, Loader2, ArrowUpDown, AlertCircle, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import { dataService } from '../services/dataService';

const GrowthChart: React.FC<{ scenarios: any, color?: string }> = ({ scenarios, color = "#fbbf24" }) => {
  let safeScenarios = scenarios;
  if (typeof scenarios === 'string') {
      try { safeScenarios = JSON.parse(scenarios); } catch(e) { safeScenarios = { moderate: 0 }; }
  }
  const getY = (val: number) => Math.max(0, Math.min(40, 40 - (val * 0.5 + 15)));
  const mY = getY(safeScenarios?.moderate || 0);

  return (
    <div className="relative h-12 w-full">
      <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none" className="overflow-visible">
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" x2="0" y1="0" y2="1">
             <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
             <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={`M0,35 C30,35 70,${mY} 100,${mY}`} fill="none" stroke={color} strokeWidth="2" />
        <path d={`M0,35 C30,35 70,${mY} 100,${mY} V40 H0 Z`} fill={`url(#grad-${color})`} stroke="none" />
      </svg>
    </div>
  );
};

const CategoryBadge = ({ category }: { category: string }) => {
  let icon = <Shield size={10} />;
  let color = "text-slate-400 bg-slate-400/10 border-slate-400/20";

  switch (category) {
    case 'Real Estate': icon = <Globe size={10} />; color = "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"; break;
    case 'Fine Art': icon = <Shield size={10} />; color = "text-purple-400 bg-purple-400/10 border-purple-400/20"; break;
    case 'Luxury Vehicles': icon = <Car size={10} />; color = "text-rose-400 bg-rose-400/10 border-rose-400/20"; break;
    case 'Space Infra': icon = <ArrowUpRight size={10} />; color = "text-cyan-400 bg-cyan-400/10 border-cyan-400/20"; break;
    case 'AI Infra': icon = <Cpu size={10} />; color = "text-blue-400 bg-blue-400/10 border-blue-400/20"; break;
    case 'Renewable Energy': icon = <Zap size={10} />; color = "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"; break;
    case 'Music Royalties': icon = <Music size={10} />; color = "text-pink-400 bg-pink-400/10 border-pink-400/20"; break;
  }

  return (
    <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${color}`}>
      {icon} {category}
    </span>
  );
};

const Investments: React.FC = () => {
  const [filter, setFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('RECOMMENDED');
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { convertPrice } = useGlobal();
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await dataService.getMarketAssets();
      setInvestments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const categories = ['All', 'Real Estate', 'Fine Art', 'Luxury Vehicles', 'Space Infra', 'AI Infra', 'Renewable Energy'];
  
  const filteredInvestments = useMemo(() => {
    let result = investments.filter(item => {
      const categoryMatch = filter === 'All' || item.category === filter;
      const riskMatch = riskFilter === 'All' || item.riskLevel === riskFilter;
      const searchMatch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.ticker.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && riskMatch && searchMatch;
    });

    if (sortOption === 'PRICE_LOW_HIGH') {
        result.sort((a, b) => Number(a.minInvestment) - Number(b.minInvestment));
    } else if (sortOption === 'PRICE_HIGH_LOW') {
        result.sort((a, b) => Number(b.minInvestment) - Number(a.minInvestment));
    }

    return result;
  }, [investments, filter, riskFilter, searchQuery, sortOption]);

  return (
    <div className="pt-20 min-h-screen bg-navy-900">
      <div className="relative bg-navy-950 py-20 border-b border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
             <span className="text-gold-500 font-mono text-xs tracking-widest uppercase mb-4 block">Global Marketplace</span>
             <h1 className="font-serif text-4xl md:text-6xl text-white mb-6 leading-tight">
               Access the World’s Most <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-amber-600">
                 Exclusive Opportunities
               </span>
             </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col xl:flex-row justify-between items-center gap-6 mb-12">
          <div className="w-full xl:w-auto overflow-x-auto pb-2">
            <div className="flex space-x-2">
              {categories.map(cat => (
                <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === cat ? 'bg-gold-600 text-white' : 'bg-navy-800 text-slate-400 border border-white/5'}`}>{cat}</button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto justify-end">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input type="text" placeholder="Search assets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-navy-800 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-gold-500" />
             </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-32"><Loader2 className="w-12 h-12 text-gold-500 animate-spin" /></div>
        ) : filteredInvestments.length === 0 ? (
          <div className="text-center py-32 text-slate-500 italic">No assets found matching your criteria.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredInvestments.map((inv) => (
              <div key={inv.id} className="group relative bg-navy-800 rounded-lg overflow-hidden border border-white/5 hover:border-gold-500/30 transition-all duration-500 flex flex-col h-full">
                <div className="relative h-56 overflow-hidden">
                  <img src={inv.imageUrl} alt={inv.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-transparent opacity-90"></div>
                  <div className="absolute top-4 left-4"><CategoryBadge category={inv.category} /></div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-white/5">
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Target ROI</p>
                        <p className="text-2xl font-serif text-emerald-400">{inv.returnRate}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Min. Entry</p>
                        <p className="text-lg font-medium text-white">{convertPrice(Number(inv.minInvestment))}</p>
                    </div>
                  </div>

                  <div className="mb-6 relative h-12">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 absolute -top-4 left-0">Projected Growth</p>
                    <GrowthChart scenarios={inv.scenarios} color={inv.riskLevel === 'High' ? '#fbbf24' : '#34d399'} />
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto pt-4">
                    <div className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border border-gold-500/20 text-gold-500">
                        {inv.riskLevel} Risk
                    </div>
                    <button onClick={() => navigate(`/investments/${inv.id}`)} className="text-xs font-bold text-white bg-gold-600 hover:bg-gold-500 px-4 py-2 rounded-sm transition-colors flex items-center">
                        View Opportunity <ChevronRight size={14} className="ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Investments;
