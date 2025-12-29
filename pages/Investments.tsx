import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Investment } from '../types';
import { TrendingUp, AlertCircle, Clock, Info, ChevronRight, BarChart2 } from 'lucide-react';

const investmentsData: Investment[] = [
  {
    id: '1',
    ticker: 'RE-LDN-001',
    title: 'The Kensington Estate',
    category: 'Real Estate',
    fundStrategy: 'Value-Add + Yield',
    price: '$50,000',
    returnRate: '14.5%',
    roiTimeframe: '36 Months',
    riskLevel: 'Low',
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-e328701102b9?q=80&w=1600',
    description: 'Prime residential conversion in West London. Secured against inflation with projected rental yield of 5% plus capital appreciation.',
    scenarios: { conservative: 8, moderate: 14.5, aggressive: 22 }
  },
  {
    id: '2',
    ticker: 'ART-WAR-067',
    title: 'Warhol "Marilyn" Series',
    category: 'Art',
    fundStrategy: 'Capital Appreciation',
    price: '$100,000',
    returnRate: '18.2%',
    roiTimeframe: '5-7 Years',
    riskLevel: 'Medium',
    imageUrl: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?q=80&w=1600',
    description: 'Blue-chip pop art asset. Warhol market index has outperformed S&P 500 by 120% over the last 15 years.',
    scenarios: { conservative: 5, moderate: 18.2, aggressive: 35 }
  },
  {
    id: '3',
    ticker: 'JW-CAR-902',
    title: 'Cartier Pink Diamond',
    category: 'Jewelry',
    fundStrategy: 'Store of Value',
    price: '$25,000',
    returnRate: '9.5%',
    roiTimeframe: '5 Years',
    riskLevel: 'Low',
    imageUrl: 'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?q=80&w=1600',
    description: 'Extremely rare fancy vivid pink diamond. Historically immune to market volatility and currency devaluation.',
    scenarios: { conservative: 4, moderate: 9.5, aggressive: 15 }
  },
  {
    id: '4',
    ticker: 'AT-MING-221',
    title: 'Ming Dynasty Vase',
    category: 'Artifacts',
    fundStrategy: 'Alternative Alpha',
    price: '$15,000',
    returnRate: '11.0%',
    roiTimeframe: '7-10 Years',
    riskLevel: 'Medium',
    imageUrl: 'https://images.unsplash.com/photo-1590924296931-562a049e6f80?q=80&w=1600',
    description: 'Museum-grade porcelain from the Wanli period. Provenance verified. High demand from Asian institutional collectors.',
    scenarios: { conservative: 2, moderate: 11, aggressive: 25 }
  },
  {
    id: '5',
    ticker: 'RE-NYC-PH1',
    title: 'Central Park Triplex',
    category: 'Real Estate',
    fundStrategy: 'Income Generation',
    price: '$250,000',
    returnRate: '11.8%',
    roiTimeframe: '48 Months',
    riskLevel: 'Low',
    imageUrl: 'https://images.unsplash.com/photo-1567684014761-b65e2e59b9eb?q=80&w=1600',
    description: 'Trophy asset in Manhattan. Immediate cash flow from existing high-net-worth tenant lease.',
    scenarios: { conservative: 6, moderate: 11.8, aggressive: 16 }
  },
  {
    id: '6',
    ticker: 'ALT-FER-250',
    title: '1962 Ferrari 250 GTO',
    category: 'Alternative',
    fundStrategy: 'Aggressive Growth',
    price: '$500,000',
    returnRate: '24.0%',
    roiTimeframe: '5-10 Years',
    riskLevel: 'High',
    imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c698d2?q=80&w=1600',
    description: 'The "Holy Grail" of automotive investing. 1 of 36. Historical CAGR of 15% over the last 30 years.',
    scenarios: { conservative: -5, moderate: 24, aggressive: 45 }
  }
];

// Simple SVG Component for ROI Chart
const GrowthChart: React.FC<{ scenarios: { conservative: number, moderate: number, aggressive: number } }> = ({ scenarios }) => {
  const width = 100;
  const height = 40;
  
  // Calculate points for a curve (0,0) to (100, Y)
  // Normalized Y: 50 is base.
  const getY = (val: number) => Math.max(0, Math.min(40, 40 - (val + 10))); // Simple mapping
  
  const cY = getY(scenarios.conservative);
  const mY = getY(scenarios.moderate);
  const aY = getY(scenarios.aggressive);

  return (
    <svg width="100%" height="40" viewBox="0 0 100 40" preserveAspectRatio="none" className="overflow-visible">
      {/* Grid line */}
      <line x1="0" y1="20" x2="100" y2="20" stroke="#334155" strokeWidth="0.5" strokeDasharray="2" />
      
      {/* Aggressive Path */}
      <path d={`M0,35 Q50,35 100,${aY}`} fill="none" stroke="#fbbf24" strokeWidth="1.5" />
      {/* Moderate Path */}
      <path d={`M0,35 Q50,35 100,${mY}`} fill="none" stroke="#10b981" strokeWidth="1.5" />
      {/* Conservative Path */}
      <path d={`M0,35 Q50,35 100,${cY}`} fill="none" stroke="#94a3b8" strokeWidth="1.5" opacity="0.5" />
      
      {/* Labels - Aligned to end to prevent cutoff */}
      <text x="98" y={aY + 2} fontSize="6" fill="#fbbf24" className="font-mono" textAnchor="end">Bull {scenarios.aggressive}%</text>
      <text x="98" y={mY + 2} fontSize="6" fill="#10b981" className="font-mono" textAnchor="end">Base {scenarios.moderate}%</text>
    </svg>
  );
};

