'use client';

import { MarkdownText } from '@/components/assistant-ui/markdown-text';
import { ToolFallback } from '@/components/assistant-ui/tool-fallback';
import { MessagePrimitive } from '@assistant-ui/react';
import { memo } from 'react';
import type { FC } from 'react';
import AssistantActionBar from './assistant-action-bar';
import AssistantMessageSuggestions from './assistant-message-suggestions';
import AssistantRun from './assistant-run';
import BranchPicker from './branch-picker';
import MessageError from './message-error';

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root
      className="aui-assistant-message-root relative mx-auto w-full max-w-[var(--thread-max-width)] px-2 py-2 duration-150 data-[message-status=running]:opacity-100"
      data-role="assistant"
    >
      <div className="aui-assistant-message-content text-foreground leading-relaxed wrap-break-word">
        <MessagePrimitive.Parts
          components={{
            Text: MarkdownText,
            tools: { Fallback: ToolFallback },
          }}
        />
        <MessageError />
        <AssistantMessageSuggestions />
      </div>

      <div className="aui-assistant-message-footer mt-1 flex">
        <BranchPicker />
        <AssistantActionBar />
      </div>
    </MessagePrimitive.Root>
  );
};

export default memo(AssistantMessage);
