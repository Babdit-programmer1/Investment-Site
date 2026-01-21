import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { ArrowLeft, Save, Loader2, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const { useNavigate } = ReactRouterDOM;

const AdminCreateAsset: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    ticker: '',
    category: 'Real Estate',
    price: '',
    minInvestment: '',
    returnRate: '',
    term: '',
    riskLevel: 'Low',
    description: '',
    imageUrl: ''
  });

  if (user?.role !== 'ADMIN') {
      navigate('/dashboard');
      return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic Validation
    if (!formData.title || !formData.ticker || !formData.price) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
    }

    try {
        // Simulate API Creation
        await new Promise(resolve => setTimeout(resolve, 1500));
        navigate('/admin/dashboard');
    } catch (err) {
        setError('Failed to create asset. Please try again.');
        setLoading(false);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-navy-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto py-10">
        
        <button onClick={() => navigate('/admin/dashboard')} className="flex items-center text-slate-400 hover:text-white mb-8 transition-colors">
            <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
        </button>

        <div className="bg-navy-800 rounded-lg border border-white/5 p-8 shadow-xl">
            <h1 className="text-2xl font-serif text-white mb-6">Create New Asset</h1>
            
            {error && (
                <div className="mb-6 p-4 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3">
                    <AlertTriangle size={18} /> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Asset Title</label>
                        <input name="title" value={formData.title} onChange={handleChange} className="w-full bg-navy-900 border border-white/10 rounded p-3 text-white focus:border-gold-500 outline-none" placeholder="e.g. The Kensington Estate" />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Ticker Symbol</label>
                        <input name="ticker" value={formData.ticker} onChange={handleChange} className="w-full bg-navy-900 border border-white/10 rounded p-3 text-white uppercase font-mono focus:border-gold-500 outline-none" placeholder="RE-LDN" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Category</label>
                        <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-navy-900 border border-white/10 rounded p-3 text-white focus:border-gold-500 outline-none">
                            <option>Real Estate</option>
                            <option>Fine Art</option>
                            <option>Luxury Vehicles</option>
                            <option>Space Infra</option>
                            <option>AI Infra</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Total Valuation ($)</label>
                        <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full bg-navy-900 border border-white/10 rounded p-3 text-white focus:border-gold-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Min Investment ($)</label>
                        <input type="number" name="minInvestment" value={formData.minInvestment} onChange={handleChange} className="w-full bg-navy-900 border border-white/10 rounded p-3 text-white focus:border-gold-500 outline-none" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Target Return</label>
                        <input name="returnRate" value={formData.returnRate} onChange={handleChange} className="w-full bg-navy-900 border border-white/10 rounded p-3 text-white focus:border-gold-500 outline-none" placeholder="e.g. 14.5%" />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Term Duration</label>
                        <input name="term" value={formData.term} onChange={handleChange} className="w-full bg-navy-900 border border-white/10 rounded p-3 text-white focus:border-gold-500 outline-none" placeholder="e.g. 36 Months" />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Risk Level</label>
                        <select name="riskLevel" value={formData.riskLevel} onChange={handleChange} className="w-full bg-navy-900 border border-white/10 rounded p-3 text-white focus:border-gold-500 outline-none">
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-slate-400 mb-2">Image URL</label>
                    <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full bg-navy-900 border border-white/10 rounded p-3 text-white focus:border-gold-500 outline-none" placeholder="https://..." />
                </div>

                <div>
                    <label className="block text-sm text-slate-400 mb-2">Description / Investment Thesis</label>
                    <textarea name="description" rows={5} value={formData.description} onChange={handleChange} className="w-full bg-navy-900 border border-white/10 rounded p-3 text-white focus:border-gold-500 outline-none" placeholder="Detailed description of the asset..." />
                </div>

                <div className="flex justify-end pt-4 border-t border-white/10">
                    <button type="submit" disabled={loading} className="bg-gold-600 hover:bg-gold-500 text-white px-8 py-3 rounded text-sm font-medium flex items-center shadow-lg transition-all disabled:opacity-50">
                        {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
                        {loading ? 'Creating Asset...' : 'Publish Asset'}
                    </button>
                </div>

            </form>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateAsset;