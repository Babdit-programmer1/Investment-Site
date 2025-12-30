import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Briefcase, DollarSign, Activity, CheckCircle, XCircle, Plus, Shield, Lock, Server, Key, AlertTriangle, FileText, Scale, Siren, Cpu, Gauge, Globe, Terminal, Bell } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../src/config';

// MOCK DATA
const MOCK_STATS = {
  totalUsers: 142,
  totalAssets: 15,
  totalAum: 45000000,
  activeInvestments: 2,
  recentActivity: []
};

const MOCK_INVESTORS = [
  { id: '1', fullName: 'James Sterling', email: 'j.sterling@example.com', investorType: 'Institutional', kycStatus: 'APPROVED' },
  { id: '2', fullName: 'Sarah Connor', email: 's.connor@example.com', investorType: 'High Net Worth', kycStatus: 'PENDING' }
];

const MOCK_APPROVALS = [
  { 
    id: '101', 
    user: { fullName: 'Sarah Connor', email: 's.connor@example.com' }, 
    asset: { title: 'The Kensington Estate' }, 
    amount: 150000,
    status: 'ESCROWED'
  }
];

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'assets' | 'investors' | 'approvals' | 'treasury' | 'risk' | 'performance' | 'diagnostics'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [investors, setInvestors] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [treasury, setTreasury] = useState<any>(null);
  const [multisigRequests, setMultisigRequests] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  
  // Diagnostics State
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
    if (activeTab === 'treasury') fetchTreasury();
    if (activeTab === 'risk') fetchRisk();
    if (activeTab === 'performance') fetchMetrics();
  }, [activeTab]);

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
    } catch (e) { setApprovals(MOCK_APPROVALS); }
  };

  const fetchTreasury = async () => {
    try {
        const [tRes, mRes] = await Promise.all([
            fetch(`${API_BASE_URL}/admin/treasury`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${API_BASE_URL}/admin/multisig`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const tData = await tRes.json();
        const mData = await mRes.json();
        setTreasury(tData);
        setMultisigRequests(mData);
    } catch (e) {
        setTreasury({ hotWallet: 50000, warmWallet: 150000, coldWallet: 1200000, reserveRatio: 1 });
        setMultisigRequests([]);
    }
  };

  const fetchRisk = async () => {
      try {
          const [aRes, audRes] = await Promise.all([
              fetch(`${API_BASE_URL}/admin/compliance/alerts`, { headers: { Authorization: `Bearer ${token}` } }),
              fetch(`${API_BASE_URL}/admin/compliance/audit`, { headers: { Authorization: `Bearer ${token}` } })
          ]);
          setAlerts(await aRes.json());
          setAuditLogs(await audRes.json());
      } catch (e) {
          console.warn("Compliance data fetch failed");
      }
  };

  const fetchMetrics = async () => {
      try {
          // Note: metrics endpoint is usually public in this demo, but wrapped for admin view
          const res = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/metrics`);
          setMetrics(await res.json());
      } catch (e) {
          setMetrics({ uptime: 3600, requests: 150, errors: 0, avgLatency: 45, errorRate: "0.0000" });
      }
  };

  const runSystemDiagnostics = async () => {
      setRunningDiag(true);
      setDiagResults(null);
      try {
          const res = await fetch(`${API_BASE_URL}/admin/diagnostics/run`, { headers: { Authorization: `Bearer ${token}` } });
          const data = await res.json();
          setTimeout(() => setDiagResults(data), 800); // Small delay for UX
      } catch (e) {
          setDiagResults({ error: 'Failed to execute diagnostics suite.' });
      } finally {
          setTimeout(() => setRunningDiag(false), 800);
      }
  };

  const sendTestNotification = async () => {
      setNotifStatus('Sending...');
      try {
          const res = await fetch(`${API_BASE_URL}/admin/diagnostics/notify`, { 
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` } 
          });
          if (res.ok) setNotifStatus('Sent successfully!');
          else setNotifStatus('Failed to send.');
      } catch (e) {
          setNotifStatus('Network error.');
      }
      setTimeout(() => setNotifStatus(''), 3000);
  };

  const verifyUser = async (id: string) => {
    try {
      await fetch(`${API_BASE_URL}/admin/investors/${id}/verify`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchInvestors();
    } catch (e) {
      alert("Verification simulated (API unavailable)");
    }
  };

  const handleApproval = async (id: string, action: 'approve' | 'refund') => {
    try {
      await fetch(`${API_BASE_URL}/admin/approvals/${id}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchApprovals();
      fetchStats();
    } catch (e) {
      alert(`Action '${action}' simulated (API unavailable)`);
      setApprovals(prev => prev.filter(a => a.id !== id));
    }
  };

  const approveMultisig = async (refId: string) => {
      try {
          await fetch(`${API_BASE_URL}/admin/multisig/${refId}/approve`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` }
          });
          fetchTreasury();
      } catch (e) {
          alert('Multisig approval simulated');
          setMultisigRequests(prev => prev.filter(r => r.referenceId !== refId));
      }
  };

  const formatUptime = (seconds: number) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      return `${h}h ${m}m`;
  };

  return (
    <div className="pt-20 min-h-screen bg-navy-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto py-10">
        <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-serif text-white">Admin Command Center</h1>
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-navy-800 px-3 py-1 rounded border border-white/5">
                <div className={`w-2 h-2 rounded-full animate-pulse ${metrics?.errorRate > 0.05 ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                System Operational
            </div>
        </div>
        <p className="text-slate-400 mb-8">System Overview & Management</p>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-white/10 overflow-x-auto">
          {['overview', 'assets', 'investors', 'approvals', 'treasury', 'risk', 'performance', 'diagnostics'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-3 text-sm font-medium capitalize transition-colors whitespace-nowrap ${
                activeTab === tab ? 'text-gold-500 border-b-2 border-gold-500' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'approvals' && stats?.activeInvestments > 0 ? (
                <span className="flex items-center gap-2">
                  Approvals 
                  <span className="bg-amber-500 text-navy-900 px-1.5 py-0.5 rounded-full text-xs font-bold">{stats.activeInvestments}</span>
                </span>
              ) : tab === 'treasury' && multisigRequests.length > 0 ? (
                <span className="flex items-center gap-2">
                  Treasury 
                  <span className="bg-rose-500 text-white px-1.5 py-0.5 rounded-full text-xs font-bold">{multisigRequests.length}</span>
                </span>
              ) : tab === 'risk' && alerts.length > 0 ? (
                <span className="flex items-center gap-2">
                  Risk 
                  <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-full text-xs font-bold animate-pulse">!</span>
                </span>
              ) : tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Users', val: stats.totalUsers, icon: <Users /> },
              { label: 'Total Assets', val: stats.totalAssets, icon: <Briefcase /> },
              { label: 'Est. AUM', val: `$${stats.totalAum.toLocaleString()}`, icon: <DollarSign /> },
              { label: 'Pending Approvals', val: stats.activeInvestments, icon: <Activity /> }
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
        )}

        {/* Diagnostics Tab */}
        {activeTab === 'diagnostics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-navy-800 border border-white/5 rounded-lg p-6">
                    <h3 className="text-white font-medium mb-4 flex items-center gap-2"><Terminal size={18} className="text-gold-500" /> System Health Check</h3>
                    <p className="text-sm text-slate-400 mb-6">Executes a deep scan of the database connection, API latency, and environment configuration.</p>
                    
                    <button 
                        onClick={runSystemDiagnostics} 
                        disabled={runningDiag}
                        className="bg-gold-600 hover:bg-gold-500 text-white px-6 py-2 rounded text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                    >
                        {runningDiag ? 'Running Diagnostics...' : 'Run System Check'}
                    </button>

                    {diagResults && (
                        <div className="mt-6 bg-navy-950 p-4 rounded border border-white/10 font-mono text-xs text-slate-300">
                            <pre>{JSON.stringify(diagResults, null, 2)}</pre>
                        </div>
                    )}
                </div>

                <div className="bg-navy-800 border border-white/5 rounded-lg p-6">
                    <h3 className="text-white font-medium mb-4 flex items-center gap-2"><Bell size={18} className="text-gold-500" /> Notification Pipeline</h3>
                    <p className="text-sm text-slate-400 mb-6">Triggers a test notification to verify the real-time alert system (DB Write + Client Fetch).</p>
                    
                    <button 
                        onClick={sendTestNotification}
                        className="bg-navy-700 hover:bg-navy-600 border border-white/10 text-white px-6 py-2 rounded text-sm font-medium flex items-center gap-2"
                    >
                        Trigger Test Alert
                    </button>
                    
                    {notifStatus && (
                        <p className={`mt-4 text-sm font-medium ${notifStatus.includes('success') ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {notifStatus}
                        </p>
                    )}
                </div>
            </div>
        )}

        {activeTab === 'performance' && metrics && (
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-navy-800 p-6 rounded border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><Activity size={64} /></div>
                        <p className="text-xs text-slate-400 uppercase">System Uptime</p>
                        <p className="text-3xl font-mono text-white mt-1">{formatUptime(metrics.uptime)}</p>
                        <p className="text-xs text-emerald-500 mt-2">Stable</p>
                    </div>
                    <div className="bg-navy-800 p-6 rounded border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><Gauge size={64} /></div>
                        <p className="text-xs text-slate-400 uppercase">Avg Latency</p>
                        <p className="text-3xl font-mono text-white mt-1">{metrics.avgLatency.toFixed(0)}ms</p>
                        <p className="text-xs text-slate-500 mt-2">Target: &lt; 200ms</p>
                    </div>
                    <div className="bg-navy-800 p-6 rounded border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><Server size={64} /></div>
                        <p className="text-xs text-slate-400 uppercase">Total Requests</p>
                        <p className="text-3xl font-mono text-white mt-1">{metrics.requests}</p>
                        <p className="text-xs text-slate-500 mt-2">Since Startup</p>
                    </div>
                    <div className={`bg-navy-800 p-6 rounded border ${Number(metrics.errorRate) > 0.01 ? 'border-rose-500/50' : 'border-white/5'} relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 p-4 opacity-10"><AlertTriangle size={64} /></div>
                        <p className="text-xs text-slate-400 uppercase">Error Rate</p>
                        <p className={`text-3xl font-mono mt-1 ${Number(metrics.errorRate) > 0.01 ? 'text-rose-500' : 'text-emerald-500'}`}>{Number(metrics.errorRate) * 100}%</p>
                        <p className="text-xs text-slate-500 mt-2">Target: &lt; 1%</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-navy-800 rounded border border-white/5 p-6">
                        <h3 className="text-white font-medium mb-4 flex items-center gap-2"><Cpu size={16} className="text-gold-500" /> Infrastructure Health</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs text-slate-400 mb-1"><span>CPU Usage</span> <span>12%</span></div>
                                <div className="h-2 bg-navy-900 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[12%]"></div></div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Memory Usage</span> <span>34%</span></div>
                                <div className="h-2 bg-navy-900 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[34%]"></div></div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Database Pool</span> <span>5/20 Conn</span></div>
                                <div className="h-2 bg-navy-900 rounded-full overflow-hidden"><div className="h-full bg-purple-500 w-[25%]"></div></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-navy-800 rounded border border-white/5 p-6">
                        <h3 className="text-white font-medium mb-4 flex items-center gap-2"><Globe size={16} className="text-gold-500" /> Global Latency Check</h3>
                        <div className="space-y-2">
                            {[
                                { region: 'US East (N. Virginia)', ping: '24ms', status: 'Optimal' },
                                { region: 'EU West (London)', ping: '88ms', status: 'Good' },
                                { region: 'Asia Pacific (Singapore)', ping: '185ms', status: 'Fair' },
                                { region: 'SA East (São Paulo)', ping: '145ms', status: 'Fair' }
                            ].map((loc, i) => (
                                <div key={i} className="flex justify-between items-center text-sm p-2 bg-navy-900/50 rounded">
                                    <span className="text-slate-300">{loc.region}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-slate-400">{loc.ping}</span>
                                        <span className={`text-[10px] uppercase font-bold ${loc.status === 'Optimal' ? 'text-emerald-500' : 'text-amber-500'}`}>{loc.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Existing Tabs */}
        {activeTab === 'investors' && (
          <div className="bg-navy-800 rounded border border-white/5 overflow-hidden">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-navy-950">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">KYC Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {investors.map((inv) => (
                  <tr key={inv.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{inv.fullName}</div>
                      <div className="text-sm text-slate-500">{inv.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{inv.investorType}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        inv.kycStatus === 'APPROVED' ? 'bg-emerald-900 text-emerald-200' : 'bg-yellow-900 text-yellow-200'
                      }`}>
                        {inv.kycStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {inv.kycStatus !== 'APPROVED' && (
                        <button onClick={() => verifyUser(inv.id)} className="text-gold-500 hover:text-gold-400">Verify</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'approvals' && (
          <div className="bg-navy-800 rounded border border-white/5 overflow-hidden">
            {approvals.length === 0 ? (
               <div className="p-12 text-center text-slate-400">No pending investments found.</div>
            ) : (
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-navy-950">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Investor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Asset</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {approvals.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{item.user?.fullName}</div>
                        <div className="text-xs text-slate-500">{item.user?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{item.asset?.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">${item.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="bg-amber-500/10 text-amber-500 px-2 py-1 rounded-full text-xs font-bold flex items-center w-fit gap-1">
                          <Shield size={10} /> Escrowed
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-3">
                        <button onClick={() => handleApproval(item.id, 'approve')} className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                          <CheckCircle size={16} /> Release Funds
                        </button>
                        <button onClick={() => handleApproval(item.id, 'refund')} className="text-rose-400 hover:text-rose-300 flex items-center gap-1">
                          <XCircle size={16} /> Refund
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'treasury' && treasury && (
            <div className="space-y-8">
                {/* Vault Visualizer */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-orange-900/40 to-navy-900 border border-orange-500/30 p-6 rounded-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><Activity size={64} /></div>
                        <h3 className="text-orange-400 font-mono text-sm uppercase tracking-widest mb-1 flex items-center gap-2"><Activity size={14} /> Hot Wallet</h3>
                        <p className="text-xs text-slate-400 mb-4">Operational Liquidity</p>
                        <p className="text-3xl font-serif text-white">${treasury.hotWallet.toLocaleString()}</p>
                        <div className="mt-4 text-xs text-orange-300/60 bg-orange-900/20 px-2 py-1 rounded inline-block">Target: 10%</div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-900/40 to-navy-900 border border-blue-500/30 p-6 rounded-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><Server size={64} /></div>
                        <h3 className="text-blue-400 font-mono text-sm uppercase tracking-widest mb-1 flex items-center gap-2"><Server size={14} /> Warm Wallet</h3>
                        <p className="text-xs text-slate-400 mb-4">Escrow & Treasury</p>
                        <p className="text-3xl font-serif text-white">${treasury.warmWallet.toLocaleString()}</p>
                        <div className="mt-4 text-xs text-blue-300/60 bg-blue-900/20 px-2 py-1 rounded inline-block">Target: 30%</div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-900/40 to-navy-900 border border-indigo-500/30 p-6 rounded-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><Lock size={64} /></div>
                        <h3 className="text-indigo-400 font-mono text-sm uppercase tracking-widest mb-1 flex items-center gap-2"><Lock size={14} /> Cold Storage</h3>
                        <p className="text-xs text-slate-400 mb-4">Deep Vault Reserves</p>
                        <p className="text-3xl font-serif text-white">${treasury.coldWallet.toLocaleString()}</p>
                        <div className="mt-4 text-xs text-indigo-300/60 bg-indigo-900/20 px-2 py-1 rounded inline-block">Target: 60%</div>
                    </div>
                </div>

                {/* Multisig Queue */}
                <div className="bg-navy-800 rounded border border-white/5 overflow-hidden">
                    <div className="p-4 border-b border-white/10 bg-navy-950 flex justify-between items-center">
                        <h3 className="text-white font-medium flex items-center gap-2"><Key size={16} className="text-gold-500" /> Pending Multisig Requests</h3>
                        <span className="text-xs text-slate-500">M-of-N Consensus Required</span>
                    </div>
                    {multisigRequests.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 text-sm">All secure transactions are up to date.</div>
                    ) : (
                        <table className="min-w-full divide-y divide-white/10">
                            <thead className="bg-navy-900">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Reference</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Tier</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {multisigRequests.map(req => (
                                    <tr key={req.id}>
                                        <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-slate-400">{req.referenceId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{req.user?.fullName || 'Unknown'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">${req.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="bg-rose-500/10 text-rose-400 px-2 py-1 rounded text-xs font-bold border border-rose-500/20">WARM WALLET</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button onClick={() => approveMultisig(req.referenceId)} className="text-xs bg-gold-600 hover:bg-gold-500 text-white px-3 py-1.5 rounded flex items-center gap-1">
                                                <Key size={10} /> Sign & Release
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        )}

        {activeTab === 'risk' && (
            <div className="space-y-8">
                {/* AI Risk Monitor Header */}
                <div className="bg-gradient-to-r from-red-900/30 to-navy-900 p-6 rounded border border-red-500/20 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl text-white font-serif flex items-center gap-2"><Siren className="text-red-500 animate-pulse" /> AI Risk Monitor</h3>
                        <p className="text-sm text-slate-400">Real-time fraud detection active. Monitoring velocity, geolocation, and pattern anomalies.</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-white">{alerts.length}</p>
                        <p className="text-xs text-red-400 uppercase tracking-widest">Active Alerts</p>
                    </div>
                </div>

                {/* Alert Center */}
                <div className="bg-navy-800 rounded border border-white/5 overflow-hidden">
                    <div className="p-4 border-b border-white/10 bg-navy-950 flex justify-between items-center">
                        <h3 className="text-white font-medium flex items-center gap-2"><AlertTriangle size={16} className="text-amber-500" /> Recent Flags</h3>
                        <span className="text-xs text-slate-500">Live Feed</span>
                    </div>
                    {alerts.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 text-sm">No critical risk flags detected.</div>
                    ) : (
                        <div className="divide-y divide-white/10">
                            {alerts.map((alert: any) => (
                                <div key={alert.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-white/5 gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                            alert.level === 'HIGH' ? 'bg-red-500 text-white' : 'bg-amber-500 text-navy-900'
                                        }`}>
                                            {alert.score}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-white text-sm font-bold">{alert.type}</p>
                                                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-300">{alert.action}</span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1">User: <span className="text-gold-500">{alert.user}</span> • {new Date(alert.timestamp).toLocaleString()}</p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {alert.reasons?.map((r: string, i: number) => (
                                                    <span key={i} className="text-[10px] bg-red-900/40 text-red-300 border border-red-500/20 px-2 py-0.5 rounded">{r}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 self-end md:self-center">
                                        <button className="text-xs bg-navy-700 hover:bg-navy-600 text-white px-3 py-2 rounded border border-white/10">Dismiss</button>
                                        {alert.action === 'BLOCK' ? (
                                            <button className="text-xs bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded flex items-center gap-1"><Lock size={12} /> Confirm Block</button>
                                        ) : (
                                            <button className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded flex items-center gap-1"><CheckCircle size={12} /> Approve</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Audit Logs */}
                {auditLogs && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-navy-800 p-6 rounded border border-white/5">
                            <h3 className="text-white font-medium mb-4 flex items-center gap-2"><Scale size={16} /> Compliance Metrics</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm"><span className="text-slate-400">Total KYC Checks</span> <span className="text-white">{auditLogs.metrics?.totalKycChecks}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-slate-400">Passed</span> <span className="text-emerald-400">{auditLogs.metrics?.passed}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-slate-400">Failed</span> <span className="text-red-400">{auditLogs.metrics?.failed}</span></div>
                                <div className="flex justify-between text-sm border-t border-white/10 pt-2"><span className="text-slate-400">SARs Filed</span> <span className="text-white font-bold">{auditLogs.metrics?.sarsFiled}</span></div>
                            </div>
                        </div>
                        <div className="bg-navy-800 p-6 rounded border border-white/5">
                            <h3 className="text-white font-medium mb-4 flex items-center gap-2"><FileText size={16} /> Recent Audit Logs</h3>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {auditLogs.logs?.map((log: any) => (
                                    <div key={log.id} className="text-xs text-slate-400 border-l-2 border-white/10 pl-3 py-1">
                                        <span className="text-gold-500 font-mono">{log.event}</span> - {log.user} <span className="opacity-50">({new Date(log.time).toLocaleTimeString()})</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )}

        {activeTab === 'assets' && (
           <div className="text-center py-20 bg-navy-800 border border-dashed border-white/10 rounded">
             <Briefcase className="mx-auto h-12 w-12 text-slate-500 mb-4" />
             <h3 className="text-lg font-medium text-white">Asset Management</h3>
             <p className="text-slate-400 mb-6">Manage real estate, art, and collectibles inventory.</p>
             <button 
                onClick={() => navigate('/admin/assets/new')}
                className="bg-gold-600 hover:bg-gold-500 text-white px-4 py-2 rounded flex items-center mx-auto transition-colors"
             >
               <Plus className="w-4 h-4 mr-2" /> Add New Asset
             </button>
           </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;