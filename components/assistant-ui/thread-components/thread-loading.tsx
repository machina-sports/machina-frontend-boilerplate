'use client';

import { AssistantIf } from '@assistant-ui/react';
import { memo } from 'react';
import type { FC } from 'react';

const ThreadLoading: FC = () => {
  return (
    <AssistantIf condition={({ thread }) => thread.isRunning}>
      <div
        className="aui-thread-loading fade-in slide-in-from-bottom-1 animate-in relative mx-auto w-full max-w-[var(--thread-max-width)] py-3 duration-200"
        data-role="assistant-loading"
      >
        <div className="aui-thread-loading-content text-muted-foreground flex items-center gap-3 px-2">
          <div className="aui-thread-loading-dots flex gap-1.5">
            <span className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:0ms] [animation-duration:1.4s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:200ms] [animation-duration:1.4s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:400ms] [animation-duration:1.4s]" />
          </div>
          <span className="text-sm font-medium">Thinking...</span>
        </div>
      </div>
    </AssistantIf>
  );
};

export default memo(ThreadLoading);
