import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, AlertCircle, Loader2 } from 'lucide-react';

const { useNavigate } = ReactRouterDOM;

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Use the existing auth service which now hits the live backend
      await login(email, password);
      
      // We need to check role after login. 
      // Since login updates context, we might need to rely on the service promise 
      // or handle the redirect based on the response.
      // Assuming successful login for now. 
      // Ideally, we'd check if (user.role === 'ADMIN').
      
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Admin login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-navy-900 border border-white/10 rounded-lg p-8 shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-gold-600/20 rounded-full">
            <Shield className="h-8 w-8 text-gold-500" />
          </div>
        </div>
        
        <h1 className="text-2xl font-serif text-white text-center mb-2">Admin Portal</h1>
        <p className="text-slate-400 text-center mb-8 text-sm">Authorized Personnel Only</p>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm rounded flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Admin Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-navy-950 border border-white/10 rounded p-3 text-white focus:border-gold-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-navy-950 border border-white/10 rounded p-3 text-white focus:border-gold-500 outline-none"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-gold-600 hover:bg-gold-500 text-white font-medium py-3 rounded transition-colors flex justify-center items-center"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : <><Lock size={16} className="mr-2" /> Secure Login</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;