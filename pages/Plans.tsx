import React, { useEffect, useState } from 'react';
import { InvestmentPlan } from '../types';
import { Shield, TrendingUp, Zap, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../src/config';

// MOCK DATA
const MOCK_PLANS = [
  {
    id: 'p1',
    name: 'Preservation Core',
    riskLevel: 'Low',
    targetRoi: '6-8%',
    minInvestment: 10000,
    lockupPeriod: '12 Months',
    allocation: { "Gold": 40, "Real Estate": 40, "Cash": 20 },
    description: 'Focused on wealth preservation and inflation hedging using tangible assets with low volatility.'
  },
  {
    id: 'p2',
    name: 'Balanced Yield',
    riskLevel: 'Medium',
    targetRoi: '10-14%',
    minInvestment: 25000,
    lockupPeriod: '36 Months',
    allocation: { "Real Estate": 50, "Art": 30, "Private Credit": 20 },
    description: 'A hybrid strategy targeting consistent cash flow from real estate combined with moderate appreciation.'
  },
  {
    id: 'p3',
    name: 'Alpha Growth',
    riskLevel: 'High',
    targetRoi: '18-25%',
    minInvestment: 50000,
    lockupPeriod: '5-7 Years',
    allocation: { "Art": 40, "Collectibles": 30, "Venture Equity": 30 },
    description: 'Aggressive capital appreciation targeting asymmetric upside in emerging artists and rare artifacts.'
  }
];

const Plans: React.FC = () => {
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('prestige_token');
      const res = await fetch(`${API_BASE_URL}/reporting/plans`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("API Error");
      const data = await res.json();
      setPlans(data);
    } catch (e) {
      setPlans(MOCK_PLANS);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
        const token = localStorage.getItem('prestige_token');
        const res = await fetch(`${API_BASE_URL}/reporting/plans/subscribe`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ planId })
        });
        // Success even if network fails for preview
        navigate('/dashboard');
    } catch (e) { 
        // Mock success
        navigate('/dashboard');
    }
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
                        
                        <div className="pt-2">
                            <span className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Allocation</span>
                            <div className="flex h-2 rounded-full overflow-hidden">
                                {Object.entries(plan.allocation).map(([key, val], i) => (
                                    <div 
                                        key={key} 
                                        style={{ width: `${val}%` }} 
                                        className={`${i === 0 ? 'bg-gold-500' : i === 1 ? 'bg-navy-600' : 'bg-slate-600'}`}
                                        title={`${key}: ${val}%`}
                                    ></div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-slate-400">
                                {Object.entries(plan.allocation).map(([key, val]) => (
                                    <span key={key}>{key} {val}%</span>
                                ))}
                            </div>
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
      </div>
    </div>
  );
};

export default Plans;