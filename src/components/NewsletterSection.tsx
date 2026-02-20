import React, { useState } from 'react';
import { useLogo } from '@/contexts/LogoContext';

const NewsletterSection: React.FC = () => {
  const { logoUrl } = useLogo();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    setSubmitted(true);
    setError('');
    setEmail('');
  };

  return (
    <section className="py-20 bg-gradient-to-r from-amber-500 to-lime-500 relative overflow-hidden">
      {/* Background logo watermark - Dynamic from LogoContext */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img 
          src={logoUrl} 
          alt="" 
          className="w-96 h-96 object-contain opacity-10"
        />
      </div>
      
      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        {/* Logo at top - Dynamic from LogoContext */}
        <div className="mb-6 flex justify-center">
          <img 
            src={logoUrl} 
            alt="Dafish Boyz" 
            className="w-16 h-16 object-contain drop-shadow-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
        </div>
        
        <h2 className="text-4xl md:text-5xl font-black text-black mb-4">
          Join the Shitstorm
        </h2>
        <p className="text-black/70 text-lg mb-8 max-w-2xl mx-auto">
          Be the first to know about new games, exclusive deals, and hilarious updates. No spam, just good shit.
        </p>

        {submitted ? (
          <div className="bg-black/20 rounded-2xl p-6 max-w-md mx-auto">
            <img 
              src={logoUrl} 
              alt="Dafish Boyz" 
              className="w-12 h-12 mx-auto mb-4 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            <svg className="w-16 h-16 mx-auto text-black mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <p className="text-black font-bold text-xl">You're in!</p>
            <p className="text-black/70">Check your inbox for a welcome surprise from DAFISH BOYZ.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <div className="flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="Enter your email"
                className="w-full px-6 py-4 rounded-xl bg-black/20 border-2 border-black/30 text-black placeholder-black/50 focus:outline-none focus:border-black"
              />
              {error && <p className="text-red-800 text-sm mt-1 text-left">{error}</p>}
            </div>
            <button
              type="submit"
              className="px-8 py-4 bg-black text-lime-400 font-bold rounded-xl hover:bg-gray-900 transition-all whitespace-nowrap flex items-center justify-center gap-2"
            >
              <img 
                src={logoUrl} 
                alt="" 
                className="w-5 h-5 object-contain"
              />
              Subscribe
            </button>
          </form>
        )}

        <p className="text-black/50 text-sm mt-4">
          We respect your privacy. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
};

export default NewsletterSection;
