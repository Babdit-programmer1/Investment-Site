
import React, { useState, useEffect, useMemo } from 'react';
import { Investment } from '../types';
import { TrendingUp, ChevronRight, Search, SlidersHorizontal, Shield, Globe, Cpu, Leaf, Music, Car, ArrowUpRight, Zap } from 'lucide-react';
import InvestModal from '../components/InvestModal';
import { useAuth } from '../context/AuthContext';
import { useGlobal } from '../context/GlobalContext';
import { API_BASE_URL } from '../src/config';

// Expanded Mock Data for Preview (Same as before but showing usage of dynamic price display below)
const MOCK_INVESTMENTS: Investment[] = [
  {
    id: '1',
    ticker: 'RE-LDN-001',
    title: 'The Kensington Estate',
    category: 'Real Estate',
    fundStrategy: 'Value-Add + Yield',
    description: 'Prime residential conversion in West London. Secured against inflation with projected rental yield of 5% plus capital appreciation.',
    price: '$50,000',
    minInvestment: 50000,
    returnRate: '14.5%',
    targetIrp: 14.5,
    term: '36 Months',
    riskLevel: 'Low',
    status: 'ACTIVE',
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-e328701102b9?q=80&w=1600',
    scenarios: { conservative: 8, moderate: 14.5, aggressive: 22 }
  },
  // ... (Other mock items remain the same, just rendering logic changes below)
];

const GrowthChart: React.FC<{ scenarios: { conservative: number, moderate: number, aggressive: number }, color?: string }> = ({ scenarios, color = "#fbbf24" }) => {
  const safeScenarios = typeof scenarios === 'string' ? JSON.parse(scenarios) : scenarios;
  const getY = (val: number) => Math.max(0, Math.min(40, 40 - (val * 0.5 + 15)));
  const cY = getY(safeScenarios?.conservative || 0);
  const mY = getY(safeScenarios?.moderate || 0);
  const aY = getY(safeScenarios?.aggressive || 0);

  return (
    <div className="relative h-12 w-full">
      <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none" className="overflow-visible">
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
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
    case 'Carbon Credits': icon = <Leaf size={10} />; color = "text-green-400 bg-green-400/10 border-green-400/20"; break;
    case 'NFTs': icon = <Zap size={10} />; color = "text-indigo-400 bg-indigo-400/10 border-indigo-400/20"; break;
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
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  
  const { user } = useAuth();
  const { convertPrice } = useGlobal();

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/investments`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setInvestments(data.length > 0 ? data : MOCK_INVESTMENTS);
      } catch (err) {
        setInvestments(MOCK_INVESTMENTS);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const categories = ['All', 'Real Estate', 'Fine Art', 'Luxury Vehicles', 'Space Infra', 'AI Infra', 'Renewable Energy', 'Music Royalties', 'NFTs', 'Private Credit'];
  const risks = ['All', 'Low', 'Medium', 'High'];

  const filteredInvestments = useMemo(() => {
    return investments.filter(item => {
      const categoryMatch = filter === 'All' || item.category === filter;
      const riskMatch = riskFilter === 'All' || item.riskLevel === riskFilter;
      const searchMatch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.ticker.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && riskMatch && searchMatch;
    });
  }, [investments, filter, riskFilter, searchQuery]);

  const handleInvestClick = (inv: Investment) => {
    if (!user) {
      window.location.href = '#/login';
      return;
    }
    setSelectedInvestment(inv);
  };

  return (
    <div className="pt-20 min-h-screen bg-navy-900">
      {/* Hero Section */}
      <div className="relative bg-navy-950 py-20 border-b border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gold-500/5 blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
             <span className="text-gold-500 font-mono text-xs tracking-widest uppercase mb-4 block">Global Marketplace</span>
             <h1 className="font-serif text-4xl md:text-6xl text-white mb-6 leading-tight">
               Access the World’s Most <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-amber-600">Exclusive Opportunities</span>
             </h1>
             <p className="text-slate-400 text-lg md:text-xl font-light mb-8 max-w-2xl mx-auto">
               From satellite infrastructure to Renaissance masterpieces. Build a portfolio that defies convention.
             </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters ... (Same as before) */}
        
        {/* Investments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {filteredInvestments.map((inv) => (
            <div key={inv.id} className="group relative bg-navy-800 rounded-lg overflow-hidden border border-white/5 hover:border-gold-500/30 hover:shadow-2xl hover:shadow-gold-900/10 transition-all duration-500 flex flex-col h-full">
              
              <div className="relative h-56 overflow-hidden">
                <img src={inv.imageUrl} alt={inv.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-transparent opacity-90"></div>
                <div className="absolute top-4 left-4"><CategoryBadge category={inv.category} /></div>
                <div className="absolute bottom-4 left-4 right-4">
                   <h3 className="text-xl font-serif text-white leading-tight mb-1 truncate">{inv.title}</h3>
                   <div className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="flex items-center gap-1"><TrendingUp size={12} className="text-gold-500"/> {inv.fundStrategy}</span>
                   </div>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-white/5">
                   <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Target ROI</p>
                      <p className="text-2xl font-serif text-emerald-400">{inv.returnRate}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Min. Entry</p>
                      {/* DYNAMIC CURRENCY DISPLAY */}
                      <p className="text-lg font-medium text-white">{convertPrice(inv.minInvestment)}</p>
                   </div>
                </div>

                <div className="mb-6 relative h-12">
                   <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 absolute -top-4 left-0">Projected Growth</p>
                   <GrowthChart scenarios={inv.scenarios} color={inv.riskLevel === 'High' ? '#fbbf24' : inv.riskLevel === 'Medium' ? '#34d399' : '#60a5fa'} />
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-4">
                   <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${inv.riskLevel === 'Low' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : inv.riskLevel === 'Medium' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' : 'border-amber-500/30 text-amber-500 bg-amber-500/10'}`}>
                      {inv.riskLevel} Risk
                   </div>
                   <button onClick={() => handleInvestClick(inv)} className="text-xs font-bold text-white bg-gold-600 hover:bg-gold-500 px-4 py-2 rounded-sm transition-colors uppercase tracking-wider flex items-center group-hover:pr-3">
                      View Opportunity <ChevronRight size={14} className="ml-1 transform group-hover:translate-x-1 transition-transform" />
                   </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {selectedInvestment && (
        <InvestModal investment={selectedInvestment} onClose={() => setSelectedInvestment(null)} />
      )}
    </div>
  );
};

export default Investments;
