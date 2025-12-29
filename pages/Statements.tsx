import React, { useEffect, useState } from 'react';
import { FileText, Download, Loader2, Eye, Calendar } from 'lucide-react';
import { InvestorStatement } from '../types';
import { API_BASE_URL } from '../src/config';

// Mock Data
const MOCK_STATEMENTS: InvestorStatement[] = [
  {
    id: 's1',
    period: 'March 2024',
    generatedAt: new Date().toISOString(),
    totalInvested: 50000,
    currentValue: 52400,
    roi: 4.8,
    content: { assets: [] }
  },
  {
    id: 's2',
    period: 'February 2024',
    generatedAt: new Date(Date.now() - 2592000000).toISOString(), // ~30 days ago
    totalInvested: 50000,
    currentValue: 51200,
    roi: 2.4,
    content: { assets: [] }
  }
];

const Statements: React.FC = () => {
  const [statements, setStatements] = useState<InvestorStatement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatements();
  }, []);

  const fetchStatements = async () => {
    try {
      const token = localStorage.getItem('prestige_token');
      const res = await fetch(`${API_BASE_URL}/reporting/statements`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if(!res.ok) throw new Error("API Error");
      const data = await res.json();
      setStatements(data);
    } catch (e) {
      setStatements(MOCK_STATEMENTS);
    } finally {
        setLoading(false);
    }
  };

  const handleDownload = async (id: string, period: string) => {
    try {
        const token = localStorage.getItem('prestige_token');
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
        alert('Simulation: PDF download triggered (Backend Unavailable)');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-navy-900 pt-20 flex justify-center items-center">
        <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-navy-900 pt-20">
      <div className="bg-navy-950 py-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-serif text-white mb-2">Investor Reporting</h1>
          <p className="text-slate-400">Institutional-grade documentation of your portfolio performance.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-navy-800 rounded-sm border border-white/5 overflow-hidden">
            {statements.length > 0 ? (
                <table className="min-w-full divide-y divide-white/10">
                    <thead className="bg-navy-900">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Period</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Generated Date</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Valuation</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">ROI</th>
                            <th className="px-6 py-4 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {statements.map((stmt) => (
                            <tr key={stmt.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 rounded bg-navy-900 border border-white/10 flex items-center justify-center text-gold-500">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-white">{stmt.period}</div>
                                            <div className="text-xs text-slate-500">Monthly Statement</div>
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
                                    <button 
                                        onClick={() => handleDownload(stmt.id, stmt.period)}
                                        className="text-gold-500 hover:text-white transition-colors flex items-center justify-end gap-2 ml-auto"
                                    >
                                        <Download className="h-4 w-4" /> PDF
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="text-center py-20">
                    <FileText className="h-16 w-16 text-slate-700 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white">No Statements Available</h3>
                    <p className="text-slate-500 mt-2">Statements are generated on the 1st of each month for active portfolios.</p>
                </div>
            )}
        </div>

        <div className="mt-8 bg-navy-900 border border-white/10 p-6 rounded-sm flex items-start gap-4">
            <Loader2 className="h-6 w-6 text-gold-500 mt-1" />
            <div>
                <h4 className="text-white font-medium">Automated Reporting Cycle</h4>
                <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                    Prestige Assets uses a T+2 settlement reporting cycle. Monthly statements are finalized and available for download 2 business days after the close of the month. Annual tax documents (Form 1099/K-1) are released by Feb 15th.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Statements;