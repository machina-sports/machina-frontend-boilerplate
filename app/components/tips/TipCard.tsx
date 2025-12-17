import { ReactNode } from 'react';

interface TipCardProps {
  title: string;
  description: string;
  children?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function TipCard({ title, description, children, icon, className = '' }: TipCardProps) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:gap-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {icon && (
          <div className="flex-shrink-0 rounded-lg bg-zinc-100 p-1.5 text-zinc-900 sm:p-2 dark:bg-zinc-800 dark:text-zinc-50">
            {icon}
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className="text-lg leading-tight font-semibold tracking-tight text-zinc-900 sm:text-xl sm:leading-none dark:text-zinc-50">
            {title}
          </h3>
          <p className="text-xs text-zinc-500 sm:text-sm dark:text-zinc-400">{description}</p>
        </div>
      </div>
      {children && (
        <div className="mt-1 w-full overflow-hidden rounded-lg border border-zinc-100 bg-zinc-50 p-3 sm:mt-2 sm:p-4 dark:border-zinc-800/50 dark:bg-zinc-950/50">
          {children}
        </div>
      )}
    </div>
  );
}
