
// @ts-ignore
import { PrismaClient } from '@prisma/client';
import { Money, MoneyInput } from '../utils/money';

const prisma = new PrismaClient();

interface LogEntry {
  adminId: string;
  actionType: string;
  targetId?: string;
  targetType?: string;
  amount?: MoneyInput;
  currency?: string;
  details?: any;
  ipAddress?: string;
}

export const adminLogService = {
  async logAction(data: LogEntry) {
    try {
      // Check if AdminLog table exists (handled via Prisma usually, but fallback safe)
      // @ts-ignore
      if (!prisma.adminLog) {
        console.log('[Admin Log] Mocking log write:', data.actionType);
        return;
      }

      // @ts-ignore
      await prisma.adminLog.create({
        data: {
          adminId: data.adminId,
          actionType: data.actionType,
          targetId: data.targetId,
          targetType: data.targetType,
          amount: data.amount ? Money.from(data.amount) : null,
          currency: data.currency,
          details: data.details ? JSON.stringify(data.details) : null,
          ipAddress: data.ipAddress,
          createdAt: new Date()
        }
      });
    } catch (error) {
      console.warn('Failed to write admin log:', error);
    }
  },

  async getLogs(filters: { actionType?: string; adminId?: string; startDate?: Date; endDate?: Date; page?: number; limit?: number }) {
    const { actionType, adminId, startDate, endDate, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (actionType) where.actionType = actionType;
    if (adminId) where.adminId = adminId;
    if (startDate && endDate) {
        where.createdAt = { gte: startDate, lte: endDate };
    }

    try {
        // @ts-ignore
        if (!prisma.adminLog) return [];

        // @ts-ignore
        const [total, logs] = await prisma.$transaction([
            // @ts-ignore
            prisma.adminLog.count({ where }),
            // @ts-ignore
            prisma.adminLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: { admin: { select: { fullName: true, email: true } } }
            })
        ]);

        return {
            data: logs.map((l: any) => ({
                ...l,
                amount: l.amount ? Money.toNumber(l.amount) : 0
            })),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        console.warn('Failed to fetch admin logs:', error);
        return { data: [], pagination: { total: 0, page: 1, limit, totalPages: 0 } };
    }
  }
};
