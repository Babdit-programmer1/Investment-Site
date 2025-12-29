import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Briefcase, DollarSign, Activity, CheckCircle, XCircle, Plus, Edit } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

const API_URL = 'http://localhost:3001/api/v1/admin';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'assets' | 'investors'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [investors, setInvestors] = useState<any[]>([]);
  const [token] = useState(localStorage.getItem('prestige_token'));

  // Redirect if not admin
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    fetchStats();
    fetchInvestors();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/stats`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setStats(data);
    } catch (e) { console.error(e); }
  };

  const fetchInvestors = async () => {
    try {
      const res = await fetch(`${API_URL}/investors`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setInvestors(data);
    } catch (e) { console.error(e); }
  };

  const verifyUser = async (id: string) => {
    await fetch(`${API_URL}/investors/${id}/verify`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchInvestors();
  };

  return (
    <div className="pt-20 min-h-screen bg-navy-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto py-10">
        <h1 className="text-3xl font-serif text-white mb-2">Admin Command Center</h1>
        <p className="text-slate-400 mb-8">System Overview & Management</p>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-white/10">
          {['overview', 'assets', 'investors'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab ? 'text-gold-500 border-b-2 border-gold-500' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Users', val: stats.totalUsers, icon: <Users /> },
              { label: 'Total Assets', val: stats.totalAssets, icon: <Briefcase /> },
              { label: 'Est. AUM', val: `$${stats.totalAum.toLocaleString()}`, icon: <DollarSign /> },
              { label: 'Active Deals', val: stats.activeInvestments, icon: <Activity /> }
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

        {activeTab === 'assets' && (
           <div className="text-center py-20 bg-navy-800 border border-dashed border-white/10 rounded">
             <Briefcase className="mx-auto h-12 w-12 text-slate-500 mb-4" />
             <h3 className="text-lg font-medium text-white">Asset Management</h3>
             <p className="text-slate-400 mb-6">Manage real estate, art, and collectibles inventory.</p>
             <button className="bg-gold-600 hover:bg-gold-500 text-white px-4 py-2 rounded flex items-center mx-auto">
               <Plus className="w-4 h-4 mr-2" /> Add New Asset
             </button>
           </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
