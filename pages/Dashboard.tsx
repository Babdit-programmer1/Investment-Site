import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { PieChart, TrendingUp, DollarSign, Activity, Briefcase, Download, Clock, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // Simulate portfolio data based on investor type to make the preview look "Active"
  const stats = useMemo(() => {
    if (user?.investorType === 'High Net Worth' || user?.investorType === 'Institutional') {
      return [
        { label: "Total Portfolio Value", value: "$2,450,000", icon: <DollarSign />, change: "+12.4%", changeType: "pos" },
        { label: "Active Investments", value: "8", icon: <Briefcase />, change: "2 Pending", changeType: "neutral" },
        { label: "Est. Annual Yield", value: "14.2%", icon: <TrendingUp />, change: "+1.5%", changeType: "pos" },
        { label: "Available Cash", value: "$150,000", icon: <Activity />, change: "Deposit", changeType: "action" }
      ];
    }
    return [
      { label: "Total Portfolio Value", value: "$0.00", icon: <DollarSign />, change: "+0.0%", changeType: "neutral" },
      { label: "Active Investments", value: "0", icon: <Briefcase />, change: "0", changeType: "neutral" },
      { label: "Est. Annual Yield", value: "0.0%", icon: <TrendingUp />, change: "+0.0%", changeType: "neutral" },
      { label: "Available Cash", value: "$0.00", icon: <Activity />, change: "Deposit", changeType: "action" }
    ];
  }, [user]);

  const hasActivePortfolio = user?.investorType === 'High Net Worth' || user?.investorType === 'Institutional';

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
                <span>ID: {user?.id}</span>
                <span>|</span>
                <span className="text-gold-500">{user?.investorType} Account</span>
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
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Row */}
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
          
          {/* Main Chart Area */}
          <div className="lg:col-span-2 bg-navy-800 rounded-sm border border-white/5 p-6 min-h-[400px]">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-serif text-white">Portfolio Performance</h3>
               <div className="flex gap-2">
                 {['1M', '3M', '6M', '1Y', 'ALL'].map(t => (
                   <button key={t} className={`text-xs font-mono px-3 py-1 rounded transition-colors ${t === '1Y' ? 'bg-white/10 text-white' : 'bg-navy-900 text-slate-400 hover:text-white hover:bg-white/5'}`}>
                     {t}
                   </button>
                 ))}
               </div>
             </div>
             
             {hasActivePortfolio ? (
               // Simulated Chart for HNW Users
               <div className="h-64 w-full flex items-end justify-between space-x-1 px-2 relative">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                     <div className="border-t border-slate-500 w-full h-0"></div>
                     <div className="border-t border-slate-500 w-full h-0"></div>
                     <div className="border-t border-slate-500 w-full h-0"></div>
                     <div className="border-t border-slate-500 w-full h-0"></div>
                  </div>
                  
                  {/* Bars */}
                  {[35, 38, 36, 42, 45, 43, 50, 55, 53, 58, 62, 65, 60, 68, 72, 75, 78, 82, 80, 85, 90, 88, 92, 95].map((h, i) => (
                    <div 
                      key={i} 
                      className="w-full bg-gradient-to-t from-gold-600/50 to-gold-400 rounded-t-sm hover:from-gold-500 hover:to-white transition-all duration-300"
                      style={{ height: `${h}%` }}
                      title={`Week ${i+1}`}
                    ></div>
                  ))}
               </div>
             ) : (
               // Empty State for New Users
               <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded">
                 <div className="p-4 bg-navy-900 rounded-full mb-4">
                   <TrendingUp className="h-8 w-8 text-slate-600" />
                 </div>
                 <p className="text-slate-300 font-medium">No active performance data</p>
                 <p className="text-slate-500 text-sm mt-1">Make your first investment to see analytics</p>
                 <Link to="/investments" className="mt-4 text-gold-500 text-sm font-medium hover:underline">
                   Browse Marketplace
                 </Link>
               </div>
             )}
          </div>

          {/* Side Panel: Profile & Interests */}
          <div className="space-y-6">
            
            {/* Interests Widget */}
            <div className="bg-navy-800 rounded-sm border border-white/5 p-6">
              <h3 className="text-lg font-serif text-white mb-4">Your Interests</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {user?.interests && user.interests.length > 0 ? (
                  user.interests.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-navy-900 text-gold-500 text-xs rounded border border-gold-500/20">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 text-sm">No interests selected.</span>
                )}
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                We'll use these preferences to curate your "Recommended for You" feed with relevant high-value assets.
              </p>
            </div>

            {/* AI Insight Widget */}
            <div className="bg-gradient-to-br from-navy-800 to-navy-900 rounded-sm border border-gold-500/20 p-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Activity size={100} className="text-gold-500" />
               </div>
               <h3 className="text-lg font-serif text-white mb-2">Market Insight</h3>
               <p className="text-sm text-slate-400 mb-4">
                 Based on your interest in <span className="text-white">{user?.interests?.[0] || 'Alternative Assets'}</span>, our AI analyst suggests reviewing the Q3 Luxury Real Estate Report.
               </p>
               <button className="text-xs font-bold text-gold-500 uppercase tracking-wide flex items-center hover:text-white transition-colors">
                 Read Report <TrendingUp className="ml-1 h-3 w-3" />
               </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;