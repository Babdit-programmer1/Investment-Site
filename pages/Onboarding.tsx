import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, Briefcase, CheckCircle, ChevronRight, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';

const { useNavigate } = ReactRouterDOM;

const Onboarding: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleNext = async () => {
    setLoading(true);
    // Simulate save delay
    await new Promise(r => setTimeout(r, 600));
    
    if (step < 3) {
      setStep(step + 1);
      setLoading(false);
    } else {
      // Completion
      if (user) {
        user.onboardingCompleted = true;
        authService.updateProfile(user);
      }
      setTimeout(() => navigate('/dashboard'), 500);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress */}
        <div className="mb-12">
          <div className="flex items-center justify-between text-sm font-medium text-slate-400 mb-2">
            <span>Profile Setup</span>
            <span>Compliance</span>
            <span>Complete</span>
          </div>
          <div className="h-2 bg-navy-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gold-500 transition-all duration-500 ease-out"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-navy-800 border border-white/5 shadow-2xl rounded-lg p-8 md:p-12">
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="w-12 h-12 bg-gold-500/10 rounded-full flex items-center justify-center mb-6">
                <User className="text-gold-500 w-6 h-6" />
              </div>
              <h2 className="text-3xl font-serif text-white mb-4">Investor Profile</h2>
              <p className="text-slate-400 mb-8">To comply with financial regulations, we need to understand your investment experience.</p>
              
              <div className="space-y-4">
                <label className="block">
                  <span className="text-slate-300 text-sm mb-1 block">Years of Experience</span>
                  <select className="w-full bg-navy-900 border border-white/10 rounded p-3 text-white">
                    <option>0-2 Years</option>
                    <option>2-5 Years</option>
                    <option>5+ Years</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-slate-300 text-sm mb-1 block">Liquid Net Worth</span>
                  <select className="w-full bg-navy-900 border border-white/10 rounded p-3 text-white">
                    <option>Under $1M</option>
                    <option>$1M - $5M</option>
                    <option>$5M+</option>
                  </select>
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <div className="w-12 h-12 bg-gold-500/10 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck className="text-gold-500 w-6 h-6" />
              </div>
              <h2 className="text-3xl font-serif text-white mb-4">Compliance & KYC</h2>
              <p className="text-slate-400 mb-8">Verify your identity to access institutional-grade assets.</p>
              
              <div className="p-4 border border-dashed border-white/20 rounded-lg bg-navy-900/50 text-center py-8 mb-6">
                <p className="text-slate-300 mb-2">Upload Passport or Gov ID</p>
                <button className="text-sm text-gold-500 hover:text-gold-400 font-medium">Choose File</button>
              </div>
              
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1" />
                <span className="text-sm text-slate-400">I certify that the funds used for investment are from legitimate sources and I am not a politically exposed person.</span>
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in text-center py-8">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                <CheckCircle className="text-emerald-500 w-8 h-8" />
              </div>
              <h2 className="text-3xl font-serif text-white mb-4">Application Received</h2>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                Your profile is now under review by our compliance team. You can access the dashboard, but investment features may be restricted until approval.
              </p>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button 
              onClick={handleNext}
              disabled={loading}
              className="bg-gold-600 hover:bg-gold-500 text-white px-8 py-3 rounded text-sm font-medium flex items-center transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin w-4 h-4" /> : step === 3 ? "Go to Dashboard" : "Continue"}
              {!loading && step !== 3 && <ChevronRight className="w-4 h-4 ml-2" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;