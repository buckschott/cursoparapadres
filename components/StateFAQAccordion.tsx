'use client';

import { useState } from 'react';
import type { FAQ } from '@/lib/stateData/types';

function FAQItem({ question, answer, isOpen, onClick }: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border-b border-white/15 last:border-b-0">
      <button
        onClick={onClick}
        aria-expanded={isOpen}
        className="w-full py-5 px-4 flex justify-between items-center text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-semibold text-white pr-4">{question}</span>
        <svg
          className={`w-5 h-5 text-white/60 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-5 text-white/70 whitespace-pre-line">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StateFAQAccordionProps {
  faqs: FAQ[];
}

export default function StateFAQAccordion({ faqs }: StateFAQAccordionProps) {
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({});

  const toggleItem = (index: number) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="bg-background rounded-xl overflow-hidden border border-[#FFFFFF]/15 shadow-xl shadow-black/40">
      {faqs.map((faq, index) => (
        <FAQItem
          key={index}
          question={faq.question}
          answer={faq.answer}
          isOpen={openItems[index] || false}
          onClick={() => toggleItem(index)}
        />
      ))}
    </div>
  );
}
