'use client';

import '@assistant-ui/react-markdown/styles/dot.css';

import {
  type CodeHeaderProps,
  MarkdownTextPrimitive,
  unstable_memoizeMarkdownComponents as memoizeMarkdownComponents,
  useIsMarkdownCodeBlock,
} from '@assistant-ui/react-markdown';
import remarkGfm from 'remark-gfm';
import { type FC, memo } from 'react';

import { CodeBlock } from '@/components/ui/code-block';
import { cn } from '@/lib/utils';

const MarkdownTextImpl = () => {
  return (
    <MarkdownTextPrimitive
      remarkPlugins={[remarkGfm]}
      className="aui-md"
      components={defaultComponents}
    />
  );
};

export const MarkdownText = memo(MarkdownTextImpl);

const CodeHeader: FC<CodeHeaderProps> = () => {
  // CodeHeader não é mais necessário pois o CodeBlock já tem header integrado
  // Mas mantemos para compatibilidade caso seja usado em algum lugar
  return null;
};

const defaultComponents = memoizeMarkdownComponents({
  h1: ({ className, ...props }) => (
    <h1
      className={cn(
        'aui-md-h1 mb-8 scroll-m-20 text-4xl font-extrabold tracking-tight last:mb-0 dark:text-zinc-50',
        className
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={cn(
        'aui-md-h2 mt-8 mb-4 scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0 last:mb-0 dark:text-zinc-100',
        className
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn(
        'aui-md-h3 mt-6 mb-4 scroll-m-20 text-2xl font-semibold tracking-tight first:mt-0 last:mb-0 dark:text-zinc-100',
        className
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }) => (
    <h4
      className={cn(
        'aui-md-h4 mt-6 mb-4 scroll-m-20 text-xl font-semibold tracking-tight first:mt-0 last:mb-0 dark:text-zinc-100',
        className
      )}
      {...props}
    />
  ),
  h5: ({ className, ...props }) => (
    <h5
      className={cn(
        'aui-md-h5 my-4 text-lg font-semibold first:mt-0 last:mb-0 dark:text-zinc-100',
        className
      )}
      {...props}
    />
  ),
  h6: ({ className, ...props }) => (
    <h6
      className={cn(
        'aui-md-h6 my-4 font-semibold first:mt-0 last:mb-0 dark:text-zinc-200',
        className
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }) => (
    <p
      className={cn(
        'aui-md-p mt-5 mb-5 leading-7 first:mt-0 last:mb-0 dark:text-zinc-300',
        className
      )}
      {...props}
    />
  ),
  a: ({ className, ...props }) => (
    <a
      className={cn('aui-md-a text-primary font-medium underline underline-offset-4', className)}
      {...props}
    />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn(
        'aui-md-blockquote border-l-2 border-zinc-300 pl-6 italic dark:border-zinc-700 dark:text-zinc-400',
        className
      )}
      {...props}
    />
  ),
  ul: ({ className, ...props }) => (
    <ul
      className={cn('aui-md-ul my-5 ml-6 list-disc dark:text-zinc-300 [&>li]:mt-2', className)}
      {...props}
    />
  ),
  ol: ({ className, ...props }) => (
    <ol
      className={cn('aui-md-ol my-5 ml-6 list-decimal dark:text-zinc-300 [&>li]:mt-2', className)}
      {...props}
    />
  ),
  hr: ({ className, ...props }) => (
    <hr className={cn('aui-md-hr my-5 border-b', className)} {...props} />
  ),
  table: ({ className, ...props }) => (
    <table
      className={cn(
        'aui-md-table my-5 w-full border-separate border-spacing-0 overflow-y-auto',
        className
      )}
      {...props}
    />
  ),
  th: ({ className, ...props }) => (
    <th
      className={cn(
        'aui-md-th bg-muted px-4 py-2 text-left font-bold first:rounded-tl-lg last:rounded-tr-lg [[align=center]]:text-center [[align=right]]:text-right',
        className
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }) => (
    <td
      className={cn(
        'aui-md-td border-b border-l px-4 py-2 text-left last:border-r [[align=center]]:text-center [[align=right]]:text-right',
        className
      )}
      {...props}
    />
  ),
  tr: ({ className, ...props }) => (
    <tr
      className={cn(
        'aui-md-tr m-0 border-b p-0 first:border-t [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg',
        className
      )}
      {...props}
    />
  ),
  sup: ({ className, ...props }) => (
    <sup className={cn('aui-md-sup [&>a]:text-xs [&>a]:no-underline', className)} {...props} />
  ),
  pre: ({ children, ...props }) => {
    // Pre não precisa de estilização quando usamos CodeBlock
    return <>{children}</>;
  },
  code: function Code({ className, children, ...props }) {
    const isCodeBlock = useIsMarkdownCodeBlock();

    // Detecta se é código inline ou block
    // Code blocks têm className com "language-" e geralmente têm múltiplas linhas
    const isInline =
      !className || (!String(children).includes('\n') && !className.includes('language-'));

    // Se for um code block, usa o CodeBlock customizado
    if (isCodeBlock || (!isInline && className)) {
      return <CodeBlock className={className}>{children}</CodeBlock>;
    }

    // Se for código inline, usa estilo simples
    return (
      <code
        className={cn(
          'aui-md-inline-code rounded-md border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-mono text-sm text-zinc-800 dark:border-zinc-700/50 dark:bg-zinc-800 dark:text-zinc-200',
          className
        )}
        {...props}
      >
        {children}
      </code>
    );
  },
  CodeHeader,
});
