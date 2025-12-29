import React from 'react';
import { UserPlus, Search, DollarSign, BarChart2 } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: <UserPlus className="h-8 w-8 text-navy-900" />,
      title: "Create Your Account",
      desc: "Complete our secure verification process to access the platform. We adhere to strict KYC/AML standards to ensure a safe community."
    },
    {
      icon: <Search className="h-8 w-8 text-navy-900" />,
      title: "Browse Assets",
      desc: "Explore detailed prospectuses, high-resolution imagery, and third-party valuation reports for every asset listed on the marketplace."
    },
    {
      icon: <DollarSign className="h-8 w-8 text-navy-900" />,
      title: "Purchase Shares",
      desc: "Invest as little as $1,000 to own a fractional share of a luxury asset. Transactions are legally binding and recorded securely."
    },
    {
      icon: <BarChart2 className="h-8 w-8 text-navy-900" />,
      title: "Track & Trade",
      desc: "Monitor your portfolio performance in real-time. Hold for long-term appreciation or trade your shares on our secondary market."
    }
  ];

  return (
    <div className="pt-20 min-h-screen bg-navy-900">
       <div className="bg-navy-950 py-16 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-white mb-6">How It Works</h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            A seamless path from curiosity to ownership. Investing in the extraordinary has never been this accessible.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative">
          {/* Vertical Line for Desktop */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-gold-500/30"></div>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={index} className={`flex flex-col md:flex-row items-center justify-between ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                
                {/* Text Content */}
                <div className="w-full md:w-[45%] mb-8 md:mb-0">
                   <div className={`bg-navy-800 p-8 rounded-lg border border-white/5 hover:border-gold-500/30 transition-colors ${index % 2 === 1 ? 'text-left md:text-right' : 'text-left'}`}>
                     <h3 className="text-2xl font-serif text-white mb-4">{step.title}</h3>
                     <p className="text-slate-400 leading-relaxed">{step.desc}</p>
                   </div>
                </div>

                {/* Icon Marker */}
                <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-gold-500 border-4 border-navy-900 shadow-xl shadow-gold-500/20">
                   {step.icon}
                </div>

                {/* Empty Space for Balance */}
                <div className="w-full md:w-[45%] hidden md:block"></div>

              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 py-20 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl text-white mb-6">Ready to diversify your portfolio?</h2>
          <button className="px-10 py-4 bg-gold-600 hover:bg-gold-500 text-white font-serif text-lg rounded-sm shadow-xl transition-all">
            Start Investing Today
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;