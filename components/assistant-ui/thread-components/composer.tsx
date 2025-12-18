'use client';

import { ComposerAttachments } from '@/components/assistant-ui/attachment';
import { ComposerPrimitive } from '@assistant-ui/react';
import { memo } from 'react';
import type { FC } from 'react';
import ComposerAction from './composer-action';

const Composer: FC = () => {
  return (
    <div className="aui-composer-root !focus-within:border-none relative mx-auto flex w-full max-w-[var(--thread-max-width)] flex-col">
      <ComposerPrimitive.AttachmentDropzone className="aui-composer-attachment-dropzone border-input data-[dragging=true]:border-ring data-[dragging=true]:bg-accent/50 flex w-full flex-col rounded-2xl border bg-zinc-50 px-1 pt-2 transition-shadow outline-none data-[dragging=true]:border-dashed dark:bg-zinc-800/50">
        <ComposerAttachments />
        <ComposerPrimitive.Input
          placeholder="Send a message..."
          className="aui-composer-input placeholder:text-muted-foreground !focus:ring-0 mb-1 max-h-32 min-h-14 w-full resize-none bg-transparent px-4 pt-2 pb-3 text-sm outline-none dark:text-zinc-100"
          rows={1}
          aria-label="Message input"
        />
        <ComposerAction />
      </ComposerPrimitive.AttachmentDropzone>
    </div>
  );
};

export default memo(Composer);
