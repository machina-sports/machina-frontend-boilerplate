import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { getReadmeContent } from '@/lib/readme';
import DocsClient from './docs-client';
import { CodeBlock } from '@/components/ui/code-block';
import { DocsHeaderLogo } from '@/components/docs/docs-header-logo';

import Link from 'next/link';

async function DocsPage() {
  const readmeContent = getReadmeContent();

  return (
    <main className="flex min-h-screen flex-col items-start justify-start gap-8 bg-zinc-50 dark:bg-zinc-950">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto max-w-5xl px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <DocsHeaderLogo />
              <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
              <h1 className="text-sm font-semibold tracking-tight text-zinc-900 md:text-base dark:text-zinc-50">
                Documentation
              </h1>
            </div>
            <DocsClient />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto w-full max-w-4xl px-6 py-8">
        <article className="prose prose-zinc dark:prose-invert docs-markdown max-w-none pb-20">
          <ReactMarkdown
            components={{
              // Headings
              h1: ({ children }) => (
                <h1 className="mt-12 mb-6 text-4xl font-extrabold tracking-tighter text-zinc-900 dark:text-zinc-50">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="mt-10 mb-5 border-b border-zinc-200 pb-3 text-2xl font-bold tracking-tight text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="mt-8 mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {children}
                </h3>
              ),
              h4: ({ children }) => (
                <h4 className="mt-6 mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-200">
                  {children}
                </h4>
              ),

              // Paragraphs and text
              p: ({ children }) => (
                <p className="mb-5 text-base leading-7 text-zinc-600 dark:text-zinc-300">
                  {children}
                </p>
              ),

              // Lists
              ul: ({ children }) => (
                <ul className="mb-6 ml-4 list-inside list-disc space-y-2 text-zinc-600 dark:text-zinc-300">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="mb-6 ml-4 list-inside list-decimal space-y-2 text-zinc-600 dark:text-zinc-300 [&>li>p:first-child]:mb-0 [&>li>p:first-child]:inline">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="pl-1 text-zinc-600 dark:text-zinc-300">{children}</li>
              ),

              // Code blocks - Handled via code component + pre override
              pre: ({ children }) => <>{children}</>,
              code: ({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) => {
                const isInline = !className && !String(children).includes('\n');

                if (isInline) {
                  return (
                    <code
                      className="rounded-md border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-mono text-sm text-zinc-800 dark:border-zinc-700/50 dark:bg-zinc-800 dark:text-zinc-200"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }

                return <CodeBlock className={className}>{children}</CodeBlock>;
              },

              // Links
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="inline-flex items-center gap-1 font-medium text-[#ff6d00] underline-offset-4 transition-colors hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),

              // Blockquotes
              blockquote: ({ children }) => (
                <blockquote className="my-6 rounded-r-xl border-l-4 border-[#ff6d00] bg-[#ff6d00]/5 py-2 pl-6 text-zinc-700 italic dark:text-zinc-300">
                  {children}
                </blockquote>
              ),

              // Tables
              table: ({ children }) => (
                <div className="my-8 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <table className="w-full border-collapse text-left text-sm">{children}</table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="border-b border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
                  {children}
                </thead>
              ),
              tbody: ({ children }) => (
                <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
                  {children}
                </tbody>
              ),
              tr: ({ children }) => (
                <tr className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                  {children}
                </tr>
              ),
              td: ({ children }) => (
                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">{children}</td>
              ),
              th: ({ children }) => (
                <th className="px-6 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
                  {children}
                </th>
              ),

              // Horizontal rule
              hr: () => <hr className="my-10 border-t border-zinc-200 dark:border-zinc-800" />,
            }}
          >
            {readmeContent}
          </ReactMarkdown>
        </article>
      </div>
    </main>
  );
}

export default DocsPage;
