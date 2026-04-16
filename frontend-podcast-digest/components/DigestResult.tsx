'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { FileText, Copy, Check, Download, Clock, Sparkles } from 'lucide-react';

interface DigestResultProps {
  digest: string;
}

export function DigestResult({ digest }: DigestResultProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(digest);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([digest], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'podcast-digest.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full mt-10 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4 px-2">
        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
          <div className="bg-[#fe591f]/10 p-2 rounded-xl text-[#fe591f]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg">AI Digest Generated</h3>
            <div className="flex items-center gap-1 text-xs font-medium">
              <Clock className="w-3 h-3" />
              <span>Just now</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700/50 hover:text-zinc-900 dark:hover:text-white transition-colors shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700/50 hover:text-zinc-900 dark:hover:text-white transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e] shadow-xl overflow-hidden relative">
        {/* Decorative header line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#fe591f] to-orange-400"></div>
        
        <div className="p-6 sm:p-10">
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-8 mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-white tracking-tight" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-2xl font-semibold mt-8 mb-4 text-zinc-800 dark:text-zinc-100 flex items-center gap-2 before:content-[''] before:block before:w-1.5 before:h-6 before:bg-[#fe591f] before:rounded-full" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-xl font-medium mt-6 mb-3 text-zinc-800 dark:text-zinc-200" {...props} />,
              p: ({node, ...props}) => <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-300 mb-5 last:mb-0" {...props} />,
              ul: ({node, ...props}) => <ul className="space-y-3 my-5 list-none pl-0" {...props} />,
              ol: ({node, ...props}) => <ol className="space-y-3 my-5 list-decimal list-outside pl-5 text-zinc-600 dark:text-zinc-300 marker:text-zinc-400 dark:marker:text-zinc-500 font-medium" {...props} />,
              li: ({node, ...props}) => {
                // If it's inside an unordered list, add custom bullet
                const isOrdered = (node as any)?.parent?.tagName === 'ol';
                if (isOrdered) {
                  return <li className="pl-1 leading-relaxed" {...props} />;
                }
                return (
                  <li className="flex items-start gap-3 text-zinc-600 dark:text-zinc-300 leading-relaxed" {...props}>
                    <span className="mt-1.5 min-w-[6px] h-[6px] rounded-full bg-[#fe591f]/60 border border-[#fe591f] shrink-0"></span>
                    <span>{props.children}</span>
                  </li>
                );
              },
              blockquote: ({node, ...props}) => (
                <blockquote className="my-6 pl-5 py-2 border-l-4 border-[#fe591f] bg-[#fe591f]/5 dark:bg-[#fe591f]/10 rounded-r-xl italic text-zinc-700 dark:text-zinc-300 text-lg shadow-sm" {...props} />
              ),
              a: ({node, ...props}) => <a className="text-[#fe591f] hover:text-[#e04a16] underline decoration-[#fe591f]/30 hover:decoration-[#fe591f] underline-offset-4 font-medium transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
              strong: ({node, ...props}) => <strong className="font-semibold text-zinc-900 dark:text-zinc-100" {...props} />,
              code: ({node, inline, className, children, ...props}: any) => {
                const match = /language-(\w+)/.exec(className || '');
                return !inline ? (
                  <div className="my-6 rounded-xl overflow-hidden bg-zinc-900 dark:bg-zinc-950 border border-zinc-800 shadow-md">
                    <div className="flex items-center px-4 py-2 bg-zinc-800/50 border-b border-zinc-800 text-xs font-mono text-zinc-400">
                      {match ? match[1] : 'Code'}
                    </div>
                    <pre className="p-4 overflow-x-auto text-sm font-mono text-zinc-300">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  </div>
                ) : (
                  <code className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[#fe591f] dark:text-[#fe591f] text-sm font-mono border border-zinc-200 dark:border-zinc-700" {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {digest}
          </ReactMarkdown>
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="mt-4 text-center pb-8">
        <p className="text-xs text-zinc-400 dark:text-zinc-500 flex items-center justify-center gap-1.5">
          Generated by <span className="font-semibold text-zinc-500 dark:text-zinc-400">Machina</span>
          <Sparkles className="w-3 h-3 text-[#fe591f]" />
        </p>
      </div>
    </div>
  );
}
