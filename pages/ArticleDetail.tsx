
import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';

// Mock Data (In a real app, fetch from API based on ID)
const ARTICLES: Record<string, any> = {
  '1': {
    id: '1',
    title: 'The Resilience of Fine Art in Recession',
    date: 'Oct 12, 2023',
    author: 'Eleanor Vance',
    category: 'Market Trends',
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1600',
    content: `
      <p class="mb-6">In times of economic uncertainty, investors traditionally flock to "safe haven" assets like gold and government bonds. However, data from the last three major recessions indicates a new contender for capital preservation: Blue-chip Fine Art.</p>
      
      <h3 class="text-2xl font-serif text-white mb-4">Uncorrelated Returns</h3>
      <p class="mb-6">The primary allure of fine art lies in its low correlation to the S&P 500. While public equities are subject to improved algorithmic trading volatility and quarterly earnings reports, art valuations move on a different axis—scarcity and cultural significance.</p>
      
      <h3 class="text-2xl font-serif text-white mb-4">The "Flight to Quality"</h3>
      <p class="mb-6">During the 2008 financial crisis, while the S&P 500 fell by 37%, the Mei Moses Fine Art Index only corrected by 4.5%. This resilience is driven by ultra-high-net-worth individuals who, regardless of market conditions, continue to compete for masterpieces by Picasso, Basquiat, and Warhol.</p>
      
      <blockquote class="border-l-4 border-gold-500 pl-4 italic text-slate-300 my-8">
        "Art is not just a decoration; it is a currency that transcends borders and banking systems."
      </blockquote>
      
      <p>At Prestige Assets, we focus specifically on the "Blue-Chip" segment—artists with established secondary markets and consistent auction records over 20+ years. This strategy minimizes speculative risk while capturing the historical appreciation of the asset class.</p>
    `
  },
  '2': {
    id: '2',
    title: 'Understanding Colored Diamonds',
    date: 'Sep 28, 2023',
    author: 'Alexander Sterling',
    category: 'Jewelry',
    imageUrl: 'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?q=80&w=1600',
    content: `
      <p class="mb-6">For centuries, diamonds have been a symbol of wealth. But while clear diamonds are common, "Fancy Colored" diamonds—specifically pink, blue, and red—are geological anomalies that command astronomical prices.</p>
      <p>The closure of the Argyle mine in Australia, previously the source of 90% of the world's pink diamonds, has created a supply shock. Prices for high-quality pink stones have appreciated by 116% over the last decade, outperforming most equity indices.</p>
    `
  },
  '3': {
    id: '3',
    title: 'Real Estate: The Flight to Quality',
    date: 'Sep 15, 2023',
    author: 'Marcus Thorne',
    category: 'Real Estate',
    imageUrl: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=1600',
    content: `
      <p class="mb-6">As interest rates stabilize, we are seeing a bifurcation in the real estate market. Commercial office space in secondary cities is struggling, but "Prime" luxury residential and Grade-A commercial in global capitals (London, NY, Singapore) remains robust.</p>
      <p>Our strategy focuses on value-add opportunities: acquiring historic properties in prime postcodes and retrofitting them for modern ultra-luxury living standards, capturing the spread between the acquisition cost and the finished asset value.</p>
    `
  }
};

const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const article = id ? ARTICLES[id] : null;

  if (!article) return <Navigate to="/resources" />;

  return (
    <div className="pt-20 min-h-screen bg-navy-900">
      {/* Hero Header */}
      <div className="relative h-96 w-full">
        <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-navy-900/70 backdrop-blur-sm"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="max-w-4xl mx-auto px-4 text-center">
                <span className="inline-block py-1 px-3 rounded border border-gold-500/30 bg-gold-500/10 text-gold-500 text-xs font-mono tracking-widest mb-4 uppercase">
                    {article.category}
                </span>
                <h1 className="text-3xl md:text-5xl font-serif text-white font-bold mb-6 leading-tight">
                    {article.title}
                </h1>
                <div className="flex items-center justify-center gap-6 text-sm text-slate-300">
                    <span className="flex items-center gap-2"><User size={16} /> {article.author}</span>
                    <span className="flex items-center gap-2"><Calendar size={16} /> {article.date}</span>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/resources" className="inline-flex items-center text-gold-500 hover:text-white mb-8 transition-colors text-sm font-medium">
            <ArrowLeft size={16} className="mr-2" /> Back to Resources
        </Link>

        {/* Content */}
        <div 
            className="prose prose-invert prose-lg max-w-none text-slate-300 font-sans leading-loose"
            dangerouslySetInnerHTML={{ __html: article.content }} 
        />

        {/* Share Footer */}
        <div className="mt-12 pt-8 border-t border-white/10 flex justify-between items-center">
            <p className="text-white font-serif italic">Share this insight</p>
            <div className="flex gap-4">
                <button className="p-2 rounded-full bg-navy-800 hover:bg-gold-600 hover:text-white text-slate-400 transition-colors"><Twitter size={18} /></button>
                <button className="p-2 rounded-full bg-navy-800 hover:bg-gold-600 hover:text-white text-slate-400 transition-colors"><Linkedin size={18} /></button>
                <button className="p-2 rounded-full bg-navy-800 hover:bg-gold-600 hover:text-white text-slate-400 transition-colors"><Facebook size={18} /></button>
                <button className="p-2 rounded-full bg-navy-800 hover:bg-gold-600 hover:text-white text-slate-400 transition-colors"><Share2 size={18} /></button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
