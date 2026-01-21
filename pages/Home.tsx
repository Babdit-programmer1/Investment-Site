
import React from 'react';
import { ArrowRight, ShieldCheck, Award, LayoutDashboard, UserPlus, Globe, Database, Rocket, Hammer, Coins, Briefcase } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Link } = ReactRouterDOM;

const ASSET_CLASSES = [
  {
    id: 'REAL_ESTATE',
    name: 'Prime Real Estate',
    description: 'Ownership in trophy properties across London, New York, and Dubai.',
    icon: <Globe className="w-8 h-8 text-emerald-400" />,
    gradient: 'from-emerald-950 via-navy-900 to-navy-950',
    border: 'border-emerald-500/20 hover:border-emerald-500/50'
  },
  {
    id: 'RARE_ASSETS',
    name: 'Rare Collectibles',
    description: 'Blue-chip art and historical artifacts with uncorrelated returns.',
    icon: <Award className="w-8 h-8 text-purple-400" />,
    gradient: 'from-purple-950 via-navy-900 to-navy-950',
    border: 'border-purple-500/20 hover:border-purple-500/50'
  },
  {
    id: 'PRIVATE_EQUITY',
    name: 'Private Equity',
    description: 'Exclusive allocation to pre-IPO ventures and growth capital.',
    icon: <Briefcase className="w-8 h-8 text-gold-500" />,
    gradient: 'from-amber-950 via-navy-900 to-navy-950',
    border: 'border-gold-500/20 hover:border-gold-500/50'
  },
  {
    id: 'INFRASTRUCTURE',
    name: 'Infrastructure',
    description: 'Yield-generating energy, data, and transport networks.',
    icon: <Hammer className="w-8 h-8 text-blue-400" />,
    gradient: 'from-blue-950 via-navy-900 to-navy-950',
    border: 'border-blue-500/20 hover:border-blue-500/50'
  },
  {
    id: 'SPACE_TECH',
    name: 'Orbital Economy',
    description: 'Frontier investments in satellite networks and launch systems.',
    icon: <Rocket className="w-8 h-8 text-cyan-400" />,
    gradient: 'from-cyan-950 via-navy-900 to-navy-950',
    border: 'border-cyan-500/20 hover:border-cyan-500/50'
  },
  {
    id: 'COMMODITIES',
    name: 'Strategic Commodities',
    description: 'Physical gold reserves and critical industrial metals.',
    icon: <Coins className="w-8 h-8 text-yellow-400" />,
    gradient: 'from-yellow-950 via-navy-900 to-navy-950',
    border: 'border-yellow-500/20 hover:border-yellow-500/50'
  }
];

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-navy-900 overflow-x-hidden">
      {/* 1. Cinematic Hero Section */}
      <div className="relative h-[95vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070"
            alt="Luxury Architecture"
            className="w-full h-full object-cover scale-110 opacity-30 grayscale blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950/20 via-navy-900 to-navy-900"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full border border-gold-500/20 bg-gold-500/5 text-gold-500 text-[10px] font-bold tracking-[0.2em] mb-8 uppercase">
            <Award size={14} /> The Gold Standard in Fractional Assets
          </div>
          
          <h1 className="font-serif text-5xl md:text-8xl text-white font-bold mb-8 leading-[1.1] tracking-tight">
            Preserving Wealth through <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-200 to-amber-600">
              Tangible Excellence
            </span>
          </h1>
          
          <p className="text-slate-400 text-lg md:text-2xl max-w-3xl mx-auto mb-12 font-light leading-relaxed">
            Democratizing access to the world's most coveted asset classes. 
            Engineered for high-net-worth yields with immediate liquidity options.
          </p>
          
          <div className="flex flex-col sm:row items-center justify-center gap-6">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="group relative px-12 py-5 bg-gold-600 text-white font-serif tracking-widest hover:bg-gold-500 transition-all rounded-sm flex items-center gap-3 overflow-hidden shadow-2xl shadow-gold-900/40"
              >
                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <LayoutDashboard size={20} /> ENTER TERMINAL
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link
                  to="/register"
                  className="px-12 py-5 bg-gold-600 text-white font-serif tracking-widest hover:bg-gold-500 transition-all rounded-sm flex items-center justify-center gap-3 shadow-2xl shadow-gold-900/40"
                >
                  <UserPlus size={20} /> JOIN THE WAITLIST
                </Link>
                <Link
                  to="/investments"
                  className="px-12 py-5 border border-white/20 text-white font-serif tracking-widest hover:bg-white/5 transition-all rounded-sm flex items-center justify-center gap-3 backdrop-blur-md"
                >
                  EXPLORE ASSETS <ArrowRight size={20} />
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
            <div className="w-px h-16 bg-gradient-to-b from-transparent via-gold-500 to-transparent"></div>
        </div>
      </div>

      {/* 2. Platform Mission */}
      <div className="py-32 relative bg-navy-950 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-gold-500 font-mono text-xs tracking-[0.3em] uppercase mb-4">Our Mission</h2>
              <h3 className="font-serif text-4xl md:text-5xl text-white mb-8 leading-tight">
                Democratizing the Assets of the <span className="italic">Elite</span>
              </h3>
              <p className="text-slate-400 text-lg leading-relaxed mb-10">
                Traditionally, blue-chip art, prime real estate, and rare collectibles were reserved for institutional titans. Prestige Assets breaks these barriers using blockchain-verified fractionalization.
              </p>
              
              <div className="space-y-6">
                {[
                  { title: "Verifiable Scarcity", desc: "Every asset is authenticated by specialists and recorded on an immutable ledger." },
                  { title: "Strategic Liquidity", desc: "Our secondary marketplace allows you to exit positions before asset maturity." },
                  { title: "Asset Protection", desc: "Assets are held in bankruptcy-remote SPV structures for ultimate investor security." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="mt-1 w-6 h-6 rounded-full bg-gold-600/10 border border-gold-500/20 flex items-center justify-center text-gold-500 shrink-0 group-hover:bg-gold-500 group-hover:text-navy-900 transition-all">
                      <ShieldCheck size={14} />
                    </div>
                    <div>
                      <h4 className="text-white font-serif text-lg mb-1">{item.title}</h4>
                      <p className="text-slate-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-10 bg-gold-500/5 rounded-full blur-3xl"></div>
              <div className="relative h-full flex items-center justify-center">
                 {/* Abstract visual instead of specific images to align with 'category' focus */}
                 <div className="grid grid-cols-2 gap-4 w-full opacity-80">
                    <div className="h-40 bg-gradient-to-br from-navy-800 to-navy-900 rounded-lg border border-white/5 transform translate-y-8"></div>
                    <div className="h-40 bg-gradient-to-bl from-gold-900/20 to-navy-900 rounded-lg border border-gold-500/20"></div>
                    <div className="h-40 bg-gradient-to-tr from-navy-800 to-navy-900 rounded-lg border border-white/5 transform -translate-y-8"></div>
                    <div className="h-40 bg-gradient-to-tl from-navy-800 to-navy-900 rounded-lg border border-white/5"></div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Asset Categories (Replaced Featured Investments) */}
      <div className="py-32 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
             <h2 className="text-gold-500 font-mono text-xs tracking-[0.3em] uppercase mb-4">Investment Horizons</h2>
             <h3 className="font-serif text-4xl md:text-5xl text-white mb-6">Strategic Asset Classes</h3>
             <p className="text-slate-400 max-w-2xl mx-auto text-lg font-light">
                Curated opportunities across six distinct sectors, each selected for long-term capital preservation and asymmetric growth potential.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ASSET_CLASSES.map((category) => (
              <Link 
                to="/plans" 
                key={category.id}
                className={`group relative p-8 rounded-lg border ${category.border} bg-gradient-to-br ${category.gradient} hover:shadow-2xl hover:shadow-black/50 transition-all duration-500 flex flex-col`}
              >
                <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none"></div>
                
                <div className="mb-6 transform group-hover:-translate-y-1 transition-transform duration-500">
                  <div className="w-14 h-14 rounded-full bg-black/20 border border-white/10 flex items-center justify-center backdrop-blur-sm mb-4 group-hover:scale-110 transition-transform">
                    {category.icon}
                  </div>
                  <h4 className="text-2xl font-serif text-white mb-2">{category.name}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">
                    {category.description}
                  </p>
                </div>

                <div className="mt-auto pt-6 border-t border-white/5 flex items-center text-xs font-bold tracking-widest uppercase text-white/50 group-hover:text-white transition-colors">
                  View Strategies <ArrowRight size={14} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-16 text-center">
             <Link to="/investments" className="inline-flex items-center gap-2 text-gold-500 hover:text-white font-serif italic text-lg transition-colors group">
                Browse individual assets in the Marketplace <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
