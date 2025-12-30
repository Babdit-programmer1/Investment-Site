
import React, { useMemo, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { TrendingUp, Activity, Briefcase, ShieldCheck, AlertCircle, Wallet, ChevronRight, FileText, User, MapPin, PieChart, ArrowUpRight, Sparkles, RefreshCw, MoreHorizontal } from 'lucide-react';
import { InvestmentIntent, InvestmentPlan } from '../types';
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
       imageUrl: '',
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

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [investments, setInvestments] = useState<InvestmentIntent[]>([]);
  const [performance, setPerformance] = useState<any[]>([]);
  const [myPlan, setMyPlan] = useState<InvestmentPlan | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  // Redirect to onboarding if not complete
  if (user && !user.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  useEffect(() => {
    const reference = searchParams.get('reference');
    if (reference) verifyPayment(reference);
    fetchDashboardData();
  }, [searchParams]);

  const verifyPayment = async (ref: string) => {
    try {
      const token = localStorage.getItem('prestige_token');
      await fetch(`${API_BASE_URL}/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ reference: ref })
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (e) { console.warn("Payment verification simulated (Backend unavailable)"); }
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

      if (!invRes.ok) throw new Error("API Failed");
      
      const invData = await invRes.json();
      setInvestments(invData);
      
      const perfData = await perfRes.json();
      setPerformance(perfData);

      if (walletRes.ok) {
          const walletData = await walletRes.json();
          setWalletBalance(walletData.fiatBalance || 0);
      }

      if (recRes.ok) {
          setRecommendation(await recRes.json());
      }

      // Find my plan if assigned
      if (user?.planId) {
        const plansData = await planRes.json();
        const plan = plansData.find((p: any) => p.id === user.planId);
        setMyPlan(plan);
      }
    } catch (e) {
      console.warn("Using mock dashboard data");
      setInvestments(MOCK_ACTIVE_INVESTMENTS);
      setPerformance(MOCK_PERFORMANCE);
      setWalletBalance(15000); // Mock balance for preview
      setRecommendation({
          matchScore: 92,
          reason: "Diversify your portfolio with high-yield assets matching your interest in Real Estate.",
          recommendation: { title: "New Asset Suggestion", ticker: "AI-RECO" }
      });
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const totalInvested = investments
      .filter(i => i.status === 'ACTIVE' || i.status === 'ESCROWED')
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    // Simulate current value for display
    const currentValue = Math.floor(totalInvested * 1.048); // 4.8% simulated gain
    const gain = currentValue - totalInvested;

    return [
      { label: "Portfolio Valuation", value: `$${currentValue.toLocaleString()}`, icon: <Briefcase className="w-5 h-5 text-gold-500" />, change: "+4.8%", changeType: "pos" },
      { label: "Wallet Balance", value: `$${walletBalance.toLocaleString()}`, icon: <Wallet className="w-5 h-5 text-blue-400" />, change: "Available", changeType: "neutral" },
      { label: "Unrealized Gain", value: `$${gain.toLocaleString()}`, icon: <TrendingUp className="w-5 h-5 text-emerald-400" />, change: "YTD", changeType: "pos" },
      { label: "Target IRR", value: "14.2%", icon: <Activity className="w-5 h-5 text-purple-400" />, change: "Target: 15%", changeType: "pos" }
    ];
  }, [investments, walletBalance]);

  const allocation = useMemo(() => {
    const cats: Record<string, number> = {};
    investments.forEach(i => {
       const cat = i.asset?.category || 'Uncategorized';
       cats[cat] = (cats[cat] || 0) + i.amount;
    });
    const total = Object.values(cats).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(cats).map(([name, value]) => ({ name, value, pct: (value / total) * 100 }));
  }, [investments]);

  // Simple Chart Component
  const SimpleChart = ({ data }: { data: any[] }) => {
    if (!data || !data.length) return null;
    const max = Math.max(...data.map(d => d.value));
    const min = Math.min(...data.map(d => d.value));
    
    // Normalize points
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
                
                {/* Dots */}
                {data.map((d, i) => {
                    const x = (i / (data.length - 1)) * 100;
                    const y = 100 - ((d.value - min) / (max - min)) * 80 - 10;
                    return (
                        <circle cx={x} cy={y} r="2" fill="#fbbf24" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    );
                })}
             </svg>
             <div className="flex justify-between text-xs text-slate-500 mt-2 font-mono uppercase">
                 {data.filter((_, i) => i % 2 === 0).map(d => <span key={d.name}>{d.name}</span>)}
             </div>
        </div>
    );
  };

  // Ring Chart Component
  const AllocationRing = ({ data }: { data: { name: string, value: number, pct: number }[] }) => {
      let cumulative = 0;
      const colors = ['#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#a78bfa']; // Gold, Emerald, Blue, Pink, Purple

      if (data.length === 0) return (
          <div className="h-40 w-40 rounded-full border-4 border-white/5 flex items-center justify-center mx-auto text-xs text-slate-500">
              No Data
          </div>
      );

      return (
         <div className="relative h-48 w-48 mx-auto">
             <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                 {data.map((d, i) => {
                     const start = cumulative;
                     const end = cumulative + d.pct;
                     cumulative = end;
                     
                     // SVG Arc logic
                     const x1 = 50 + 40 * Math.cos(2 * Math.PI * start / 100);
                     const y1 = 50 + 40 * Math.sin(2 * Math.PI * start / 100);
                     const x2 = 50 + 40 * Math.cos(2 * Math.PI * end / 100);
                     const y2 = 50 + 40 * Math.sin(2 * Math.PI * end / 100);
                     const largeArc = d.pct > 50 ? 1 : 0;
                     
                     return (
                         <path 
                           key={i}
                           d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`} 
                           fill={colors[i % colors.length]} 
                           stroke="#1e293b" 
                           strokeWidth="2"
                         />
                     );
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

  return (
    <div className="min-h-screen bg-navy-900 pt-20">
      
      {/* Header */}
      <div className="bg-navy-950 border-b border-white/5 pb-12 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-serif text-white">Welcome, {user?.fullName || "Investor"}</h1>
              <div className="flex items-center mt-2 space-x-4 text-sm text-slate-400">
                <span className="flex items-center"><ShieldCheck className="h-4 w-4 mr-1 text-emerald-500" /> Verified Investor</span>
                <span>|</span>
                <span className="uppercase tracking-widest text-xs font-bold text-gold-500">{user?.investorType || "Standard"}</span>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
               <Link to="/wallet" className="bg-navy-800 border border-white/10 hover:bg-navy-700 text-white px-4 py-2 rounded-sm text-sm font-medium transition-colors flex items-center">
                 <Wallet className="h-4 w-4 mr-2" /> My Wallet
               </Link>
               <Link to="/investments" className="bg-gold-600 hover:bg-gold-500 text-white px-6 py-2 rounded-sm text-sm font-medium transition-colors">
                 New Investment
               </Link>
            </div>
          </div>
          
          {user?.kycStatus === 'PENDING' && (
            <div className="mt-6 bg-amber-500/10 border border-amber-500/20 p-4 rounded flex items-start animate-pulse">
               <AlertCircle className="text-amber-500 h-5 w-5 mr-3 mt-0.5" />
               <div>
                 <h4 className="text-amber-500 font-medium text-sm">KYC Under Review</h4>
                 <p className="text-amber-200/70 text-sm mt-1">Your compliance documents are being processed. Investment capabilities are currently restricted.</p>
               </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* AI Recommendation Widget (New) */}
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

        {/* Stats Grid - Glassmorphism */}
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
             {/* Performance Chart */}
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

             {/* Holdings / Secondary Market Interaction */}
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
                            <div className="w-10 h-10 rounded bg-navy-900 flex items-center justify-center border border-white/10 text-slate-300 font-serif font-bold group-hover:text-gold-500 transition-colors">
                                {inv.asset?.ticker?.substring(0,2) || 'AS'}
                            </div>
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
                                 <button 
                                    onClick={() => setSelectedAsset(inv)}
                                    className="bg-navy-700 hover:bg-navy-600 text-white px-3 py-1.5 rounded text-xs font-medium border border-white/10 flex items-center gap-1"
                                 >
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
            
            {/* Visual Portfolio Breakdown */}
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

            {/* Investor Profile Card with KYC Link */}
            <div className="bg-navy-800 rounded-lg border border-white/5 p-6 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-500 to-amber-600"></div>
              <div className="flex items-center gap-4 mb-6">
                 <div className="h-12 w-12 rounded-full bg-navy-900 flex items-center justify-center text-gold-500 font-serif text-xl border border-gold-500/20">
                    {user?.fullName?.charAt(0) || <User />}
                 </div>
                 <div>
                    <h3 className="text-white font-serif text-lg">{user?.fullName || 'Investor'}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin size={10} /> {user?.country || 'Global'}
                    </p>
                 </div>
              </div>
              
              <div className="space-y-4">
                 <div className="pt-4 border-t border-white/5 flex justify-between items-center text-sm">
                    <span className="text-slate-400">Status</span>
                    <span className={`flex items-center gap-1 font-mono text-xs font-bold uppercase ${user?.kycStatus === 'APPROVED' ? 'text-emerald-400' : user?.kycStatus === 'REJECTED' ? 'text-rose-400' : 'text-amber-400'}`}>
                       {user?.kycStatus === 'APPROVED' ? <ShieldCheck size={12} /> : <AlertCircle size={12} />}
                       {user?.kycStatus}
                    </span>
                 </div>
                 {user?.kycStatus !== 'APPROVED' && (
                     <Link to="/kyc" className="block w-full text-center bg-gold-600 hover:bg-gold-500 text-white py-2 rounded text-sm transition-colors mt-2">
                        {user?.kycStatus === 'PENDING' ? 'View Application' : 'Complete Verification'}
                     </Link>
                 )}
              </div>
            </div>

            {/* Current Plan */}
            <div className="bg-gradient-to-br from-navy-800 to-navy-900 rounded-lg border border-white/5 p-6 relative overflow-hidden group hover:border-gold-500/30 transition-all">
               <h3 className="text-lg font-serif text-white mb-4 relative z-10">Strategy</h3>
               
               {myPlan ? (
                   <div>
                       <div className="text-gold-500 font-mono text-xs uppercase tracking-widest mb-1">Active Plan</div>
                       <h4 className="text-2xl text-white font-serif mb-4">{myPlan.name}</h4>
                       <Link to="/plans" className="w-full block text-center bg-white/5 hover:bg-white/10 text-white py-2 rounded text-sm transition-colors border border-white/10">Manage Strategy</Link>
                   </div>
               ) : (
                   <div className="text-center py-4">
                       <PieChart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                       <p className="text-slate-400 text-sm mb-4">No wealth plan active.</p>
                       <Link to="/plans" className="w-full block bg-gold-600 hover:bg-gold-500 text-white py-2 rounded text-sm transition-colors">Select Strategy</Link>
                   </div>
               )}
            </div>

          </div>
        </div>
      </div>

      {selectedAsset && (
          <TradeModal 
            asset={selectedAsset} 
            currentValue={selectedAsset.amount * 1.048} // Mock value calc
            onClose={() => setSelectedAsset(null)}
            onSuccess={() => {
                fetchDashboardData();
                // Show notification here
            }}
          />
      )}
    </div>
  );
};

export default Dashboard;
