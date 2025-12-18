'use client';

import { useEffect, useState, memo } from 'react';
import { useAssistantState, ThreadPrimitive } from '@assistant-ui/react';
import { useShallow } from 'zustand/shallow';
import { Button } from '@/components/ui/button';
import type { FC } from 'react';

const AssistantMessageSuggestions: FC = () => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Get state using non-deprecated useAssistantState with useShallow to avoid infinite loop
  const state = useAssistantState(
    useShallow((s) => {
      const thread = s.thread;
      const message = s.message;

      if (!message)
        return {
          isLast: false,
          isAssistant: false,
          isRunning: false,
          threadId: undefined,
          metadataSuggestions: undefined,
        };

      const lastMessage = thread.messages[thread.messages.length - 1];
      const isLast = lastMessage?.id === message.id;
      const isAssistant = message.role === 'assistant';
      const isRunning = thread.isRunning;

      // Get threadId from message metadata or thread state
      const threadId = (message.metadata?.custom as any)?.threadId as string | undefined;
      const metadataSuggestions = (message.metadata?.custom as any)?.suggestions as
        | string[]
        | undefined;

      return { isLast, isAssistant, isRunning, threadId, metadataSuggestions };
    })
  );

  const { isLast, isAssistant, isRunning, threadId, metadataSuggestions } = state;

  useEffect(() => {
    if (!isLast || !isAssistant || isRunning || !threadId) {
      if (!isLast || !isAssistant) {
        setSuggestions([]);
      }
      return;
    }

    if (metadataSuggestions && metadataSuggestions.length > 0) {
      setSuggestions(metadataSuggestions);
      return;
    }

    // Fetch from API if not in metadata or if we want to ensure latest
    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/thread/${threadId}`);
        if (res.ok) {
          const data = await res.json();
          const fetchedSuggestions = data.thread?.last_response?.suggestions || [];
          setSuggestions(fetchedSuggestions);
        }
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [isLast, isAssistant, isRunning, threadId, metadataSuggestions]);

  if (!isLast || !isAssistant || isRunning || (suggestions.length === 0 && !loading)) return null;

  return (
    <div className="aui-assistant-message-suggestions mt-2 flex flex-wrap gap-2 pb-2">
      {suggestions.map((suggestion, i) => (
        <ThreadPrimitive.Suggestion key={i} prompt={suggestion} send asChild>
          <Button
            variant="outline"
            size="sm"
            className="border-muted-foreground/20 hover:bg-muted rounded-xl text-xs transition-all duration-200"
          >
            {suggestion}
          </Button>
        </ThreadPrimitive.Suggestion>
      ))}
      {loading && suggestions.length === 0 && (
        <div className="flex items-center gap-1.5 px-1 py-2">
          <span className="bg-muted-foreground/40 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:0ms]" />
          <span className="bg-muted-foreground/40 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:200ms]" />
          <span className="bg-muted-foreground/40 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:400ms]" />
        </div>
      )}
    </div>
  );
};

export default memo(AssistantMessageSuggestions);
