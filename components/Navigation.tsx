
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Gem, LogOut, LayoutDashboard, Shield, FileText, Wallet, BarChart2, Bell, Settings as SettingsIcon, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGlobal } from '../context/GlobalContext';
import LanguageCurrencySelector from './LanguageCurrencySelector';
import { MOCK_NOTIFICATIONS } from '../src/mockData';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
      // Load mock notifications
      setNotifications(MOCK_NOTIFICATIONS);
      setUnreadCount(MOCK_NOTIFICATIONS.filter(n => !n.read).length);
  }, []);

  const markRead = () => {
      const updated = notifications.map(n => ({ ...n, read: true }));
      setNotifications(updated);
      setUnreadCount(0);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative p-1 text-slate-300 hover:text-white transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-navy-900" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-navy-800 rounded-lg shadow-xl border border-white/10 z-40 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center">
              <span className="text-sm font-semibold text-white">Notifications</span>
              {unreadCount > 0 && (
                  <span onClick={markRead} className="text-xs text-gold-500 cursor-pointer hover:text-gold-400">Mark all read</span>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">No new notifications</div>
              ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${!n.read ? 'bg-white/5' : ''}`}>
                      <div className="flex items-start gap-3">
                        {n.type === 'SUCCESS' ? <CheckCircle size={14} className="text-emerald-500 mt-0.5" /> : 
                         n.type === 'WARNING' || n.type === 'ALERT' ? <AlertTriangle size={14} className="text-amber-500 mt-0.5" /> : 
                         <Bell size={14} className="text-blue-400 mt-0.5" />}
                        <div>
                          <p className="text-sm text-white font-medium">{n.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
                          <p className="text-[10px] text-slate-600 mt-1">{new Date(n.createdAt).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
            <div className="px-4 py-2 bg-navy-900 text-center">
              <Link to="/settings" className="text-xs text-slate-400 hover:text-white" onClick={() => setIsOpen(false)}>Manage Alerts</Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useGlobal();

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.invest'), path: '/investments' },
    { name: 'Strategies', path: '/plans' }, 
    { name: 'Resources', path: '/resources' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  if (['/login', '/register'].includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="fixed w-full z-50 bg-navy-900/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center space-x-2">
              <Gem className="h-8 w-8 text-gold-500" />
              <span className="font-serif text-2xl font-bold text-white tracking-wider">
                PRESTIGE <span className="text-gold-500">ASSETS</span>
              </span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive(link.path) ? 'text-gold-500' : 'text-slate-300 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}

            <LanguageCurrencySelector />
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4 pl-4 border-l border-white/10">
                <NotificationBell />
                
                {user?.role === 'ADMIN' && (
                  <Link 
                    to="/admin/dashboard" 
                    className="flex items-center text-sm font-medium text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </Link>
                )}
                
                <div className="relative group">
                  <button className="flex items-center text-sm font-medium text-white hover:text-gold-500 transition-colors">
                    <span className="w-8 h-8 rounded-full bg-gold-600/20 border border-gold-500 text-gold-500 flex items-center justify-center font-serif mr-2">
                      {user?.fullName?.charAt(0)}
                    </span>
                  </button>
                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-navy-800 rounded-md shadow-lg border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                    <div className="py-1">
                      <Link to="/dashboard" className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center">
                        <LayoutDashboard className="h-4 w-4 mr-2" /> {t('nav.dashboard')}
                      </Link>
                      <Link to="/dashboard?tab=wallet" className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center">
                        <Wallet className="h-4 w-4 mr-2" /> {t('nav.wallet')}
                      </Link>
                      <Link to="/settings" className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center">
                        <SettingsIcon className="h-4 w-4 mr-2" /> Settings
                      </Link>
                      <div className="border-t border-white/10 my-1"></div>
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-white/5 flex items-center">
                        <LogOut className="h-4 w-4 mr-2" /> Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4 pl-4 border-l border-white/10">
                 <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Sign In</Link>
                 <Link to="/register" className="bg-gold-600 hover:bg-gold-500 text-white px-5 py-2 rounded-sm font-serif italic text-sm transition-all shadow-lg shadow-gold-900/20">Join Waitlist</Link>
              </div>
            )}
          </div>
          <div className="md:hidden flex items-center gap-4">
            <LanguageCurrencySelector />
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-300 hover:text-white focus:outline-none">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-navy-900 border-b border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-white/5">{link.name}</Link>
            ))}
            {isAuthenticated && (
              <div className="border-t border-white/10 mt-4 pt-4">
                 <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/5 flex items-center"><LayoutDashboard className="h-5 w-5 mr-2" /> {t('nav.dashboard')}</Link>
                 <Link to="/settings" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/5 flex items-center"><SettingsIcon className="h-5 w-5 mr-2" /> Settings</Link>
                 <Link to="/dashboard?tab=wallet" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/5 flex items-center"><Wallet className="h-5 w-5 mr-2" /> {t('nav.wallet')}</Link>
                 <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-400 hover:bg-white/5 flex items-center"><LogOut className="h-5 w-5 mr-2" /> Sign Out</button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
export default Navigation;
