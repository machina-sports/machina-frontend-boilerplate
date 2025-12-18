'use client';

import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
}

export function CodeBlock({ children, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Detecta o tema atual verificando a classe 'dark' no elemento raiz
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    // Verifica o tema inicial
    checkTheme();

    // Observa mudanças no tema
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const getTextContent = (node: React.ReactNode): string => {
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(getTextContent).join('');
    if (typeof node === 'object' && node !== null && 'props' in node) {
      return getTextContent(
        (node as React.ReactElement<{ children: React.ReactNode }>).props.children
      );
    }
    return '';
  };

  const textContent = getTextContent(children);
  const language = className?.replace(/language-/, '') || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(textContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const theme = isDark ? dracula : oneLight;
  const bgColor = isDark ? '#19191b' : '#fafafa';
  const borderColor = isDark ? '#44475a' : '#e5e7eb';
  const headerBg = isDark ? '#19191b' : '#f3f4f6';

  return (
    <div
      className="group relative my-4 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 shadow-lg dark:border-[#44475a] dark:bg-[#282a36]"
      style={{
        borderColor,
        backgroundColor: bgColor,
      }}
    >
      <div
        className="flex items-center justify-between border-b border-gray-200 bg-gray-100 px-4 py-2 dark:border-[#44475a] dark:bg-[#18181b]"
        style={{
          borderColor,
          backgroundColor: headerBg,
        }}
      >
        <span className="font-mono text-xs tracking-wider text-gray-600 uppercase dark:text-[#bd93f9]">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="rounded p-1.5 text-gray-500 transition-colors hover:bg-gray-200 hover:text-blue-600 dark:text-[#6272a4] dark:hover:bg-[#44475a] dark:hover:text-[#8be9fd]"
          aria-label="Copy code"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>

      <div
        className="overflow-x-auto bg-gray-50 dark:bg-[#282a36]"
        style={{ backgroundColor: bgColor }}
      >
        <SyntaxHighlighter
          language={language}
          style={theme}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: bgColor,
          }}
        >
          {textContent}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
