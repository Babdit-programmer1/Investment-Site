import React, { useState, useEffect, useMemo } from 'react';
import { Investment } from '../types';
import { TrendingUp, Info, ChevronRight, Filter, Loader2, Search, SlidersHorizontal, ArrowUpRight, Shield, Zap, Globe, Cpu, Leaf, Music, Car } from 'lucide-react';
import InvestModal from '../components/InvestModal';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../src/config';

// Expanded Mock Data for Preview
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
  {
    id: '2',
    ticker: 'ART-WAR-067',
    title: 'Warhol "Marilyn" Series',
    category: 'Fine Art',
    fundStrategy: 'Capital Appreciation',
    description: 'Blue-chip pop art asset. Warhol market index has outperformed S&P 500 by 120% over the last 15 years.',
    price: '$100,000',
    minInvestment: 100000,
    returnRate: '18.2%',
    targetIrp: 18.2,
    term: '5-7 Years',
    riskLevel: 'Medium',
    status: 'ACTIVE',
    imageUrl: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?q=80&w=1600',
    scenarios: { conservative: 5, moderate: 18.2, aggressive: 35 }
  },
  {
    id: '3',
    ticker: 'ALT-FER-250',
    title: '1962 Ferrari 250 GTO',
    category: 'Luxury Vehicles',
    fundStrategy: 'Aggressive Growth',
    description: 'The "Holy Grail" of automotive investing. 1 of 36. Historical CAGR of 15% over the last 30 years.',
    price: '$500,000',
    minInvestment: 500000,
    returnRate: '24.0%',
    targetIrp: 24.0,
    term: '5-10 Years',
    riskLevel: 'High',
    status: 'ACTIVE',
    imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c698d2?q=80&w=1600',
    scenarios: { conservative: -5, moderate: 24, aggressive: 45 }
  },
  {
    id: '4',
    ticker: 'SPC-ORB-001',
    title: 'Low-Earth Orbit Network',
    category: 'Space Infra',
    fundStrategy: 'Infrastructure Growth',
    description: 'Equity stake in a constellation of 50 nanosatellites providing global maritime data coverage.',
    price: '$25,000',
    minInvestment: 25000,
    returnRate: '21.5%',
    targetIrp: 21.5,
    term: '7 Years',
    riskLevel: 'High',
    status: 'ACTIVE',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600',
    scenarios: { conservative: -10, moderate: 21.5, aggressive: 55 }
  },
  {
    id: '5',
    ticker: 'AI-DAT-CAL',
    title: 'Silicon Valley Data Center',
    category: 'AI Infra',
    fundStrategy: 'Yield + Growth',
    description: 'Tier 4 data center facility leased to major AI research labs. Long-term triple net lease.',
    price: '$50,000',
    minInvestment: 50000,
    returnRate: '12.8%',
    targetIrp: 12.8,
    term: '5 Years',
    riskLevel: 'Medium',
    status: 'ACTIVE',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef526b01201b?q=80&w=1600',
    scenarios: { conservative: 8, moderate: 12.8, aggressive: 18 }
  },
  {
    id: '6',
    ticker: 'CRB-AMZ-09',
    title: 'Amazonian Carbon Project',
    category: 'Carbon Credits',
    fundStrategy: 'Sustainability',
    description: 'Verified Carbon Standard (VCS) project covering 50,000 hectares. High demand from Fortune 500 net-zero pledges.',
    price: '$10,000',
    minInvestment: 10000,
    returnRate: '16.5%',
    targetIrp: 16.5,
    term: '10 Years',
    riskLevel: 'Medium',
    status: 'ACTIVE',
    imageUrl: 'https://images.unsplash.com/photo-1440342359726-591831b254d1?q=80&w=1600',
    scenarios: { conservative: 5, moderate: 16.5, aggressive: 28 }
  },
  {
    id: '7',
    ticker: 'NRG-SOL-SPN',
    title: 'Andalusian Solar Farm',
    category: 'Renewable Energy',
    fundStrategy: 'Stable Yield',
    description: 'Operational 50MW solar photovoltaic plant in Southern Spain with government-backed power purchase agreement.',
    price: '$20,000',
    minInvestment: 20000,
    returnRate: '9.2%',
    targetIrp: 9.2,
    term: '15 Years',
    riskLevel: 'Low',
    status: 'ACTIVE',
    imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1600',
    scenarios: { conservative: 6, moderate: 9.2, aggressive: 11 }
  },
  {
    id: '8',
    ticker: 'MUS-RCK-80',
    title: 'Legends of Rock Catalog',
    category: 'Music Royalties',
    fundStrategy: 'Cash Flow',
    description: 'Ownership of master recording rights for a portfolio of 3 top-charting 1980s rock bands. Consistent streaming revenue.',
    price: '$15,000',
    minInvestment: 15000,
    returnRate: '11.0%',
    targetIrp: 11.0,
    term: 'Perpetual',
    riskLevel: 'Medium',
    status: 'ACTIVE',
    imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1600',
    scenarios: { conservative: 7, moderate: 11, aggressive: 15 }
  },
  {
    id: '9',
    ticker: 'COL-GAT-01',
    title: 'First Edition "Gatsby"',
    category: 'Rare Collectibles',
    fundStrategy: 'Appreciation',
    description: 'Immaculate 1925 first edition of The Great Gatsby with original dust jacket. Only 5 known copies in this condition.',
    price: '$75,000',
    minInvestment: 75000,
    returnRate: '13.5%',
    targetIrp: 13.5,
    term: '3-5 Years',
    riskLevel: 'Medium',
    status: 'ACTIVE',
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1600',
    scenarios: { conservative: 2, moderate: 13.5, aggressive: 25 }
  },
  {
    id: '10',
    ticker: 'NFT-PUNK-IDX',
    title: 'CryptoPunks Blue Index',
    category: 'NFTs',
    fundStrategy: 'Digital Momentum',
    description: 'Fractional ownership of a basket containing 3 Zombie and 1 Ape CryptoPunk. High volatility, high upside.',
    price: '$5,000',
    minInvestment: 5000,
    returnRate: '35.0%',
    targetIrp: 35.0,
    term: '2 Years',
    riskLevel: 'High',
    status: 'ACTIVE',
    imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1600',
    scenarios: { conservative: -30, moderate: 35, aggressive: 120 }
  },
  {
    id: '11',
    ticker: 'CRE-PVT-DBT',
    title: 'Global Tech Venture Debt',
    category: 'Private Credit',
    fundStrategy: 'Fixed Income',
    description: 'Senior secured loans to Series C+ technology companies. Short duration, high coupon.',
    price: '$100,000',
    minInvestment: 100000,
    returnRate: '14.0%',
    targetIrp: 14.0,
    term: '24 Months',
    riskLevel: 'Medium',
    status: 'ACTIVE',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1600',
    scenarios: { conservative: 10, moderate: 14, aggressive: 16 }
  }
];

