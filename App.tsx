import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import AiAdvisor from './components/AiAdvisor';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import About from './pages/About';
import Investments from './pages/Investments';
import HowItWorks from './pages/HowItWorks';
import Resources from './pages/Resources';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import AdminDashboard from './pages/AdminDashboard';
import Plans from './pages/Plans';
import Statements from './pages/Statements';
import WalletPage from './pages/Wallet';
import KycVerification from './pages/KycVerification'; // Added

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/onboarding'].includes(location.pathname);
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen bg-navy-900 text-slate-200">
      <Navigation />
      <main className="flex-grow">
        {children}
      </main>
      {!isAuthPage && !isAdminPage && <Footer />}
      {!isAuthPage && !isAdminPage && <AiAdvisor />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/investments" element={<Investments />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
            <Route path="/statements" element={<ProtectedRoute><Statements /></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
            <Route path="/kyc" element={<ProtectedRoute><KycVerification /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;