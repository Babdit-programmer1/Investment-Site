import React from 'react';
import { TeamMember } from '../types';

const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Alexander Sterling',
    role: 'Founder & CEO',
    imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop',
    bio: 'Former hedge fund manager with 20 years of experience in alternative asset valuation.'
  },
  {
    id: '2',
    name: 'Eleanor Vance',
    role: 'Head of Fine Art',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop',
    bio: 'Curated collections for the Louvre and Tate Modern before joining Prestige Assets.'
  },
  {
    id: '3',
    name: 'Marcus Thorne',
    role: 'Director of Real Estate',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800&auto=format&fit=crop',
    bio: 'Specializes in high-yield commercial and luxury residential developments across Europe.'
  }
];

const About: React.FC = () => {
  return (
    <div className="pt-20 min-h-screen bg-navy-900">
      {/* Vision Section */}
      <div className="bg-navy-950 py-20 border-b border-white/5">
         <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="font-serif text-4xl md:text-5xl text-white mb-8">Our Vision</h1>
            <p className="text-xl text-slate-300 leading-relaxed font-light mb-8">
              At Prestige Assets, we believe that true wealth is built on the tangible. 
              Our mission is to unlock the gates to the world’s most exclusive asset classes, 
              transforming the way individuals preserve and grow their capital.
            </p>
            <p className="text-lg text-slate-400 leading-relaxed">
              We combine centuries of appraisal expertise with modern fractional ownership technology,
              ensuring transparency, liquidity, and security for the modern investor.
            </p>
         </div>
      </div>

      {/* Team Section */}
      <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-serif text-3xl text-white mb-12 text-center">Meet The Experts</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
           {teamMembers.map(member => (
             <div key={member.id} className="text-center group">
               <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-2 border-gold-500/20 group-hover:border-gold-500 transition-colors">
                 <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500" />
               </div>
               <h3 className="text-xl font-serif text-white">{member.name}</h3>
               <p className="text-gold-500 text-sm uppercase tracking-wider mb-4">{member.role}</p>
               <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                 {member.bio}
               </p>
             </div>
           ))}
        </div>
      </div>

      {/* Trust Badges / Stats */}
      <div className="bg-navy-800 py-16 border-t border-white/5">
         <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
               <p className="text-4xl font-serif text-white mb-2">$500M+</p>
               <p className="text-slate-500 text-sm uppercase">Assets Under Management</p>
            </div>
            <div>
               <p className="text-4xl font-serif text-white mb-2">15k+</p>
               <p className="text-slate-500 text-sm uppercase">Global Investors</p>
            </div>
            <div>
               <p className="text-4xl font-serif text-white mb-2">14%</p>
               <p className="text-slate-500 text-sm uppercase">Avg. Historical Return</p>
            </div>
            <div>
               <p className="text-4xl font-serif text-white mb-2">0</p>
               <p className="text-slate-500 text-sm uppercase">Security Breaches</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default About;