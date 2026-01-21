
import React, { useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { ArrowLeft, Loader2, AlertTriangle, ArrowUpRight, Check, X, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { useGlobal } from '../context/GlobalContext';

const { useNavigate } = ReactRouterDOM;

const AdminWithdrawals: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { convertPrice } = useGlobal();
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Access Control
  if (user?.role !== 'ADMIN') {
      return (
        <div className="min-h-screen bg-navy-900 pt-20 flex items-center justify-center">
            <div className="text-white text-center">
                <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                <h2 className="text-2xl font-serif">Access Denied</h2>
                <p className="text-slate-400 mt-2">You do not have permission to view this page.</p>
                <button onClick={() => navigate('/dashboard')} className="mt-6 text-gold-500 hover:text-white">Return to Dashboard</button>
            </div>
        </div>
      );
  }

  const loadData = async () => {
    setLoading(true);
    try {
        const data = await dataService.getAdminWithdrawals();
        setWithdrawals(Array.isArray(data) ? data : []);
    } catch (err) {
        console.error(err);
        setError('Failed to fetch pending withdrawals.');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
      setActionLoading(id);
      try {
          if (action === 'approve') {
              await dataService.approveWithdrawal(id);
          } else {
              await dataService.rejectWithdrawal(id);
          }
          // Remove from list
          setWithdrawals(prev => prev.filter(w => w.id !== id));
      } catch (e: any) {
          alert(`Failed to ${action} withdrawal: ${e.message}`);
      } finally {
          setActionLoading(null);
      }
  };

  const getMetadata = (jsonString: string) => {
      try {
          return JSON.parse(jsonString) || {};
      } catch {
          return {};
      }
  };

  return (
    <div className="pt-20 min-h-screen bg-navy-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto py-10">
        
        <div className="flex justify-between items-center mb-8">
            <button onClick={() => navigate('/admin/dashboard')} className="flex items-center text-slate-400 hover:text-white transition-colors">
                <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
            </button>
            <button onClick={loadData} className="text-slate-400 hover:text-white"><RefreshCw size={20} /></button>
        </div>

        <div className="bg-navy-800 rounded-lg border border-white/5 p-8 shadow-xl">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-navy-900 rounded-full border border-white/10">
                    <ArrowUpRight className="text-gold-500 w-6 h-6" />
                </div>
                <h1 className="text-2xl font-serif text-white">Pending Withdrawals</h1>
            </div>
            
            <p className="text-slate-400 mb-6 text-sm">
                Review and process user withdrawal requests. Ensure address validity before approving.
            </p>

            {error && (
                <div className="mb-6 p-4 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3">
                    <AlertTriangle size={18} /> {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gold-500" /></div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/10">
                        <thead className="bg-navy-950">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Network</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Destination</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {withdrawals.length === 0 ? (
                                <tr><td colSpan={5} className="p-12 text-center text-slate-500">No pending withdrawal requests.</td></tr>
                            ) : withdrawals.map((w) => {
                                const meta = getMetadata(w.metadata);
                                return (
                                    <tr key={w.id} className="hover:bg-white/5">
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-white font-medium">{w.user?.fullName}</div>
                                            <div className="text-xs text-slate-500">{w.user?.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gold-500 font-bold">{convertPrice(Number(w.amount))}</div>
                                            <div className="text-xs text-slate-500">{w.currency}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-900/50 text-blue-200">
                                                {meta.chain || 'ETH'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <code className="text-xs text-slate-300 bg-black/20 px-2 py-1 rounded">{meta.destinationAddress || 'N/A'}</code>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleAction(w.id, 'approve')}
                                                    disabled={!!actionLoading}
                                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded text-xs flex items-center transition-colors disabled:opacity-50"
                                                >
                                                    {actionLoading === w.id ? <Loader2 className="animate-spin w-3 h-3" /> : <Check size={14} className="mr-1" />} 
                                                    Approve
                                                </button>
                                                <button 
                                                    onClick={() => handleAction(w.id, 'reject')}
                                                    disabled={!!actionLoading}
                                                    className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1 rounded text-xs flex items-center transition-colors disabled:opacity-50"
                                                >
                                                    {actionLoading === w.id ? <Loader2 className="animate-spin w-3 h-3" /> : <X size={14} className="mr-1" />}
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AdminWithdrawals;
