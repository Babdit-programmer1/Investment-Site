
import React from 'react';
import { ArrowRight, ShieldCheck, Award, LayoutDashboard, UserPlus } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Link } = ReactRouterDOM;

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
      <div className="py-32 relative bg-navy-950">
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
              <div className="relative grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-12">
                  <img src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800" className="rounded-sm grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl" alt="Art" />
                  <img src="https://images.unsplash.com/photo-1600607687940-472002695530?q=80&w=800" className="rounded-sm grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl" alt="Real Estate" />
                </div>
                <div className="space-y-4">
                  <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800" className="rounded-sm grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl" alt="Luxury" />
                  <img src="https://images.unsplash.com/photo-1517398823963-c2dc6fc3e837?q=80&w=800" className="rounded-sm grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl" alt="Cars" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Featured Investments */}
      <div className="py-32 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
             <div>
                <h2 className="text-gold-500 font-mono text-xs tracking-[0.3em] uppercase mb-4">Curated Collection</h2>
                <h3 className="font-serif text-4xl md:text-5xl text-white">Current Opportunities</h3>
             </div>
             <Link to="/investments" className="text-slate-400 hover:text-gold-500 transition-colors flex items-center gap-2 group text-sm tracking-widest font-bold">
                VIEW FULL MARKETPLACE <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
             </Link>
          </div>

          <div className="text-center py-20 bg-navy-950 rounded-sm border border-white/5">
            <p className="text-slate-400 font-serif text-xl italic">Assets coming soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
