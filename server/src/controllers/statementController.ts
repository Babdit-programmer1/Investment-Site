import { Request, Response } from 'express';
// @ts-ignore
import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';

const prisma = new PrismaClient();

export const getStatements = async (req: any, res: any) => {
  const userId = req.user?.id;
  try {
    // Generate a new statement for "Current Month" if it doesn't exist (Simulation)
    const currentPeriod = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const existing = await prisma.investorStatement.findFirst({
      where: { userId, period: currentPeriod }
    });

    if (!existing) {
        await generateStatementRecord(userId, currentPeriod);
    }

    const statements = await prisma.investorStatement.findMany({
      where: { userId },
      orderBy: { generatedAt: 'desc' }
    });
    
    const formatted = statements.map((s: any) => ({
      ...s,
      content: JSON.parse(s.content)
    }));
    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching statements' });
  }
};

export const downloadStatementPdf = async (req: any, res: any) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    const statement = await prisma.investorStatement.findFirst({
      where: { id, userId },
      include: { user: true }
    });

    if (!statement) return res.status(404).json({ message: 'Statement not found' });

    const content = JSON.parse(statement.content);

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Prestige_Statement_${statement.period.replace(' ', '_')}.pdf`);

    doc.pipe(res);

    // Header
    doc.rect(0, 0, doc.page.width, 100).fill('#0f172a'); // Navy
    doc.fontSize(20).fillColor('#fbbf24').text('PRESTIGE ASSETS', 50, 40, { letterSpacing: 2 });
    doc.fontSize(10).fillColor('#ffffff').text('INSTITUTIONAL REPORTING', 50, 65);

    // Info Box
    doc.fillColor('#000000');
    doc.moveDown(5);
    doc.fontSize(12).font('Helvetica-Bold').text('INVESTOR STATEMENT');
    doc.fontSize(10).font('Helvetica').text(`Period: ${statement.period}`);
    doc.text(`Generated: ${new Date(statement.generatedAt).toLocaleDateString()}`);
    
    doc.moveDown();
    doc.text(`Investor: ${statement.user.fullName}`);
    doc.text(`Account ID: ${statement.user.id.substring(0, 8).toUpperCase()}`);
    doc.text(`Status: ${statement.user.kycStatus}`);

    // Summary Box
    const startY = 250;
    doc.rect(50, startY, 495, 80).fillOpacity(0.1).fill('#fbbf24').stroke('#fbbf24');
    
    doc.fillColor('#000000').fillOpacity(1);
    doc.fontSize(10).text('TOTAL INVESTED', 70, startY + 20);
    doc.fontSize(14).text(`$${statement.totalInvested.toLocaleString()}`, 70, startY + 40);

    doc.fontSize(10).text('CURRENT VALUATION', 250, startY + 20);
    doc.fontSize(14).text(`$${statement.currentValue.toLocaleString()}`, 250, startY + 40);

    doc.fontSize(10).text('ROI', 430, startY + 20);
    const roiColor = statement.roi >= 0 ? '#10b981' : '#ef4444';
    doc.fillColor(roiColor).fontSize(14).text(`${statement.roi.toFixed(2)}%`, 430, startY + 40);

    // Asset Breakdown Table
    doc.moveDown(8);
    doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text('PORTFOLIO COMPOSITION');
    doc.moveDown(1);

    const tableTop = 400;
    const itemHeight = 30;
    
    // Headers
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('ASSET', 50, tableTop);
    doc.text('CATEGORY', 250, tableTop);
    doc.text('VALUE', 450, tableTop, { width: 100, align: 'right' });
    
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke('#e2e8f0');

    // Rows
    let y = tableTop + 25;
    doc.font('Helvetica');
    content.assets.forEach((asset: any) => {
        doc.text(asset.title, 50, y);
        doc.text(asset.category, 250, y);
        doc.text(`$${asset.value.toLocaleString()}`, 450, y, { width: 100, align: 'right' });
        y += itemHeight;
    });

    // Footer
    doc.fontSize(8).fillColor('#64748b');
    doc.text('CONFIDENTIAL. This document contains sensitive financial information. Not for distribution.', 50, 700, { align: 'center' });
    doc.text('Prestige Assets Ltd. 100 Luxury Lane, New York, NY', 50, 715, { align: 'center' });

    doc.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating PDF' });
  }
};

export const getPerformance = async (req: any, res: any) => {
  const userId = req.user?.id;
  try {
     // Mocking historical data for the graph since we lack a chron job
     const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
     const chartData = months.map((m, i) => {
        const base = 50000;
        const volatility = Math.random() * 5000;
        const growth = i * 1500;
        return {
            name: m,
            value: base + growth + volatility
        };
     });
     
     res.json(chartData);
  } catch(error) {
     res.status(500).json({ message: 'Error fetching performance' });
  }
}

// Helper
const generateStatementRecord = async (userId: string, period: string) => {
    // Calculate current portfolio state
    const portfolio = await prisma.userPortfolio.findMany({
        where: { userId, status: 'ACTIVE' },
        include: { asset: true }
    });

    const totalInvested = portfolio.reduce((acc: number, item: any) => acc + item.amount, 0);
    
    // Simulate 4.5% appreciation for demo purposes
    const currentValue = Math.floor(totalInvested * 1.045); 
    const roi = totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0;

    const assets = portfolio.map((p: any) => ({
        ticker: p.asset.ticker,
        title: p.asset.title,
        category: p.asset.category,
        invested: p.amount,
        value: Math.floor(p.amount * 1.045)
    }));

    await prisma.investorStatement.create({
        data: {
            userId,
            period,
            totalInvested,
            currentValue,
            roi,
            content: JSON.stringify({ assets, generated: new Date() })
        }
    });
};