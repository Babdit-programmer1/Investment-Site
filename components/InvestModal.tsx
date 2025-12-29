import React, { useState } from 'react';
import { Investment } from '../types';
import { X, ShieldCheck, CreditCard, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface InvestModalProps {
  investment: Investment;
  onClose: () => void;
}

const InvestModal: React.FC<InvestModalProps> = ({ investment, onClose }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState<number>(investment.minInvestment);
  const [gateway, setGateway] = useState('PAYSTACK'); // Default to Paystack (or Simulator)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('prestige_token');
  const feePercentage = 0.015; // 1.5% platform fee
  const processingFee = amount * feePercentage;
  const total = amount + processingFee;

  const handleInvest = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3001/api/v1/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          assetId: investment.id,
          amount: amount,
          gateway: 'SIMULATOR' // Forcing simulator for demo purposes so it works without keys
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Investment failed');

      // Redirect to gateway (or simulator)
      window.location.href = data.authorizationUrl;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-navy-800 rounded-lg shadow-2xl border border-white/10 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-navy-950 px-6 py-4 flex justify-between items-center border-b border-white/10">
          <h3 className="text-xl font-serif text-white">Secure Investment</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <img src={investment.imageUrl} alt={investment.title} className="w-16 h-16 object-cover rounded border border-white/10" />
            <div>
              <h4 className="text-white font-medium">{investment.title}</h4>
              <p className="text-xs text-gold-500 font-mono uppercase">{investment.ticker}</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm rounded">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Investment Amount (USD)</label>
              <input 
                type="number" 
                min={investment.minInvestment}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-navy-900 border border-white/10 rounded p-3 text-white focus:border-gold-500 focus:outline-none"
              />
              <p className="text-xs text-slate-500 mt-1">Min: ${investment.minInvestment.toLocaleString()}</p>
            </div>

            <div className="bg-navy-900/50 p-4 rounded border border-white/5 space-y-2 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Principal</span>
                <span>${amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Processing Fee (1.5%)</span>
                <span>${processingFee.toLocaleString()}</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between text-white font-bold">
                <span>Total Due</span>
                <span>${total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-900/20 border border-emerald-500/20 p-3 rounded mb-6 flex gap-3">
             <ShieldCheck className="text-emerald-500 w-5 h-5 flex-shrink-0" />
             <p className="text-xs text-emerald-200/80 leading-relaxed">
               <span className="font-bold text-emerald-400">Escrow Protection:</span> Your funds will be held in a regulated escrow account and only released to the asset issuer upon successful compliance review and deal finalization.
             </p>
          </div>

          <button 
            onClick={handleInvest}
            disabled={loading || amount < investment.minInvestment}
            className="w-full bg-gold-600 hover:bg-gold-500 text-white font-serif py-3 rounded shadow-lg transition-all disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><CreditCard size={18} /> Proceed to Payment</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvestModal;
