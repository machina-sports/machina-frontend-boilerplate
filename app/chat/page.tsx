'use client';

import { useEffect } from 'react';
import { useAppSelector } from '@/store/useState';
import { useAppDispatch } from '@/store/dispatch';
import { setFullscreen } from '@/providers/chat-ui/reducer';
import { Thread } from '@/components/assistant-ui/thread';
import { ChatControls } from '@/components/chat-page/chat-controls';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import './chat-page.css';

export default function ChatPage() {
  const dispatch = useAppDispatch();
  const { isFullscreen, theme } = useAppSelector((state) => state.chatUI);

  // Manage fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen?.();
      }
    }
  }, [isFullscreen]);

  // Detect fullscreen exit via ESC
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        dispatch(setFullscreen(false));
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isFullscreen, dispatch]);

  // Apply theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // auto - use system preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  return (
    <div
      className={cn(
        'flex h-screen w-full flex-col bg-zinc-50 dark:bg-zinc-950',
        isFullscreen && 'fixed inset-0 z-50'
      )}
    >
      {/* Header */}
      <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-zinc-200 bg-white/80 px-3 backdrop-blur-md md:h-16 md:px-4 dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="flex items-center gap-2 md:gap-4">
          {!isFullscreen && (
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-500 hover:text-zinc-900 md:h-9 md:w-9 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          )}
          <div className="flex items-center gap-2">
            <Image
              src="/favicon.ico"
              alt="Machina Boilerplate"
              width={20}
              height={20}
              className="md:h-6 md:w-6"
            />
            <div className="hidden h-6 w-px bg-zinc-300 md:block dark:bg-zinc-700"></div>
            <h1 className="text-base font-semibold text-zinc-900 md:text-lg dark:text-zinc-100">
              Machina Assistant
            </h1>
          </div>
        </div>

        <ChatControls />
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat Area */}
        <main className="chat-content-enter flex-1 overflow-hidden">
          <div className="h-full bg-white dark:bg-zinc-950">
            <Thread />
          </div>
        </main>
      </div>
    </div>
  );
}
