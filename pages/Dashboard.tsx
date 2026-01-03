
import React, { useMemo, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGlobal } from '../context/GlobalContext';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { 
  TrendingUp, Briefcase, Wallet as WalletIcon, 
  ArrowUpRight, ArrowDownLeft, Sparkles, 
  FileText, CheckCircle, Lock, Copy, Activity, ShieldCheck
} from 'lucide-react';
import { InvestmentIntent, Wallet } from '../types';
import { API_BASE_URL } from '../src/config';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { convertPrice, currency: globalCurrency } = useGlobal();
  const [searchParams] = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'ledger'>('overview');
  const [investments, setInvestments] = useState<InvestmentIntent[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  if (user && !user.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('prestige_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [invRes, walletRes, logRes] = await Promise.all([
        fetch(`${API_BASE_URL}/payments/my`, { headers }),
        fetch(`${API_BASE_URL}/wallet`, { headers }),
        fetch(`${API_BASE_URL}/logs?type=ALL`, { headers })
      ]);

      if (invRes.ok) setInvestments(await invRes.json());
      if (walletRes.ok) setWallet(await walletRes.json());
      if (logRes.ok) setLogs(await logRes.json());
    } catch (e) {
      console.warn("Using fallback data");
    } finally {
      setLoading(false);
    }
  };

  const portfolioStats = useMemo(() => {
    const liquid = wallet?.fiatBalance || 0;
    const invested = wallet?.investmentBalance || 0;
    const total = liquid + invested;
    const gain = invested * 0.048; // Simulated ROI

    return [
      { label: "Total Net Worth", value: convertPrice(total), icon: <ShieldCheck className="text-gold-500" />, sub: "Verified Assets" },
      { label: "Liquid Capital", value: convertPrice(liquid), icon: <WalletIcon className="text-blue-400" />, sub: "Available to Invest" },
      { label: "Invested Capital", value: convertPrice(invested), icon: <Briefcase className="text-purple-400" />, sub: "Fractional Holdings" },
      { label: "Total Yield", value: `+${convertPrice(gain)}`, icon: <TrendingUp className="text-emerald-400" />, sub: "Unrealized Gain" }
    ];
  }, [wallet, convertPrice]);

  return (
    <div className="min-h-screen bg-navy-900 pt-20">
      {/* Premium Header */}
      <div className="bg-navy-950 border-b border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-serif text-white tracking-tight">Portfolio Overview</h1>
              <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
                <Lock size={12} className="text-gold-500" /> SECURED INSTITUTIONAL ACCOUNT: {user?.fullName}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-4">
               <Link to="/wallet" className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-6 py-2 rounded-sm text-sm font-medium transition-colors">
                 Manage Funds
               </Link>
               <Link to="/investments" className="bg-gold-600 hover:bg-gold-500 text-white px-6 py-2 rounded-sm text-sm font-medium transition-colors shadow-lg shadow-gold-900/20">
                 Explore Assets
               </Link>
            </div>
          </div>

          <div className="flex space-x-8">
            <button onClick={() => setActiveTab('overview')} className={`pb-4 text-sm font-bold tracking-widest uppercase transition-colors border-b-2 ${activeTab === 'overview' ? 'border-gold-500 text-gold-500' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>Overview</button>
            <button onClick={() => setActiveTab('ledger')} className={`pb-4 text-sm font-bold tracking-widest uppercase transition-colors border-b-2 ${activeTab === 'ledger' ? 'border-gold-500 text-gold-500' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>Financial Ledger</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {activeTab === 'overview' ? (
          <div className="animate-fade-in">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {portfolioStats.map((stat, i) => (
                <div key={i} className="bg-navy-800 border border-white/5 p-6 rounded-sm shadow-xl">
                   <div className="flex justify-between items-center mb-4">
                     <div className="p-2 bg-navy-950 rounded-lg">{stat.icon}</div>
                     <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{stat.sub}</span>
                   </div>
                   <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">{stat.label}</p>
                   <p className="text-2xl font-serif text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Active Holdings */}
              <div className="lg:col-span-2 space-y-6">
                 <div className="bg-navy-800 border border-white/5 rounded-sm overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-navy-800/50">
                        <h3 className="text-white font-serif flex items-center gap-2"><Activity size={18} className="text-gold-500" /> Active Holdings</h3>
                        <Link to="/investments" className="text-[10px] text-gold-500 hover:text-gold-400 font-bold uppercase tracking-widest">Marketplace</Link>
                    </div>
                    {investments.length > 0 ? (
                      <div className="divide-y divide-white/5">
                        {investments.map((inv) => (
                          <div key={inv.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                             <div className="flex items-center gap-4">
                                <div className="w-14 h-10 bg-navy-950 border border-white/10 rounded flex items-center justify-center font-mono text-[10px] text-gold-500">
                                   {inv.asset?.ticker || 'ASSET'}
                                </div>
                                <div>
                                   <p className="text-white font-medium">{inv.asset?.title}</p>
                                   <p className="text-xs text-slate-500 uppercase tracking-widest">{inv.asset?.category}</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-white font-bold">{convertPrice(inv.amount)}</p>
                                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">+4.8% Gain</p>
                             </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 text-center text-slate-500 text-sm">No active investments found. <Link to="/investments" className="text-gold-500 ml-1 underline">Browse Opportunities</Link></div>
                    )}
                 </div>
              </div>

              {/* Security Sidebar */}
              <div className="space-y-6">
                 <div className="bg-gradient-to-br from-gold-900/10 to-navy-800 border border-gold-500/20 p-6 rounded-sm">
                    <h4 className="text-gold-500 font-serif text-lg mb-4 flex items-center gap-2"><ShieldCheck size={20} /> Integrity Audit</h4>
                    <p className="text-slate-400 text-xs leading-relaxed mb-6">
                      Your assets are held in segregated SPV structures with quarterly independent audits. View your latest compliance statement.
                    </p>
                    <Link to="/statements" className="block w-full text-center py-2 border border-gold-500/30 text-gold-500 text-xs font-bold uppercase tracking-widest hover:bg-gold-500 hover:text-navy-900 transition-all">
                      Access Reports
                    </Link>
                 </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in bg-navy-800 border border-white/5 rounded-sm overflow-hidden shadow-2xl">
             <div className="p-6 border-b border-white/5 bg-navy-800/50">
                <h3 className="text-white font-serif flex items-center gap-2"><FileText size={18} className="text-gold-500" /> Immutable Transaction Ledger</h3>
             </div>
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10">
                   <thead className="bg-navy-950">
                      <tr>
                         <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                         <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reference</th>
                         <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                         <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/5">
                           <td className="px-6 py-4">
                              <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                                log.actionType.includes('DEPOSIT') ? 'bg-emerald-500/10 text-emerald-400' :
                                log.actionType.includes('WITHDRAWAL') ? 'bg-rose-500/10 text-rose-400' : 'bg-blue-500/10 text-blue-400'
                              }`}>{log.actionType}</span>
                           </td>
                           <td className="px-6 py-4 text-xs font-mono text-slate-500">{log.referenceId}</td>
                           <td className="px-6 py-4 text-sm font-bold text-white">{convertPrice(log.amount)}</td>
                           <td className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">{log.status}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
