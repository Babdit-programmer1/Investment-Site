
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { User, Lock, Bell, Shield, Smartphone, Save, Check, Loader2, AlertCircle } from 'lucide-react';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'SECURITY' | 'NOTIFICATIONS'>('PROFILE');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state initialized with user data
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.profileData?.phone || '',
    twoFactor: user?.profileData?.twoFactor || false,
    emailAlerts: user?.profileData?.emailAlerts ?? true,
    pushAlerts: user?.profileData?.pushAlerts ?? true
  });

  // Password State
  const [passwordData, setPasswordData] = useState({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
  });

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
        await authService.updateProfile({
            fullName: formData.fullName,
            phone: formData.phone,
            twoFactor: formData.twoFactor,
            emailAlerts: formData.emailAlerts,
            pushAlerts: formData.pushAlerts
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    } catch (e) {
        setError('Failed to update profile');
    } finally {
        setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
      setError('');
      if (passwordData.newPassword !== passwordData.confirmPassword) {
          setError('New passwords do not match');
          return;
      }
      if (passwordData.newPassword.length < 8) {
          setError('Password must be at least 8 characters');
          return;
      }

      setLoading(true);
      
      try {
          // Simulate update
          await new Promise(resolve => setTimeout(resolve, 800));
          
          setSaved(true);
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
          setTimeout(() => setSaved(false), 3000);
      } catch (e: any) {
          setError(e.message);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-navy-900 pt-20">
      <div className="bg-navy-950 py-12 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-serif text-white mb-2">Account Settings</h1>
          <p className="text-slate-400">Manage your personal information and security preferences.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-2">
            <button 
              onClick={() => setActiveTab('PROFILE')}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'PROFILE' ? 'bg-navy-800 text-gold-500 border border-gold-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <User size={18} /> Profile
            </button>
            <button 
              onClick={() => setActiveTab('SECURITY')}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'SECURITY' ? 'bg-navy-800 text-gold-500 border border-gold-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <Shield size={18} /> Security
            </button>
            <button 
              onClick={() => setActiveTab('NOTIFICATIONS')}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'NOTIFICATIONS' ? 'bg-navy-800 text-gold-500 border border-gold-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <Bell size={18} /> Notifications
            </button>
          </div>

          {/* Content */}
          <div className="md:col-span-3 bg-navy-800 rounded-lg border border-white/5 p-8">
            
            {error && (
                <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm rounded flex items-center gap-2">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {activeTab === 'PROFILE' && (
              <div className="space-y-6">
                <h2 className="text-xl font-serif text-white mb-6">Personal Information</h2>
                
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={formData.fullName} 
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full bg-navy-900 border border-white/10 rounded p-3 text-white focus:border-gold-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      value={formData.email} 
                      disabled
                      className="w-full bg-navy-950 border border-white/5 rounded p-3 text-slate-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500 mt-1">Contact support to change email.</p>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-navy-900 border border-white/10 rounded p-3 text-white focus:border-gold-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'SECURITY' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-serif text-white mb-6">Password</h2>
                  <div className="space-y-4">
                    <input 
                        type="password" 
                        placeholder="Current Password" 
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="w-full bg-navy-900 border border-white/10 rounded p-3 text-white" 
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="password" 
                        placeholder="New Password" 
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="w-full bg-navy-900 border border-white/10 rounded p-3 text-white" 
                      />
                      <input 
                        type="password" 
                        placeholder="Confirm New Password" 
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="w-full bg-navy-900 border border-white/10 rounded p-3 text-white" 
                      />
                    </div>
                    <button 
                        onClick={handlePasswordUpdate}
                        disabled={!passwordData.currentPassword || !passwordData.newPassword}
                        className="text-gold-500 text-sm hover:text-white disabled:opacity-50"
                    >
                        Update Password
                    </button>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/10">
                  <h2 className="text-xl font-serif text-white mb-4">Two-Factor Authentication</h2>
                  <div className="flex items-center justify-between p-4 bg-navy-900/50 rounded border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-navy-800 rounded-full text-gold-500">
                        <Smartphone size={24} />
                      </div>
                      <div>
                        <p className="text-white font-medium">Authenticator App</p>
                        <p className="text-sm text-slate-400">Secure your account with 2FA.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.twoFactor} 
                        onChange={() => setFormData({...formData, twoFactor: !formData.twoFactor})}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-navy-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'NOTIFICATIONS' && (
              <div className="space-y-6">
                <h2 className="text-xl font-serif text-white mb-6">Preferences</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-navy-900/50 rounded border border-white/5">
                    <div>
                      <p className="text-white font-medium">Email Alerts</p>
                      <p className="text-sm text-slate-400">Receive statements and investment updates.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.emailAlerts} 
                        onChange={() => setFormData({...formData, emailAlerts: !formData.emailAlerts})}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-navy-950 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-navy-900/50 rounded border border-white/5">
                    <div>
                      <p className="text-white font-medium">Push Notifications</p>
                      <p className="text-sm text-slate-400">Real-time browser notifications for transactions.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.pushAlerts} 
                        onChange={() => setFormData({...formData, pushAlerts: !formData.pushAlerts})}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-navy-950 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab !== 'SECURITY' && (
                <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center bg-gold-600 hover:bg-gold-500 text-white px-6 py-2 rounded-sm transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : 
                    saved ? <Check size={18} className="mr-2" /> : <Save size={18} className="mr-2" />}
                    {loading ? 'Saving...' : saved ? 'Saved Successfully' : 'Save Changes'}
                </button>
                </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
