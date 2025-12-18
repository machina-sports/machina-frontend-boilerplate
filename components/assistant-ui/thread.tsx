'use client';

import { AssistantIf, ThreadPrimitive, ComposerPrimitive } from '@assistant-ui/react';
import type { FC } from 'react';
import dynamic from 'next/dynamic';
import { useAppSelector } from '@/store/useState';

const AssistantMessage = dynamic(() => import('./thread-components/assistant-message'));
const Composer = dynamic(() => import('./thread-components/composer'));
const EditComposer = dynamic(() => import('./thread-components/edit-composer'));
const ThreadScrollToBottom = dynamic(() => import('./thread-components/thread-scroll-to-bottom'));
const ThreadWelcome = dynamic(() => import('./thread-components/thread-welcome'));
const UserMessage = dynamic(() => import('./thread-components/user-message'));

export const Thread: FC = () => {
  const layout = useAppSelector((state) => state.chatUI.layout);

  return (
    <ThreadPrimitive.Root
      className="aui-root aui-thread-root bg-background flex h-full w-full flex-col"
      style={{
        ['--thread-max-width' as string]: layout === 'wide' ? '100%' : '52rem',
      }}
    >
      <ComposerPrimitive.Root className="flex h-full w-full flex-col">
        <ThreadPrimitive.Viewport
          turnAnchor="top"
          className="aui-thread-viewport scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500 scrollbar scrollbar-thumb-gray-500 flex-1 overflow-y-scroll scroll-smooth px-4 pt-4"
        >
          <AssistantIf condition={({ thread }) => thread.isEmpty}>
            <ThreadWelcome />
          </AssistantIf>
          <ThreadPrimitive.Messages
            components={{
              UserMessage,
              EditComposer,
              AssistantMessage,
            }}
          />
          <div className="min-h-8 flex-shrink-0" /> {/* Spacer no final das mensagens */}
        </ThreadPrimitive.Viewport>

        <div className="bg-background relative z-10 flex-shrink-0 px-4 pt-2 pb-4">
          <ThreadScrollToBottom />
          <Composer />
        </div>
      </ComposerPrimitive.Root>
    </ThreadPrimitive.Root>
  );
};
