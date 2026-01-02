
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Briefcase, DollarSign, Activity, CheckCircle, XCircle, Plus, Shield, Lock, Server, Key, AlertTriangle, FileText, Scale, Siren, Cpu, Gauge, Globe, Terminal, Bell, Download, ArrowUpRight, ArrowDownLeft, Wallet, X, Loader2, List, Search } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../src/config';

// MOCK DATA FOR FALLBACK
const MOCK_STATS = {
  totalUsers: 142,
  totalAssets: 15,
  totalAum: 45000000,
  activeInvestments: 2,
  pendingDeposits: 1,
  pendingWithdrawals: 3,
  platformInflow: 2500000,
  platformOutflow: 500000,
  platformProfit: 2000000,
  recentActivity: []
};

const MOCK_INVESTORS = [
  { id: '1', fullName: 'James Sterling', email: 'j.sterling@example.com', investorType: 'Institutional', kycStatus: 'APPROVED' },
  { id: '2', fullName: 'Sarah Connor', email: 's.connor@example.com', investorType: 'High Net Worth', kycStatus: 'PENDING' }
];

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'assets' | 'investors' | 'approvals' | 'deposits' | 'withdrawals' | 'logs' | 'treasury' | 'risk' | 'diagnostics'>('overview');
  
  // Data States
  const [stats, setStats] = useState<any>(null);
  const [investors, setInvestors] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [treasury, setTreasury] = useState<any>(null);
  const [multisigRequests, setMultisigRequests] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  
  // Logs State
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [logsFilter, setLogsFilter] = useState({ actionType: '', adminId: '' });
  const [logsLoading, setLogsLoading] = useState(false);

  // Wallet Control Modal State
  const [walletModal, setWalletModal] = useState<{ isOpen: boolean, userId: string | null, userName: string }>({ isOpen: false, userId: null, userName: '' });
  const [walletForm, setWalletForm] = useState({ type: 'CREDIT', amount: '', reason: '' });
  const [walletLoading, setWalletLoading] = useState(false);
  
  // System State
  const [diagResults, setDiagResults] = useState<any>(null);
  const [runningDiag, setRunningDiag] = useState(false);
  const [notifStatus, setNotifStatus] = useState('');

  const [token] = useState(localStorage.getItem('prestige_token'));

  // Redirect if not admin
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    fetchStats();
    if (activeTab === 'investors') fetchInvestors();
    if (activeTab === 'approvals') fetchApprovals();
    if (activeTab === 'deposits') fetchDeposits();
    if (activeTab === 'withdrawals') fetchWithdrawals();
    if (activeTab === 'treasury') fetchTreasury();
    if (activeTab === 'risk') fetchRisk();
    if (activeTab === 'logs') fetchSystemLogs();
  }, [activeTab]);

  // --- FETCHERS ---

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } });
      if(!res.ok) throw new Error("API Error");
      const data = await res.json();
      setStats(data);
    } catch (e) { setStats(MOCK_STATS); }
  };

  const fetchInvestors = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/investors`, { headers: { Authorization: `Bearer ${token}` } });
      if(!res.ok) throw new Error("API Error");
      const data = await res.json();
      setInvestors(data);
    } catch (e) { setInvestors(MOCK_INVESTORS); }
  };

  const fetchApprovals = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/approvals`, { headers: { Authorization: `Bearer ${token}` } });
      if(!res.ok) throw new Error("API Error");
      const data = await res.json();
      setApprovals(data);
    } catch (e) { setApprovals([]); }
  };

  const fetchDeposits = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/deposits/pending`, { headers: { Authorization: `Bearer ${token}` } });
      if(!res.ok) throw new Error("API Error");
      const data = await res.json();
      setDeposits(data);
    } catch (e) { setDeposits([]); }
  };

  const fetchWithdrawals = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/withdrawals/pending`, { headers: { Authorization: `Bearer ${token}` } });
      if(!res.ok) throw new Error("API Error");
      const data = await res.json();
      setWithdrawalList(data);
    } catch (e) { 
        // Mock withdrawals for preview
        setWithdrawalList([{ id: 'w1', user: { fullName: 'John Doe', email: 'john@example.com' }, amount: 25000, currency: 'USD', reference: 'WTH-8821', createdAt: new Date().toISOString() }]);
    }
  };
  
  const setWithdrawalList = (data: any) => setWithdrawals(data);

  const fetchTreasury = async () => {
    try {
        const [tRes, mRes] = await Promise.all([
            fetch(`${API_BASE_URL}/admin/treasury`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${API_BASE_URL}/admin/multisig`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setTreasury(await tRes.json());
        setMultisigRequests(await mRes.json());
    } catch (e) {
        setTreasury({ hotWallet: 50000, warmWallet: 150000, coldWallet: 1200000, reserveRatio: 1 });
        setMultisigRequests([]);
    }
  };

  const fetchRisk = async () => {
      try {
          const res = await fetch(`${API_BASE_URL}/admin/compliance/alerts`, { headers: { Authorization: `Bearer ${token}` } });
          setAlerts(await res.json());
      } catch (e) {}
  };

  const fetchSystemLogs = async () => {
      setLogsLoading(true);
      try {
          const params = new URLSearchParams();
          if (logsFilter.actionType) params.append('actionType', logsFilter.actionType);
          if (logsFilter.adminId) params.append('adminId', logsFilter.adminId);
          
          const res = await fetch(`${API_BASE_URL}/admin/logs?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
          if(res.ok) {
              const result = await res.json();
              setSystemLogs(result.data || []);
          }
      } catch (e) {
          console.warn("Failed to fetch logs");
      } finally {
          setLogsLoading(false);
      }
  };

  // --- ACTIONS ---

  const handleApproval = async (id: string, action: 'approve' | 'refund') => {
    try {
      await fetch(`${API_BASE_URL}/admin/approvals/${id}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchApprovals();
      fetchStats();
    } catch (e) { alert("Action simulated"); }
  };

  const handleDepositAction = async (id: string, action: 'approve' | 'reject') => {
      try {
          await fetch(`${API_BASE_URL}/admin/deposits/${id}/${action}`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` }
          });
          fetchDeposits();
          fetchStats();
      } catch (e) { alert("Deposit action simulated"); }
  };

  const handleWithdrawalAction = async (id: string, action: 'approve' | 'reject') => {
      try {
          await fetch(`${API_BASE_URL}/admin/withdrawals/${id}/${action}`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` }
          });
          fetchWithdrawals();
          fetchStats();
      } catch (e) { alert("Withdrawal action simulated"); }
  };

  const verifyUser = async (id: string) => {
    try {
      await fetch(`${API_BASE_URL}/admin/investors/${id}/verify`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
      fetchInvestors();
    } catch (e) {}
  };

  // --- WALLET CONTROL ---

  const openWalletModal = (user: any) => {
      setWalletModal({ isOpen: true, userId: user.id, userName: user.fullName });
      setWalletForm({ type: 'CREDIT', amount: '', reason: '' });
  };

  const submitWalletAdjustment = async () => {
      if (!walletForm.amount || !walletForm.reason || !walletModal.userId) return;
      setWalletLoading(true);
      
      try {
          const endpoint = walletForm.type === 'CREDIT' ? 'credit' : 'debit';
          const res = await fetch(`${API_BASE_URL}/admin/wallets/${walletModal.userId}/${endpoint}`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` 
              },
              body: JSON.stringify({
                  amount: parseFloat(walletForm.amount),
                  reason: walletForm.reason
              })
          });
          
          if (!res.ok) throw new Error('Action failed');
          
          alert(`Successfully ${walletForm.type === 'CREDIT' ? 'credited' : 'debited'} wallet.`);
          setWalletModal({ isOpen: false, userId: null, userName: '' });
          fetchStats(); // Refresh totals
      } catch (e) {
          alert('Failed to adjust wallet. Ensure backend is reachable.');
      } finally {
          setWalletLoading(false);
      }
  };

  // --- DIAGNOSTICS ---

  const runSystemDiagnostics = async () => {
      setRunningDiag(true);
      try {
          const res = await fetch(`${API_BASE_URL}/admin/diagnostics/run`, { headers: { Authorization: `Bearer ${token}` } });
          setDiagResults(await res.json());
      } catch (e) { setDiagResults({ error: 'Failed' }); }
      setTimeout(() => setRunningDiag(false), 800);
  };

  return (
    <div className="pt-20 min-h-screen bg-navy-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto py-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-serif text-white">Admin Command Center</h1>
                <p className="text-slate-400 text-sm mt-1">Platform Control & Oversight</p>
            </div>
            <div className="flex gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-navy-800 px-3 py-1.5 rounded border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    System Active
                </div>
                <button 
                    onClick={() => navigate('/admin/assets/new')}
                    className="flex items-center gap-2 bg-gold-600 hover:bg-gold-500 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                >
                    <Plus size={16} /> Create Asset
                </button>
            </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-8 border-b border-white/10 overflow-x-auto pb-1 no-scrollbar">
          {['overview', 'investors', 'approvals', 'deposits', 'withdrawals', 'logs', 'treasury', 'risk', 'diagnostics'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-all whitespace-nowrap rounded-t-lg ${
                activeTab === tab 
                ? 'bg-navy-800 text-gold-500 border-t border-x border-white/10' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'approvals' && (stats?.activeInvestments > 0) ? (
                <span className="flex items-center gap-2">Approvals <span className="bg-amber-500 text-navy-900 px-1.5 py-0.5 rounded-full text-[10px] font-bold">{stats.activeInvestments}</span></span>
              ) : tab === 'deposits' && (stats?.pendingDeposits > 0) ? (
                <span className="flex items-center gap-2">Deposits <span className="bg-blue-500 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold">{stats.pendingDeposits}</span></span>
              ) : tab === 'withdrawals' && (stats?.pendingWithdrawals > 0) ? (
                <span className="flex items-center gap-2">Withdrawals <span className="bg-rose-500 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold">{stats.pendingWithdrawals}</span></span>
              ) : tab}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        
        {/* OVERVIEW */}
        {activeTab === 'overview' && stats && (
          <div className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                  { label: 'Total Users', val: stats.totalUsers, icon: <Users /> },
                  { label: 'Total Assets', val: stats.totalAssets, icon: <Briefcase /> },
                  { label: 'Est. AUM', val: `$${stats.totalAum.toLocaleString()}`, icon: <DollarSign /> },
                  { label: 'Pending Items', val: (stats.pendingDeposits || 0) + (stats.pendingWithdrawals || 0), icon: <Activity /> }
                ].map((s, i) => (
                  <div key={i} className="bg-navy-800 p-6 rounded border border-white/5">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-gold-500">{s.icon}</div>
                    </div>
                    <div className="text-2xl font-serif text-white">{s.val}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Financial Health Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-navy-800 p-6 rounded border border-emerald-500/20">
                      <div className="flex items-center gap-3 mb-2">
                          <ArrowDownLeft className="text-emerald-500" />
                          <h3 className="text-sm font-medium text-emerald-400">Total Inflow</h3>
                      </div>
                      <p className="text-2xl text-white font-mono">${stats.platformInflow?.toLocaleString() || '0'}</p>
                      <p className="text-xs text-slate-500 mt-1">Approved Deposits</p>
                  </div>
                  <div className="bg-navy-800 p-6 rounded border border-rose-500/20">
                      <div className="flex items-center gap-3 mb-2">
                          <ArrowUpRight className="text-rose-500" />
                          <h3 className="text-sm font-medium text-rose-400">Total Outflow</h3>
                      </div>
                      <p className="text-2xl text-white font-mono">${stats.platformOutflow?.toLocaleString() || '0'}</p>
                      <p className="text-xs text-slate-500 mt-1">Approved Withdrawals</p>
                  </div>
                  <div className="bg-navy-800 p-6 rounded border border-gold-500/20">
                      <div className="flex items-center gap-3 mb-2">
                          <DollarSign className="text-gold-500" />
                          <h3 className="text-sm font-medium text-gold-400">Net Platform Profit</h3>
                      </div>
                      <p className="text-2xl text-white font-mono">${stats.platformProfit?.toLocaleString() || '0'}</p>
                      <p className="text-xs text-slate-500 mt-1">Inflow - Outflow</p>
                  </div>
              </div>

              <div className="bg-navy-800 p-8 rounded border border-white/5 text-center">
                  <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-white font-medium">Activity Feed</h3>
                  <p className="text-slate-400 text-sm">Real-time system logs will appear here.</p>
              </div>
          </div>
        )}

        {/* INVESTORS */}
        {activeTab === 'investors' && (
          <div className="bg-navy-800 rounded border border-white/5 overflow-hidden animate-fade-in">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-navy-950">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {investors.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-white">{inv.fullName}</div>
                      <div className="text-xs text-slate-500">{inv.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">{inv.investorType}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                        inv.kycStatus === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {inv.kycStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-3 items-center">
                      {inv.kycStatus !== 'APPROVED' && (
                        <button onClick={() => verifyUser(inv.id)} className="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 px-2 py-1 rounded">Verify KYC</button>
                      )}
                      <button 
                        onClick={() => openWalletModal(inv)}
                        className="flex items-center gap-1 text-xs bg-navy-900 hover:bg-navy-950 text-gold-500 px-3 py-1.5 rounded border border-gold-500/20 transition-colors"
                      >
                        <Wallet size={12} /> Funds
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* APPROVALS (INVESTMENTS) */}
        {activeTab === 'approvals' && (
          <div className="bg-navy-800 rounded border border-white/5 overflow-hidden animate-fade-in">
            {approvals.length === 0 ? <div className="p-12 text-center text-slate-400">No pending investments.</div> : (
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-navy-950">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Investor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Asset</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Amount</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {approvals.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-white">{item.user?.fullName}</div>
                        <div className="text-xs text-slate-500">{item.user?.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">{item.asset?.title}</td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-white">${item.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button onClick={() => handleApproval(item.id, 'approve')} className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded hover:bg-emerald-500/20"><CheckCircle size={16}/></button>
                        <button onClick={() => handleApproval(item.id, 'refund')} className="p-1.5 bg-rose-500/10 text-rose-500 rounded hover:bg-rose-500/20"><XCircle size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* DEPOSITS */}
        {activeTab === 'deposits' && (
          <div className="bg-navy-800 rounded border border-white/5 overflow-hidden animate-fade-in">
            <div className="p-4 bg-navy-950 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-white font-medium flex items-center gap-2"><Download size={16} className="text-blue-500" /> Pending Deposits</h3>
                <span className="text-xs text-slate-500">Validate Transaction Hashes before approving.</span>
            </div>
            {deposits.length === 0 ? <div className="p-12 text-center text-slate-400">No pending deposits.</div> : (
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-navy-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">TxHash</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Amount</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {deposits.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-white">{item.user?.fullName}</div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-blue-400 truncate max-w-[150px]">{item.metadata?.txHash || 'N/A'}</td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-emerald-400">+{item.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button onClick={() => handleDepositAction(item.id, 'approve')} className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded">Confirm</button>
                        <button onClick={() => handleDepositAction(item.id, 'reject')} className="text-xs bg-navy-700 hover:bg-navy-600 text-slate-300 px-3 py-1.5 rounded">Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* WITHDRAWALS */}
        {activeTab === 'withdrawals' && (
          <div className="bg-navy-800 rounded border border-white/5 overflow-hidden animate-fade-in">
            <div className="p-4 bg-navy-950 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-white font-medium flex items-center gap-2"><ArrowUpRight size={16} className="text-rose-500" /> Pending Withdrawals</h3>
                <span className="text-xs text-slate-500">High-value exits require dual-signoff (simulated).</span>
            </div>
            {withdrawals.length === 0 ? <div className="p-12 text-center text-slate-400">No pending withdrawals.</div> : (
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-navy-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Destination</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Amount</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {withdrawals.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-white">{item.user?.fullName}</div>
                        <div className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-300 truncate max-w-[150px]">
                        {item.metadata?.address || 'Bank Wire'}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-rose-400">
                        -{item.amount.toLocaleString()} {item.currency}
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button onClick={() => handleWithdrawalAction(item.id, 'approve')} className="text-xs bg-gold-600 hover:bg-gold-500 text-white px-3 py-1.5 rounded">Approve</button>
                        <button onClick={() => handleWithdrawalAction(item.id, 'reject')} className="text-xs bg-rose-900/50 hover:bg-rose-900 text-rose-200 border border-rose-500/20 px-3 py-1.5 rounded">Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* LOGS - NEW TAB */}
        {activeTab === 'logs' && (
            <div className="bg-navy-800 rounded border border-white/5 overflow-hidden animate-fade-in">
                <div className="p-4 bg-navy-950 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="text-white font-medium flex items-center gap-2"><List size={16} className="text-slate-400" /> Admin Activity Log</h3>
                    
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative">
                            <select 
                                value={logsFilter.actionType}
                                onChange={(e) => {
                                    setLogsFilter({...logsFilter, actionType: e.target.value});
                                    fetchSystemLogs(); // Trigger fetch on change for simplicity
                                }}
                                className="bg-navy-800 text-xs text-slate-300 border border-white/10 rounded px-3 py-1.5 focus:border-gold-500 outline-none appearance-none pr-8"
                            >
                                <option value="">All Actions</option>
                                <option value="APPROVE_DEPOSIT">Approve Deposit</option>
                                <option value="APPROVE_WITHDRAWAL">Approve Withdrawal</option>
                                <option value="MANUAL_CREDIT">Manual Credit</option>
                                <option value="MANUAL_DEBIT">Manual Debit</option>
                                <option value="VERIFY_USER">Verify User</option>
                                <option value="CREATE_ASSET">Create Asset</option>
                            </select>
                        </div>
                        <button onClick={fetchSystemLogs} className="bg-navy-700 hover:bg-navy-600 text-slate-300 p-1.5 rounded border border-white/10"><Search size={14} /></button>
                    </div>
                </div>

                {logsLoading ? (
                    <div className="p-12 text-center"><Loader2 className="animate-spin text-gold-500 mx-auto" /></div>
                ) : systemLogs.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 text-sm">No activity logs found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-white/10">
                            <thead className="bg-navy-900">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Timestamp</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Admin</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Action</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Target</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {systemLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-white/5">
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-mono">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-300">
                                            {log.admin?.email || log.adminId.substring(0,8)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                                                log.actionType.includes('APPROVE') ? 'bg-emerald-500/10 text-emerald-400' :
                                                log.actionType.includes('REJECT') ? 'bg-rose-500/10 text-rose-400' :
                                                log.actionType.includes('MANUAL') ? 'bg-amber-500/10 text-amber-400' : 
                                                'bg-blue-500/10 text-blue-400'
                                            }`}>
                                                {log.actionType.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400 font-mono">
                                            {log.targetType}: {log.targetId ? log.targetId.substring(0,8) : 'N/A'}...
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-bold text-white">
                                            {log.amount ? `${log.amount.toLocaleString()} ${log.currency || 'USD'}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="group relative inline-block">
                                                <FileText size={14} className="text-slate-500 cursor-pointer hover:text-white" />
                                                <div className="absolute right-0 top-6 w-64 bg-navy-950 border border-white/10 rounded p-3 text-[10px] text-slate-300 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 whitespace-normal break-words">
                                                    {log.details}
                                                    <div className="mt-2 pt-2 border-t border-white/5 text-slate-500">IP: {log.ipAddress}</div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        )}

        {/* DIAGNOSTICS */}
        {activeTab === 'diagnostics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                <div className="bg-navy-800 border border-white/5 rounded-lg p-6">
                    <h3 className="text-white font-medium mb-4 flex items-center gap-2"><Terminal size={18} className="text-gold-500" /> System Health Check</h3>
                    <button 
                        onClick={runSystemDiagnostics} 
                        disabled={runningDiag}
                        className="bg-navy-700 hover:bg-navy-600 text-white px-6 py-2 rounded text-sm font-medium disabled:opacity-50 flex items-center gap-2 w-full justify-center border border-white/10"
                    >
                        {runningDiag ? <Loader2 className="animate-spin" /> : 'Run Diagnostics Suite'}
                    </button>
                    {diagResults && (
                        <div className="mt-4 bg-black/30 p-3 rounded text-xs font-mono text-green-400 overflow-auto max-h-40">
                            {JSON.stringify(diagResults, null, 2)}
                        </div>
                    )}
                </div>
            </div>
        )}

      </div>

      {/* WALLET CONTROL MODAL */}
      {walletModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/90 backdrop-blur-sm animate-fade-in">
              <div className="bg-navy-800 rounded-lg shadow-2xl border border-white/10 w-full max-w-md p-6">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-serif text-white">Manage Funds</h3>
                      <button onClick={() => setWalletModal({ isOpen: false, userId: null, userName: '' })} className="text-slate-400 hover:text-white"><X size={20}/></button>
                  </div>
                  
                  <div className="mb-6 p-3 bg-navy-900 rounded border border-white/5 text-sm text-slate-300">
                      Adjusting balance for: <span className="text-white font-bold">{walletModal.userName}</span>
                  </div>

                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm text-slate-400 mb-2">Action</label>
                          <div className="grid grid-cols-2 gap-3">
                              <button 
                                onClick={() => setWalletForm({...walletForm, type: 'CREDIT'})}
                                className={`py-2 rounded text-sm font-bold transition-colors ${walletForm.type === 'CREDIT' ? 'bg-emerald-600 text-white' : 'bg-navy-900 text-slate-400'}`}
                              >
                                  CREDIT (+)
                              </button>
                              <button 
                                onClick={() => setWalletForm({...walletForm, type: 'DEBIT'})}
                                className={`py-2 rounded text-sm font-bold transition-colors ${walletForm.type === 'DEBIT' ? 'bg-rose-600 text-white' : 'bg-navy-900 text-slate-400'}`}
                              >
                                  DEBIT (-)
                              </button>
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm text-slate-400 mb-1">Amount (USD)</label>
                          <input 
                            type="number" 
                            value={walletForm.amount}
                            onChange={(e) => setWalletForm({...walletForm, amount: e.target.value})}
                            className="w-full bg-navy-900 border border-white/10 rounded p-2 text-white focus:border-gold-500 outline-none"
                            placeholder="0.00"
                          />
                      </div>

                      <div>
                          <label className="block text-sm text-slate-400 mb-1">Audit Reason (Required)</label>
                          <textarea 
                            value={walletForm.reason}
                            onChange={(e) => setWalletForm({...walletForm, reason: e.target.value})}
                            className="w-full bg-navy-900 border border-white/10 rounded p-2 text-white focus:border-gold-500 outline-none text-sm"
                            placeholder="e.g. Wire transfer received REF#9982"
                            rows={2}
                          />
                      </div>

                      <button 
                        onClick={submitWalletAdjustment}
                        disabled={walletLoading || !walletForm.amount || !walletForm.reason}
                        className="w-full bg-gold-600 hover:bg-gold-500 text-white py-3 rounded font-medium disabled:opacity-50 flex justify-center items-center gap-2 mt-2"
                      >
                        {walletLoading ? <Loader2 className="animate-spin" /> : 'Execute Adjustment'}
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default AdminDashboard;
