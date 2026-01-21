
import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { ArrowLeft, Save, Loader2, AlertTriangle, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';

const { useNavigate } = ReactRouterDOM;

const AdminCreatePlan: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    durationMonths: '',
    monthlyRoi: '',
    minInvestment: '',
    active: true
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.name || !formData.durationMonths || !formData.monthlyRoi || !formData.minInvestment) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
    }

    try {
        await dataService.createPlan({
            name: formData.name,
            lockupPeriod: `${formData.durationMonths} Months`,
            targetRoi: `${formData.monthlyRoi}%`,
            minInvestment: Number(formData.minInvestment),
            // Mapping required backend fields not present in simple form
            riskLevel: 'Medium', 
            allocation: {},
            description: `Standard ${formData.durationMonths}-month plan with ${formData.monthlyRoi}% target ROI.`
        });
        navigate('/admin/dashboard');
    } catch (err: any) {
        setError(err.message || 'Failed to create plan. Please try again.');
        setLoading(false);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-navy-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto py-10">
        
        <button onClick={() => navigate('/admin/dashboard')} className="flex items-center text-slate-400 hover:text-white mb-8 transition-colors">
            <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
        </button>

        <div className="bg-navy-800 rounded-lg border border-white/5 p-8 shadow-xl">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-navy-900 rounded-full border border-white/10">
                    <Layers className="text-gold-500 w-6 h-6" />
                </div>
                <h1 className="text-2xl font-serif text-white">Create Investment Plan</h1>
            </div>
            
            {error && (
                <div className="mb-6 p-4 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3">
                    <AlertTriangle size={18} /> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                
                <div>
                    <label className="block text-sm text-slate-400 mb-2">Plan Name</label>
                    <input 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        className="w-full bg-navy-900 border border-white/10 rounded p-3 text-white focus:border-gold-500 outline-none" 
                        placeholder="e.g. Growth Plus Strategy" 
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Duration (Months)</label>
                        <input 
                            type="number"
                            name="durationMonths" 
                            value={formData.durationMonths} 
                            onChange={handleChange} 
                            className="w-full bg-navy-900 border border-white/10 rounded p-3 text-white focus:border-gold-500 outline-none" 
                            placeholder="12" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Monthly ROI (%)</label>
                        <input 
                            type="text"
                            name="monthlyRoi" 
                            value={formData.monthlyRoi} 
                            onChange={handleChange} 
                            className="w-full bg-navy-900 border border-white/10 rounded p-3 text-white focus:border-gold-500 outline-none" 
                            placeholder="1.5" 
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Minimum Investment ($)</label>
                        <input 
                            type="number" 
                            name="minInvestment" 
                            value={formData.minInvestment} 
                            onChange={handleChange} 
                            className="w-full bg-navy-900 border border-white/10 rounded p-3 text-white focus:border-gold-500 outline-none" 
                            placeholder="5000" 
                        />
                    </div>
                    <div className="flex items-center mt-6">
                         <label className="flex items-center cursor-pointer group">
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    name="active" 
                                    checked={formData.active} 
                                    onChange={handleChange} 
                                    className="sr-only"
                                />
                                <div className={`block w-14 h-8 rounded-full transition-colors ${formData.active ? 'bg-emerald-600' : 'bg-navy-950 border border-white/10'}`}></div>
                                <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.active ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </div>
                            <span className="ml-3 text-sm text-slate-300 group-hover:text-white font-medium">Plan Active</span>
                        </label>
                    </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-white/10">
                    <button type="submit" disabled={loading} className="bg-gold-600 hover:bg-gold-500 text-white px-8 py-3 rounded text-sm font-medium flex items-center shadow-lg transition-all disabled:opacity-50">
                        {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
                        {loading ? 'Creating...' : 'Create Plan'}
                    </button>
                </div>

            </form>
        </div>
      </div>
    </div>
  );
};

export default AdminCreatePlan;
