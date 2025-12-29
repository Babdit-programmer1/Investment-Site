import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Gem, Lock, Mail, User, Globe, Loader2, Check } from 'lucide-react';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    investorType: 'Individual',
    interests: [] as string[]
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => {
      if (prev.interests.includes(interest)) {
        return { ...prev, interests: prev.interests.filter(i => i !== interest) };
      } else {
        return { ...prev, interests: [...prev.interests, interest] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
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
          Investor Application
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Create your profile to view exclusive prospectus details
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-navy-800 py-8 px-4 shadow-xl border border-white/5 sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-6 p-4 rounded-md bg-rose-500/10 border border-rose-500/50 text-sm text-rose-200">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Personal Details */}
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-300">Full Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="block w-full pl-10 bg-navy-900 border border-white/10 rounded-md py-3 text-white focus:ring-gold-500 focus:border-gold-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-300">Email Address</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 bg-navy-900 border border-white/10 rounded-md py-3 text-white focus:ring-gold-500 focus:border-gold-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300">Country</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    name="country"
                    type="text"
                    required
                    value={formData.country}
                    onChange={handleChange}
                    className="block w-full pl-10 bg-navy-900 border border-white/10 rounded-md py-3 text-white focus:ring-gold-500 focus:border-gold-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300">Investor Type</label>
                <div className="mt-1">
                  <select
                    name="investorType"
                    value={formData.investorType}
                    onChange={handleChange}
                    className="block w-full pl-3 bg-navy-900 border border-white/10 rounded-md py-3 text-white focus:ring-gold-500 focus:border-gold-500 sm:text-sm"
                  >
                    <option value="Individual">Individual</option>
                    <option value="High Net Worth">High Net Worth ($1M+)</option>
                    <option value="Institutional">Institutional</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300">Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 bg-navy-900 border border-white/10 rounded-md py-3 text-white focus:ring-gold-500 focus:border-gold-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300">Confirm Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full pl-10 bg-navy-900 border border-white/10 rounded-md py-3 text-white focus:ring-gold-500 focus:border-gold-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Asset Interests</label>
              <div className="grid grid-cols-2 gap-3">
                {['Real Estate', 'Fine Art', 'Jewelry', 'Artifacts', 'Collectibles', 'Gold'].map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest)}
                    className={`flex items-center justify-between px-4 py-3 border rounded-md text-sm font-medium transition-all ${
                      formData.interests.includes(interest)
                        ? 'bg-gold-600/20 border-gold-500 text-gold-500'
                        : 'bg-navy-900 border-white/10 text-slate-400 hover:border-white/30'
                    }`}
                  >
                    {interest}
                    {formData.interests.includes(interest) && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-gold-600 focus:ring-gold-500 border-gray-300 rounded bg-navy-900"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-slate-400">
                I agree to the <a href="#" className="text-gold-500 hover:text-gold-400">Terms of Service</a> and <a href="#" className="text-gold-500 hover:text-gold-400">Privacy Policy</a>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-gold-600 hover:bg-gold-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-500">Already have an account? </span>
            <Link to="/login" className="font-medium text-gold-500 hover:text-gold-400">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;