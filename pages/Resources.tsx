import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { BlogPost, FaqItem } from '../types';

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'The Resilience of Fine Art in Recession',
    date: 'Oct 12, 2023',
    category: 'Market Trends',
    excerpt: 'Historical data shows that blue-chip art has consistently outperformed traditional equities during economic downturns.',
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '2',
    title: 'Understanding Colored Diamonds',
    date: 'Sep 28, 2023',
    category: 'Jewelry',
    excerpt: 'Why pink and blue diamonds are commanding record-breaking prices at international auctions this year.',
    imageUrl: 'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '3',
    title: 'Real Estate: The Flight to Quality',
    date: 'Sep 15, 2023',
    category: 'Real Estate',
    excerpt: 'Prime locations in London, New York, and Singapore remain resilient despite rising interest rates.',
    imageUrl: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=800&auto=format&fit=crop'
  }
];

const faqItems: FaqItem[] = [
  {
    question: "What is the minimum investment amount?",
    answer: "Our minimum investment varies by asset class but typically starts at $1,000 for diversified funds and $5,000 for specific single-asset offerings."
  },
  {
    question: "How are the assets stored and insured?",
    answer: "Physical assets are stored in specialized, climate-controlled bonded warehouses or freeports. They are fully insured by Lloyds of London or equivalent top-tier providers."
  },
  {
    question: "Can I sell my shares before the asset is sold?",
    answer: "Yes, we offer a secondary marketplace where you can list your shares for sale to other accredited investors on the platform, providing liquidity options."
  },
  {
    question: "Who verifies the authenticity of the items?",
    answer: "We work with world-renowned experts, appraisers, and authentication bodies specific to each category (e.g., GIA for gems, recognized art historians for paintings)."
  }
];

const Resources: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="pt-20 min-h-screen bg-navy-900">
      <div className="bg-navy-950 py-16 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-white mb-6">Resources</h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Stay informed with market insights, expert analysis, and answers to your questions.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Blog Section */}
        <h2 className="font-serif text-3xl text-white mb-8">Latest Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {blogPosts.map((post) => (
            <div key={post.id} className="bg-navy-800 rounded-lg overflow-hidden border border-white/5 group hover:border-gold-500/30 transition-all">
              <div className="h-48 overflow-hidden">
                <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gold-500 uppercase font-bold">{post.category}</span>
                  <span className="text-xs text-slate-500">{post.date}</span>
                </div>
                <h3 className="text-xl font-serif text-white mb-3 group-hover:text-gold-400 transition-colors">{post.title}</h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                <a href="#" className="text-gold-500 text-sm font-medium hover:underline">Read Article</a>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl text-white mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-navy-800 rounded-lg border border-white/5 overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="text-white font-medium">{item.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-gold-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-500" />
                  )}
                </button>
                <div
                  className={`px-6 text-slate-400 text-sm leading-relaxed transition-all duration-300 ease-in-out ${
                    openFaq === index ? 'max-h-40 py-4 border-t border-white/5' : 'max-h-0 py-0 overflow-hidden'
                  }`}
                >
                  {item.answer}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Resources;