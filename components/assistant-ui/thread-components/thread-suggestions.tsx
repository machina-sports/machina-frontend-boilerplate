'use client';

import { Button } from '@/components/ui/button';
import { ThreadPrimitive } from '@assistant-ui/react';
import { memo } from 'react';
import type { FC } from 'react';
import { SUGGESTIONS } from '@/components/assistant-ui/utils/suggestions';
import { useBrand } from '@/contexts/brand-context';
import { cn } from '@/lib/utils';

const ThreadSuggestions: FC = () => {
  const brand = useBrand();

  return (
    <div className="aui-thread-welcome-suggestions flex w-full flex-col gap-8 pb-8">
      {SUGGESTIONS.map((category, categoryIndex) => (
        <div 
          key={category.category} 
          className="fade-in slide-in-from-bottom-4 animate-in fill-mode-both duration-500"
          style={{ animationDelay: `${categoryIndex * 150}ms` }}
        >
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground/70 px-1">
            {category.category}
          </h2>
          <div className="grid w-full gap-3 sm:grid-cols-2">
            {category.items.map((suggestion, index) => {
              const Icon = suggestion.icon;
              return (
                <div
                  key={suggestion.prompt}
                  className="fade-in slide-in-from-bottom-2 animate-in fill-mode-both duration-300"
                  style={{ animationDelay: `${categoryIndex * 150 + (index + 1) * 50}ms` }}
                >
                  <ThreadPrimitive.Suggestion prompt={suggestion.prompt} send asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "group relative flex h-auto w-full flex-col items-start justify-start gap-3 overflow-hidden rounded-2xl border-zinc-200 bg-white p-4 text-left transition-all hover:border-primary/50 hover:bg-zinc-50/50 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-primary/50 dark:hover:bg-zinc-900/50"
                      )}
                      aria-label={suggestion.prompt}
                    >
                      <div className="flex w-full items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 transition-colors group-hover:bg-primary/10 group-hover:text-primary dark:bg-zinc-800 dark:text-zinc-400 dark:group-hover:bg-primary/20 dark:group-hover:text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="h-2 w-2 rounded-full bg-zinc-200 transition-colors group-hover:bg-primary dark:bg-zinc-700" />
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {suggestion.title}
                        </span>
                        <span className="text-sm text-muted-foreground line-clamp-2">
                          {suggestion.label}
                        </span>
                      </div>

                      {/* Hover effect background glow */}
                      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition-opacity opacity-0 group-hover:opacity-100" />
                    </Button>
                  </ThreadPrimitive.Suggestion>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default memo(ThreadSuggestions);
