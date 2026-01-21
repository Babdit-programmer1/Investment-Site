
import React, { useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { ArrowLeft, Save, Loader2, AlertTriangle, Wallet, Copy, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';

const { useNavigate } = ReactRouterDOM;

const AdminPlatformWallets: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [wallets, setWallets] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    chain: 'ETH',
    address: ''
  });

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

  const loadWallets = async () => {
    setLoading(true);
    try {
        const data = await dataService.getPlatformWallets();
        setWallets(data);
    } catch (err) {
        console.error(err);
        setError('Failed to fetch wallets.');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadWallets();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    if (!formData.address) {
        setError('Wallet address is required');
        setSaving(false);
        return;
    }

    try {
        await dataService.addPlatformWallet({
            chain: formData.chain,
            address: formData.address
        });
        setSuccess('Wallet updated successfully');
        setFormData({ ...formData, address: '' }); // Clear address
        loadWallets(); // Refresh list
    } catch (err: any) {
        setError(err.message || 'Failed to update wallet.');
    } finally {
        setSaving(false);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-navy-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto py-10">
        
        <button onClick={() => navigate('/admin/dashboard')} className="flex items-center text-slate-400 hover:text-white mb-8 transition-colors">
            <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
        </button>

        <div className="bg-navy-800 rounded-lg border border-white/5 p-8 shadow-xl mb-8">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-navy-900 rounded-full border border-white/10">
                    <Wallet className="text-gold-500 w-6 h-6" />
                </div>
                <h1 className="text-2xl font-serif text-white">Platform Wallets</h1>
            </div>
            
            <p className="text-slate-400 mb-6 text-sm">
                Manage the deposit addresses displayed to investors. Updating a chain will overwrite the previous active address.
            </p>

            {error && (
                <div className="mb-6 p-4 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3">
                    <AlertTriangle size={18} /> {error}
                </div>
            )}

            {success && (
                <div className="mb-6 p-4 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-3">
                    <CheckCircle size={18} /> {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-navy-900/50 p-6 rounded border border-white/5 mb-8">
                <h3 className="text-white font-medium mb-4">Add / Update Wallet</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-1">
                        <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wide">Blockchain</label>
                        <select 
                            name="chain" 
                            value={formData.chain} 
                            onChange={handleChange} 
                            className="w-full bg-navy-950 border border-white/10 rounded p-3 text-white focus:border-gold-500 outline-none"
                        >
                            <option value="ETH">Ethereum (ERC20)</option>
                            <option value="BTC">Bitcoin</option>
                            <option value="BSC">BNB Chain</option>
                            <option value="SOL">Solana</option>
                            <option value="TRON">Tron (TRC20)</option>
                            <option value="POLYGON">Polygon</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wide">Wallet Address</label>
                        <input 
                            type="text"
                            name="address" 
                            value={formData.address} 
                            onChange={handleChange} 
                            className="w-full bg-navy-950 border border-white/10 rounded p-3 text-white focus:border-gold-500 outline-none font-mono text-sm" 
                            placeholder="0x..." 
                        />
                    </div>
                    <div className="md:col-span-1">
                        <button type="submit" disabled={saving} className="w-full bg-gold-600 hover:bg-gold-500 text-white p-3 rounded font-medium flex items-center justify-center shadow-lg transition-all disabled:opacity-50">
                            {saving ? <Loader2 className="animate-spin" size={20} /> : 'Save Wallet'}
                        </button>
                    </div>
                </div>
            </form>

            {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gold-500" /></div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/10">
                        <thead className="bg-navy-950">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Chain</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Active Address</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {wallets.length === 0 ? (
                                <tr><td colSpan={3} className="p-6 text-center text-slate-500">No active wallets configured.</td></tr>
                            ) : wallets.map((w, idx) => (
                                <tr key={idx} className="hover:bg-white/5">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-white">{w.chain}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <code className="text-xs text-gold-500 font-mono bg-black/20 px-2 py-1 rounded border border-white/5">{w.address}</code>
                                            <button onClick={() => navigator.clipboard.writeText(w.address)} className="text-slate-500 hover:text-white"><Copy size={14} /></button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${w.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                                            {w.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AdminPlatformWallets;
