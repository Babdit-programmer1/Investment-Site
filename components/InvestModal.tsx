
import React, { useState } from 'react';
import { Investment } from '../types';
import { X, ShieldCheck, Wallet, Loader2, FileText, CheckSquare, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../src/config';

interface InvestModalProps {
  investment: Investment;
  onClose: () => void;
}

const InvestModal: React.FC<InvestModalProps> = ({ investment, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'DETAILS' | 'LEGAL' | 'PAYMENT'>('DETAILS');
  const [amount, setAmount] = useState<number>(investment.minInvestment);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [legalAgreed, setLegalAgreed] = useState({
      riskDisclosure: false,
      offeringMemo: false,
      terms: false
  });

  const token = localStorage.getItem('prestige_token');
  const feePercentage = 0.015; // 1.5% platform fee
  const processingFee = amount * feePercentage;
  const total = amount + processingFee;

  const handleInvest = async () => {
    setLoading(true);
    setError('');

    try {
      // Crypto-Only: No gateway parameter needed, defaults to internal wallet
      const res = await fetch(`${API_BASE_URL}/payments/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          assetId: investment.id,
          amount: amount
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
          throw new Error(data.message || 'Investment failed');
      }

      // Success
      if (data.success) {
         navigate('/dashboard?status=success');
         onClose();
      }
    } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
    } finally {
        setLoading(false);
    }
  };

  const renderDetails = () => (
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

        <button 
            onClick={() => setStep('LEGAL')}
            disabled={amount < investment.minInvestment}
            className="w-full bg-gold-600 hover:bg-gold-500 text-white font-serif py-3 rounded shadow-lg transition-all disabled:opacity-50 mt-4"
        >
            Review Legal Terms
        </button>
      </div>
  );

  const renderLegal = () => (
      <div className="space-y-4 mb-6">
          <div className="bg-navy-950 p-4 rounded border border-white/10 h-48 overflow-y-auto text-xs text-slate-400 leading-relaxed">
              <h4 className="text-white font-bold mb-2">RISK DISCLOSURE & OFFERING MEMORANDUM</h4>
              <p className="mb-2">1. <strong>Investment Risk:</strong> Investments in alternative assets involve a high degree of risk and are speculative. You may lose your entire investment.</p>
              <p className="mb-2">2. <strong>Liquidity:</strong> These assets are illiquid. There is no guarantee of a secondary market.</p>
              <p className="mb-2">3. <strong>Holding Structure:</strong> Your investment is held via a Special Purpose Vehicle (SPV) domiciled in the Cayman Islands.</p>
              <p>By proceeding, you acknowledge that you have read the Offering Memorandum for {investment.title}.</p>
          </div>

          <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer group">
                  <div className={`mt-0.5 w-4 h-4 border rounded flex items-center justify-center ${legalAgreed.riskDisclosure ? 'bg-gold-600 border-gold-600' : 'border-slate-500'}`}>
                      {legalAgreed.riskDisclosure && <CheckSquare size={12} className="text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={legalAgreed.riskDisclosure} onChange={() => setLegalAgreed({...legalAgreed, riskDisclosure: !legalAgreed.riskDisclosure})} />
                  <span className="text-sm text-slate-300 group-hover:text-white">I accept the Risk Disclosure Statement</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer group">
                  <div className={`mt-0.5 w-4 h-4 border rounded flex items-center justify-center ${legalAgreed.offeringMemo ? 'bg-gold-600 border-gold-600' : 'border-slate-500'}`}>
                      {legalAgreed.offeringMemo && <CheckSquare size={12} className="text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={legalAgreed.offeringMemo} onChange={() => setLegalAgreed({...legalAgreed, offeringMemo: !legalAgreed.offeringMemo})} />
                  <span className="text-sm text-slate-300 group-hover:text-white">I have read the Offering Memorandum</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer group">
                  <div className={`mt-0.5 w-4 h-4 border rounded flex items-center justify-center ${legalAgreed.terms ? 'bg-gold-600 border-gold-600' : 'border-slate-500'}`}>
                      {legalAgreed.terms && <CheckSquare size={12} className="text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={legalAgreed.terms} onChange={() => setLegalAgreed({...legalAgreed, terms: !legalAgreed.terms})} />
                  <span className="text-sm text-slate-300 group-hover:text-white">I agree to the Terms of Service</span>
              </label>
          </div>

          <button 
            onClick={() => setStep('PAYMENT')}
            disabled={!legalAgreed.riskDisclosure || !legalAgreed.offeringMemo || !legalAgreed.terms}
            className="w-full bg-gold-600 hover:bg-gold-500 text-white font-serif py-3 rounded shadow-lg transition-all disabled:opacity-50 mt-4"
        >
            Accept & Continue
        </button>
      </div>
  );

  const renderPayment = () => (
      <div className="space-y-4 mb-6">
         <div className="bg-navy-900 border border-white/10 rounded p-4 flex items-start gap-4">
             <div className="p-3 bg-gold-600/20 rounded-full text-gold-500">
                 <Wallet size={24} />
             </div>
             <div>
                 <h4 className="text-white font-medium">Pay from Wallet</h4>
                 <p className="text-sm text-slate-400 mt-1">
                     Funds will be deducted from your available balance. Please ensure you have sufficient deposits.
                 </p>
             </div>
         </div>

         <div className="bg-emerald-900/20 border border-emerald-500/20 p-3 rounded mb-6 flex gap-3">
             <ShieldCheck className="text-emerald-500 w-5 h-5 flex-shrink-0" />
             <p className="text-xs text-emerald-200/80 leading-relaxed">
               <span className="font-bold text-emerald-400">Escrow Protection:</span> Your funds will be held in a regulated escrow account and only released to the asset issuer upon successful compliance review.
             </p>
          </div>

          <button 
            onClick={handleInvest}
            disabled={loading}
            className="w-full bg-gold-600 hover:bg-gold-500 text-white font-serif py-3 rounded shadow-lg transition-all disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Confirm Investment'}
          </button>
      </div>
  );

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

          {/* Progress Stepper */}
          <div className="flex items-center justify-between mb-6 text-xs font-medium text-slate-500 relative">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-navy-950 -z-10"></div>
              <span className={`px-2 bg-navy-800 ${step === 'DETAILS' ? 'text-gold-500' : 'text-emerald-500'}`}>1. Details</span>
              <span className={`px-2 bg-navy-800 ${step === 'LEGAL' ? 'text-gold-500' : step === 'PAYMENT' ? 'text-emerald-500' : ''}`}>2. Legal</span>
              <span className={`px-2 bg-navy-800 ${step === 'PAYMENT' ? 'text-gold-500' : ''}`}>3. Payment</span>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm rounded flex items-center gap-2">
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          {step === 'DETAILS' && renderDetails()}
          {step === 'LEGAL' && renderLegal()}
          {step === 'PAYMENT' && renderPayment()}

        </div>
      </div>
    </div>
  );
};

export default InvestModal;
