import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Gem, Mail, ArrowRight, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../src/config';

const { Link } = ReactRouterDOM;

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('LOADING');
    
    try {
        // Simulate API call
        // In real app: await fetch(`${API_BASE_URL}/auth/reset-password-request`, ...)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setStatus('SUCCESS');
        setMessage(`If an account exists for ${email}, you will receive a password reset link shortly.`);
    } catch (e) {
        setStatus('ERROR');
        setMessage('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center space-x-2">
            <Gem className="h-10 w-10 text-gold-500" />
            <span className="font-serif text-2xl font-bold text-white tracking-wider">
              PRESTIGE <span className="text-gold-500">ASSETS</span>
            </span>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-serif text-white">
          Reset Password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Enter your email to receive recovery instructions
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-navy-800 py-8 px-4 shadow-xl border border-white/5 sm:rounded-lg sm:px-10">
          
          {status === 'SUCCESS' ? (
              <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-500/10 mb-4">
                      <CheckCircle className="h-6 w-6 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Check your email</h3>
                  <p className="text-sm text-slate-400 mb-6">{message}</p>
                  <Link 
                    to="/login"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-gold-500 bg-gold-500/10 hover:bg-gold-500/20 transition-colors"
                  >
                    Return to Login
                  </Link>
              </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
                {status === 'ERROR' && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm rounded">
                        {message}
                    </div>
                )}
                
                <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                    Email address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500" />
                    </div>
                    <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 bg-navy-900 border border-white/10 rounded-md py-3 text-white placeholder-slate-500 focus:ring-gold-500 focus:border-gold-500 sm:text-sm"
                    placeholder="you@example.com"
                    />
                </div>
                </div>

                <div>
                <button
                    type="submit"
                    disabled={status === 'LOADING'}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-gold-600 hover:bg-gold-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 transition-colors disabled:opacity-50"
                >
                    {status === 'LOADING' ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                    <span className="flex items-center">
                        Send Reset Link <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                    )}
                </button>
                </div>

                <div className="flex items-center justify-center">
                    <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white flex items-center">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                    </Link>
                </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;