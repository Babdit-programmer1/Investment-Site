
// Crypto-Only Payment Service
// Manages platform wallet addresses for deposits

// @ts-ignore
import { PrismaClient } from '@prisma/client';
import { adminLogService } from './adminLogService';

const prisma = new PrismaClient();

// In-memory cache for addresses to prevent DB spam
let addressCache: Record<string, string> | null = null;
let cacheTime = 0;
const CACHE_TTL = 60000; // 1 minute

const DEFAULT_ADDRESSES: Record<string, string> = {
  'BTC': 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  'ETH': '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  'BSC': '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  'POLYGON': '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  'SOL': 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrx',
  'TRON': 'TNPEeAAFB7KtNrMaKKMA463n2M5t96pp3d',
  'USDT': '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
};

export const paymentService = {
  async getDepositAddress(chain: string): Promise<string> {
    const addresses = await this.getAllAddresses();
    const normalizedChain = chain.toUpperCase();
    
    // Map aliases
    if (normalizedChain === 'BITCOIN') return addresses['BTC'] || DEFAULT_ADDRESSES['BTC'];
    if (normalizedChain === 'ETHEREUM' || normalizedChain === 'ERC20') return addresses['ETH'] || DEFAULT_ADDRESSES['ETH'];
    if (normalizedChain === 'BNB' || normalizedChain === 'BEP20') return addresses['BSC'] || DEFAULT_ADDRESSES['BSC'];
    if (normalizedChain === 'MATIC') return addresses['POLYGON'] || DEFAULT_ADDRESSES['POLYGON'];
    if (normalizedChain === 'SOLANA') return addresses['SOL'] || DEFAULT_ADDRESSES['SOL'];
    if (normalizedChain === 'TRC20') return addresses['TRON'] || DEFAULT_ADDRESSES['TRON'];

    return addresses[normalizedChain] || DEFAULT_ADDRESSES['ETH'];
  },

  async getAllAddresses(): Promise<Record<string, string>> {
    const now = Date.now();
    if (addressCache && (now - cacheTime < CACHE_TTL)) {
      return addressCache;
    }

    try {
      // Fetch from DB
      const settings = await prisma.systemSetting.findMany({
        where: { key: { startsWith: 'WALLET_' } }
      });

      const dbAddresses: Record<string, string> = {};
      settings.forEach((s: any) => {
        const chain = s.key.replace('WALLET_', '');
        dbAddresses[chain] = s.value;
      });

      // Merge defaults with DB overrides
      addressCache = { ...DEFAULT_ADDRESSES, ...dbAddresses };
      cacheTime = now;
      return addressCache;
    } catch (e) {
      console.warn("Failed to fetch dynamic wallet addresses, using defaults");
      return DEFAULT_ADDRESSES;
    }
  },

  async updateDepositAddress(chain: string, address: string, adminId: string, ip: string): Promise<void> {
    const key = `WALLET_${chain.toUpperCase()}`;
    
    // Get old value for logging
    const oldSetting = await prisma.systemSetting.findUnique({ where: { key } });
    const oldAddress = oldSetting?.value || DEFAULT_ADDRESSES[chain.toUpperCase()] || 'N/A';

    // Upsert new address
    await prisma.systemSetting.upsert({
      where: { key },
      update: { value: address },
      create: { key, value: address }
    });

    // Invalidate Cache
    addressCache = null;

    // Log Immutable Action
    await adminLogService.logAction({
      adminId,
      actionType: 'UPDATE_SYSTEM_WALLET',
      targetId: chain,
      targetType: 'SYSTEM_CONFIG',
      details: { chain, oldAddress, newAddress: address },
      ipAddress: ip
    });
  }
};
