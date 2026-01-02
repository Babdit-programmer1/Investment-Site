
import React, { useMemo, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGlobal } from '../context/GlobalContext';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { 
  TrendingUp, Activity, Briefcase, ShieldCheck, AlertCircle, Wallet as WalletIcon, 
  ChevronRight, ArrowUpRight, ArrowDownLeft, Sparkles, RefreshCw, 
  Bitcoin, CreditCard, DollarSign, FileText, CheckCircle, Clock, Lock, Copy 
} from 'lucide-react';
import { InvestmentIntent, InvestmentPlan, Wallet } from '../types';
import { API_BASE_URL } from '../src/config';
import TradeModal from '../components/TradeModal';

// Mock Data
const MOCK_PERFORMANCE = [
  { name: 'Jan', value: 50000 },
  { name: 'Feb', value: 52000 },
  { name: 'Mar', value: 51500 },
  { name: 'Apr', value: 54000 },
  { name: 'May', value: 56000 },
  { name: 'Jun', value: 58500 }
];

const MOCK_WALLET: any = {
  id: 'w1',
  fiatBalance: 15000,
  investmentBalance: 50000,
  cryptoBalances: [],
  transactions: []
};

const MOCK_ACTIVE_INVESTMENTS: InvestmentIntent[] = [
  {
    id: 'inv-1',
    userId: 'user-1',
    assetId: '1',
    amount: 50000,
    currency: 'USD',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    asset: {
       id: '1',
       ticker: 'RE-LDN-001',
       title: 'The Kensington Estate',
       category: 'Real Estate',
       fundStrategy: 'Value-Add',
       description: 'Luxury residential',
       imageUrl: 'https://images.unsplash.com/photo-1600596542815-e328701102b9?q=80&w=200',
       price: '',
       minInvestment: 50000,
       returnRate: '14.5%',
       targetIrp: 14.5,
       term: '36m',
       riskLevel: 'Low',
       status: 'ACTIVE',
       scenarios: { conservative: 8, moderate: 14.5, aggressive: 22 }
    }
  }
];

