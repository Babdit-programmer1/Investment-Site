
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Briefcase, DollarSign, Activity, CheckCircle, XCircle, Plus, Wallet, X, Loader2, List, Search } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'investors' | 'approvals'>('overview');
  
  const [stats, setStats] = useState<any>(null);
  const [investors, setInvestors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([
        dataService.getAdminOverview(),
        dataService.getAdminUsers()
    ])
    .then(([overview, users]) => {
        setStats(overview);
        setInvestors(users);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, [activeTab]);

  return (
    <div className="pt-20 min-h-screen bg-navy-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto py-10">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-serif text-white">Command Center</h1>
            <button onClick={() => navigate('/admin/assets/new')} className="bg-gold-600 text-white px-4 py-2 rounded text-sm flex items-center gap-2"><Plus size={16} /> Create Asset</button>
        </div>

        <div className="flex space-x-2 mb-8 border-b border-white/10 overflow-x-auto pb-1">
          {['overview', 'investors', 'approvals'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-2 text-sm font-medium capitalize rounded-t-lg ${activeTab === tab ? 'bg-navy-800 text-gold-500 border-t border-x border-white/10' : 'text-slate-400 hover:text-white'}`}>{tab}</button>
          ))}
        </div>

        {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gold-500 w-10 h-10" /></div>
        ) : (
            <div className="animate-fade-in">
                {activeTab === 'overview' && stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-navy-800 p-6 rounded border border-white/5">
                            <p className="text-xs text-slate-500 uppercase tracking-wide">AUM</p>
                            <div className="text-2xl font-serif text-white">${Number(stats.totalAum || 0).toLocaleString()}</div>
                        </div>
                        <div className="bg-navy-800 p-6 rounded border border-white/5">
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Total Users</p>
                            <div className="text-2xl font-serif text-white">{stats.totalUsers}</div>
                        </div>
                        <div className="bg-navy-800 p-6 rounded border border-white/5">
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Inflow</p>
                            <div className="text-2xl font-serif text-emerald-400">${Number(stats.platformInflow || 0).toLocaleString()}</div>
                        </div>
                        <div className="bg-navy-800 p-6 rounded border border-white/5">
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Outflow</p>
                            <div className="text-2xl font-serif text-rose-400">${Number(stats.platformOutflow || 0).toLocaleString()}</div>
                        </div>
                    </div>
                )}

                {activeTab === 'investors' && (
                    <div className="bg-navy-800 rounded overflow-hidden">
                        <table className="min-w-full divide-y divide-white/10">
                            <thead className="bg-navy-950"><tr><th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">User</th><th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">KYC Status</th></tr></thead>
                            <tbody className="divide-y divide-white/5">
                                {investors.map(inv => (
                                    <tr key={inv.id}>
                                        <td className="px-6 py-4"><div className="text-sm text-white">{inv.fullName}</div><div className="text-xs text-slate-500">{inv.email}</div></td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`px-2 py-1 text-xs rounded ${inv.kycStatus === 'APPROVED' ? 'bg-emerald-900 text-emerald-200' : 'bg-amber-900 text-amber-200'}`}>{inv.kycStatus}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {activeTab === 'approvals' && (
                    <div className="bg-navy-800 p-20 text-center text-slate-500 italic rounded border border-white/5">
                        No pending requests.
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
