
import React, { useEffect, useState } from 'react';
import { InvestmentPlan } from '../types';
import { Shield, TrendingUp, Zap, Check, Loader2, Star, Globe, Cpu, Hammer, Box, Coins, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as ReactRouterDOM from 'react-router-dom';
import { dataService } from '../services/dataService';

const { useNavigate } = ReactRouterDOM;

const Plans: React.FC = () => {
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    dataService.getPlans()
      .then(setPlans)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (planId: string) => {
    try {
      await dataService.subscribeToPlan(planId);
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
      alert('Failed to subscribe to plan.');
    }
  };

  const getIcon = (category: string = '') => {
      if (category === 'REAL_ESTATE') return <Globe className="w-8 h-8 text-emerald-400" />;
      if (category === 'RARE_ASSETS') return <Star className="w-8 h-8 text-purple-400" />;
      if (category === 'PRIVATE_EQUITY') return <Briefcase className="w-8 h-8 text-gold-500" />;
      if (category === 'INFRASTRUCTURE') return <Hammer className="w-8 h-8 text-blue-400" />;
      if (category === 'SPACE_TECH') return <Cpu className="w-8 h-8 text-cyan-400" />;
      if (category === 'COMMODITIES') return <Coins className="w-8 h-8 text-yellow-400" />;
      return <Shield className="w-8 h-8 text-slate-400" />;
  };

  const getGradient = (category: string = '') => {
      switch(category) {
          case 'REAL_ESTATE': return 'from-emerald-900/80 to-navy-900';
          case 'RARE_ASSETS': return 'from-purple-900/80 to-navy-900';
          case 'PRIVATE_EQUITY': return 'from-gold-900/80 to-navy-900';
          case 'INFRASTRUCTURE': return 'from-blue-900/80 to-navy-900';
          case 'SPACE_TECH': return 'from-cyan-900/80 to-navy-900';
          case 'COMMODITIES': return 'from-yellow-900/80 to-navy-900';
          default: return 'from-slate-800 to-navy-900';
      }
  };

  if (loading) return <div className="min-h-screen bg-navy-900 pt-20 flex justify-center items-center"><Loader2 className="w-8 h-8 text-gold-500 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-navy-900 pt-20">
      <div className="bg-navy-950 py-16 border-b border-white/5 text-center">
        <h1 className="text-4xl font-serif text-white mb-4">Investment Strategies</h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Standardized wealth management structures aligned with your liquidity needs.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {plans.length === 0 ? (
            <div className="bg-navy-800 p-20 text-center text-slate-500 italic rounded border border-white/5">
                No standardized strategies are currently available. Contact your wealth manager.
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan) => (
                    <div 
                        key={plan.id} 
                        className={`group relative rounded-lg border overflow-hidden transition-all duration-500 ${
                            user?.planId === plan.id 
                            ? 'border-gold-500 shadow-2xl shadow-gold-900/20' 
                            : 'border-white/10 hover:border-white/30 hover:shadow-xl'
                        }`}
                    >
                        {/* Header Gradient */}
                        <div className={`h-32 bg-gradient-to-b ${getGradient(plan.category)} p-6 flex items-start justify-between relative overflow-hidden`}>
                            <div className="relative z-10">
                                <div className="bg-black/20 p-3 rounded-full inline-block backdrop-blur-sm mb-2">
                                    {getIcon(plan.category)}
                                </div>
                                <div className="text-xs font-bold uppercase tracking-widest text-white/70">{plan.category?.replace('_', ' ')}</div>
                            </div>
                            
                            {user?.planId === plan.id && (
                                <div className="bg-gold-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg z-10">
                                    Active
                                </div>
                            )}
                            
                            {/* Abstract background shape */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
                        </div>

                        <div className="bg-navy-800 p-8 pt-6 relative">
                            <h3 className="text-2xl font-serif text-white mb-2">{plan.name}</h3>
                            <div className="flex items-baseline gap-2 mb-6">
                                <span className="text-3xl text-gold-500 font-bold">{plan.targetRoi}</span>
                                <span className="text-slate-500 text-sm uppercase tracking-wide">Target APY</span>
                            </div>

                            <p className="text-slate-400 text-sm mb-8 leading-relaxed h-12 line-clamp-2">
                                {plan.description}
                            </p>

                            <div className="space-y-3 mb-8">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Risk Profile</span>
                                    <span className={`font-medium ${plan.riskLevel === 'High' ? 'text-rose-400' : 'text-emerald-400'}`}>{plan.riskLevel}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Lock-up Period</span>
                                    <span className="text-white font-medium">{plan.lockupPeriod}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Min. Commitment</span>
                                    <span className="text-white font-medium">${plan.minInvestment.toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleSubscribe(plan.id)}
                                disabled={user?.planId === plan.id}
                                className={`w-full py-3 rounded text-sm font-medium tracking-wide uppercase transition-all ${
                                    user?.planId === plan.id 
                                    ? 'bg-navy-900 text-slate-500 cursor-default border border-white/5' 
                                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/20 hover:border-gold-500/50'
                                }`}
                            >
                                {user?.planId === plan.id ? (
                                    <span className="flex items-center justify-center gap-2"><Check className="w-4 h-4" /> Selected</span>
                                ) : (
                                    "Select Strategy"
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default Plans;
