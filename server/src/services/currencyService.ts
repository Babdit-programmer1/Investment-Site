
// In-memory cache
let ratesCache: { data: Record<string, number>, timestamp: number } | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export const currencyService = {
  // Base Currency is USD
  getRates(): Record<string, number> {
    const now = Date.now();
    
    // Return cached rates if valid
    if (ratesCache && (now - ratesCache.timestamp < CACHE_TTL)) {
      return ratesCache.data;
    }

    const rates = {
      USD: 1,
      EUR: 0.92,
      GBP: 0.79,
      JPY: 150.5,
      CNY: 7.2,
      NGN: 1450.0,
      BTC: 0.000015, // Approx $66k
      ETH: 0.0003,   // Approx $3.3k
    };

    // Update cache
    ratesCache = { data: rates, timestamp: now };
    return rates;
  },

  convert(amount: number, from: string, to: string): number {
    const rates = this.getRates();
    const fromRate = rates[from] || 1;
    const toRate = rates[to] || 1;
    
    // Convert to USD first (Base), then to Target
    const amountInUsd = amount / fromRate;
    return amountInUsd * toRate;
  },

  format(amount: number, currency: string, locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2
    }).format(amount);
  }
};
