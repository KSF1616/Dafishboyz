import React, { useState } from 'react';

const faqs = [
  {
    question: 'How do I play online with friends?',
    answer: 'After purchasing a digital pass, you\'ll get a unique game room link. Share it with friends and they can join instantly - no account needed for guests!'
  },
  {
    question: 'What\'s included in the physical games?',
    answer: 'Each physical game includes all cards/dice, a rule book, and a storage box. Premium quality materials that will last through countless game nights.'
  },
  {
    question: 'Can I get a refund?',
    answer: 'Digital purchases are non-refundable. Physical games can be returned within 30 days if unopened. Opened games can be exchanged if defective.'
  },
  {
    question: 'How long does shipping take?',
    answer: 'US orders ship within 24 hours and arrive in 3-5 business days. International shipping takes 7-14 business days. Free shipping on orders over $50!'
  },
  {
    question: 'Are these games appropriate for all ages?',
    answer: 'Our games are designed for adults 17+. They contain mature humor and themes. Keep them away from the kids... or don\'t, we\'re not your parents.'
  }
];

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block bg-lime-500/20 text-lime-400 px-4 py-2 rounded-full text-sm font-bold mb-4">
            FAQ
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Got <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-lime-400">Questions?</span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-gray-800 rounded-xl border border-amber-500/20 overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full px-6 py-4 flex items-center justify-between text-left"
              >
                <span className="font-bold text-white">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-amber-400 transition-transform ${openIndex === idx ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === idx && (
                <div className="px-6 pb-4">
                  <p className="text-gray-400">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
