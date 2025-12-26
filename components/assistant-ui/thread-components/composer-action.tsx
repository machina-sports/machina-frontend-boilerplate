'use client';

import { TooltipIconButton } from '@/components/assistant-ui/tooltip-icon-button';
import { Button } from '@/components/ui/button';
import { AssistantIf, ComposerPrimitive, useAssistantRuntime } from '@assistant-ui/react';
import { ArrowUpIcon, SquareIcon } from 'lucide-react';
import { memo, useState } from 'react';
import type { FC } from 'react';
import { ComposerAddAttachment } from '@/components/assistant-ui/attachment';
import { VoiceRecorder } from '@/components/assistant/voice-recorder';
import { useAppDispatch } from '@/store/dispatch';
import { useAppSelector } from '@/store/useState';
import { sendVoiceMessage } from '@/providers/assistant/actions';
import { cn } from '@/lib/utils';

const ComposerAction: FC = () => {
  const runtime = useAssistantRuntime();
  const dispatch = useAppDispatch();
  const { selectedWorkflow } = useAppSelector((state) => state.assistant);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  const handleVoiceRecording = async (audioBlob: Blob) => {
    setIsProcessingVoice(true);
    try {
      // Call our Redux action to process: Upload -> Execute Workflow
      const resultAction = await dispatch(
        sendVoiceMessage({
          audioBlob,
          agentId: selectedWorkflow || 'voice-chat',
        })
      );

      if (sendVoiceMessage.fulfilled.match(resultAction)) {
        const { transcript } = resultAction.payload;

        // Append to the assistant-ui thread runtime
        const thread = (runtime as any).threads?.main || runtime;
        if (typeof (thread as any).append === 'function') {
          (thread as any).append({
            role: 'user',
            content: [{ type: 'text', text: transcript }],
          });
        }
      }
    } finally {
      setIsProcessingVoice(false);
    }
  };

  // memoize: if the isProcessingVoice toggled, remove from ui the Compose.Primitive.Send button for a smoother ux

  return (
    <div className="aui-composer-action-wrapper relative mx-2 mb-2 flex items-center justify-between gap-2">
      <ComposerAddAttachment />

      <div className="flex items-center gap-3 pr-1">
        <div
          className={cn(
            'flex items-center transition-all duration-500 ease-in-out',
            isRecordingVoice || isProcessingVoice ? 'w-auto' : 'w-auto'
          )}
        >
          <VoiceRecorder
            onRecordingComplete={handleVoiceRecording}
            onRecordingChange={setIsRecordingVoice}
            isProcessing={isProcessingVoice}
            disabled={isProcessingVoice}
          />
        </div>

        <AssistantIf
          condition={({ thread }) => !thread.isRunning && !isProcessingVoice && !isRecordingVoice}
        >
          <ComposerPrimitive.Send asChild>
            <TooltipIconButton
              tooltip="Send message"
              side="bottom"
              type="submit"
              variant="default"
              size="icon"
              className="aui-composer-send size-8 rounded-full"
              aria-label="Send message"
              disabled={isProcessingVoice}
            >
              <ArrowUpIcon className="aui-composer-send-icon size-4" />
            </TooltipIconButton>
          </ComposerPrimitive.Send>
        </AssistantIf>

        <AssistantIf condition={({ thread }) => thread.isRunning}>
          <ComposerPrimitive.Cancel asChild>
            <Button
              type="button"
              variant="default"
              size="icon"
              className="aui-composer-cancel size-8 rounded-full"
              aria-label="Stop generating"
            >
              <SquareIcon className="aui-composer-cancel-icon size-3 fill-current" />
            </Button>
          </ComposerPrimitive.Cancel>
        </AssistantIf>
      </div>
    </div>
  );
};

export default memo(ComposerAction);
