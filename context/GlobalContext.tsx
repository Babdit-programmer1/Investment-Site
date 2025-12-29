
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'NGN' | 'BTC' | 'ETH';
type Language = 'EN' | 'ES' | 'FR' | 'ZH' | 'AR';

interface GlobalContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  rates: Record<string, number>;
  convertPrice: (amount: number) => string;
  t: (key: string) => string;
  isRtl: boolean;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// Mock Translations
const TRANSLATIONS: Record<Language, Record<string, string>> = {
  EN: { 'nav.home': 'Home', 'nav.invest': 'Investments', 'nav.wallet': 'Wallet', 'nav.dashboard': 'Dashboard' },
  ES: { 'nav.home': 'Inicio', 'nav.invest': 'Inversiones', 'nav.wallet': 'Billetera', 'nav.dashboard': 'Tablero' },
  FR: { 'nav.home': 'Accueil', 'nav.invest': 'Investissements', 'nav.wallet': 'Portefeuille', 'nav.dashboard': 'Tableau de bord' },
  ZH: { 'nav.home': '首页', 'nav.invest': '投资', 'nav.wallet': '钱包', 'nav.dashboard': '仪表板' },
  AR: { 'nav.home': 'الصفحة الرئيسية', 'nav.invest': 'الاستثمارات', 'nav.wallet': 'المحفظة', 'nav.dashboard': 'لوحة القيادة' },
};

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [language, setLanguage] = useState<Language>('EN');
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1, EUR: 0.92, GBP: 0.79, JPY: 150.5, CNY: 7.2, NGN: 1450.0, BTC: 0.000015, ETH: 0.0003 });

  const isRtl = language === 'AR';

  useEffect(() => {
    // In production, fetch from /api/v1/rates
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language.toLowerCase();
  }, [language, isRtl]);

  const convertPrice = (amountInUsd: number) => {
    const rate = rates[currency] || 1;
    const converted = amountInUsd * rate;
    
    return new Intl.NumberFormat(language === 'EN' ? 'en-US' : 'de-DE', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: currency === 'BTC' || currency === 'ETH' ? 6 : 2
    }).format(converted);
  };

  const t = (key: string) => {
    return TRANSLATIONS[language]?.[key] || key;
  };

  return (
    <GlobalContext.Provider value={{ currency, setCurrency, language, setLanguage, rates, convertPrice, t, isRtl }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error('useGlobal must be used within GlobalProvider');
  return context;
};
