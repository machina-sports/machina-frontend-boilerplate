'use client';

import { useState, useRef, useCallback } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TooltipIconButton } from '@/components/assistant-ui/tooltip-icon-button';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onRecordingChange?: (isRecording: boolean) => void;
  disabled?: boolean;
  isProcessing?: boolean;
}

export function VoiceRecorder({
  onRecordingComplete,
  onRecordingChange,
  disabled,
  isProcessing: isProcessingExternal,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const isProcessing = isProcessingExternal;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/m4a' });
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
        onRecordingChange?.(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
      onRecordingChange?.(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <TooltipIconButton
      tooltip={
        isProcessing
          ? 'Processing audio...'
          : isRecording
            ? 'Stop recording'
            : 'Record voice message'
      }
      side="top"
      variant="ghost"
      size="icon"
      onClick={isRecording ? stopRecording : startRecording}
      disabled={disabled || isProcessing}
      className={cn(
        'aui-voice-recorder h-9 rounded-full transition-all duration-300 ease-in-out',
        isRecording
          ? 'w-24 bg-red-500/10 text-red-500 hover:bg-red-500/20 ring-1 ring-red-500/20'
          : isProcessing
            ? 'w-32 bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20'
            : 'w-9 border-muted-foreground/10 hover:bg-muted-foreground/15 dark:border-muted-foreground/15 dark:hover:bg-muted-foreground/30'
      )}
    >
      {isProcessing ? (
        <div className="flex w-full items-center justify-center gap-2 px-1">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-[11px] font-semibold uppercase tracking-wider">Processing</span>
        </div>
      ) : isRecording ? (
        <div className="flex w-full items-center justify-center gap-3 px-1">
          <div className="flex items-center gap-1">
            <span
              className="h-3 w-0.5 rounded-full bg-current opacity-70 animate-[wave_1s_ease-in-out_infinite]"
              style={{ animationDelay: '0s' }}
            ></span>
            <span
              className="h-4 w-0.5 rounded-full bg-current animate-[wave_1s_ease-in-out_infinite]"
              style={{ animationDelay: '0.1s' }}
            ></span>
            <span
              className="h-3 w-0.5 rounded-full bg-current opacity-70 animate-[wave_1s_ease-in-out_infinite]"
              style={{ animationDelay: '0.2s' }}
            ></span>
          </div>
          <Square size={14} className="fill-current" />
        </div>
      ) : (
        <Mic size={18} className="stroke-[1.5px]" />
      )}
    </TooltipIconButton>
  );
}
