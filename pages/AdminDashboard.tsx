
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Briefcase, DollarSign, Activity, CheckCircle, XCircle, 
  Plus, Loader2, RefreshCw, AlertTriangle 
} from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { dataService } from '../services/dataService';
import { useGlobal } from '../context/GlobalContext';

const { Navigate, useNavigate } = ReactRouterDOM;

const AdminDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { convertPrice } = useGlobal();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'deposits' | 'investments'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [pendingInvestments, setPendingInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadData();
  }, [activeTab, isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const data = await dataService.getAdminOverview();
        setStats(data);
      } else if (activeTab === 'deposits') {
        try {
            // GET /admin/deposits
            const data = await dataService.getAdminDeposits();
            setDeposits(Array.isArray(data) ? data : []);
        } catch (e) {
            console.warn("No pending deposits or error fetching", e);
            setDeposits([]);
        }
      } else if (activeTab === 'investments') {
        try {
            // GET /admin/investments
            const data = await dataService.getAdminPendingInvestments();
            setPendingInvestments(Array.isArray(data) ? data : []);
        } catch (e) {
            console.warn("No pending investments or error fetching", e);
            setPendingInvestments([]);
        }
      }
    } catch (error) {
      console.error("Failed to load admin data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDeposit = async (id: string) => {
    setActionLoading(id);
    try {
        await dataService.approveDeposit(id);
        setDeposits(prev => prev.filter(d => d.id !== id));
    } catch (e) {
        alert('Failed to approve');
    } finally {
        setActionLoading(null);
    }
  };

  const handleApproveInvestment = async (id: string) => {
    setActionLoading(id);
    try {
        await dataService.approveInvestment(id);
        setPendingInvestments(prev => prev.filter(i => i.id !== id));
    } catch (e) {
        alert('Failed to approve');
    } finally {
        setActionLoading(null);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user?.role !== 'ADMIN') {
    return <div className="p-8 text-center text-white">Access Denied</div>;
  }

  return (
    <div className="pt-20 min-h-screen bg-navy-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto py-10">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-serif text-white">Admin Dashboard</h1>
            <div className="flex gap-4">
                <button onClick={loadData} className="text-slate-400 hover:text-white"><RefreshCw size={20} /></button>
                <button onClick={() => navigate('/admin/assets/new')} className="bg-gold-600 text-white px-4 py-2 rounded text-sm flex items-center gap-2"><Plus size={16} /> Create Asset</button>
            </div>
        </div>

        <div className="flex space-x-2 mb-8 border-b border-white/10">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'deposits', label: 'Pending Deposits' },
            { id: 'investments', label: 'Pending Investments' }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id as any)} 
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id 
                ? 'border-gold-500 text-gold-500' 
                : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gold-500 w-10 h-10" /></div>
        ) : (
            <div className="animate-fade-in">
                {activeTab === 'overview' && stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-navy-800 p-6 rounded border border-white/5 shadow-lg">
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Total AUM</p>
                            <div className="text-2xl font-serif text-white">{convertPrice(Number(stats.totalAum || 0))}</div>
                        </div>
                        <div className="bg-navy-800 p-6 rounded border border-white/5 shadow-lg">
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Users</p>
                            <div className="text-2xl font-serif text-white">{stats.totalUsers}</div>
                        </div>
                        <div className="bg-navy-800 p-6 rounded border border-white/5 shadow-lg">
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Inflow</p>
                            <div className="text-2xl font-serif text-emerald-400">{convertPrice(Number(stats.platformInflow || 0))}</div>
                        </div>
                        <div className="bg-navy-800 p-6 rounded border border-white/5 shadow-lg">
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Outflow</p>
                            <div className="text-2xl font-serif text-rose-400">{convertPrice(Number(stats.platformOutflow || 0))}</div>
                        </div>
                    </div>
                )}

                {activeTab === 'deposits' && (
                    <div className="bg-navy-800 rounded overflow-hidden border border-white/5">
                        <table className="min-w-full divide-y divide-white/10">
                            <thead className="bg-navy-950">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Ref / Hash</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {deposits.length === 0 ? (
                                    <tr><td colSpan={4} className="p-8 text-center text-slate-500">No pending deposits found.</td></tr>
                                ) : deposits.map(dep => (
                                    <tr key={dep.id}>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-white">{dep.user?.fullName}</div>
                                            <div className="text-xs text-slate-500">{dep.user?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-emerald-400 font-bold">{convertPrice(Number(dep.amount))}</td>
                                        <td className="px-6 py-4 text-xs font-mono text-slate-400">{dep.referenceId}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleApproveDeposit(dep.id)}
                                                disabled={!!actionLoading}
                                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded text-xs flex items-center ml-auto"
                                            >
                                                {actionLoading === dep.id && <Loader2 className="w-3 h-3 animate-spin mr-1" />} Approve
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {activeTab === 'investments' && (
                    <div className="bg-navy-800 rounded overflow-hidden border border-white/5">
                        <table className="min-w-full divide-y divide-white/10">
                            <thead className="bg-navy-950">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Investor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Asset</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {pendingInvestments.length === 0 ? (
                                    <tr><td colSpan={4} className="p-8 text-center text-slate-500">No pending investments found.</td></tr>
                                ) : pendingInvestments.map(inv => (
                                    <tr key={inv.id}>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-white">{inv.user?.fullName}</div>
                                            <div className="text-xs text-slate-500">{inv.user?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white">{inv.asset?.title}</td>
                                        <td className="px-6 py-4 text-gold-500 font-bold">{convertPrice(Number(inv.amount))}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleApproveInvestment(inv.id)}
                                                disabled={!!actionLoading}
                                                className="bg-gold-600 hover:bg-gold-500 text-white px-3 py-1 rounded text-xs flex items-center ml-auto"
                                            >
                                                {actionLoading === inv.id && <Loader2 className="w-3 h-3 animate-spin mr-1" />} Approve
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
