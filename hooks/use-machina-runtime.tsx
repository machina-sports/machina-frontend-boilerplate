'use client';

import { useMemo } from 'react';
import { useLocalRuntime } from '@assistant-ui/react';
import { createMachinaStreamingAdapter } from '@/lib/machina-streaming-adapter';
import { useSelector } from 'react-redux';

export function useMachinaRuntime() {
  const { threadId, selectedAgent } = useSelector((state: any) => state.assistant);

  const adapter = useMemo(() => {
    return createMachinaStreamingAdapter({
      agentName: selectedAgent || 'meme-agent',
      threadId: threadId || undefined,
      streamWorkflows: true,
    });
  }, [selectedAgent, threadId]);

  const runtime = useLocalRuntime(adapter);

  return runtime;
}
