'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type DropdownMenuContextType = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const DropdownMenuContext = React.createContext<DropdownMenuContextType | undefined>(undefined);

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <DropdownMenuContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative inline-block">{children}</div>
    </DropdownMenuContext.Provider>
  );
};

const useDropdownMenu = () => {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('useDropdownMenu must be used within DropdownMenu');
  }
  return context;
};

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ children, asChild, onClick, ...props }, ref) => {
  const { isOpen, setIsOpen } = useDropdownMenu();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsOpen(!isOpen);
    onClick?.(e);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ref,
      onClick: handleClick,
      ...props,
    });
  }
  return (
    <button ref={ref} onClick={handleClick} {...props}>
      {children}
    </button>
  );
});
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { align?: 'start' | 'end' }
>(({ className, align = 'start', children, ...props }, ref) => {
  const { isOpen, setIsOpen } = useDropdownMenu();
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm sm:hidden"
        onClick={() => setIsOpen(false)}
      />
      <div
        ref={contentRef}
        className={cn(
          'animate-in fade-in-0 zoom-in-95 absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border border-zinc-200 bg-white p-1 text-zinc-950 shadow-md',
          'dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50',
          align === 'end' && 'right-0 origin-top-right',
          align === 'start' && 'left-0 origin-top-left',
          'max-sm:fixed max-sm:top-auto max-sm:right-0 max-sm:bottom-0 max-sm:left-0 max-sm:mt-0 max-sm:w-full max-sm:rounded-t-xl max-sm:rounded-b-none max-sm:border-x-0 max-sm:border-b-0 max-sm:p-4 max-sm:shadow-[0_-8px_30px_rgb(0,0,0,0.12)]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </>
  );
});
DropdownMenuContent.displayName = 'DropdownMenuContent';

const DropdownMenuItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, onClick, ...props }, ref) => {
    const { setIsOpen } = useDropdownMenu();

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      onClick?.(e);
      setIsOpen(false);
    };

    return (
      <div
        ref={ref}
        onClick={handleClick}
        className={cn(
          'relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm transition-colors outline-none select-none',
          'hover:bg-zinc-100 focus:bg-zinc-100',
          'dark:hover:bg-zinc-800 dark:focus:bg-zinc-800',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DropdownMenuItem.displayName = 'DropdownMenuItem';

const DropdownMenuLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('px-2 py-1.5 text-sm font-semibold', className)} {...props}>
        {children}
      </div>
    );
  }
);
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('-mx-1 my-1 h-px bg-zinc-200 dark:bg-zinc-800', className)}
      {...props}
    />
  );
});
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
};
