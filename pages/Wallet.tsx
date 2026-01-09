
import React, { useEffect, useState } from 'react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, CreditCard, Bitcoin, RefreshCw, Loader2, DollarSign, FileText, CheckCircle, Clock, AlertCircle, Lock, Copy, WifiOff } from 'lucide-react';
import { Wallet } from '../types';
import { useAuth } from '../context/AuthContext';
import { useGlobal } from '../context/GlobalContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../src/config';

type LogType = 'ALL' | 'DEPOSIT' | 'INVESTMENT' | 'PROFIT' | 'WITHDRAWAL';

interface LedgerLog {
  id: string;
  actionType: string;
  amount: number;
  currency: string;
  status: string;
  referenceId: string;
  createdAt: string;
  source?: string;
}

const WalletPage: React.FC = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState<'DEPOSIT' | 'WITHDRAWAL' | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [asset, setAsset] = useState('USD');
  const [selectedChain, setSelectedChain] = useState('ETH');
  const [txHash, setTxHash] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [kycError, setKycError] = useState(false);
  const [withdrawalMessage, setWithdrawalMessage] = useState('');
  
  // Config State
  const [depositAddresses, setDepositAddresses] = useState<Record<string, string>>({});
  
  // Ledger State
  const [logs, setLogs] = useState<LedgerLog[]>([]);
  const [activeTab, setActiveTab] = useState<LogType>('ALL');
  const [logsLoading, setLogsLoading] = useState(false);

  const { user } = useAuth();
  const { convertPrice, currency, t } = useGlobal();
  const navigate = useNavigate();
  const token = localStorage.getItem('prestige_token');

  const fetchDepositConfig = async () => {
      try {
          const res = await fetch(`${API_BASE_URL}/payments/config`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
              setDepositAddresses(await res.json());
          }
      } catch (e) {
          console.error("Deposit config unavailable");
      }
  };

  const fetchWallet = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/wallet`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Wallet Server Error");
      setWallet(await res.json());
    } catch (e: any) {
      console.error("Wallet sync failure:", e);
      setError("Unable to synchronize with the secure vault. Please check server status.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/logs?type=${activeTab}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setLogs(await res.json());
      }
    } catch (e) {
       console.warn("Log retrieval failed");
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
    fetchDepositConfig();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [activeTab]);

  const initiateAction = (type: 'DEPOSIT' | 'WITHDRAWAL') => {
      if (type === 'WITHDRAWAL' && user?.kycStatus !== 'APPROVED') {
          setKycError(true);
          return;
      }
      setKycError(false);
      setAction(type);
      setWithdrawalMessage('');
      setAmount(0);
      setTxHash('');
      setWithdrawAddress('');
  };

  const handleTransaction = async () => {
    if (!action || amount <= 0) return;
    setLoading(true);

    try {
        const endpoint = action === 'DEPOSIT' ? 'deposit' : 'withdraw';
        const payload: any = { 
            amount, 
            currency: asset, 
            type: 'CRYPTO'
        };

        if (action === 'DEPOSIT') {
            payload.chain = selectedChain;
            payload.txHash = txHash;
        } else {
            payload.address = withdrawAddress;
        }

        const res = await fetch(`${API_BASE_URL}/wallet/${endpoint}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(payload)
        });
        
        const data = await res.json();

        if (!res.ok) {
            setWithdrawalMessage(data.message || 'Transaction failed');
        } else {
            setWithdrawalMessage(data.message);
            fetchWallet();
            fetchLogs();
        }
    } catch (e) {
        setWithdrawalMessage('Connection Error');
    } finally {
        setLoading(false);
    }
  };

  if (loading && !wallet) return <div className="min-h-screen bg-navy-900 pt-20 flex justify-center items-center"><Loader2 className="w-8 h-8 text-gold-500 animate-spin" /></div>;

  if (error) return (
      <div className="min-h-screen bg-navy-900 pt-20 flex flex-col justify-center items-center p-4">
          <WifiOff className="w-16 h-16 text-rose-500 mb-6 opacity-40" />
          <h2 className="text-2xl font-serif text-white mb-2">Vault Unreachable</h2>
          <p className="text-slate-400 mb-8">{error}</p>
          <button onClick={fetchWallet} className="px-8 py-2 bg-gold-600 text-white rounded">Retry Sync</button>
      </div>
  );

  return (
    <div className="min-h-screen bg-navy-900 pt-20">
      <div className="bg-navy-950 py-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-serif text-white mb-2">{t('nav.wallet')}</h1>
          <p className="text-slate-400">Manage your fiat and digital asset balances.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {kycError && (
            <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <AlertCircle className="text-amber-500" />
                    <div>
                        <h4 className="text-white font-medium">Withdrawal Restricted</h4>
                        <p className="text-sm text-amber-200/80">You must complete identity verification to withdraw funds.</p>
                    </div>
                </div>
                <button onClick={() => navigate('/kyc')} className="text-sm bg-amber-500 text-navy-900 px-4 py-2 rounded font-bold hover:bg-amber-400">Verify Now</button>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-gradient-to-r from-navy-800 to-navy-900 border border-white/10 rounded-lg p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <WalletIcon size={120} className="text-gold-500" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-slate-400 font-mono text-xs uppercase tracking-widest mb-2">Available Balance</p>
                        <h2 className="text-4xl text-white font-serif mb-6">{convertPrice(wallet?.fiatBalance || 0)} <span className="text-lg text-slate-500">{currency}</span></h2>
                        
                        <div className="flex gap-4">
                            <button onClick={() => initiateAction('DEPOSIT')} className="flex items-center bg-gold-600 hover:bg-gold-500 text-white px-6 py-2 rounded-sm text-sm font-medium transition-colors">
                                <ArrowDownLeft className="w-4 h-4 mr-2" /> Deposit
                            </button>
                            <button onClick={() => initiateAction('WITHDRAWAL')} className="flex items-center bg-white/5 hover:bg-white/10 text-white border border-white/20 px-6 py-2 rounded-sm text-sm font-medium transition-colors">
                                <ArrowUpRight className="w-4 h-4 mr-2" /> Withdraw
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-navy-800 border border-white/5 rounded-lg overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                       <h3 className="text-white font-serif text-lg flex items-center"><FileText className="w-5 h-5 text-gold-500 mr-2" /> Financial Ledger</h3>
                       <div className="flex bg-navy-900 p-1 rounded-lg">
                          {['ALL', 'DEPOSIT', 'INVESTMENT', 'PROFIT', 'WITHDRAWAL'].map((t) => (
                             <button key={t} onClick={() => setActiveTab(t as LogType)} className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === t ? 'bg-navy-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
                                {t.charAt(0) + t.slice(1).toLowerCase()}
                             </button>
                          ))}
                       </div>
                    </div>

                    <div className="min-h-[300px]">
                       {logsLoading ? (
                          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gold-500" /></div>
                       ) : logs.length === 0 ? (
                          <div className="text-center py-12 text-slate-500 text-sm">No records found.</div>
                       ) : (
                          <div className="divide-y divide-white/5">
                             {logs.map((log) => (
                                <div key={log.id} className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between">
                                   <div className="flex items-center gap-4">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border border-white/10 ${log.actionType === 'DEPOSIT' || log.actionType === 'PROFIT' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                         {log.actionType === 'DEPOSIT' ? <ArrowDownLeft size={16} /> : log.actionType === 'WITHDRAWAL' ? <ArrowUpRight size={16} /> : <DollarSign size={16} />}
                                      </div>
                                      <div>
                                         <p className="text-white text-sm font-medium">{log.actionType}</p>
                                         <p className="text-xs text-slate-500 font-mono">{log.referenceId} • {new Date(log.createdAt).toLocaleDateString()}</p>
                                      </div>
                                   </div>
                                   <div className="text-right">
                                      <p className={`text-sm font-bold ${log.actionType === 'DEPOSIT' || log.actionType === 'PROFIT' ? 'text-emerald-400' : 'text-white'}`}>
                                         {log.actionType === 'DEPOSIT' || log.actionType === 'PROFIT' ? '+' : '-'}{convertPrice(log.amount)}
                                      </p>
                                      <span className="text-[10px] uppercase text-slate-500">{log.status}</span>
                                   </div>
                                </div>
                             ))}
                          </div>
                       )}
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <div className="bg-navy-800 border border-white/5 rounded-lg p-6">
                    <h3 className="text-white font-serif text-lg mb-4 flex items-center"><Bitcoin className="w-5 h-5 text-gold-500 mr-2" /> Digital Assets</h3>
                    <div className="space-y-4">
                        <p className="text-slate-500 text-sm text-center py-4">Direct crypto balance view is managed via the Cold Storage gateway.</p>
                        <button onClick={() => initiateAction('DEPOSIT')} className="w-full py-2 text-xs text-gold-500 hover:text-gold-400 border border-dashed border-gold-500/30 rounded">
                            + Deposit Crypto
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Action Modal */}
        {action && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-sm animate-fade-in">
                <div className="bg-navy-800 rounded-lg p-6 w-full max-w-md border border-white/10 shadow-2xl">
                    <h3 className="text-xl text-white font-serif mb-4">{action === 'DEPOSIT' ? 'Deposit Funds' : 'Withdraw Funds'}</h3>
                    
                    {withdrawalMessage ? (
                        <div className="text-center py-6">
                            <CheckCircle className="w-16 h-16 text-gold-500 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-white mb-2">Request Processed</h4>
                            <p className="text-slate-400 text-sm mb-6">{withdrawalMessage}</p>
                            <button onClick={() => { setAction(null); setWithdrawalMessage(''); fetchWallet(); }} className="w-full bg-navy-700 hover:bg-navy-600 text-white py-2 rounded">Close</button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm text-slate-400 mb-1">Currency</label>
                                <select value={asset} onChange={(e) => setAsset(e.target.value)} className="w-full bg-navy-900 border border-white/10 rounded p-2 text-white">
                                    <option value="USD">USD Equivalent</option>
                                </select>
                            </div>

                            {action === 'DEPOSIT' && (
                                <div className="mb-4">
                                    <label className="block text-sm text-slate-400 mb-1">Network</label>
                                    <select value={selectedChain} onChange={(e) => setSelectedChain(e.target.value)} className="w-full bg-navy-900 border border-white/10 rounded p-2 text-white">
                                        {Object.keys(depositAddresses).length > 0 ? Object.keys(depositAddresses).map(c => <option key={c} value={c}>{c}</option>) : <option>Loading...</option>}
                                    </select>
                                    {depositAddresses[selectedChain] && (
                                        <div className="mt-4 p-4 bg-navy-900 border border-white/10 rounded">
                                            <p className="text-xs text-slate-400 mb-2">Send funds to:</p>
                                            <div className="flex items-center justify-between bg-black/20 p-2 rounded border border-white/5">
                                                <code className="text-xs text-gold-500 font-mono break-all">{depositAddresses[selectedChain]}</code>
                                                <button onClick={() => navigator.clipboard.writeText(depositAddresses[selectedChain])} className="text-slate-400 hover:text-white"><Copy size={14} /></button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="block text-sm text-slate-400 mb-1">Amount</label>
                                <input type="number" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value))} className="w-full bg-navy-900 border border-white/10 rounded p-2 text-white" placeholder="0.00" />
                            </div>

                            {action === 'DEPOSIT' ? (
                                <div className="mb-6">
                                    <label className="block text-sm text-slate-400 mb-1">Transaction Hash (TxID)</label>
                                    <input type="text" value={txHash} onChange={(e) => setTxHash(e.target.value)} className="w-full bg-navy-900 border border-white/10 rounded p-2 text-white text-xs font-mono" placeholder="Paste hash here..." />
                                </div>
                            ) : (
                                <div className="mb-6">
                                    <label className="block text-sm text-slate-400 mb-1">Destination Address</label>
                                    <input type="text" value={withdrawAddress} onChange={(e) => setWithdrawAddress(e.target.value)} className="w-full bg-navy-900 border border-white/10 rounded p-2 text-white text-xs font-mono" placeholder="Address..." />
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button onClick={() => setAction(null)} className="flex-1 py-2 text-slate-300 hover:text-white transition-colors">Cancel</button>
                                <button onClick={handleTransaction} disabled={!amount || (action === 'DEPOSIT' && !txHash) || (action === 'WITHDRAWAL' && !withdrawAddress)} className="flex-1 bg-gold-600 hover:bg-gold-500 text-white py-2 rounded-sm disabled:opacity-50">
                                    {action === 'DEPOSIT' ? 'Confirm Deposit' : 'Confirm Withdrawal'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default WalletPage;
