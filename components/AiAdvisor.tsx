import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { getInvestmentAdvice } from '../services/geminiService';
import { ChatMessage, ChatRole } from '../types';
import { useAuth } from '../context/AuthContext';

const AiAdvisor: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize chat with a personalized welcome if user is logged in
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        { 
          role: ChatRole.MODEL, 
          text: user 
            ? `Welcome back, ${user.fullName.split(' ')[0]}. I have reviewed your ${user.investorType.toLowerCase()} profile preferences. How can I assist with your portfolio strategy today?`
            : "Welcome to Prestige Assets. I am Aura, your personal investment concierge. How may I assist you with your portfolio today?"
        }
      ]);
    }
  }, [user]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: ChatRole.USER, text: userMessage }]);
    setIsLoading(true);

    // Pass the user object to the service for context-aware answers
    const advice = await getInvestmentAdvice(userMessage, user);

    setMessages(prev => [...prev, { role: ChatRole.MODEL, text: advice }]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 bg-gold-600 hover:bg-gold-500 text-white p-4 rounded-full shadow-lg shadow-gold-900/20 transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${isOpen ? 'hidden' : 'flex'}`}
        aria-label="Open AI Assistant"
      >
        <Sparkles className="h-6 w-6" />
        <span className="font-serif italic pr-2">Ask Aura</span>
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-6 right-6 z-50 w-full max-w-sm bg-navy-900 border border-gold-500/30 rounded-2xl shadow-2xl transition-all duration-300 origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-navy-950 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gold-500/10 rounded-full">
              <Sparkles className="h-5 w-5 text-gold-500" />
            </div>
            <div>
              <h3 className="text-white font-serif font-semibold">Aura</h3>
              <p className="text-xs text-slate-400">AI Wealth Concierge</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="h-80 overflow-y-auto p-4 space-y-4 bg-navy-900">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === ChatRole.USER ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === ChatRole.USER
                    ? 'bg-gold-600 text-white rounded-tr-none'
                    : 'bg-navy-800 text-slate-200 border border-white/5 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-navy-800 p-3 rounded-2xl rounded-tl-none border border-white/5">
                <Loader2 className="h-4 w-4 text-gold-500 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 bg-navy-950 rounded-b-2xl">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about market trends..."
              className="flex-1 bg-navy-800 border-none text-white placeholder-slate-500 text-sm rounded-full px-4 py-2.5 focus:ring-1 focus:ring-gold-500 focus:outline-none"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-2.5 bg-gold-600 hover:bg-gold-500 disabled:bg-navy-700 disabled:text-slate-500 text-white rounded-full transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AiAdvisor;