const Investments: React.FC = () => {
  const [filter, setFilter] = useState('All');
  const categories = ['All', 'Real Estate', 'Art', 'Jewelry', 'Artifacts', 'Alternative'];

  const filteredInvestments = filter === 'All' 
    ? investmentsData 
    : investmentsData.filter(item => item.category === filter);

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
        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-12 pb-4 border-b border-white/10">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded text-xs font-mono uppercase tracking-wider transition-all ${
                  filter === cat
                    ? 'bg-gold-600 text-white'
                    : 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="text-slate-500 text-xs font-mono">
            SHOWING {filteredInvestments.length} ASSETS
          </div>
        </div>

        {/* Investment Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredInvestments.map((inv) => (
            <div key={inv.id} className="bg-navy-800 rounded-sm overflow-hidden border border-white/5 hover:border-gold-500/50 transition-all duration-300 flex flex-col md:flex-row h-auto md:h-72 shadow-xl">
              
              {/* Image Section */}
              <div className="w-full md:w-2/5 relative">
                <img src={inv.imageUrl} alt={inv.title} className="w-full h-full object-cover" />
                <div className="absolute top-0 left-0 bg-navy-900/90 backdrop-blur px-3 py-1.5 border-b border-r border-white/10">
                  <span className="text-xs font-mono text-gold-500">{inv.ticker}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-navy-900 to-transparent p-4">
                  <span className="inline-block px-2 py-0.5 rounded-sm bg-navy-950/80 border border-white/10 text-[10px] font-bold text-slate-300 uppercase">
                    {inv.category}
                  </span>
                </div>
              </div>

              {/* Data Section */}
              <div className="w-full md:w-3/5 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-serif text-white truncate pr-2">{inv.title}</h3>
                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                      inv.riskLevel === 'Low' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' :
                      inv.riskLevel === 'Medium' ? 'border-gold-500/30 text-gold-500 bg-gold-500/10' :
                      'border-rose-500/30 text-rose-400 bg-rose-500/10'
                    }`}>
                      {inv.riskLevel} Risk
                    </div>
                  </div>
                  
                  {/* Strategy & Description Section */}
                  <div className="space-y-3 mb-4">
                    <div>
                      <span className="block text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-1">Fund Strategy</span>
                      <div className="flex items-center text-sm text-gold-500 font-medium">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        {inv.fundStrategy}
                      </div>
                    </div>
                    
                    <div>
                      <span className="block text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-1">Asset Description</span>
                      <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 border-l border-white/10 pl-3">
                        {inv.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Financials Grid */}
                <div className="bg-navy-900/50 rounded p-3 border border-white/5 mb-4">
                   <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <span className="block text-[10px] text-slate-500 uppercase">Min Invest</span>
                        <span className="block text-white font-medium text-sm">{inv.price}</span>
                      </div>
                      <div className="border-x border-white/5">
                        <span className="block text-[10px] text-slate-500 uppercase">Target IRR</span>
                        <span className="block text-emerald-400 font-medium text-sm">{inv.returnRate}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500 uppercase">Term</span>
                        <span className="block text-white font-medium text-sm">{inv.roiTimeframe}</span>
                      </div>
                   </div>
                </div>

                {/* Chart Area */}
                <div className="mb-4 pr-12">
                   <div className="flex justify-between items-end mb-1">
                      <span className="text-[10px] text-slate-500 uppercase">Projected Performance (5Y)</span>
                   </div>
                   <GrowthChart scenarios={inv.scenarios} />
                </div>

                <div className="flex items-center justify-between mt-auto">
                   <button className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
                     <Info size={14} />
                     <span>Fact Sheet</span>
                   </button>
                   <Link to="/contact" className="bg-gold-600 hover:bg-gold-500 text-white text-xs font-bold uppercase tracking-wide py-2 px-6 rounded-sm transition-colors flex items-center">
                     Invest Now <ChevronRight size={14} className="ml-1" />
                   </Link>
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