'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAppSelector } from '@/store/useState';

export function DocsHeaderLogo() {
  const { theme } = useAppSelector((state) => state.chatUI);

  const isDark =
    theme === 'dark' ||
    (theme === 'auto' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <Link href="/" className="transition-opacity hover:opacity-80">
      <Image
        src={isDark ? '/logo-grey.svg' : '/machina-logo-dark.svg'}
        alt="Machina Sports logo"
        width={0}
        height={0}
        sizes="100vw"
        className="h-7 w-auto md:h-8"
      />
    </Link>
  );
}
