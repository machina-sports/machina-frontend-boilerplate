'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { VoiceRecorder } from './voice-recorder';

interface ChatInputProps {
  onSend: (message: string) => void;
  onSendVoice?: (audioBlob: Blob) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  onSendVoice,
  disabled,
  placeholder = 'Type your message...',
}: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
        />
        {onSendVoice && <VoiceRecorder onRecordingComplete={onSendVoice} disabled={disabled} />}
        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
