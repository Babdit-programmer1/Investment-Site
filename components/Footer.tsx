
import React from 'react';
import { Link } from 'react-router-dom';
import { Gem, Twitter, Linkedin, Instagram, Mail, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Gem className="h-6 w-6 text-gold-500" />
              <span className="font-serif text-xl font-bold text-white tracking-wider">
                PRESTIGE <span className="text-gold-500">ASSETS</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Democratizing access to the world's most coveted assets. We curate exceptional investment opportunities in luxury real estate, fine art, and rare collectibles.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-gold-500 transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-gold-500 transition-colors"><Linkedin size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-gold-500 transition-colors"><Instagram size={20} /></a>
            </div>
          </div>

          <div>
            <h3 className="font-serif text-lg text-white mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/about" className="hover:text-gold-500 transition-colors">About Us</Link></li>
              <li><Link to="/investments" className="hover:text-gold-500 transition-colors">Opportunities</Link></li>
              <li><Link to="/how-it-works" className="hover:text-gold-500 transition-colors">How It Works</Link></li>
              <li><Link to="/resources" className="hover:text-gold-500 transition-colors">Resources</Link></li>
              <li><Link to="/contact" className="hover:text-gold-500 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg text-white mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-gold-500 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-gold-500 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-gold-500 transition-colors">Risk Disclosure</a></li>
              <li><a href="#" className="hover:text-gold-500 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg text-white mb-4">Contact</h3>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gold-500" />
                <span>+1 (888) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gold-500" />
                <span>concierge@prestigeassets.com</span>
              </li>
            </ul>
          </div>

        </div>
        
        <div className="border-t border-white/5 pt-8 text-center">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Prestige Assets. All rights reserved. Investment involves risk.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
