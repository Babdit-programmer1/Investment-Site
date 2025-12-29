import React, { useMemo, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { PieChart, TrendingUp, DollarSign, Activity, Briefcase, Download, ShieldCheck, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { InvestmentIntent } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [investments, setInvestments] = useState<InvestmentIntent[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect to onboarding if not complete
  if (user && !user.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  useEffect(() => {
    // Check for payment verification param from gateway redirect
    const reference = searchParams.get('reference');
    if (reference) {
      verifyPayment(reference);
    } else {
      fetchInvestments();
    }
  }, [searchParams]);

  const verifyPayment = async (ref: string) => {
    try {
      const token = localStorage.getItem('prestige_token');
      await fetch('http://localhost:3001/api/v1/payments/verify', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ reference: ref })
      });
      fetchInvestments();
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (e) { console.error(e); }
  };

  const fetchInvestments = async () => {
    try {
      const token = localStorage.getItem('prestige_token');
      const res = await fetch('http://localhost:3001/api/v1/payments/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setInvestments(data);
      setLoading(false);
    } catch (e) { console.error(e); }
  };

  const stats = useMemo(() => {
    const totalInvested = investments
      .filter(i => i.status === 'ACTIVE' || i.status === 'ESCROWED')
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    const activeCount = investments.filter(i => i.status === 'ACTIVE').length;
    const pendingCount = investments.filter(i => i.status === 'ESCROWED').length;

    return [
      { label: "Total Portfolio Value", value: `$${totalInvested.toLocaleString()}`, icon: <DollarSign />, change: activeCount > 0 ? "+12.4%" : "0.0%", changeType: activeCount > 0 ? "pos" : "neutral" },
      { label: "Active Investments", value: activeCount.toString(), icon: <Briefcase />, change: `${pendingCount} Pending`, changeType: "neutral" },
      { label: "Est. Annual Yield", value: activeCount > 0 ? "14.2%" : "0.0%", icon: <TrendingUp />, change: "+1.5%", changeType: activeCount > 0 ? "pos" : "neutral" },
      { label: "Available Cash", value: "$0.00", icon: <Activity />, change: "Deposit", changeType: "action" }
    ];
  }, [investments]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <span className="bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/> ACTIVE</span>;
      case 'ESCROWED': return <span className="bg-amber-500/10 text-amber-500 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><ShieldCheck size={12}/> ESCROW</span>;
      case 'PENDING': return <span className="bg-slate-700 text-slate-400 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><Clock size={12}/> UNPAID</span>;
      case 'REFUNDED': return <span className="bg-rose-500/10 text-rose-500 px-2 py-1 rounded text-xs font-bold">REFUNDED</span>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 pt-20">
      
      {/* Welcome Header */}
      <div className="bg-navy-950 border-b border-white/5 pb-12 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-serif text-white">Welcome, {user?.fullName}</h1>
              <div className="flex items-center mt-2 space-x-4 text-sm text-slate-400">
                <span className="flex items-center"><ShieldCheck className="h-4 w-4 mr-1 text-emerald-500" /> Verified Investor</span>
                <span>|</span>
                <span className={`uppercase font-bold text-xs ${user?.kycStatus === 'PENDING' ? 'text-amber-500' : 'text-emerald-500'}`}>{user?.kycStatus} Status</span>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
               <button className="bg-navy-800 border border-white/10 hover:bg-navy-700 text-white px-4 py-2 rounded-sm text-sm font-medium transition-colors flex items-center">
                 <Download className="h-4 w-4 mr-2" /> Statements
               </button>
               <Link to="/investments" className="bg-gold-600 hover:bg-gold-500 text-white px-6 py-2 rounded-sm text-sm font-medium transition-colors">
                 New Investment
               </Link>
            </div>
          </div>
          
          {user?.kycStatus === 'PENDING' && (
            <div className="mt-6 bg-amber-500/10 border border-amber-500/20 p-4 rounded flex items-start">
               <AlertCircle className="text-amber-500 h-5 w-5 mr-3 mt-0.5" />
               <div>
                 <h4 className="text-amber-500 font-medium text-sm">Account Under Review</h4>
                 <p className="text-amber-200/70 text-sm mt-1">Your compliance documents are being processed. Investment capabilities are currently restricted.</p>
               </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-navy-800 p-6 rounded-sm border border-white/5">
               <div className="flex justify-between items-start mb-4">
                 <div className="p-2 bg-navy-900 rounded border border-white/10 text-gold-500">
                   {React.cloneElement(stat.icon as any, { size: 20 })}
                 </div>
                 <span className={`text-xs font-mono px-2 py-1 rounded ${
                   stat.changeType === 'action' ? 'bg-gold-600/20 text-gold-500 cursor-pointer hover:bg-gold-600/30' : 
                   stat.changeType === 'pos' ? 'bg-emerald-500/10 text-emerald-500' : 
                   'bg-slate-700/30 text-slate-400'
                 }`}>
                   {stat.change}
                 </span>
               </div>
               <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">{stat.label}</p>
               <p className="text-2xl font-serif text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-navy-800 rounded-sm border border-white/5 p-6 min-h-[400px]">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-serif text-white">Your Investments</h3>
             </div>
             
             {investments.length > 0 ? (
               <div className="overflow-hidden">
                 <table className="min-w-full divide-y divide-white/10">
                   <thead className="bg-navy-900">
                     <tr>
                       <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Asset</th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Amount</th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Date</th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                     {investments.map((inv) => (
                       <tr key={inv.id}>
                         <td className="px-6 py-4 whitespace-nowrap">
                           <div className="text-sm text-white font-medium">{inv.asset?.title}</div>
                           <div className="text-xs text-slate-500">{inv.asset?.ticker}</div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-white">${inv.amount.toLocaleString()}</td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{new Date(inv.createdAt).toLocaleDateString()}</td>
                         <td className="px-6 py-4 whitespace-nowrap">
                           {getStatusBadge(inv.status)}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             ) : (
               <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded">
                 <div className="p-4 bg-navy-900 rounded-full mb-4">
                   <TrendingUp className="h-8 w-8 text-slate-600" />
                 </div>
                 <p className="text-slate-300 font-medium">No active investments</p>
                 <Link to="/investments" className="mt-4 text-gold-500 text-sm font-medium hover:underline">Browse Marketplace</Link>
               </div>
             )}
          </div>

          <div className="space-y-6">
            <div className="bg-navy-800 rounded-sm border border-white/5 p-6">
              <h3 className="text-lg font-serif text-white mb-4">Your Interests</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {user?.interests && user.interests.length > 0 ? (
                  user.interests.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-navy-900 text-gold-500 text-xs rounded border border-gold-500/20">{tag}</span>
                  ))
                ) : <span className="text-slate-500 text-sm">No interests selected.</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
