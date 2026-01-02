
import React, { useState } from 'react';
import { Mail, Phone, CheckCircle } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1000);
  };

  return (
    <div className="pt-20 min-h-screen bg-navy-900">
      <div className="bg-navy-950 py-16 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-white mb-6">Get In Touch</h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Our private client team is available 24/7 to assist with your portfolio inquiries.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          
          {/* Contact Info */}
          <div>
            <h2 className="font-serif text-2xl text-white mb-8">Contact Information</h2>
            <div className="space-y-8">
              
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-navy-800 rounded-lg border border-white/10">
                  <Phone className="h-6 w-6 text-gold-500" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Phone</h3>
                  <p className="text-slate-400 text-sm">
                    +1 (888) 123-4567<br />
                    Mon-Fri, 9am - 6pm EST
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-navy-800 rounded-lg border border-white/10">
                  <Mail className="h-6 w-6 text-gold-500" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Email</h3>
                  <p className="text-slate-400 text-sm">
                    concierge@prestigeassets.com<br />
                    investors@prestigeassets.com
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 bg-gradient-to-br from-gold-600/20 to-navy-900 rounded-lg border border-gold-500/20">
               <h3 className="text-gold-500 font-serif text-lg mb-2">Private Client Services</h3>
               <p className="text-slate-400 text-sm">
                 Investing over $1M? Contact our dedicated VIP team for tailored portfolio construction and wealth planning services.
               </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-navy-800 p-8 rounded-xl border border-white/5">
            <h2 className="font-serif text-2xl text-white mb-6">Send us a Message</h2>
            
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <CheckCircle className="h-16 w-16 text-emerald-500 mb-4" />
                <h3 className="text-xl text-white font-medium mb-2">Message Sent</h3>
                <p className="text-slate-400">Thank you for reaching out. A specialist will be in touch shortly.</p>
                <button onClick={() => setSubmitted(false)} className="mt-6 text-gold-500 hover:text-white text-sm font-medium">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-navy-900 border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-navy-900 border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange as any}
                    className="w-full bg-navy-900 border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
                  >
                    <option value="">Select a topic</option>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Investment Opportunities">Investment Opportunities</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Support">Support</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full bg-navy-900 border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gold-600 hover:bg-gold-500 text-white font-medium py-3 rounded-md transition-colors shadow-lg shadow-gold-900/20"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;
