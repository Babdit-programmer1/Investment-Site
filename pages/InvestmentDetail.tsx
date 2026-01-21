
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Investment } from '../types';
import { ArrowLeft, TrendingUp, Shield, FileText, Activity, Share2, AlertTriangle } from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';
import InvestModal from '../components/InvestModal';
import { dataService } from '../services/dataService';

const InvestmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { convertPrice } = useGlobal();
  
  const [asset, setAsset] = useState<Investment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'FINANCIALS' | 'DOCUMENTS'>('OVERVIEW');
  const [showInvestModal, setShowInvestModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    dataService.getAssetById(id)
      .then(data => {
        setAsset(data);
        setError(null);
      })
      .catch(err => {
        setError('Asset not found or unavailable');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-navy-900 pt-20 flex justify-center items-center text-gold-500"><Activity className="animate-spin mr-2" /> Loading Opportunity...</div>;
  }

  if (error || !asset) {
    return (
        <div className="min-h-screen bg-navy-900 pt-20 flex flex-col items-center justify-center p-4">
            <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="text-rose-500 w-10 h-10" />
                </div>
                <h1 className="text-3xl font-serif text-white mb-4">Unavailable</h1>
                <p className="text-slate-400 mb-8">{error || "Asset not found."}</p>
                <div className="flex gap-4 justify-center">
                    <button onClick={() => navigate('/investments')} className="bg-navy-800 border border-white/10 text-white px-6 py-2 rounded">Marketplace</button>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-900 pt-20">
      
      {/* Hero Header */}
      <div className="relative h-[60vh] min-h-[500px]">
        <img src={asset.imageUrl} alt={asset.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/60 to-transparent"></div>
        
        <div className="absolute top-8 left-4 sm:left-8 z-10">
            <button onClick={() => navigate('/investments')} className="flex items-center text-white/80 hover:text-white transition-colors bg-black/20 backdrop-blur px-4 py-2 rounded-full">
                <ArrowLeft className="mr-2" size={18} /> Back to Market
            </button>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-4 sm:p-8 md:p-12">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="bg-gold-600 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">{asset.category}</span>
                            <span className="flex items-center text-emerald-400 text-xs font-bold bg-emerald-900/40 border border-emerald-500/30 px-2 py-1 rounded">
                                <Activity size={12} className="mr-1" /> {asset.status}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-serif text-white mb-2">{asset.title}</h1>
                        <p className="text-xl text-slate-300 flex items-center gap-2">
                            <span className="font-mono text-sm text-slate-400">{asset.ticker}</span>
                        </p>
                    </div>
                    
                    <div className="flex gap-4">
                        <button className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur transition-colors">
                            <Share2 size={20} />
                        </button>
                        <button 
                            onClick={() => setShowInvestModal(true)}
                            className="bg-gold-600 hover:bg-gold-500 text-white px-8 py-3 rounded text-lg font-serif shadow-lg shadow-gold-900/30 transition-all transform hover:scale-105"
                        >
                            Invest Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Main Content */}
            <div className="lg:col-span-2">
                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 bg-navy-800 p-6 rounded border border-white/5">
                    <div>
                        <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Target IRR</p>
                        <p className="text-2xl font-serif text-emerald-400">{asset.returnRate}</p>
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Term</p>
                        <p className="text-2xl font-serif text-white">{asset.term}</p>
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Min. Entry</p>
                        <p className="text-2xl font-serif text-white">{convertPrice(Number(asset.minInvestment))}</p>
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Risk Profile</p>
                        <p className={`text-2xl font-serif ${asset.riskLevel === 'Low' ? 'text-emerald-400' : 'text-amber-400'}`}>{asset.riskLevel}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-white/10 mb-8">
                    <div className="flex space-x-8">
                        {['OVERVIEW', 'FINANCIALS', 'DOCUMENTS'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`pb-4 text-sm font-medium tracking-wider transition-colors ${
                                    activeTab === tab ? 'text-gold-500 border-b-2 border-gold-500' : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="min-h-[400px]">
                    {activeTab === 'OVERVIEW' && (
                        <div className="space-y-8 animate-fade-in">
                            <div>
                                <h3 className="text-2xl font-serif text-white mb-4">Investment Thesis</h3>
                                <p className="text-slate-300 leading-relaxed text-lg">{asset.description}</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-navy-800 p-6 rounded border border-white/5">
                                    <Shield className="w-8 h-8 text-gold-500 mb-4" />
                                    <h4 className="text-white font-medium mb-2">Asset Security</h4>
                                    <p className="text-sm text-slate-400">Held in an bankruptcy-remote SPV. Title deed insured by Lloyds of London. Fully managed by top-tier property managers.</p>
                                </div>
                                <div className="bg-navy-800 p-6 rounded border border-white/5">
                                    <TrendingUp className="w-8 h-8 text-gold-500 mb-4" />
                                    <h4 className="text-white font-medium mb-2">Exit Strategy</h4>
                                    <p className="text-sm text-slate-400">Targeted sale at month 6-12 upon completion of value-add renovations. Secondary market liquidity available after 3-month lockup.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'FINANCIALS' && (
                        <div className="animate-fade-in space-y-8">
                            <div className="bg-navy-800 p-8 rounded border border-white/5">
                                <h3 className="text-white font-serif mb-6">Pro Forma Financials</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between py-3 border-b border-white/5">
                                        <span className="text-slate-400">Current Price (Est.)</span>
                                        <span className="text-white font-mono">{convertPrice(Number(asset.price || 0))}</span>
                                    </div>
                                    <div className="flex justify-between py-3">
                                        <span className="text-slate-400">Yield Type</span>
                                        <span className="text-gold-500 font-bold">{asset.fundStrategy}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'DOCUMENTS' && (
                        <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['Offering Memorandum', 'Valuation Report', 'Title Deed', 'SPV Articles'].map((doc, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-navy-800 border border-white/5 rounded hover:border-gold-500/30 transition-colors group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <FileText className="text-slate-400 group-hover:text-gold-500 transition-colors" />
                                        <span className="text-white text-sm">{doc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-8">
                <div className="bg-navy-800 rounded border border-white/5 p-6">
                    <h3 className="text-white font-serif text-lg mb-4">Investment Portal</h3>
                    <div className="mb-6 pb-6 border-b border-white/5">
                        <div className="text-center">
                            <p className="text-4xl font-bold text-white">{asset.returnRate}</p>
                            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Projected Annual Return</p>
                        </div>
                    </div>

                    <button onClick={() => setShowInvestModal(true)} className="w-full bg-gold-600 hover:bg-gold-500 text-white py-3 rounded font-medium mb-3">Invest Now</button>
                    <p className="text-center text-xs text-slate-500">Minimum investment {convertPrice(Number(asset.minInvestment))}</p>
                </div>
            </div>
        </div>
      </div>

      {showInvestModal && (
        <InvestModal investment={asset} onClose={() => setShowInvestModal(false)} />
      )}
    </div>
  );
};

export default InvestmentDetail;
