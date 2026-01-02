
import React, { useEffect, useState } from 'react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, CreditCard, Bitcoin, RefreshCw, Loader2, DollarSign, FileText, CheckCircle, Clock, AlertCircle, Lock, Copy } from 'lucide-react';
import { Wallet } from '../types';
import { useAuth } from '../context/AuthContext';
import { useGlobal } from '../context/GlobalContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../src/config';

// Fallback if API fails
const DEFAULT_ADDRESSES: Record<string, string> = {
    'BTC': 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    'ETH': '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    'BSC': '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    'POLYGON': '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    'SOLANA': 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrx',
    'TRON': 'TNPEeAAFB7KtNrMaKKMA463n2M5t96pp3d'
};

const MOCK_WALLET: Wallet = {
  id: 'w1',
  fiatBalance: 15000,
  cryptoBalances: [],
  transactions: []
};

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
  const [action, setAction] = useState<'DEPOSIT' | 'WITHDRAWAL' | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [asset, setAsset] = useState('USD');
  const [selectedChain, setSelectedChain] = useState('ETH');
  const [txHash, setTxHash] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [kycError, setKycError] = useState(false);
  const [withdrawalMessage, setWithdrawalMessage] = useState('');
  
  // Config State
  const [depositAddresses, setDepositAddresses] = useState<Record<string, string>>(DEFAULT_ADDRESSES);
  
  // Ledger State
  const [logs, setLogs] = useState<LedgerLog[]>([]);
  const [activeTab, setActiveTab] = useState<LogType>('ALL');
  const [logsLoading, setLogsLoading] = useState(false);

  const { user } = useAuth();
  const { convertPrice, currency, t } = useGlobal();
  const navigate = useNavigate();
  const token = localStorage.getItem('prestige_token');

  useEffect(() => {
    fetchWallet();
    fetchDepositConfig();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [activeTab]);

  const fetchDepositConfig = async () => {
      try {
          const res = await fetch(`${API_BASE_URL}/payments/config`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
              const data = await res.json();
              setDepositAddresses(data);
          }
      } catch (e) {
          console.warn("Failed to fetch dynamic deposit addresses, using fallback");
      }
  };

  const fetchWallet = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/wallet`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      setWallet(data);
    } catch (e) {
      setWallet(MOCK_WALLET);
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
        const data = await res.json();
        setLogs(data);
      } else {
        if (wallet?.transactions) {
           const mapped = wallet.transactions.map((t: any) => ({
             id: t.id,
             actionType: t.type,
             amount: t.amount,
             currency: t.currency,
             status: t.status,
             referenceId: t.reference,
             createdAt: t.createdAt
           }));
           setLogs(mapped);
        }
      }
    } catch (e) {
       console.warn("Using transaction fallback");
    } finally {
      setLogsLoading(false);
    }
  };

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
            if (data.status === 'PENDING_APPROVAL' || action === 'DEPOSIT') {
                setWithdrawalMessage(data.message);
            } else {
                await fetchWallet();
                await fetchLogs();
                setAction(null);
            }
        }
    } catch (e) {
        console.warn('Backend unavailable');
        setWithdrawalMessage('Network error');
    } finally {
        setLoading(false);
    }
  };

  if (loading && !wallet) return <div className="min-h-screen bg-navy-900 pt-20 flex justify-center items-center"><Loader2 className="w-8 h-8 text-gold-500 animate-spin" /></div>;

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
            {/* Balances */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* Fiat Card */}
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

                {/* Unified Ledger Log */}
                <div className="bg-navy-800 border border-white/5 rounded-lg overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                       <h3 className="text-white font-serif text-lg flex items-center"><FileText className="w-5 h-5 text-gold-500 mr-2" /> Financial Ledger</h3>
                       
                       {/* Tabs */}
                       <div className="flex bg-navy-900 p-1 rounded-lg">
                          {['ALL', 'DEPOSIT', 'INVESTMENT', 'PROFIT', 'WITHDRAWAL'].map((t) => (
                             <button
                                key={t}
                                onClick={() => setActiveTab(t as LogType)}
                                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                                   activeTab === t ? 'bg-navy-700 text-white shadow' : 'text-slate-400 hover:text-white'
                                }`}
                             >
                                {t.charAt(0) + t.slice(1).toLowerCase()}
                             </button>
                          ))}
                       </div>
                    </div>

                    <div className="min-h-[300px]">
                       {logsLoading ? (
                          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gold-500" /></div>
                       ) : logs.length === 0 ? (
                          <div className="text-center py-12 text-slate-500 text-sm">No records found for this category.</div>
                       ) : (
                          <div className="divide-y divide-white/5">
                             {logs.map((log) => (
                                <div key={log.id} className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between">
                                   <div className="flex items-center gap-4">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border border-white/10 ${
                                         log.actionType === 'DEPOSIT' || log.actionType === 'PROFIT' ? 'bg-emerald-500/10 text-emerald-400' : 
                                         log.actionType === 'WITHDRAWAL' ? 'bg-rose-500/10 text-rose-400' : 'bg-blue-500/10 text-blue-400'
                                      }`}>
                                         {log.actionType === 'DEPOSIT' ? <ArrowDownLeft size={16} /> :
                                          log.actionType === 'WITHDRAWAL' ? <ArrowUpRight size={16} /> :
                                          log.actionType === 'PROFIT' ? <DollarSign size={16} /> : <CreditCard size={16} />}
                                      </div>
                                      <div>
                                         <p className="text-white text-sm font-medium">{log.actionType}</p>
                                         <p className="text-xs text-slate-500 font-mono">{log.referenceId} • {new Date(log.createdAt).toLocaleDateString()}</p>
                                      </div>
                                   </div>
                                   <div className="text-right">
                                      <p className={`text-sm font-bold ${
                                         log.actionType === 'DEPOSIT' || log.actionType === 'PROFIT' ? 'text-emerald-400' : 'text-white'
                                      }`}>
                                         {log.actionType === 'DEPOSIT' || log.actionType === 'PROFIT' ? '+' : '-'}{convertPrice(log.amount)}
                                      </p>
                                      <div className="flex items-center justify-end gap-1 mt-1">
                                         {log.status === 'COMPLETED' ? <CheckCircle size={10} className="text-emerald-500" /> : 
                                          log.status === 'PENDING_APPROVAL' ? <Lock size={10} className="text-rose-500" /> : <Clock size={10} className="text-amber-500" />}
                                         <span className={`text-[10px] uppercase ${log.status === 'PENDING_APPROVAL' ? 'text-rose-400 font-bold' : 'text-slate-500'}`}>{log.status.replace('_', ' ')}</span>
                                      </div>
                                   </div>
                                </div>
                             ))}
                          </div>
                       )}
                    </div>
                </div>
            </div>

            {/* Crypto Side Panel */}
            <div className="space-y-8">
                <div className="bg-navy-800 border border-white/5 rounded-lg p-6">
                    <h3 className="text-white font-serif text-lg mb-4 flex items-center"><Bitcoin className="w-5 h-5 text-gold-500 mr-2" /> Digital Assets</h3>
                    <div className="space-y-4">
                        {wallet?.cryptoBalances.map(crypto => (
                            <div key={crypto.id} className="flex justify-between items-center p-4 bg-navy-900 rounded border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                                        {crypto.asset.substring(0,1)}
                                    </div>
                                    <div>
                                        <div className="text-white font-medium">{crypto.asset}</div>
                                        <div className="text-xs text-slate-500">Cold Storage</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-white font-mono">{crypto.balance.toFixed(4)} {crypto.asset}</div>
                                </div>
                            </div>
                        ))}
                        {(!wallet?.cryptoBalances || wallet.cryptoBalances.length === 0) && (
                             <p className="text-slate-500 text-sm text-center py-4">No crypto assets currently held.</p>
                        )}
                        <button onClick={() => initiateAction('DEPOSIT')} className="w-full py-2 text-xs text-gold-500 hover:text-gold-400 border border-dashed border-gold-500/30 rounded">
                            + Deposit Crypto
                        </button>
                    </div>
                </div>
                
                <div className="bg-navy-900 border border-white/5 p-4 rounded text-xs text-slate-400">
                   <h4 className="text-white font-medium mb-2">Security Notice</h4>
                   <p>All financial logs are immutable. Deposits require block confirmation and admin approval.</p>
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
                            <Lock className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-white mb-2">Request Status</h4>
                            <p className="text-slate-400 text-sm mb-6">{withdrawalMessage}</p>
                            <button onClick={() => { setAction(null); setAmount(0); setWithdrawalMessage(''); fetchLogs(); fetchWallet(); }} className="w-full bg-navy-700 hover:bg-navy-600 text-white py-2 rounded">Close</button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm text-slate-400 mb-1">Currency</label>
                                <select 
                                    value={asset} 
                                    onChange={(e) => setAsset(e.target.value)}
                                    className="w-full bg-navy-900 border border-white/10 rounded p-2 text-white"
                                >
                                    <option value="USD">USD (Stablecoin Equivalent)</option>
                                </select>
                            </div>

                            {action === 'DEPOSIT' && (
                                <div className="mb-4">
                                    <label className="block text-sm text-slate-400 mb-1">Network / Chain</label>
                                    <select 
                                        value={selectedChain} 
                                        onChange={(e) => setSelectedChain(e.target.value)}
                                        className="w-full bg-navy-900 border border-white/10 rounded p-2 text-white"
                                    >
                                        {Object.keys(depositAddresses).map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    
                                    <div className="mt-4 p-4 bg-navy-900 border border-white/10 rounded">
                                        <p className="text-xs text-slate-400 mb-2">Send funds to this address:</p>
                                        <div className="flex items-center justify-between bg-black/20 p-2 rounded border border-white/5 mb-2">
                                            <code className="text-xs text-gold-500 font-mono break-all">{depositAddresses[selectedChain]}</code>
                                            <button onClick={() => navigator.clipboard.writeText(depositAddresses[selectedChain])} className="text-slate-400 hover:text-white"><Copy size={14} /></button>
                                        </div>
                                        <p className="text-[10px] text-amber-500 flex items-center gap-1"><AlertCircle size={10} /> Ensure you send only supported assets on {selectedChain} network.</p>
                                    </div>
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="block text-sm text-slate-400 mb-1">Amount</label>
                                <input 
                                    type="number" 
                                    value={amount}
                                    onChange={(e) => setAmount(parseFloat(e.target.value))}
                                    className="w-full bg-navy-900 border border-white/10 rounded p-2 text-white"
                                    placeholder="0.00"
                                />
                            </div>

                            {action === 'DEPOSIT' ? (
                                <div className="mb-6">
                                    <label className="block text-sm text-slate-400 mb-1">Transaction Hash (TxID)</label>
                                    <input 
                                        type="text" 
                                        value={txHash}
                                        onChange={(e) => setTxHash(e.target.value)}
                                        className="w-full bg-navy-900 border border-white/10 rounded p-2 text-white text-xs font-mono"
                                        placeholder="Paste transaction hash here..."
                                    />
                                    <p className="text-[10px] text-slate-500 mt-1">Required for admin verification.</p>
                                </div>
                            ) : (
                                <div className="mb-6">
                                    <label className="block text-sm text-slate-400 mb-1">Destination Address</label>
                                    <input 
                                        type="text" 
                                        value={withdrawAddress}
                                        onChange={(e) => setWithdrawAddress(e.target.value)}
                                        className="w-full bg-navy-900 border border-white/10 rounded p-2 text-white text-xs font-mono"
                                        placeholder="Your crypto wallet address..."
                                    />
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button onClick={() => setAction(null)} className="flex-1 py-2 text-slate-300 hover:text-white transition-colors">Cancel</button>
                                <button onClick={handleTransaction} disabled={!amount || (action === 'DEPOSIT' && !txHash) || (action === 'WITHDRAWAL' && !withdrawAddress)} className="flex-1 bg-gold-600 hover:bg-gold-500 text-white py-2 rounded-sm disabled:opacity-50">
                                    {action === 'DEPOSIT' ? 'Submit Claim' : 'Request Withdraw'}
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
