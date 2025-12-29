
import React from 'react';
import { Globe, DollarSign } from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';

const LanguageCurrencySelector: React.FC = () => {
  const { currency, setCurrency, language, setLanguage } = useGlobal();

  return (
    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-2 py-1">
      {/* Language */}
      <div className="flex items-center">
        <Globe size={14} className="text-slate-400 mr-1" />
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value as any)}
          className="bg-transparent text-xs text-white border-none outline-none cursor-pointer hover:text-gold-500 appearance-none font-medium"
        >
          <option value="EN">EN</option>
          <option value="ES">ES</option>
          <option value="FR">FR</option>
          <option value="ZH">ZH</option>
          <option value="AR">AR</option>
        </select>
      </div>

      <div className="w-px h-4 bg-white/20"></div>

      {/* Currency */}
      <div className="flex items-center">
        <DollarSign size={14} className="text-slate-400 mr-1" />
        <select 
          value={currency} 
          onChange={(e) => setCurrency(e.target.value as any)}
          className="bg-transparent text-xs text-white border-none outline-none cursor-pointer hover:text-gold-500 appearance-none font-medium"
        >
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
          <option value="JPY">JPY</option>
          <option value="CNY">CNY</option>
          <option value="NGN">NGN</option>
          <option value="BTC">BTC</option>
          <option value="ETH">ETH</option>
        </select>
      </div>
    </div>
  );
};

export default LanguageCurrencySelector;