// Simple SVG Component for ROI Chart (Enhanced)
const GrowthChart: React.FC<{ scenarios: { conservative: number, moderate: number, aggressive: number }, color?: string }> = ({ scenarios, color = "#fbbf24" }) => {
  const safeScenarios = typeof scenarios === 'string' ? JSON.parse(scenarios) : scenarios;
  const getY = (val: number) => Math.max(0, Math.min(40, 40 - (val * 0.5 + 15))); // Adjusted scale
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
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
  
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/investments`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        // Merge mock data with potentially fewer backend items for preview completeness
        // In a real app, backend would handle all
        setInvestments(data.length > 5 ? data : MOCK_INVESTMENTS);
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

  if (loading) return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-gold-500 animate-spin" />
    </div>
  );

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
             <div className="flex justify-center gap-8 text-center">
                <div>
                   <p className="text-2xl font-serif text-white">{investments.length}</p>
                   <p className="text-xs text-slate-500 uppercase tracking-widest">Assets</p>
                </div>
                <div className="w-px h-10 bg-white/10"></div>
                <div>
                   <p className="text-2xl font-serif text-white text-emerald-400">18.4%</p>
                   <p className="text-xs text-slate-500 uppercase tracking-widest">Avg ROI</p>
                </div>
                <div className="w-px h-10 bg-white/10"></div>
                <div>
                   <p className="text-2xl font-serif text-white">$420M</p>
                   <p className="text-xs text-slate-500 uppercase tracking-widest">Deployed</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Advanced Filters */}
        <div className="flex flex-col gap-6 mb-12">
           <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 h-4 w-4" />
                <input 
                  type="text" 
                  placeholder="Search by asset name or ticker..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-navy-800 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-gold-500 focus:outline-none placeholder-slate-500"
                />
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                 <div className="flex items-center gap-2 bg-navy-800 rounded-full p-1 border border-white/5">
                    {risks.map((risk) => (
                      <button 
                        key={risk} 
                        onClick={() => setRiskFilter(risk)} 
                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${riskFilter === risk ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        {risk === 'All' ? 'Risk: All' : risk}
                      </button>
                    ))}
                 </div>
              </div>
           </div>

           {/* Category Tabs */}
           <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <SlidersHorizontal className="text-slate-500 h-4 w-4 flex-shrink-0 mr-2" />
              {categories.map((cat) => (
                <button 
                  key={cat} 
                  onClick={() => setFilter(cat)} 
                  className={`whitespace-nowrap px-4 py-2 rounded-sm text-xs font-mono uppercase tracking-wider border transition-all ${
                    filter === cat 
                    ? 'bg-gold-600 border-gold-600 text-white' 
                    : 'bg-transparent border-white/10 text-slate-400 hover:border-gold-500/50 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
           </div>
           
           <div className="flex justify-between items-center text-xs text-slate-500 font-mono border-b border-white/5 pb-4">
              <span>SHOWING {filteredInvestments.length} OPPORTUNITIES</span>
              <span className="hidden md:inline">REAL-TIME VALUATION</span>
           </div>
        </div>

        {/* Investments Grid - Premium Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredInvestments.map((inv) => (
            <div key={inv.id} className="group relative bg-navy-800 rounded-lg overflow-hidden border border-white/5 hover:border-gold-500/30 hover:shadow-2xl hover:shadow-gold-900/10 transition-all duration-500 flex flex-col h-full">
              
              {/* Image Area */}
              <div className="relative h-56 overflow-hidden">
                <img src={inv.imageUrl} alt={inv.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-transparent opacity-90"></div>
                
                {/* Overlay Tags */}
                <div className="absolute top-4 left-4">
                  <CategoryBadge category={inv.category} />
                </div>
                <div className="absolute top-4 right-4 bg-navy-950/80 backdrop-blur border border-white/10 px-2 py-1 rounded text-[10px] font-mono text-white">
                  {inv.ticker}
                </div>
                
                <div className="absolute bottom-4 left-4 right-4">
                   <h3 className="text-xl font-serif text-white leading-tight mb-1 truncate">{inv.title}</h3>
                   <div className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="flex items-center gap-1"><TrendingUp size={12} className="text-gold-500"/> {inv.fundStrategy}</span>
                   </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-6 flex flex-col flex-grow">
                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-white/5">
                   <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Target ROI</p>
                      <p className="text-2xl font-serif text-emerald-400">{inv.returnRate}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Min. Entry</p>
                      <p className="text-lg font-medium text-white">{typeof inv.minInvestment === 'number' ? `$${inv.minInvestment.toLocaleString()}` : inv.price}</p>
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

        {filteredInvestments.length === 0 && (
           <div className="text-center py-20">
              <p className="text-slate-500 text-lg">No assets match your criteria.</p>
              <button onClick={() => {setFilter('All'); setRiskFilter('All'); setSearchQuery('');}} className="mt-4 text-gold-500 hover:text-white text-sm">Clear Filters</button>
           </div>
        )}
      </div>

      {selectedInvestment && (
        <InvestModal investment={selectedInvestment} onClose={() => setSelectedInvestment(null)} />
      )}
    </div>
  );
};

export default Investments;