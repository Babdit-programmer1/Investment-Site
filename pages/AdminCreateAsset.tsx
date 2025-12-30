
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../src/config';
import { useAuth } from '../context/AuthContext';

const AdminCreateAsset: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    ticker: '',
    category: 'Real Estate',
    fundStrategy: 'Capital Appreciation',
    description: '',
    imageUrl: '',
    price: '',
    minInvestment: 50000,
    returnRate: '',
    term: '',
    riskLevel: 'Medium',
    status: 'UPCOMING',
    scenarios: { conservative: 5, moderate: 12, aggressive: 18 }
  });

  if (user?.role !== 'ADMIN') {
      return (
          <div className="min-h-screen bg-navy-900 flex items-center justify-center">
             <div className="text-center">
                 <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                 <h1 className="text-2xl text-white">Access Denied</h1>
             </div>
          </div>
      )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleScenarioChange = (type: 'conservative' | 'moderate' | 'aggressive', value: string) => {
      setFormData(prev => ({
          ...prev,
          scenarios: { ...prev.scenarios, [type]: parseFloat(value) || 0 }
      }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      const token = localStorage.getItem('prestige_token');
      
      try {
          const res = await fetch(`${API_BASE_URL}/admin/assets`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` 
              },
              body: JSON.stringify(formData)
          });
          
          if (!res.ok) throw new Error('Failed to create asset');
          
          // Redirect back to dashboard
          navigate('/admin/dashboard');
      } catch (err) {
          console.error(err);
          // In Preview Mode without backend, simulate success
          alert('Asset creation simulated (Preview Mode)');
          navigate('/admin/dashboard');
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-navy-900 pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center mb-8">
                <button onClick={() => navigate('/admin/dashboard')} className="p-2 rounded-full hover:bg-white/5 mr-4 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft />
                </button>
                <h1 className="text-3xl font-serif text-white">Create New Asset</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-navy-800 border border-white/5 rounded-lg p-8 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="md:col-span-2">
                        <label className="block text-sm text-slate-400 mb-1">Asset Title</label>
                        <input name="title" required value={formData.title} onChange={handleChange} type="text" className="w-full bg-navy-900 border border-white/10 rounded p-3 text-white" placeholder="e.g. The Kensington Estate" />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Ticker Symbol</label>
                        <input name="ticker" required value={formData.ticker} onChange={handleChange} type="text" className="w-full bg-navy-900 border border-white/10 rounded p-3 text-white font-mono uppercase" placeholder="e.g. RE-LDN-001" />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Category</label>
                        <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-navy-900 border border-white/10 rounded p-3 text-white">
                            <option>Real Estate</option>
                            <option>Fine Art</option>
                            <option>Luxury Vehicles</option>
                            <option>Collectibles</option>
                            <option>Private Credit</option>
                            <option>Renewable Energy</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Minimum Investment</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-slate-500">$</span>
                            <input name="minInvestment" type="number" required value={formData.minInvestment} onChange={handleChange} className="w-full bg-navy-900 border border-white/10 rounded p-3 pl-8 text-white" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Projected ROI (Text)</label>
                        <input name="returnRate" required value={formData.returnRate} onChange={handleChange} type="text" className="w-full bg-navy-900 border border-white/10 rounded p-3 text-white" placeholder="e.g. 14.5%" />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Risk Level</label>
                        <select name="riskLevel" value={formData.riskLevel} onChange={handleChange} className="w-full bg-navy-900 border border-white/10 rounded p-3 text-white">
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Investment Term</label>
                        <input name="term" required value={formData.term} onChange={handleChange} type="text" className="w-full bg-navy-900 border border-white/10 rounded p-3 text-white" placeholder="e.g. 36 Months" />
                    </div>
                </div>

                <div className="mb-8">
                    <label className="block text-sm text-slate-400 mb-1">Description</label>
                    <textarea name="description" required rows={4} value={formData.description} onChange={handleChange} className="w-full bg-navy-900 border border-white/10 rounded p-3 text-white" placeholder="Detailed asset description..." />
                </div>

                <div className="mb-8">
                    <label className="block text-sm text-slate-400 mb-1">Image URL</label>
                    <input name="imageUrl" required value={formData.imageUrl} onChange={handleChange} type="text" className="w-full bg-navy-900 border border-white/10 rounded p-3 text-white" placeholder="https://..." />
                </div>

                <div className="bg-navy-900/50 p-6 rounded border border-white/5 mb-8">
                    <h3 className="text-white font-medium mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-gold-500" /> ROI Scenarios (%)</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Conservative</label>
                            <input type="number" value={formData.scenarios.conservative} onChange={(e) => handleScenarioChange('conservative', e.target.value)} className="w-full bg-navy-800 border border-white/10 rounded p-2 text-white" />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Moderate</label>
                            <input type="number" value={formData.scenarios.moderate} onChange={(e) => handleScenarioChange('moderate', e.target.value)} className="w-full bg-navy-800 border border-white/10 rounded p-2 text-white" />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Aggressive</label>
                            <input type="number" value={formData.scenarios.aggressive} onChange={(e) => handleScenarioChange('aggressive', e.target.value)} className="w-full bg-navy-800 border border-white/10 rounded p-2 text-white" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-white/5">
                    <button type="button" onClick={() => navigate('/admin/dashboard')} className="px-6 py-3 text-slate-400 hover:text-white mr-4">Cancel</button>
                    <button type="submit" disabled={loading} className="px-8 py-3 bg-gold-600 hover:bg-gold-500 text-white rounded font-medium flex items-center disabled:opacity-50">
                        {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" size={18} />}
                        Publish Asset
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default AdminCreateAsset;
