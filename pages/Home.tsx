import React from 'react';
import { ArrowRight, TrendingUp, ShieldCheck, Globe, Database, PieChart, BarChart, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const FEATURED_ASSETS = [
  {
    id: '1',
    title: 'The Kensington Estate',
    category: 'Real Estate',
    image: 'https://images.unsplash.com/photo-1600596542815-e328701102b9?q=80&w=1600',
    roi: '14.5%',
    min: '$50,000'
  },
  {
    id: '2',
    title: 'Warhol "Marilyn" Series',
    category: 'Fine Art',
    image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?q=80&w=1600',
    roi: '18.2%',
    min: '$100,000'
  },
  {
    id: '3',
    title: '1962 Ferrari 250 GTO',
    category: 'Luxury Vehicles',
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c698d2?q=80&w=1600',
    roi: '24.0%',
    min: '$500,000'
  }
];

const Home: React.FC = () => {
  return (
    <div className="bg-navy-900">
      {/* Market Pulse Ticker */}
      <div className="bg-navy-950 border-b border-white/10 h-10 flex items-center overflow-hidden">
        <div className="flex space-x-12 animate-marquee whitespace-nowrap px-4 text-xs font-mono text-slate-400">
          <span className="flex items-center"><span className="text-gold-500 mr-2">FINE ART IDX</span> ▲ 12.4% YTD</span>
          <span className="flex items-center"><span className="text-gold-500 mr-2">LUX REAL ESTATE</span> ▲ 8.2% YTD</span>
          <span className="flex items-center"><span className="text-gold-500 mr-2">RARE GEMS</span> ▲ 5.1% YTD</span>
          <span className="flex items-center"><span className="text-gold-500 mr-2">CLASSIC CARS</span> ▼ 1.2% Q3</span>
          <span className="flex items-center"><span className="text-gold-500 mr-2">GOLD BULLION</span> ▲ 4.8% YTD</span>
          <span className="flex items-center"><span className="text-gold-500 mr-2">S&P 500</span> ▲ 7.2% YTD</span>
        </div>
      </div>

      {/* 1. Hero Section */}
      <div className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
            alt="Financial District"
            className="w-full h-full object-cover grayscale opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/80 to-navy-900/60"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block py-1 px-3 rounded border border-gold-500/30 bg-gold-500/10 text-gold-500 text-xs font-mono tracking-widest mb-6">
            INSTITUTIONAL GRADE PLATFORM
          </span>
          <h1 className="font-serif text-5xl md:text-7xl text-white font-bold mb-6 leading-tight">
            Precision Investing in <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-amber-600">
              Alternative Assets
            </span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-3xl mx-auto mb-10 font-light leading-relaxed">
            Our mission is to democratize access to million-dollar opportunities in real estate, art, and collectibles. 
            Engineered for accreditation-level ROI, wealth preservation, and portfolio diversification.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/investments"
              className="w-full sm:w-auto px-10 py-4 bg-gold-600 text-white font-serif tracking-wide hover:bg-gold-500 transition-colors shadow-lg shadow-gold-900/30 rounded-sm"
            >
              Access Marketplace
            </Link>
            <Link
              to="/resources"
              className="w-full sm:w-auto px-10 py-4 border border-white/30 text-white font-serif tracking-wide hover:bg-white/10 transition-colors backdrop-blur-sm rounded-sm"
            >
              Investment Thesis
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Institutional Stats / Trust Bar */}
      <div className="border-y border-white/10 bg-navy-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/10">
            <div className="text-center px-4">
              <p className="text-3xl font-light text-white mb-1">14.2%</p>
              <p className="text-xs text-slate-500 uppercase tracking-widest">Avg. Annual Return</p>
            </div>
            <div className="text-center px-4">
              <p className="text-3xl font-light text-white mb-1">$580M</p>
              <p className="text-xs text-slate-500 uppercase tracking-widest">Assets Securitized</p>
            </div>
            <div className="text-center px-4">
              <p className="text-3xl font-light text-white mb-1">2.4yr</p>
              <p className="text-xs text-slate-500 uppercase tracking-widest">Avg. Holding Period</p>
            </div>
            <div className="text-center px-4">
              <p className="text-3xl font-light text-white mb-1">0%</p>
              <p className="text-xs text-slate-500 uppercase tracking-widest">Principal Loss</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Featured Investments */}
      <div className="py-20 bg-navy-900 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
             <div>
                <h2 className="text-gold-500 font-mono text-xs tracking-widest uppercase mb-2">Curated Opportunities</h2>
                <h3 className="font-serif text-3xl md:text-4xl text-white">Featured Investments</h3>
             </div>
             <Link to="/investments" className="hidden md:flex items-center space-x-2 text-slate-400 hover:text-white transition-colors text-sm">
                <span>View All Assets</span>
                <ArrowRight size={16} />
             </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {FEATURED_ASSETS.map(asset => (
                <Link key={asset.id} to={`/investments/${asset.id}`} className="group block bg-navy-800 rounded-sm overflow-hidden border border-white/5 hover:border-gold-500/30 transition-all duration-500 shadow-lg hover:shadow-gold-900/10">
                   <div className="relative h-64 overflow-hidden">
                      <img src={asset.image} alt={asset.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/20 to-transparent opacity-90"></div>
                      <span className="absolute top-4 left-4 bg-navy-900/90 backdrop-blur px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gold-500 rounded border border-gold-500/20">
                         {asset.category}
                      </span>
                   </div>
                   <div className="p-6">
                      <h4 className="text-xl font-serif text-white mb-4 group-hover:text-gold-500 transition-colors truncate">{asset.title}</h4>
                      <div className="flex justify-between items-center pt-4 border-t border-white/5">
                         <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Target ROI</p>
                            <p className="text-lg font-medium text-emerald-400 font-mono">{asset.roi}</p>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Min. Entry</p>
                            <p className="text-lg font-medium text-white font-mono">{asset.min}</p>
                         </div>
                      </div>
                   </div>
                </Link>
             ))}
          </div>
          
          <div className="mt-8 text-center md:hidden">
              <Link to="/investments" className="inline-flex items-center text-gold-500 font-medium">View All Assets <ArrowRight size={16} className="ml-2"/></Link>
          </div>
        </div>
      </div>

      {/* 4. Asset Classes (Data Driven) */}
      <div className="py-24 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div className="max-w-2xl">
              <h2 className="text-gold-500 font-mono text-xs tracking-widest uppercase mb-2">Portfolio Construction</h2>
              <h3 className="font-serif text-3xl md:text-4xl text-white mb-4">Strategic Asset Allocation</h3>
              <p className="text-slate-400">
                We select assets based on three core pillars: scarcity, historical resilience, and asymmetric upside potential.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: "Real Estate", 
                subtitle: "High-Yield & Growth",
                desc: "Million-dollar properties in London, NYC, and Dubai. Focus on commercial conversion and luxury residential.",
                stats: "12-15% Target IRR",
                timeframe: "3-5 Years"
              },
              { 
                title: "Fine Art", 
                subtitle: "Capital Preservation",
                desc: "Blue-chip works from Post-War & Contemporary masters. Uncorrelated with public equity markets.",
                stats: "10-18% Hist. APY",
                timeframe: "5-10 Years"
              },
              { 
                title: "Collectibles", 
                subtitle: "Alternative Alpha",
                desc: "Investment-grade watches, cars, and artifacts. Driven by diminishing supply and global collector demand.",
                stats: "Outperforms S&P 500",
                timeframe: "2-7 Years"
              }
            ].map((cat, i) => (
              <div key={i} className="group p-8 bg-navy-800 border border-white/5 hover:border-gold-500/30 rounded-sm transition-all duration-300">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-navy-900 rounded border border-white/10 text-gold-500 group-hover:text-white group-hover:bg-gold-600 transition-colors">
                    {i === 0 ? <Globe size={24} /> : i === 1 ? <PieChart size={24} /> : <Database size={24} />}
                  </div>
                  <span className="text-xs font-mono text-slate-500">{`0${i+1}`}</span>
                </div>
                <h4 className="font-serif text-xl text-white mb-1">{cat.title}</h4>
                <p className="text-xs text-gold-500 uppercase tracking-wider mb-4">{cat.subtitle}</p>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 border-b border-white/5 pb-6">
                  {cat.desc}
                </p>
                <div className="space-y-3">
                    <div className="flex items-center text-white font-mono text-sm">
                        <BarChart size={16} className="mr-2 text-emerald-400" />
                        {cat.stats}
                    </div>
                    <div className="flex items-center text-slate-300 font-mono text-xs">
                        <Clock size={16} className="mr-2 text-slate-500" />
                        Est. Timeframe: <span className="text-white ml-2">{cat.timeframe}</span>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Methodology Section */}
      <div className="py-24 bg-navy-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-gold-500/5 rounded-lg blur-lg"></div>
                <div className="relative bg-navy-900 p-8 border border-white/10 rounded-sm shadow-2xl">
                   {/* Simulated Chart UI */}
                   <div className="flex justify-between items-center mb-8">
                      <h4 className="text-white font-serif">Comparative Performance (5Y)</h4>
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-gold-500"></div><span className="text-xs text-slate-400">Prestige</span>
                        <div className="w-3 h-3 rounded-full bg-slate-600"></div><span className="text-xs text-slate-400">S&P 500</span>
                      </div>
                   </div>
                   <div className="h-64 flex items-end justify-between space-x-2">
                      {[40, 45, 30, 60, 55, 70, 85, 80, 95, 100].map((h, i) => (
                        <div key={i} className="w-full bg-gold-500/20 hover:bg-gold-500 transition-colors rounded-t-sm" style={{height: `${h}%`}}></div>
                      ))}
                   </div>
                   <div className="flex justify-between mt-4 text-xs text-slate-500 font-mono">
                      <span>2019</span>
                      <span>2020</span>
                      <span>2021</span>
                      <span>2022</span>
                      <span>2023</span>
                   </div>
                </div>
              </div>

              <div>
                <h2 className="text-gold-500 font-mono text-xs tracking-widest uppercase mb-2">Our Methodology</h2>
                <h3 className="font-serif text-3xl md:text-4xl text-white mb-6">Data-Driven Due Diligence</h3>
                <p className="text-slate-400 text-lg leading-relaxed mb-8">
                  We don't speculate. We analyze. Our proprietary algorithm evaluates over 50 data points per asset, including auction history, insurance valuations, and macroeconomic liquidity indicators.
                </p>
                <ul className="space-y-4">
                  {[
                    "AI-driven predictive modeling for asset appreciation",
                    "Quarterly independent appraisals by third-party experts",
                    "Blockchain-verified ownership and transaction history",
                    "Bank-grade custodial vaults for physical asset security"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start space-x-3">
                      <ShieldCheck className="h-5 w-5 text-gold-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Home;