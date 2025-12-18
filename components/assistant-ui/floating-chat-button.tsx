'use client';

import { Button } from '@/components/ui/button';
import { MessageCircleIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { FC } from 'react';

export const FloatingChatButton: FC = () => {
  const pathname = usePathname();

  // Não mostrar o botão flutuante na página de chat
  if (pathname === '/chat') {
    return null;
  }

  return (
    <Link href="/chat">
      <Button
        className="aui-floating-chat-button fixed right-6 bottom-6 z-40 h-14 w-14 rounded-full p-0 shadow-lg transition-all hover:shadow-xl"
        aria-label="Abrir chat"
      >
        <MessageCircleIcon className="h-6 w-6" />
      </Button>
    </Link>
  );
};
