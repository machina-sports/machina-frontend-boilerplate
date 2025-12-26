'use client';

import ThreadSuggestions from './thread-suggestions';
import { memo } from 'react';
import type { FC } from 'react';
import { useBrand } from '@/contexts/brand-context';
import Image from 'next/image';

const ThreadWelcome: FC = () => {
  const brand = useBrand();

  return (
    <div className="aui-thread-welcome-root mx-auto flex w-full max-w-[var(--thread-max-width)] flex-col px-4 py-12 md:py-20">
      <div className="aui-thread-welcome-center flex w-full flex-col items-center justify-center text-center">
        <div className="shadow-primary/10 mb-8 flex h-[50px] w-[50px] items-center justify-center rounded-3xl bg-white p-4 shadow-xl ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <Image
            src={brand.content.favicon || '/favicon.ico'}
            alt={brand.content.title}
            width={48}
            height={48}
            className="h-auto w-full object-contain"
          />
        </div>

        <div className="aui-thread-welcome-message mb-12 flex w-full flex-col items-center justify-center gap-4">
          <h1 className="fade-in slide-in-from-bottom-2 animate-in text-4xl font-bold tracking-tight text-zinc-900 duration-500 sm:text-5xl dark:text-zinc-100">
            {brand.id === 'default' ? 'Welcome to Machina' : `Welcome to ${brand.content.title}`}
          </h1>
          <p className="fade-in slide-in-from-bottom-2 animate-in text-muted-foreground max-w-lg text-lg delay-150 duration-500">
            {brand.content.description}
          </p>
          <div className="bg-primary/20 mt-4 h-1 w-12 rounded-full" />
        </div>
      </div>

      <ThreadSuggestions />
    </div>
  );
};

export default memo(ThreadWelcome);
