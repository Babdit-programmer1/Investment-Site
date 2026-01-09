
import React, { useEffect, useState } from 'react';
import { FileText, Download, Loader2, Calendar, DollarSign, TrendingUp, TrendingDown, Clock, Shield, PieChart, Activity, WifiOff } from 'lucide-react';
import { InvestorStatement } from '../types';
import { API_BASE_URL } from '../src/config';

const Statements: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'STATEMENTS' | 'TRANSACTIONS' | 'PNL' | 'TAX'>('STATEMENTS');
  const [statements, setStatements] = useState<InvestorStatement[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pnl, setPnL] = useState<any>(null);
  const [tax, setTax] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem('prestige_token');

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [stmtRes, txRes, pnlRes, taxRes] = await Promise.all([
          fetch(`${API_BASE_URL}/reporting/statements`, { headers }),
          fetch(`${API_BASE_URL}/reporting/transactions`, { headers }),
          fetch(`${API_BASE_URL}/reporting/pnl`, { headers }),
          fetch(`${API_BASE_URL}/reporting/tax?year=2024`, { headers })
      ]);

      if (!stmtRes.ok || !txRes.ok) throw new Error("Synchronization Error");

      setStatements(await stmtRes.json());
      setTransactions(await txRes.json());
      setPnL(pnlRes.ok ? await pnlRes.json() : null);
      setTax(taxRes.ok ? await taxRes.json() : null);

    } catch (e: any) {
      console.error("Reporting sync failed:", e);
      setError("The reporting server is currently unreachable. Please verify your local node is running.");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleDownload = async (id: string, period: string) => {
    try {
        const res = await fetch(`${API_BASE_URL}/reporting/statements/${id}/download`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Download failed');
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Prestige_Statement_${period}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    } catch(e) {
        alert('Audit download failed. Node synchronization required.');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-navy-900 pt-20 flex flex-col justify-center items-center">
        <Loader2 className="w-10 h-10 text-gold-500 animate-spin mb-4" />
        <p className="text-slate-500 font-serif tracking-widest animate-pulse">FETCHING AUDIT LEDGER</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-navy-900 pt-20 flex flex-col justify-center items-center p-4">
        <WifiOff className="w-16 h-16 text-rose-500 mb-6 opacity-40" />
        <h2 className="text-2xl font-serif text-white mb-2">Reports Unavailable</h2>
        <p className="text-slate-400 text-center max-w-md mb-8">{error}</p>
        <button onClick={fetchAllData} className="px-8 py-2 bg-gold-600 text-white rounded">Retry Connection</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-navy-900 pt-20">
      <div className="bg-navy-950 py-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-serif text-white mb-2">Reports Center</h1>
          <p className="text-slate-400">Institutional-grade analytics, tax documents, and monthly statements.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 mb-8 overflow-x-auto">
            {[
                { id: 'STATEMENTS', label: 'Statements', icon: <FileText size={16} /> },
                { id: 'TRANSACTIONS', label: 'Ledger History', icon: <Clock size={16} /> },
                { id: 'PNL', label: 'P&L Analysis', icon: <Activity size={16} /> },
                { id: 'TAX', label: 'Tax Documents', icon: <Shield size={16} /> }
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                        activeTab === tab.id 
                        ? 'border-gold-500 text-gold-500' 
                        : 'border-transparent text-slate-400 hover:text-white hover:border-white/20'
                    }`}
                >
                    {tab.icon} {tab.label}
                </button>
            ))}
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
            
            {/* STATEMENTS TAB */}
            {activeTab === 'STATEMENTS' && (
                <div className="space-y-6">
                    {statements.length === 0 ? (
                        <div className="bg-navy-800 p-20 text-center text-slate-500 italic rounded border border-white/5">
                            No statements have been generated for your account yet.
                        </div>
                    ) : (
                        <div className="bg-navy-800 rounded-sm border border-white/5 overflow-hidden">
                            <table className="min-w-full divide-y divide-white/10">
                                <thead className="bg-navy-900">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Period</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Valuation</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">ROI</th>
                                        <th className="px-6 py-4 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Download</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {statements.map((stmt) => (
                                        <tr key={stmt.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8 rounded bg-navy-900 border border-white/10 flex items-center justify-center text-gold-500">
                                                        <FileText size={14} />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-white">{stmt.period}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                                {new Date(stmt.generatedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                                                ${stmt.currentValue.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${stmt.roi >= 0 ? 'bg-emerald-900 text-emerald-200' : 'bg-rose-900 text-rose-200'}`}>
                                                    {stmt.roi > 0 ? '+' : ''}{stmt.roi.toFixed(2)}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleDownload(stmt.id, stmt.period)} className="text-slate-400 hover:text-white transition-colors">
                                                    <Download size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* TRANSACTIONS TAB */}
            {activeTab === 'TRANSACTIONS' && (
                <div className="bg-navy-800 rounded-sm border border-white/5 overflow-hidden">
                    {transactions.length === 0 ? (
                        <div className="p-20 text-center text-slate-500 italic">No historical records found in your ledger.</div>
                    ) : (
                        <table className="min-w-full divide-y divide-white/10">
                            <thead className="bg-navy-900">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Reference</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Date</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {transactions.map((tx: any) => (
                                    <tr key={tx.id || tx.referenceId}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                                                tx.actionType === 'DEPOSIT' ? 'bg-emerald-500/10 text-emerald-400' :
                                                tx.actionType === 'WITHDRAWAL' ? 'bg-rose-500/10 text-rose-400' :
                                                'bg-blue-500/10 text-blue-400'
                                            }`}>{tx.actionType}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-400">{tx.referenceId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{new Date(tx.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-white">${tx.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-xs text-slate-500">{tx.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* P&L TAB */}
            {activeTab === 'PNL' && (
                pnl ? (
                    <div className="space-y-8 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-navy-800 p-6 rounded border border-white/5">
                                <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Total Invested</p>
                                <p className="text-2xl font-serif text-white">${pnl.totalInvested.toLocaleString()}</p>
                            </div>
                            <div className="bg-navy-800 p-6 rounded border border-white/5">
                                <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Current Value</p>
                                <p className="text-2xl font-serif text-white">${pnl.currentValue.toLocaleString()}</p>
                            </div>
                            <div className="bg-navy-800 p-6 rounded border border-white/5 border-l-4 border-l-emerald-500">
                                <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Unrealized Gains</p>
                                <p className="text-2xl font-serif text-emerald-400">+${pnl.unrealizedGains.toLocaleString()}</p>
                            </div>
                            <div className="bg-navy-800 p-6 rounded border border-white/5 border-l-4 border-l-gold-500">
                                <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Realized Gains</p>
                                <p className="text-2xl font-serif text-gold-500">+${pnl.realizedGains.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-navy-800 p-20 text-center text-slate-500 italic rounded border border-white/5">
                        Performance analysis requires active investment history.
                    </div>
                )
            )}

            {/* TAX TAB */}
            {activeTab === 'TAX' && (
                tax ? (
                    <div className="max-w-4xl animate-fade-in">
                        <div className="bg-gradient-to-r from-navy-800 to-navy-900 border border-white/10 rounded-lg p-8 mb-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-serif text-white">Tax Summary {tax.year}</h3>
                                    <p className="text-slate-400 text-sm mt-1">Estimated liability based on realized events.</p>
                                </div>
                                <div className="text-right">
                                    <span className="block text-xs text-slate-500 uppercase">Est. Liability</span>
                                    <span className="text-3xl font-mono text-white">${tax.totalLiability.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-navy-800 p-20 text-center text-slate-500 italic rounded border border-white/5">
                        No tax events recorded for the current fiscal year.
                    </div>
                )
            )}

        </div>
      </div>
    </div>
  );
};

export default Statements;
