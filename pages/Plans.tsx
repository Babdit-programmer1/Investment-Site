
import React, { useEffect, useState } from 'react';
import { InvestmentPlan } from '../types';
import { Shield, TrendingUp, Zap, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MOCK_PLANS } from '../src/mockData';

const Plans: React.FC = () => {
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate Fetch
    setTimeout(() => {
        setPlans(MOCK_PLANS);
        setLoading(false);
    }, 600);
  }, []);

  const handleSubscribe = async (planId: string) => {
    // Simulate API call
    navigate('/dashboard');
  };

  const getIcon = (name: string) => {
      if (name.includes('Preservation')) return <Shield className="w-12 h-12 text-emerald-400" />;
      if (name.includes('Balanced')) return <TrendingUp className="w-12 h-12 text-gold-500" />;
      return <Zap className="w-12 h-12 text-rose-400" />;
  };

  if (loading) return <div className="min-h-screen bg-navy-900 pt-20 flex justify-center items-center"><Loader2 className="w-8 h-8 text-gold-500 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-navy-900 pt-20">
      <div className="bg-navy-950 py-16 border-b border-white/5 text-center">
        <h1 className="text-4xl font-serif text-white mb-4">Investment Strategies</h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Choose a wealth management structure aligned with your liquidity needs and risk tolerance.
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
                        className={`relative bg-navy-800 rounded-lg p-8 border transition-all duration-300 ${
                            user?.planId === plan.id 
                            ? 'border-gold-500 shadow-2xl shadow-gold-900/20' 
                            : 'border-white/10 hover:border-white/30'
                        }`}
                    >
                        {user?.planId === plan.id && (
                            <div className="absolute top-0 right-0 bg-gold-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg uppercase tracking-wider">
                                Active Plan
                            </div>
                        )}

                        <div className="mb-6 flex justify-center">
                            <div className="p-4 bg-navy-900 rounded-full border border-white/10">
                                {getIcon(plan.name)}
                            </div>
                        </div>

                        <h3 className="text-2xl font-serif text-white text-center mb-2">{plan.name}</h3>
                        <div className="flex justify-center items-baseline gap-1 mb-6">
                            <span className="text-lg text-gold-500 font-bold">{plan.targetRoi}</span>
                            <span className="text-slate-500 text-sm">Target ROI</span>
                        </div>

                        <p className="text-slate-400 text-sm text-center mb-8 leading-relaxed h-16">
                            {plan.description}
                        </p>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-sm py-2 border-b border-white/5">
                                <span className="text-slate-400">Risk Profile</span>
                                <span className="text-white font-medium">{plan.riskLevel}</span>
                            </div>
                            <div className="flex justify-between text-sm py-2 border-b border-white/5">
                                <span className="text-slate-400">Lock-up Period</span>
                                <span className="text-white font-medium">{plan.lockupPeriod}</span>
                            </div>
                            <div className="flex justify-between text-sm py-2 border-b border-white/5">
                                <span className="text-slate-400">Min. Commitment</span>
                                <span className="text-white font-medium">${plan.minInvestment.toLocaleString()}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => handleSubscribe(plan.id)}
                            disabled={user?.planId === plan.id}
                            className={`w-full py-3 rounded text-sm font-medium tracking-wide uppercase transition-colors ${
                                user?.planId === plan.id 
                                ? 'bg-emerald-900/50 text-emerald-500 cursor-default border border-emerald-500/20' 
                                : 'bg-white/5 hover:bg-white/10 text-white border border-white/20'
                            }`}
                        >
                            {user?.planId === plan.id ? (
                                <span className="flex items-center justify-center gap-2"><Check className="w-4 h-4" /> Active Strategy</span>
                            ) : (
                                "Select Strategy"
                            )}
                        </button>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default Plans;
