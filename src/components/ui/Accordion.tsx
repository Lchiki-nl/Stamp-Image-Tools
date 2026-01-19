"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
}

export function Accordion({ title, children }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`border-2 rounded-xl transition-all duration-200 ${isOpen ? 'border-primary/30 bg-white shadow-md' : 'border-gray-100 bg-white/50 hover:border-primary/20'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 md:p-5 text-left"
      >
        <span className={`font-bold text-base md:text-lg transition-colors ${isOpen ? 'text-primary' : 'text-gray-700'}`}>
          {title}
        </span>
        <div className={`p-2 rounded-full transition-colors ${isOpen ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>
      
      <div 
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="p-5 pt-0 border-t border-gray-50 mt-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
