import React from 'react';
import Image from 'next/image';
import { Check, Copy, ArrowUpRight, BookText, Layout } from 'lucide-react';

interface HeaderProps {
  handleCopy: () => void;
  copied: boolean;
}
const Header = ({ handleCopy, copied }: HeaderProps) => {
  return (
    <div className="flex max-w-4xl flex-col items-center gap-10 text-center">
      <div className="space-y-6">
        <div className="inline-flex items-center rounded-full border border-[#ff6d00]/20 bg-[#ff6d00]/10 px-3 py-1 text-xs font-medium text-[#ff6d00] ring-1 ring-[#ff6d00]/20 ring-inset">
          Developer Boilerplate
        </div>
        <h1 className="text-4xl font-extrabold tracking-tighter text-zinc-900 sm:text-6xl md:text-7xl dark:text-white">
          Machina Sports <span className="text-[#ff6d00]">Boilerplate</span>
        </h1>
        <p className="mx-auto max-w-[42rem] text-lg leading-normal text-balance text-zinc-600 sm:text-xl sm:leading-8 dark:text-zinc-400">
          The ultimate foundation for building next-generation AI agents in sports.
          Performance-optimized, developer-first, and ready for production.
        </p>
      </div>

      {/* Git Clone Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={handleCopy}
          className={`group flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 ${
            copied
              ? 'bg-green-600 text-white'
              : 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200'
          }`}
        >
          {copied ? (
            <>
              <Check size={18} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={18} className="text-[#ff6d00]" />
              Copy git clone command
            </>
          )}
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-4">
        <a
          href="/redux-demo"
          className="group flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <Layout size={16} className="text-zinc-400 group-hover:text-[#ff6d00]" />
          Redux Demo
          <ArrowUpRight
            size={14}
            className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
          />
        </a>
        <a
          href="/docs"
          className="group flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <BookText size={16} className="text-zinc-400 group-hover:text-[#ff6d00]" />
          Documentation
          <ArrowUpRight
            size={14}
            className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
          />
        </a>
        <a
          href="/deploy"
          className="group flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <span className="flex h-1.5 w-1.5 rounded-full bg-green-500" />
          Deployment Guide
          <ArrowUpRight
            size={14}
            className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
          />
        </a>
      </div>
    </div>
  );
};

export default Header;
