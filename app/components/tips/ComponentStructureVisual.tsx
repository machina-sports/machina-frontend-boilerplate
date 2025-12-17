'use client';

import { useState } from 'react';
import { Layers, FileCode, ArrowDown } from 'lucide-react';

export function ComponentStructureVisual() {
  const [isRefactored, setIsRefactored] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4 p-2 sm:gap-6 sm:p-4">
      <button
        onClick={() => setIsRefactored(!isRefactored)}
        className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
      >
        <Layers size={14} />
        {isRefactored ? 'Merge into Monolith' : 'Refactor & Split'}
      </button>

      <div className="relative flex h-48 w-full max-w-md items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 p-4 sm:h-64 sm:p-8 dark:border-zinc-800 dark:bg-zinc-950/30">
        {/* Monolith State */}
        <div
          className={`absolute transition-all duration-700 ease-in-out ${isRefactored ? 'pointer-events-none scale-90 opacity-0' : 'scale-100 opacity-100'}`}
        >
          <div className="flex h-40 w-36 flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-red-200 bg-white p-3 shadow-sm sm:h-56 sm:w-48 sm:gap-2 sm:p-4 dark:border-red-900/50 dark:bg-zinc-900">
            <FileCode size={24} className="text-red-400 sm:size-8" />
            <span className="text-xs font-semibold text-zinc-700 sm:text-sm dark:text-zinc-300">
              LargePage.tsx
            </span>
            <div className="mt-2 w-full space-y-1 opacity-50">
              <div className="h-1.5 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-1.5 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-1.5 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-1.5 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-1.5 w-full rounded bg-red-100 dark:bg-red-900/30" />
              <div className="h-1.5 w-full rounded bg-red-100 dark:bg-red-900/30" />
              <div className="h-1.5 w-full rounded bg-red-100 dark:bg-red-900/30" />
            </div>
            <span className="mt-0.5 text-[9px] font-medium text-red-500 sm:mt-1 sm:text-[10px]">
              Too Complex!
            </span>
          </div>
        </div>

        {/* Refactored State */}
        <div
          className={`absolute h-full w-full transition-all duration-700 ease-in-out ${!isRefactored ? 'pointer-events-none scale-110 opacity-0' : 'scale-100 opacity-100'}`}
        >
          <div className="relative flex h-full w-full flex-col items-center justify-between">
            {/* Parent */}
            <div className="z-10 flex h-14 w-24 flex-col items-center justify-center rounded-lg border-2 border-green-200 bg-white shadow-sm sm:h-20 sm:w-32 dark:border-green-900/50 dark:bg-zinc-900">
              <span className="text-[10px] font-semibold text-zinc-700 sm:text-xs dark:text-zinc-300">
                Page.tsx
              </span>
            </div>

            {/* Arrows */}
            <div className="absolute top-14 flex w-full justify-center gap-6 text-zinc-300 sm:top-20 sm:gap-12 dark:text-zinc-700">
              <ArrowDown size={16} className="-rotate-12 sm:size-6" />
              <ArrowDown size={16} className="translate-y-2 rotate-0 sm:size-6" />
              <ArrowDown size={16} className="rotate-12 sm:size-6" />
            </div>

            {/* Children */}
            <div className="flex items-end gap-2 pb-1 sm:gap-4 sm:pb-2">
              <ChildBlock name="Header" />
              <ChildBlock name="List" />
              <ChildBlock name="Footer" />
            </div>
          </div>
        </div>
      </div>

      <p className="max-w-sm text-center text-xs text-zinc-500 sm:text-sm">
        {isRefactored
          ? 'Better! Separate logic into focused, reusable components.'
          : 'Avoid large files. If you see repetition or complexity, break it down.'}
      </p>
    </div>
  );
}

function ChildBlock({ name }: { name: string }) {
  return (
    <div className="flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-sm sm:h-24 sm:w-24 sm:gap-1 sm:p-2 dark:border-zinc-800 dark:bg-zinc-900">
      <FileCode size={12} className="text-green-500 sm:size-4" />
      <span className="text-[9px] font-medium text-zinc-600 sm:text-[10px] dark:text-zinc-400">
        {name}.tsx
      </span>
    </div>
  );
}