type LogType = 'ALL' | 'DEPOSIT' | 'INVESTMENT' | 'PROFIT' | 'WITHDRAWAL';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { convertPrice, currency: globalCurrency } = useGlobal();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Dashboard State
  const [activeTab, setActiveTab] = useState<'overview' | 'wallet'>('overview');
  const [investments, setInvestments] = useState<InvestmentIntent[]>([]);
  const [performance, setPerformance] = useState<any[]>([]);
  const [myPlan, setMyPlan] = useState<InvestmentPlan | null>(null);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  
  // Wallet & Ledger State
  const [wallet, setWallet] = useState<any | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [logFilter, setLogFilter] = useState<LogType>('ALL');
  const [walletAction, setWalletAction] = useState<'DEPOSIT' | 'WITHDRAWAL' | null>(null);
  const [transAmount, setTransAmount] = useState<number>(0);
  const [transAsset, setTransAsset] = useState('USD');
  const [transHash, setTransHash] = useState('');
  const [transAddress, setTransAddress] = useState(''); // For withdrawal
  const [withdrawalMsg, setWithdrawalMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);

  // Redirect to onboarding if not complete
  if (user && !user.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'wallet') setActiveTab('wallet');
    
    const reference = searchParams.get('reference');
    if (reference) verifyPayment(reference);
    
    fetchDashboardData();
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === 'wallet') {
        fetchLogs();
    }
  }, [activeTab, logFilter]);

  const verifyPayment = async (ref: string) => {
    try {
      const token = localStorage.getItem('prestige_token');
      await fetch(`${API_BASE_URL}/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ reference: ref })
      });
      // Clean URL
      setSearchParams(params => {
          params.delete('reference');
          return params;
      });
    } catch (e) { console.warn("Payment verification simulated"); }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('prestige_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [invRes, perfRes, planRes, walletRes, recRes] = await Promise.all([
        fetch(`${API_BASE_URL}/payments/my`, { headers }),
        fetch(`${API_BASE_URL}/reporting/performance`, { headers }),
        fetch(`${API_BASE_URL}/reporting/plans`, { headers }),
        fetch(`${API_BASE_URL}/wallet`, { headers }),
        fetch(`${API_BASE_URL}/analytics/recommendation`, { headers })
      ]);

      if (invRes.ok) setInvestments(await invRes.json());
      if (perfRes.ok) setPerformance(await perfRes.json());
      if (walletRes.ok) setWallet(await walletRes.json());
      if (recRes.ok) setRecommendation(await recRes.json());

      if (user?.planId && planRes.ok) {
        const plansData = await planRes.json();
        const plan = plansData.find((p: any) => p.id === user.planId);
        setMyPlan(plan);
      }
    } catch (e) {
      console.warn("Using mock dashboard data");
      setInvestments(MOCK_ACTIVE_INVESTMENTS);
      setPerformance(MOCK_PERFORMANCE);
      setWallet(MOCK_WALLET);
      setRecommendation({
          matchScore: 92,
          reason: "Diversify your portfolio with high-yield assets matching your interest in Real Estate.",
          recommendation: { title: "New Asset Suggestion", ticker: "AI-RECO" }
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const token = localStorage.getItem('prestige_token');
      const res = await fetch(`${API_BASE_URL}/logs?type=${logFilter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      } else if (wallet?.transactions) {
         // Fallback
         const mapped = wallet.transactions.map((t: any) => ({
             id: t.id,
             actionType: t.type,
             amount: t.amount,
             currency: t.currency,
             status: t.status,
             referenceId: t.reference,
             createdAt: t.createdAt
         }));
         setLogs(mapped);
      }
    } catch (e) {
       console.warn("Using transaction fallback");
    } finally {
      setLogsLoading(false);
    }
  };

  const handleWalletAction = async () => {
    if (!walletAction || transAmount <= 0) return;
    setLoading(true);
    const token = localStorage.getItem('prestige_token');

    try {
        const endpoint = walletAction === 'DEPOSIT' ? 'deposit' : 'withdraw';
        const payload: any = { 
            amount: transAmount, 
            currency: transAsset,
            type: 'CRYPTO'
        };
        
        if (walletAction === 'DEPOSIT') {
            payload.txHash = transHash;
        } else {
            payload.address = transAddress;
        }

        const res = await fetch(`${API_BASE_URL}/wallet/${endpoint}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(payload)
        });
        
        const data = await res.json();

        if (res.ok) {
            setWithdrawalMsg(data.message);
            // Refresh data in background
            fetchDashboardData();
            if (activeTab === 'wallet') fetchLogs();
        } else {
            setWithdrawalMsg(data.message || 'Transaction failed');
        }
    } catch (e) {
        console.warn('Simulating transaction');
        setWithdrawalMsg('Request submitted (Simulation)');
    } finally {
        setLoading(false);
        // Clear inputs
        setTransAmount(0);
        setTransHash('');
        setTransAddress('');
    }
  };

  const stats = useMemo(() => {
    const totalInvested = investments
      .filter(i => i.status === 'ACTIVE' || i.status === 'ESCROWED')
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    const currentValue = Math.floor(totalInvested * 1.048); // 4.8% simulated gain
    const gain = currentValue - totalInvested;

    return [
      { label: "Portfolio Valuation", value: `$${currentValue.toLocaleString()}`, icon: <Briefcase className="w-5 h-5 text-gold-500" />, change: "+4.8%", changeType: "pos" },
      { label: "Liquid Balance", value: convertPrice(wallet?.fiatBalance || 0), icon: <WalletIcon className="w-5 h-5 text-blue-400" />, change: "Available", changeType: "neutral" },
      { label: "Unrealized Gain", value: `$${gain.toLocaleString()}`, icon: <TrendingUp className="w-5 h-5 text-emerald-400" />, change: "YTD", changeType: "pos" },
      { label: "Target IRR", value: "14.2%", icon: <Activity className="w-5 h-5 text-purple-400" />, change: "Target: 15%", changeType: "pos" }
    ];
  }, [investments, wallet, convertPrice]);

  const allocation = useMemo(() => {
    const cats: Record<string, number> = {};
    investments.forEach(i => {
       const cat = i.asset?.category || 'Uncategorized';
       cats[cat] = (cats[cat] || 0) + i.amount;
    });
    const total = Object.values(cats).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(cats).map(([name, value]) => ({ name, value, pct: (value / total) * 100 }));
  }, [investments]);

  // --- SUB-COMPONENTS ---

  const SimpleChart = ({ data }: { data: any[] }) => {
    if (!data || !data.length) return null;
    const max = Math.max(...data.map(d => d.value));
    const min = Math.min(...data.map(d => d.value));
    
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((d.value - min) / (max - min)) * 80 - 10;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="h-56 w-full mt-4 relative group">
             <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path d={`M0,100 ${points} L100,100 Z`} fill="url(#gradient)" className="opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
                <polyline points={points} fill="none" stroke="#fbbf24" strokeWidth="2" vectorEffect="non-scaling-stroke" className="drop-shadow-lg" />
                {data.map((d, i) => {
                    const x = (i / (data.length - 1)) * 100;
                    const y = 100 - ((d.value - min) / (max - min)) * 80 - 10;
                    return <circle key={i} cx={x} cy={y} r="2" fill="#fbbf24" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />;
                })}
             </svg>
             <div className="flex justify-between text-xs text-slate-500 mt-2 font-mono uppercase">
                 {data.filter((_, i) => i % 2 === 0).map(d => <span key={d.name}>{d.name}</span>)}
             </div>
        </div>
    );
  };

  const AllocationRing = ({ data }: { data: { name: string, value: number, pct: number }[] }) => {
      let cumulative = 0;
      const colors = ['#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#a78bfa'];
      if (data.length === 0) return <div className="h-40 w-40 rounded-full border-4 border-white/5 flex items-center justify-center mx-auto text-xs text-slate-500">No Data</div>;

      return (
         <div className="relative h-48 w-48 mx-auto">
             <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                 {data.map((d, i) => {
                     const start = cumulative;
                     const end = cumulative + d.pct;
                     cumulative = end;
                     const x1 = 50 + 40 * Math.cos(2 * Math.PI * start / 100);
                     const y1 = 50 + 40 * Math.sin(2 * Math.PI * start / 100);
                     const x2 = 50 + 40 * Math.cos(2 * Math.PI * end / 100);
                     const y2 = 50 + 40 * Math.sin(2 * Math.PI * end / 100);
                     const largeArc = d.pct > 50 ? 1 : 0;
                     return <path key={i} d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`} fill={colors[i % colors.length]} stroke="#1e293b" strokeWidth="2" />;
                 })}
                 <circle cx="50" cy="50" r="30" fill="#1e293b" />
             </svg>
             <div className="absolute inset-0 flex items-center justify-center flex-col">
                 <span className="text-xl font-serif text-white">{data.length}</span>
                 <span className="text-[10px] text-slate-500 uppercase tracking-widest">Assets</span>
             </div>
         </div>
      );
  };

  const copyAddress = () => {
      navigator.clipboard.writeText("0xAdminCryptoWalletAddressGoesHere");
      alert("Address copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-navy-900 pt-20">
      
      {/* Header */}
      <div className="bg-navy-950 border-b border-white/5 pb-0 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-serif text-white">Welcome, {user?.fullName || "Investor"}</h1>
              <div className="flex items-center mt-2 space-x-4 text-sm text-slate-400">
                <span className="flex items-center"><ShieldCheck className="h-4 w-4 mr-1 text-emerald-500" /> Verified Investor</span>
                <span>|</span>
                <span className="uppercase tracking-widest text-xs font-bold text-gold-500">{user?.investorType || "Standard"}</span>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
               <Link to="/investments" className="bg-gold-600 hover:bg-gold-500 text-white px-6 py-2 rounded-sm text-sm font-medium transition-colors">
                 New Investment
               </Link>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-8">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`pb-4 text-sm font-medium tracking-wide transition-colors border-b-2 ${activeTab === 'overview' ? 'border-gold-500 text-gold-500' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('wallet')}
              className={`pb-4 text-sm font-medium tracking-wide transition-colors border-b-2 ${activeTab === 'wallet' ? 'border-gold-500 text-gold-500' : 'border-transparent text-slate-400 hover:text-white'}`}
            >
              My Wallets
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            {/* AI Recommendation Widget */}
            {recommendation && recommendation.recommendation && (
                <div className="mb-8 bg-gradient-to-r from-purple-900/30 to-navy-900 border border-purple-500/20 p-6 rounded-lg flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-purple-900/10">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-full border border-purple-500/30">
                            <Sparkles className="text-purple-400 w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-white font-medium">Aura's Smart Pick</h3>
                                <span className="bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{recommendation.matchScore}% Match</span>
                            </div>
                            <p className="text-slate-400 text-sm mb-2 max-w-xl">{recommendation.reason}</p>
                            <p className="text-white font-serif text-lg">{recommendation.recommendation.title}</p>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <Link to="/analytics" className="flex-1 md:flex-none text-center px-4 py-2 border border-white/10 text-slate-300 rounded hover:text-white hover:bg-white/5 transition-colors text-sm">
                            Analyze
                        </Link>
                        <Link to="/investments" className="flex-1 md:flex-none text-center px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded shadow-lg shadow-purple-900/20 text-sm font-medium transition-colors">
                            View Details
                        </Link>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, i) => (
                <div key={i} className="bg-navy-800/80 backdrop-blur p-6 rounded-lg border border-white/5 hover:border-white/10 transition-colors shadow-lg">
                   <div className="flex justify-between items-start mb-4">
                     <div className="p-2 bg-navy-900 rounded-lg border border-white/5">
                       {stat.icon}
                     </div>
                     <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${
                       stat.changeType === 'pos' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-700/30 text-slate-400'
                     }`}>
                       {stat.changeType === 'pos' ? <ArrowUpRight size={10} /> : null}
                       {stat.change}
                     </span>
                   </div>
                   <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">{stat.label}</p>
                   <p className="text-2xl font-serif text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Chart Area */}
              <div className="lg:col-span-2 space-y-8">
                 <div className="bg-navy-800 rounded-lg border border-white/5 p-8">
                     <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-serif text-white">Portfolio Performance</h3>
                            <p className="text-slate-400 text-sm">Net Asset Value (NAV) Growth</p>
                        </div>
                        <select className="bg-navy-900 border border-white/10 text-xs text-white p-2 rounded focus:outline-none focus:border-gold-500">
                            <option>Year to Date</option>
                            <option>1 Year</option>
                            <option>All Time</option>
                        </select>
                     </div>
                     <SimpleChart data={performance} />
                 </div>

                 {/* Holdings */}
                 <div className="bg-navy-800 rounded-lg border border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center">
                        <h3 className="text-lg font-serif text-white">My Holdings</h3>
                        <Link to="/investments" className="text-xs text-gold-500 hover:text-white uppercase tracking-wider font-bold">Marketplace</Link>
                    </div>
                    {investments.length > 0 ? (
                      <div className="divide-y divide-white/5">
                        {investments.map((inv) => (
                          <div key={inv.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-navy-900/50 transition-colors gap-4">
                             <div className="flex items-center gap-4">
                                {inv.asset?.imageUrl ? (
                                    <div className="w-16 h-12 rounded overflow-hidden border border-white/10 flex-shrink-0">
                                        <img 
                                            src={inv.asset.imageUrl} 
                                            alt={inv.asset.title} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-16 h-12 rounded bg-navy-900 flex items-center justify-center border border-white/10 text-slate-300 font-serif font-bold text-xs group-hover:text-gold-500 transition-colors flex-shrink-0">
                                        {inv.asset?.ticker?.substring(0,2) || 'AS'}
                                    </div>
                                )}
                                <div>
                                    <h4 className="text-white text-sm font-medium">{inv.asset?.title || 'Unknown Asset'}</h4>
                                    <div className="flex gap-2 text-xs">
                                        <span className="text-slate-500">{new Date(inv.createdAt).toLocaleDateString()}</span>
                                        <span className={`px-1.5 rounded-sm font-bold uppercase ${inv.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{inv.status}</span>
                                    </div>
                                </div>
                             </div>
                             <div className="flex items-center gap-6 justify-between md:justify-end w-full md:w-auto">
                                 <div className="text-right">
                                     <p className="text-white text-sm font-bold">${inv.amount.toLocaleString()}</p>
                                     <p className="text-xs text-emerald-400">+4.8% Gain</p>
                                 </div>
                                 {inv.status === 'ACTIVE' && (
                                     <button onClick={() => setSelectedAsset(inv)} className="bg-navy-700 hover:bg-navy-600 text-white px-3 py-1.5 rounded text-xs font-medium border border-white/10 flex items-center gap-1">
                                         <RefreshCw size={12} /> Trade
                                     </button>
                                 )}
                             </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-500 text-sm">
                          No assets found. 
                          <Link to="/investments" className="text-gold-500 hover:text-white ml-1">Start Investing</Link>
                      </div>
                    )}
                 </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-navy-800 rounded-lg border border-white/5 p-8">
                   <h3 className="text-lg font-serif text-white mb-6">Allocation</h3>
                   <AllocationRing data={allocation} />
                   <div className="mt-6 space-y-3">
                      {allocation.map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2">
                                 <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: ['#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#a78bfa'][i % 5] }}></div>
                                 <span className="text-slate-300">{item.name}</span>
                              </div>
                              <span className="text-white font-mono">{item.pct.toFixed(1)}%</span>
                          </div>
                      ))}
                   </div>
                </div>

                {/* Profile Card */}
                <div className="bg-navy-800 rounded-lg border border-white/5 p-6 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-500 to-amber-600"></div>
                   <div className="flex items-center gap-4 mb-6">
                     <div className="h-12 w-12 rounded-full bg-navy-900 flex items-center justify-center text-gold-500 font-serif text-xl border border-gold-500/20">
                        {user?.fullName?.charAt(0)}
                     </div>
                     <div>
                        <h3 className="text-white font-serif text-lg">{user?.fullName || 'Investor'}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <CheckCircle size={10} className="text-emerald-500" /> {user?.investorType}
                        </p>
                     </div>
                   </div>
                   <Link to="/kyc" className="block w-full text-center bg-gold-600 hover:bg-gold-500 text-white py-2 rounded text-sm transition-colors">
                      {user?.kycStatus === 'APPROVED' ? 'Verification Complete' : 'Complete Verification'}
                   </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WALLET TAB */}
        {activeTab === 'wallet' && (
          <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Balances & Actions */}
            <div className="lg:col-span-2 space-y-8">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Crypto Wallet (Main) */}
                    <div className="bg-gradient-to-br from-navy-800 to-navy-900 border border-white/10 rounded-lg p-6 relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <WalletIcon size={80} className="text-blue-500" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="p-1.5 bg-blue-500/20 rounded text-blue-400"><WalletIcon size={14} /></span>
                                <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">Crypto Wallet</p>
                            </div>
                            <h2 className="text-3xl text-white font-serif mb-1">{convertPrice(wallet?.fiatBalance || 0)} <span className="text-sm text-slate-500">{globalCurrency}</span></h2>
                            <p className="text-xs text-slate-500 mb-6">Liquid funds for withdrawal</p>
                            
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setWalletAction('DEPOSIT')} 
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded text-xs font-bold uppercase transition-colors"
                                >
                                    Deposit
                                </button>
                                <button 
                                    onClick={() => setWalletAction('WITHDRAWAL')} 
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/20 py-2 rounded text-xs font-bold uppercase transition-colors"
                                >
                                    Withdraw
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Investment Wallet */}
                    <div className="bg-gradient-to-br from-navy-800 to-navy-900 border border-white/10 rounded-lg p-6 relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Briefcase size={80} className="text-gold-500" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="p-1.5 bg-gold-500/20 rounded text-gold-500"><Briefcase size={14} /></span>
                                <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">Investment Wallet</p>
                            </div>
                            <h2 className="text-3xl text-white font-serif mb-1">{convertPrice(wallet?.investmentBalance || 0)} <span className="text-sm text-slate-500">{globalCurrency}</span></h2>
                            <p className="text-xs text-slate-500 mb-6">Capital allocated to assets</p>
                            
                            <Link to="/investments" className="block text-center w-full bg-gold-600 hover:bg-gold-500 text-white py-2 rounded text-xs font-bold uppercase transition-colors">
                                View Marketplace
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Ledger */}
                <div className="bg-navy-800 border border-white/5 rounded-lg overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                       <h3 className="text-white font-serif text-lg flex items-center"><FileText className="w-5 h-5 text-gold-500 mr-2" /> Transaction Ledger</h3>
                       <div className="flex bg-navy-900 p-1 rounded-lg">
                          {['ALL', 'DEPOSIT', 'INVESTMENT', 'PROFIT', 'WITHDRAWAL'].map((t) => (
                             <button
                                key={t}
                                onClick={() => setLogFilter(t as LogType)}
                                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                                   logFilter === t ? 'bg-navy-700 text-white shadow' : 'text-slate-400 hover:text-white'
                                }`}
                             >
                                {t.charAt(0) + t.slice(1).toLowerCase()}
                             </button>
                          ))}
                       </div>
                    </div>

                    <div className="min-h-[300px]">
                       {logsLoading ? (
                          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-500"></div></div>
                       ) : logs.length === 0 ? (
                          <div className="text-center py-12 text-slate-500 text-sm">No records found for this category.</div>
                       ) : (
                          <div className="divide-y divide-white/5">
                             {logs.map((log) => (
                                <div key={log.id} className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between">
                                   <div className="flex items-center gap-4">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border border-white/10 ${
                                         log.actionType === 'DEPOSIT' || log.actionType === 'PROFIT' ? 'bg-emerald-500/10 text-emerald-400' : 
                                         log.actionType === 'WITHDRAWAL' ? 'bg-rose-500/10 text-rose-400' : 'bg-blue-500/10 text-blue-400'
                                      }`}>
                                         {log.actionType === 'DEPOSIT' ? <ArrowDownLeft size={16} /> :
                                          log.actionType === 'WITHDRAWAL' ? <ArrowUpRight size={16} /> :
                                          log.actionType === 'PROFIT' ? <DollarSign size={16} /> : <CreditCard size={16} />}
                                      </div>
                                      <div>
                                         <p className="text-white text-sm font-medium">{log.actionType}</p>
                                         <p className="text-xs text-slate-500 font-mono">{log.referenceId} • {new Date(log.createdAt).toLocaleDateString()}</p>
                                      </div>
                                   </div>
                                   <div className="text-right">
                                      <p className={`text-sm font-bold ${
                                         log.actionType === 'DEPOSIT' || log.actionType === 'PROFIT' ? 'text-emerald-400' : 'text-white'
                                      }`}>
                                         {log.actionType === 'DEPOSIT' || log.actionType === 'PROFIT' ? '+' : '-'}{convertPrice(log.amount)}
                                      </p>
                                      <div className="flex items-center justify-end gap-1 mt-1">
                                         {log.status === 'COMPLETED' ? <CheckCircle size={10} className="text-emerald-500" /> : 
                                          log.status === 'PENDING_APPROVAL' ? <Lock size={10} className="text-rose-500" /> : <Clock size={10} className="text-amber-500" />}
                                         <span className={`text-[10px] uppercase ${log.status === 'PENDING_APPROVAL' ? 'text-rose-400 font-bold' : 'text-slate-500'}`}>{log.status.replace('_', ' ')}</span>
                                      </div>
                                   </div>
                                </div>
                             ))}
                          </div>
                       )}
                    </div>
                </div>
            </div>

            {/* Right Column: Crypto & Info */}
            <div className="space-y-8">
                <div className="bg-navy-800 border border-white/5 rounded-lg p-6">
                    <h3 className="text-white font-serif text-lg mb-4 flex items-center"><Bitcoin className="w-5 h-5 text-gold-500 mr-2" /> Digital Assets</h3>
                    <div className="space-y-4">
                        {wallet?.cryptoBalances.map((crypto: any) => (
                            <div key={crypto.id} className="flex justify-between items-center p-4 bg-navy-900 rounded border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                                        {crypto.asset.substring(0,1)}
                                    </div>
                                    <div>
                                        <div className="text-white font-medium">{crypto.asset}</div>
                                        <div className="text-xs text-slate-500">Cold Storage</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-white font-mono">{crypto.balance.toFixed(4)} {crypto.asset}</div>
                                </div>
                            </div>
                        ))}
                        {(!wallet?.cryptoBalances || wallet.cryptoBalances.length === 0) && (
                             <p className="text-slate-500 text-sm text-center py-4">No crypto assets currently held.</p>
                        )}
                        <button onClick={() => setWalletAction('DEPOSIT')} className="w-full py-2 text-xs text-gold-500 hover:text-gold-400 border border-dashed border-gold-500/30 rounded">
                            + Deposit Crypto
                        </button>
                    </div>
                </div>
                
                <div className="bg-navy-900 border border-white/5 p-4 rounded text-xs text-slate-400">
                   <h4 className="text-white font-medium mb-2 flex items-center gap-2"><Lock size={12} /> Institutional Security</h4>
                   <p className="leading-relaxed">All financial logs are immutable and stored on a secured, dedicated ledger. Withdrawals exceeding $5,000 require manual admin approval for your protection.</p>
                </div>
            </div>
          </div>
        )}

      </div>

      {/* Trade Modal */}
      {selectedAsset && (
          <TradeModal 
            asset={selectedAsset} 
            currentValue={selectedAsset.amount * 1.048} 
            onClose={() => setSelectedAsset(null)}
            onSuccess={() => {
                fetchDashboardData();
            }}
          />
      )}

      {/* Wallet Action Modal */}
      {walletAction && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-sm animate-fade-in">
                <div className="bg-navy-800 rounded-lg p-6 w-full max-w-md border border-white/10 shadow-2xl">
                    <h3 className="text-xl text-white font-serif mb-4">{walletAction === 'DEPOSIT' ? 'Deposit Funds' : 'Withdraw Funds'}</h3>
                    
                    {withdrawalMsg ? (
                        <div className="text-center py-6">
                            <Lock className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-white mb-2">Request Status</h4>
                            <p className="text-slate-400 text-sm mb-6">{withdrawalMsg}</p>
                            <button onClick={() => { setWalletAction(null); setTransAmount(0); setWithdrawalMsg(''); setTransHash(''); }} className="w-full bg-navy-700 hover:bg-navy-600 text-white py-2 rounded">Close</button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm text-slate-400 mb-1">Asset Type</label>
                                <select 
                                    value={transAsset} 
                                    onChange={(e) => setTransAsset(e.target.value)}
                                    className="w-full bg-navy-900 border border-white/10 rounded p-2 text-white"
                                >
                                    <option value="USD">USDT (Tether)</option>
                                    <option value="BTC">Bitcoin (BTC)</option>
                                    <option value="ETH">Ethereum (ETH)</option>
                                </select>
                            </div>

                            {walletAction === 'DEPOSIT' && (
                                <div className="mb-6 p-4 bg-navy-900 border border-white/10 rounded">
                                    <p className="text-xs text-slate-400 mb-2">Send funds to this address:</p>
                                    <div className="flex items-center justify-between bg-black/20 p-2 rounded border border-white/5 mb-2">
                                        <code className="text-xs text-gold-500 font-mono break-all">0xAdminCryptoWalletAddressGoesHere</code>
                                        <button onClick={() => navigator.clipboard.writeText("0xAdminCryptoWalletAddressGoesHere")} className="text-slate-400 hover:text-white"><Copy size={14} /></button>
                                    </div>
                                    <p className="text-[10px] text-amber-500 flex items-center gap-1"><AlertCircle size={10} /> Admin approval required for balance to reflect.</p>
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="block text-sm text-slate-400 mb-1">Amount</label>
                                <input 
                                    type="number" 
                                    value={transAmount}
                                    onChange={(e) => setTransAmount(parseFloat(e.target.value))}
                                    className="w-full bg-navy-900 border border-white/10 rounded p-2 text-white focus:border-gold-500 outline-none"
                                    placeholder="0.00"
                                />
                            </div>

                            {walletAction === 'DEPOSIT' ? (
                                <div className="mb-6">
                                    <label className="block text-sm text-slate-400 mb-1">Transaction Hash (TxID)</label>
                                    <input 
                                        type="text" 
                                        value={transHash}
                                        onChange={(e) => setTransHash(e.target.value)}
                                        className="w-full bg-navy-900 border border-white/10 rounded p-2 text-white text-xs font-mono"
                                        placeholder="Enter blockchain transaction hash..."
                                    />
                                </div>
                            ) : (
                                <div className="mb-6">
                                    <label className="block text-sm text-slate-400 mb-1">Destination Address</label>
                                    <input 
                                        type="text" 
                                        value={transAddress}
                                        onChange={(e) => setTransAddress(e.target.value)}
                                        className="w-full bg-navy-900 border border-white/10 rounded p-2 text-white text-xs font-mono"
                                        placeholder="Your crypto wallet address..."
                                    />
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button onClick={() => setWalletAction(null)} className="flex-1 py-2 text-slate-300 hover:text-white transition-colors">Cancel</button>
                                <button onClick={handleWalletAction} disabled={!transAmount || (walletAction === 'DEPOSIT' && !transHash) || (walletAction === 'WITHDRAWAL' && !transAddress)} className="flex-1 bg-gold-600 hover:bg-gold-500 text-white py-2 rounded-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                                    {walletAction === 'DEPOSIT' ? 'Submit for Approval' : 'Request Withdrawal'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
      )}
    </div>
  );
};

export default Dashboard;
