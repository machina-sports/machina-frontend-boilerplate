'use client';

import { useEffect, useRef } from 'react';
import { useAppSelector } from '@/store/useState';
import { useAppDispatch } from '@/store/dispatch';
import { addUserMessage } from '@/providers/assistant/reducer';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { Bot, AlertCircle } from 'lucide-react';
import { sendMessage, sendVoiceMessage, streamAgentExecution } from '@/providers/assistant/actions';

export function ChatPanel() {
  const dispatch = useAppDispatch();
  const { messages, selectedWorkflow, workflowParameters, threadId, status, error } =
    useAppSelector((state) => state.assistant);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    if (!selectedWorkflow) {
      return;
    }

    // Send to backend
    dispatch(
      streamAgentExecution({
        message,
        agentName: selectedWorkflow,
        threadId: threadId || undefined,
        streamWorkflows: true,
      })
    );
  };

  const handleVoiceMessage = async (audioBlob: Blob) => {
    if (!selectedWorkflow) {
      return;
    }

    dispatch(
      sendVoiceMessage({
        audioBlob,
        agentId: selectedWorkflow,
        connectorId: 'google-storage-test-upload',
        languageCode: 'pt-BR',
      })
    );
  };

  const canSend = selectedWorkflow && status !== 'streaming';

  return (
    <div className="flex h-full flex-col rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-zinc-200 p-4 dark:border-zinc-800">
        <Bot size={20} className="text-blue-500 dark:text-blue-400" />
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Chat Assistant</h2>
        {status === 'streaming' && (
          <span className="ml-auto text-xs text-zinc-500 dark:text-zinc-400">Typing...</span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
              {selectedWorkflow ? (
                <>
                  <Bot size={48} className="mx-auto mb-4 text-zinc-300 dark:text-zinc-700" />
                  <p>Start a conversation with the assistant</p>
                </>
              ) : (
                <>
                  <AlertCircle
                    size={48}
                    className="mx-auto mb-4 text-zinc-300 dark:text-zinc-700"
                  />
                  <p>Select a workflow to begin</p>
                </>
              )}
            </div>
          </div>
        )}
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
        <ChatInput
          onSend={handleSendMessage}
          onSendVoice={handleVoiceMessage}
          disabled={!canSend}
          placeholder={
            selectedWorkflow ? 'Type your message...' : 'Select a workflow to start chatting'
          }
        />
      </div>
    </div>
  );
}
