
import { api } from './apiUtils';
import { Investment, InvestmentIntent, Wallet, InvestmentPlan, InvestorStatement } from '../types';

export const dataService = {
  // --- Investments ---
  async getMarketAssets(): Promise<Investment[]> {
    return await api.get('/investments');
  },

  async getAssetById(id: string): Promise<Investment> {
    return await api.get(`/investments/${id}`);
  },

  async getMyPortfolio(): Promise<InvestmentIntent[]> {
    return await api.get('/payments/my');
  },

  async initiateInvestment(data: { assetId: string, amount: number, investmentType: string, durationMonths?: number }) {
    return await api.post('/payments/initiate', data);
  },

  // --- Wallet ---
  async getWallet(): Promise<Wallet> {
    return await api.get('/wallet');
  },

  async depositFunds(data: { amount: number, currency: string, txHash: string, chain: string }) {
    return await api.post('/wallet/deposit', data);
  },

  async withdrawFunds(data: { amount: number, currency: string, address: string, chain: string }) {
    return await api.post('/wallet/withdraw', data);
  },

  async getDepositConfig() {
    return await api.get('/payments/config');
  },

  // --- Logs & Reporting ---
  async getLogs(type: string = 'ALL') {
    return await api.get(`/logs?type=${type}`);
  },

  async getStatements(): Promise<InvestorStatement[]> {
    return await api.get('/reporting/statements');
  },

  async getPlans(): Promise<InvestmentPlan[]> {
    const plans = await api.get<InvestmentPlan[]>('/reporting/plans');
    return plans.map(p => ({
        ...p,
        // Extract category from allocation JSON if present
        category: p.allocation?.category || 'GENERAL_WEALTH'
    }));
  },

  async subscribeToPlan(planId: string) {
    return await api.post('/reporting/plans/subscribe', { planId });
  },

  // --- Admin ---
  async getAdminOverview() {
    return await api.get('/admin/overview');
  },

  async getAdminUsers() {
    return await api.get('/admin/users');
  },

  async getAdminDeposits() {
    return await api.get('/admin/deposits/pending');
  },

  async getAdminWithdrawals() {
    return await api.get('/admin/withdrawals/pending');
  },

  async getAdminPendingInvestments() {
    return await api.get('/admin/approvals');
  },
  
  async createAsset(assetData: any) {
    return await api.post('/admin/assets', assetData);
  },

  async createPlan(planData: any) {
    return await api.post('/admin/plans', planData);
  },

  async getPlatformWallets() {
    return await api.get('/admin/platform-wallets');
  },

  async addPlatformWallet(data: { chain: string, address: string }) {
    return await api.post('/admin/platform-wallets', data);
  },

  async approveDeposit(id: string) {
    return await api.post(`/admin/deposits/${id}/approve`, {});
  },

  async approveInvestment(id: string) {
    return await api.post(`/admin/approvals/${id}/approve`, {});
  },

  async approveWithdrawal(id: string) {
    return await api.post(`/admin/withdrawals/${id}/approve`, {});
  },

  async rejectWithdrawal(id: string) {
    return await api.post(`/admin/withdrawals/${id}/reject`, {});
  },

  // --- Analytics (AI) ---
  async getAnalyticsPrediction() {
    return await api.get('/analytics/predict');
  },

  async getAiRecommendation() {
    return await api.get('/analytics/recommendation');
  }
};
