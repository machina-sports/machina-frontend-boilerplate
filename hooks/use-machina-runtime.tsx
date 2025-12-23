'use client';

import { useMemo } from 'react';
import { useLocalRuntime } from '@assistant-ui/react';
import { createMachinaStreamingAdapter } from '@/lib/machina-streaming-adapter';
import { useAppSelector } from '@/store/useState';

export function useMachinaRuntime() {
  const { threadId, selectedAgent } = useAppSelector((state) => state.assistant);

  const adapter = useMemo(() => {
    return createMachinaStreamingAdapter({
      agentName: selectedAgent || 'machina-assistant-executor',
      threadId: threadId || undefined,
      streamWorkflows: true,
    });
  }, [selectedAgent, threadId]);

  const runtime = useLocalRuntime(adapter);

  return runtime;
}
