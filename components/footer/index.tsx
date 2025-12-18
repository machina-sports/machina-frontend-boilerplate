'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/useState';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const version = '0.1.0'; // You can import from package.json if needed
  const pathname = usePathname();
  const { theme } = useAppSelector((state) => state.chatUI);

  const isChatPage = pathname === '/chat';
  const isDark =
    theme === 'dark' ||
    (theme === 'auto' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const logoSrc = isChatPage && isDark ? '/logo-grey.svg' : '/machina-logo-dark.svg';

  return (
    <footer className="w-full border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Left Section - Branding */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Image
                src={logoSrc}
                alt="Machina Sports logo"
                width={0}
                height={0}
                sizes="100vw"
                className="h-8 w-auto"
              />
              <span className="text-xs font-light tracking-tight text-zinc-400 dark:text-zinc-500">
                opensource
              </span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              The Generative AI engine for Sports.
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              Copyright © {currentYear} - All rights reserved
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">v{version}</p>
          </div>

          {/* Middle Section - Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-zinc-700 uppercase dark:text-zinc-300">
              Links
            </h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="https://machina.gg/blog"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Blog
              </Link>
              <Link
                href="https://machina.gg/templates"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Templates
              </Link>
              <Link
                href="https://docs.machina.gg/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Documentation
              </Link>
              <Link
                href="https://discord.gg/PBYd6FbBSK"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Discord
              </Link>
            </nav>
          </div>

          {/* Right Section - Legal */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-zinc-700 uppercase dark:text-zinc-300">
              Legal
            </h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="https://machina.gg/tos"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Terms of Service
              </Link>
              <Link
                href="https://machina.gg/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Privacy Policy
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
