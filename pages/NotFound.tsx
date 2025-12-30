
import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 bg-navy-800 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10 shadow-2xl shadow-navy-950">
          <Compass className="w-12 h-12 text-gold-500 animate-pulse" />
        </div>
        
        <h1 className="text-6xl font-serif text-white font-bold mb-4">404</h1>
        <h2 className="text-xl font-serif text-gold-500 mb-6 uppercase tracking-widest">Page Not Found</h2>
        
        <p className="text-slate-400 mb-8 leading-relaxed">
          The asset or page you are looking for has been moved, removed, or is temporarily unavailable.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/" 
            className="flex items-center justify-center px-6 py-3 bg-gold-600 hover:bg-gold-500 text-white rounded-sm transition-colors font-medium"
          >
            <Home size={18} className="mr-2" /> Return Home
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="flex items-center justify-center px-6 py-3 bg-navy-800 hover:bg-navy-700 text-slate-300 rounded-sm border border-white/10 transition-colors font-medium"
          >
            <ArrowLeft size={18} className="mr-2" /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
