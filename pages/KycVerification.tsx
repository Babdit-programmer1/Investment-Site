import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Upload, User, MapPin, Camera, CheckCircle, AlertCircle, Loader2, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../src/config';

const KycVerification: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('prestige_token');
  const { user } = useAuth();

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/kyc/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setStatus(data);
      setCurrentStep(data.currentStep);
    } catch (e) {
      console.warn("KYC Status fetch failed");
    }
  };

  const handleStepSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/kyc/submit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ step: currentStep, data })
      });
      const resData = await res.json();
      
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
      } else {
         navigate('/dashboard');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    if (status?.status === 'APPROVED') {
       return (
         <div className="text-center py-12">
            <ShieldCheck className="w-24 h-24 text-emerald-500 mx-auto mb-6" />
            <h2 className="text-3xl font-serif text-white mb-4">Identity Verified</h2>
            <p className="text-slate-400 mb-8">Your account is fully approved for institutional-grade trading.</p>
            <button onClick={() => navigate('/dashboard')} className="bg-gold-600 hover:bg-gold-500 text-white px-8 py-3 rounded">Return to Dashboard</button>
         </div>
       );
    }
    
    if (status?.status === 'PENDING' || status?.status === 'REVIEW') {
       return (
         <div className="text-center py-12">
            <Loader2 className="w-24 h-24 text-gold-500 mx-auto mb-6 animate-spin" />
            <h2 className="text-3xl font-serif text-white mb-4">Verification In Progress</h2>
            <p className="text-slate-400 mb-8">Our compliance team is reviewing your documents. This typically takes 24-48 hours.</p>
            <button onClick={() => navigate('/dashboard')} className="bg-navy-800 hover:bg-navy-700 text-white px-8 py-3 rounded border border-white/10">Back to Dashboard</button>
         </div>
       );
    }

    switch(currentStep) {
      case 1:
        return <IdentityStep onSubmit={handleStepSubmit} loading={loading} initialData={status?.details?.identity} />;
      case 2:
        return <ClassificationStep onSubmit={handleStepSubmit} loading={loading} />;
      case 3:
        return <DocumentStep onSubmit={handleStepSubmit} loading={loading} />;
      case 4:
        return <AddressStep onSubmit={handleStepSubmit} loading={loading} />;
      case 5:
        return <LivenessStep onSubmit={handleStepSubmit} loading={loading} />;
      default:
        return <div>Unknown Step</div>;
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 pt-24 pb-12 px-4">
       <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
             <h1 className="text-2xl font-serif text-white mb-2">Identity Verification</h1>
             <p className="text-slate-400 text-sm">Prestige Assets complies with global AML/KYC regulations.</p>
          </div>

          {/* Progress Bar */}
          {status?.status !== 'APPROVED' && status?.status !== 'PENDING' && (
             <div className="flex justify-between mb-8 relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-navy-800 -z-10 rounded"></div>
                {[1, 2, 3, 4, 5].map(s => (
                   <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${s <= currentStep ? 'bg-gold-500 text-navy-900' : 'bg-navy-800 text-slate-500 border border-white/10'}`}>
                      {s < currentStep ? <CheckCircle size={14} /> : s}
                   </div>
                ))}
             </div>
          )}

          <div className="bg-navy-800 border border-white/5 rounded-lg p-8 shadow-2xl">
             {renderStep()}
          </div>
          
          <div className="mt-8 text-center flex items-center justify-center gap-2 text-xs text-slate-500">
             <ShieldCheck size={12} />
             <span>Bank-grade encryption • GDPR Compliant • SumSub Powered</span>
          </div>
       </div>
    </div>
  );
};

// SUB-COMPONENTS FOR STEPS

const IdentityStep = ({ onSubmit, loading, initialData }: any) => {
  const [data, setData] = useState(initialData || { firstName: '', lastName: '', dob: '', nationality: '' });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
         <div className="p-3 bg-navy-900 rounded-full border border-white/10"><User className="text-gold-500" /></div>
         <div>
            <h3 className="text-white font-medium">Personal Information</h3>
            <p className="text-xs text-slate-400">Match your legal government ID.</p>
         </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
         <div>
            <label className="text-xs text-slate-400 mb-1 block">First Name</label>
            <input type="text" className="w-full bg-navy-900 border border-white/10 rounded p-2 text-white" value={data.firstName} onChange={e => setData({...data, firstName: e.target.value})} />
         </div>
         <div>
            <label className="text-xs text-slate-400 mb-1 block">Last Name</label>
            <input type="text" className="w-full bg-navy-900 border border-white/10 rounded p-2 text-white" value={data.lastName} onChange={e => setData({...data, lastName: e.target.value})} />
         </div>
         <div>
            <label className="text-xs text-slate-400 mb-1 block">Date of Birth</label>
            <input type="date" className="w-full bg-navy-900 border border-white/10 rounded p-2 text-white" value={data.dob} onChange={e => setData({...data, dob: e.target.value})} />
         </div>
         <div>
            <label className="text-xs text-slate-400 mb-1 block">Nationality</label>
            <input type="text" className="w-full bg-navy-900 border border-white/10 rounded p-2 text-white" value={data.nationality} onChange={e => setData({...data, nationality: e.target.value})} />
         </div>
      </div>
      <button onClick={() => onSubmit({ identity: data })} disabled={loading} className="w-full bg-gold-600 hover:bg-gold-500 text-white py-3 rounded font-medium mt-4 disabled:opacity-50">
         {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Continue'}
      </button>
    </div>
  );
};

const ClassificationStep = ({ onSubmit, loading }: any) => {
    const [type, setType] = useState('RETAIL');
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-navy-900 rounded-full border border-white/10"><Briefcase className="text-gold-500" /></div>
                <div>
                    <h3 className="text-white font-medium">Investor Classification</h3>
                    <p className="text-xs text-slate-400">Determine your regulatory status.</p>
                </div>
            </div>

            <div className="space-y-3">
                {[
                    { id: 'RETAIL', label: 'Retail Investor', desc: 'Net worth < $1M. Standard limits apply.' },
                    { id: 'ACCREDITED', label: 'Accredited Investor', desc: 'Net worth > $1M or Income > $200k.' },
                    { id: 'INSTITUTIONAL', label: 'Institutional', desc: 'Family Office, Fund, or Corporate Entity.' }
                ].map((opt) => (
                    <div 
                        key={opt.id} 
                        onClick={() => setType(opt.id)}
                        className={`p-4 rounded border cursor-pointer transition-all ${type === opt.id ? 'bg-gold-600/20 border-gold-500' : 'bg-navy-900 border-white/10 hover:border-white/30'}`}
                    >
                        <h4 className="text-white font-medium text-sm">{opt.label}</h4>
                        <p className="text-xs text-slate-400">{opt.desc}</p>
                    </div>
                ))}
            </div>

            <button onClick={() => onSubmit({ classification: type })} disabled={loading} className="w-full bg-gold-600 hover:bg-gold-500 text-white py-3 rounded font-medium mt-4 disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Confirm Status'}
            </button>
        </div>
    );
};

const DocumentStep = ({ onSubmit, loading }: any) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
         <div className="p-3 bg-navy-900 rounded-full border border-white/10"><Upload className="text-gold-500" /></div>
         <div>
            <h3 className="text-white font-medium">Document Upload</h3>
            <p className="text-xs text-slate-400">Passport, National ID, or Driver's License.</p>
         </div>
      </div>

      <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:bg-navy-900/50 transition-colors cursor-pointer">
         <Upload className="mx-auto text-slate-500 mb-2" />
         <p className="text-sm text-white">Click to upload Front of ID</p>
         <p className="text-xs text-slate-500 mt-1">JPG, PNG or PDF (Max 5MB)</p>
      </div>

      <button onClick={() => onSubmit({ document: { type: 'Passport', number: '123456', uploaded: true } })} disabled={loading} className="w-full bg-gold-600 hover:bg-gold-500 text-white py-3 rounded font-medium mt-4 disabled:opacity-50">
         {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Submit Documents'}
      </button>
    </div>
  );
};

const AddressStep = ({ onSubmit, loading }: any) => {
   return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
         <div className="p-3 bg-navy-900 rounded-full border border-white/10"><MapPin className="text-gold-500" /></div>
         <div>
            <h3 className="text-white font-medium">Proof of Address</h3>
            <p className="text-xs text-slate-400">Utility bill or bank statement (issued last 3 months).</p>
         </div>
      </div>

      <input type="text" placeholder="Street Address" className="w-full bg-navy-900 border border-white/10 rounded p-3 text-white" />
      <div className="grid grid-cols-2 gap-4">
         <input type="text" placeholder="City" className="w-full bg-navy-900 border border-white/10 rounded p-3 text-white" />
         <input type="text" placeholder="Country" className="w-full bg-navy-900 border border-white/10 rounded p-3 text-white" />
      </div>

      <button onClick={() => onSubmit({ address: { street: '123 Fake St', country: 'US' } })} disabled={loading} className="w-full bg-gold-600 hover:bg-gold-500 text-white py-3 rounded font-medium mt-4 disabled:opacity-50">
         {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Continue'}
      </button>
    </div>
   );
};

const LivenessStep = ({ onSubmit, loading }: any) => {
   return (
    <div className="space-y-6 text-center">
      <div className="flex items-center gap-4 mb-6 text-left">
         <div className="p-3 bg-navy-900 rounded-full border border-white/10"><Camera className="text-gold-500" /></div>
         <div>
            <h3 className="text-white font-medium">Liveness Check</h3>
            <p className="text-xs text-slate-400">Verify that you are a real person.</p>
         </div>
      </div>

      <div className="w-48 h-48 bg-navy-900 rounded-full mx-auto border-4 border-gold-500/20 flex items-center justify-center">
         <div className="w-40 h-40 bg-slate-800 rounded-full animate-pulse"></div>
      </div>
      <p className="text-xs text-slate-400">Position your face in the circle.</p>

      <button onClick={() => onSubmit({ selfie: { verified: true } })} disabled={loading} className="w-full bg-gold-600 hover:bg-gold-500 text-white py-3 rounded font-medium mt-4 disabled:opacity-50">
         {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Complete Verification'}
      </button>
    </div>
   );
};

export default KycVerification;