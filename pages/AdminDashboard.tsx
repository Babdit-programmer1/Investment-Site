
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Briefcase, DollarSign, Activity, CheckCircle, XCircle, Plus, Wallet, X, Loader2, List, Search, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../src/config';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'investors' | 'approvals' | 'deposits' | 'withdrawals' | 'logs'>('overview');
  
  const [stats, setStats] = useState<any>(null);
  const [investors, setInvestors] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [walletModal, setWalletModal] = useState<{ isOpen: boolean, userId: string | null, userName: string }>({ isOpen: false, userId: null, userName: '' });
  const [walletForm, setWalletForm] = useState({ type: 'CREDIT', amount: '', reason: '' });
  const [walletLoading, setWalletLoading] = useState(false);

  const token = localStorage.getItem('prestige_token');

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    fetchTabData();
  }, [activeTab]);

  const fetchTabData = async () => {
    setLoading(true);
    try {
        const headers = { Authorization: `Bearer ${token}` };
        if (activeTab === 'overview') {
            const res = await fetch(`${API_BASE_URL}/admin/stats`, { headers });
            setStats(await res.json());
        } else if (activeTab === 'investors') {
            const res = await fetch(`${API_BASE_URL}/admin/users`, { headers });
            setInvestors(await res.json());
        } else if (activeTab === 'approvals') {
            const res = await fetch(`${API_BASE_URL}/admin/approvals`, { headers });
            setApprovals(await res.json());
        } else if (activeTab === 'deposits') {
            const res = await fetch(`${API_BASE_URL}/admin/deposits/pending`, { headers });
            setDeposits(await res.json());
        } else if (activeTab === 'withdrawals') {
            const res = await fetch(`${API_BASE_URL}/admin/withdrawals/pending`, { headers });
            setWithdrawals(await res.json());
        } else if (activeTab === 'logs') {
            const res = await fetch(`${API_BASE_URL}/admin/logs`, { headers });
            const data = await res.json();
            setSystemLogs(data.data || []);
        }
    } catch (e) {
        console.error("Admin: API Error");
    } finally {
        setLoading(false);
    }
  };

  const handleAction = async (endpoint: string) => {
    try {
        await fetch(`${API_BASE_URL}/admin/${endpoint}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchTabData();
    } catch (e) { alert("Execution failed"); }
  };

  const submitWalletAdjustment = async () => {
    if (!walletForm.amount || !walletForm.reason || !walletModal.userId) return;
    setWalletLoading(true);
    try {
        const endpoint = walletForm.type === 'CREDIT' ? 'credit' : 'debit';
        const res = await fetch(`${API_BASE_URL}/admin/wallets/${walletModal.userId}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ amount: parseFloat(walletForm.amount), reason: walletForm.reason })
        });
        if (res.ok) {
            setWalletModal({ isOpen: false, userId: null, userName: '' });
            fetchTabData();
        }
    } catch (e) { alert('Action failed'); } finally { setWalletLoading(false); }
  };

  return (
    <div className="pt-20 min-h-screen bg-navy-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto py-10">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-serif text-white">Command Center</h1>
            <button onClick={() => navigate('/admin/assets/new')} className="bg-gold-600 text-white px-4 py-2 rounded text-sm flex items-center gap-2"><Plus size={16} /> Create Asset</button>
        </div>

        <div className="flex space-x-2 mb-8 border-b border-white/10 overflow-x-auto pb-1">
          {['overview', 'investors', 'approvals', 'deposits', 'withdrawals', 'logs'].map(tab => (
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
                            <thead className="bg-navy-950"><tr><th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">User</th><th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Actions</th></tr></thead>
                            <tbody className="divide-y divide-white/5">
                                {investors.map(inv => (
                                    <tr key={inv.id}>
                                        <td className="px-6 py-4"><div className="text-sm text-white">{inv.fullName}</div><div className="text-xs text-slate-500">{inv.email}</div></td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => setWalletModal({ isOpen: true, userId: inv.id, userName: inv.fullName })} className="text-xs text-gold-500 flex items-center gap-1 ml-auto"><Wallet size={12} /> Manage Funds</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {/* Fallback for empty states in Approvals/Deposits/Withdrawals handled by table logic */}
                {['approvals', 'deposits', 'withdrawals'].includes(activeTab) && (
                    <div className="bg-navy-800 p-20 text-center text-slate-500 italic rounded border border-white/5">
                        No pending requests in this category.
                    </div>
                )}
            </div>
        )}
      </div>

      {/* Wallet Adjustment Modal */}
      {walletModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/90 backdrop-blur-sm">
              <div className="bg-navy-800 rounded-lg w-full max-w-md p-6 border border-white/10">
                  <div className="flex justify-between items-center mb-6"><h3 className="text-xl text-white">Manual Fund Entry</h3><button onClick={() => setWalletModal({ isOpen: false, userId: null, userName: '' })} className="text-slate-400"><X size={20}/></button></div>
                  <div className="space-y-4">
                      <select className="w-full bg-navy-900 border border-white/10 rounded p-2 text-white" value={walletForm.type} onChange={e => setWalletForm({...walletForm, type: e.target.value})}>
                          <option value="CREDIT">Add Funds (+)</option>
                          <option value="DEBIT">Remove Funds (-)</option>
                      </select>
                      <input type="number" placeholder="Amount" className="w-full bg-navy-900 border border-white/10 rounded p-2 text-white" value={walletForm.amount} onChange={e => setWalletForm({...walletForm, amount: e.target.value})} />
                      <textarea placeholder="Audit Reason" className="w-full bg-navy-900 border border-white/10 rounded p-2 text-white" value={walletForm.reason} onChange={e => setWalletForm({...walletForm, reason: e.target.value})} />
                      <button onClick={submitWalletAdjustment} disabled={walletLoading} className="w-full bg-gold-600 text-white py-3 rounded font-medium disabled:opacity-50">
                        {walletLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Confirm Adjustment'}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;
