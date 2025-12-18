import type { ChatModelAdapter } from '@assistant-ui/react';

export interface MachinaStreamingAdapterConfig {
  agentName?: string;
  threadId?: string;
  streamWorkflows?: boolean;
}

function safeContentToString(content: unknown): string {
  if (typeof content === 'string') {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .map((item) => (typeof item === 'string' ? item : JSON.stringify(item)))
      .join(' ');
  }
  if (content === null || content === undefined) {
    return '';
  }
  if (typeof content === 'object') {
    return JSON.stringify(content);
  }
  return String(content);
}

export const createMachinaStreamingAdapter = (
  config: MachinaStreamingAdapterConfig
): ChatModelAdapter => {
  return {
    async *run({ messages, abortSignal }) {
      try {
        if (!config.agentName) {
          yield {
            role: 'assistant' as const,
            content: [
              {
                type: 'text' as const,
                text: 'Please configure an agent to start chatting.',
              },
            ],
          };
          return;
        }

        const lastMessage = messages[messages.length - 1];

        const userMessage = {
          role: lastMessage.role,
          content: lastMessage.content
            .map((c) => {
              if (c.type === 'text') return c.text;
              return '';
            })
            .join(''),
          timestamp: new Date().toISOString(),
        };

        const threadIdToSend =
          config.threadId &&
          ((config.threadId.length === 24 && /^[0-9a-fA-F]{24}$/.test(config.threadId)) ||
            (config.threadId.length === 36 && /^[0-9a-fA-F-]{36}$/.test(config.threadId)))
            ? config.threadId
            : '';

        console.log('[MachinaStreamAdapter] 📤 Sending request:', {
          hasThreadId: !!config.threadId,
          threadId: config.threadId,
          threadIdToSend,
          messageCount: messages.length,
        });

        const requestBody: Record<string, unknown> = {
          'context-agent': {
            messages: [userMessage],
            status_message: 'Processing your request...',
            thread_id: threadIdToSend,
          },
          messages: [userMessage],
          skip_delay: true,
          stream: true,
          stream_workflows: false,
        };

        const response = await fetch(
          `/api/thread/stream?target=${encodeURIComponent(config.agentName)}&type=agent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            signal: abortSignal,
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('Failed to get response reader');
        }

        let fullText = '';
        let buffer = '';
        let threadId: string | null = config.threadId || null;
        let suggestions: string[] = [];

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              console.log('[MachinaStreamAdapter] Stream ended by server');
              break;
            }

            buffer += decoder.decode(value, { stream: false });

            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.trim()) continue;

              try {
                const chunk = JSON.parse(line);
                const contentStr = safeContentToString(chunk.content);

                // Capture suggestions if present in any chunk
                if (chunk.metadata?.suggestions) {
                  suggestions = chunk.metadata.suggestions;
                } else if (chunk.metadata?.last_response?.suggestions) {
                  suggestions = chunk.metadata.last_response.suggestions;
                }

                // Capture threadId if present in any chunk
                if (!threadId) {
                  threadId =
                    chunk.metadata?.thread_id || chunk.metadata?.document_id || chunk.metadata?._id;
                }

                // Log every chunk type
                console.log(`[MachinaStreamAdapter] 📦 Chunk type: ${chunk.type}`);

                if (
                  chunk.type === 'content' ||
                  chunk.type === 'text' ||
                  chunk.type === 'done' ||
                  chunk.type === 'start'
                ) {
                  console.log('[MachinaStreamAdapter] Chunk details:', {
                    type: chunk.type,
                    hasContent: !!chunk.content,
                    contentPreview: contentStr ? contentStr.substring(0, 100) + '...' : null,
                    contentLength: contentStr ? contentStr.length : 0,
                    contentType: Array.isArray(chunk.content) ? 'array' : typeof chunk.content,
                    hasMetadata: !!chunk.metadata,
                    metadataKeys: chunk.metadata ? Object.keys(chunk.metadata) : [],
                  });
                }

                if (chunk.type === 'done' || chunk.type === 'start') {
                  console.log(
                    '[MachinaStreamAdapter] Full chunk JSON:',
                    JSON.stringify(chunk, null, 2)
                  );
                }

                if (chunk.type === 'done' || chunk.type === 'complete') {
                  console.log('[MachinaStreamAdapter] Processing done/complete chunk');
                  console.log('[MachinaStreamAdapter] Current fullText length:', fullText.length);
                  console.log('[MachinaStreamAdapter] Chunk metadata:', chunk.metadata);

                  let shouldYield = false;
                  let finalContent = '';

                  // Capture suggestions from metadata (already done at top level, but being explicit here)
                  if (chunk.metadata?.suggestions) {
                    suggestions = chunk.metadata.suggestions;
                  } else if (chunk.metadata?.last_response?.suggestions) {
                    suggestions = chunk.metadata.last_response.suggestions;
                  }

                  // Capture threadId from metadata if not already captured
                  if (!threadId) {
                    threadId =
                      chunk.metadata?.thread_id ||
                      chunk.metadata?.document_id ||
                      chunk.metadata?._id;
                  }

                  // Priority 1: Check metadata.content
                  if (chunk.metadata?.content) {
                    const metadataContent = safeContentToString(chunk.metadata.content);
                    if (metadataContent) {
                      console.log(
                        '[MachinaStreamAdapter] Found content in metadata.content, length:',
                        metadataContent.length
                      );
                      finalContent = metadataContent;
                      fullText = metadataContent;
                      shouldYield = true;
                    }
                  }

                  // Priority 2: Use accumulated fullText if we have it
                  if (!finalContent && fullText) {
                    console.log(
                      '[MachinaStreamAdapter] Using accumulated fullText, length:',
                      fullText.length
                    );
                    finalContent = fullText;
                    shouldYield = true;
                  }

                  // Priority 3: Try fallback fields
                  if (!finalContent) {
                    const fallbackContent =
                      safeContentToString(chunk.metadata?.text) ||
                      safeContentToString(chunk.metadata?.response_text) ||
                      safeContentToString(chunk.content) ||
                      '';

                    if (fallbackContent) {
                      console.log(
                        '[MachinaStreamAdapter] Using fallback content, length:',
                        fallbackContent.length
                      );
                      finalContent = fallbackContent;
                      fullText = fallbackContent;
                      shouldYield = true;
                    }
                  }

                  // Yield the final content or metadata updates
                  if ((shouldYield && finalContent) || suggestions.length > 0 || threadId) {
                    console.log(
                      '[MachinaStreamAdapter] ✅ Yielding final state, content length:',
                      finalContent.length,
                      'suggestions:',
                      suggestions.length
                    );
                    yield {
                      role: 'assistant' as const,
                      content: [
                        {
                          type: 'text' as const,
                          text: finalContent || fullText,
                        },
                      ],
                      metadata: {
                        custom: {
                          suggestions,
                          threadId: threadId || config.threadId,
                        },
                      },
                    };
                  } else {
                    console.warn(
                      '[MachinaStreamAdapter] ❌ No content or metadata found in done chunk'
                    );
                    console.warn('[MachinaStreamAdapter] fullText:', fullText);
                    console.warn('[MachinaStreamAdapter] chunk:', JSON.stringify(chunk, null, 2));

                    // Don't yield error message, just return empty
                    // The content should have been yielded in previous chunks
                    if (!fullText) {
                      yield {
                        role: 'assistant' as const,
                        content: [
                          {
                            type: 'text' as const,
                            text: '⚠️ Resposta processada, mas o conteúdo não está disponível.',
                          },
                        ],
                      };
                    }
                  }

                  return;
                } else if (chunk.type === 'content' || chunk.type === 'text') {
                  const contentStr = safeContentToString(chunk.content);

                  if (contentStr) {
                    const isFinal = chunk.metadata?.final === true;

                    if (isFinal) {
                      console.log(
                        '[MachinaStreamAdapter] 📝 Received FINAL content chunk, length:',
                        contentStr.length
                      );
                      fullText = contentStr;
                    } else {
                      fullText += contentStr;
                      console.log(
                        '[MachinaStreamAdapter] 📝 Accumulated fullText length:',
                        fullText.length
                      );
                    }

                    yield {
                      role: 'assistant' as const,
                      content: [
                        {
                          type: 'text' as const,
                          text: fullText,
                        },
                      ],
                      metadata: {
                        custom: {
                          suggestions,
                          threadId: threadId || config.threadId,
                        },
                      },
                    };
                  } else {
                    console.warn('[MachinaStreamAdapter] ⚠️ Content chunk has no content:', chunk);
                  }
                } else if (chunk.type === 'error') {
                  const errorContent = safeContentToString(chunk.content);
                  console.error('[MachinaStreamAdapter] Received ERROR:', errorContent);
                  throw new Error(errorContent || 'Agent execution failed');
                } else if (
                  chunk.type === 'status' ||
                  chunk.type === 'info' ||
                  chunk.type === 'status_update' ||
                  chunk.type === 'workflow_start' ||
                  chunk.type === 'workflow_complete'
                ) {
                  const statusContent = safeContentToString(chunk.content);
                  console.log('[MachinaStreamAdapter] Status update:', statusContent);
                } else if (chunk.type === 'start') {
                  console.log('[MachinaStreamAdapter] 📡 Start event received');

                  if (chunk.metadata) {
                    if (chunk.metadata.thread_id) {
                      threadId = chunk.metadata.thread_id;
                    } else if (chunk.metadata.document_id) {
                      threadId = chunk.metadata.document_id;
                    } else if (chunk.metadata.task_id) {
                      threadId = chunk.metadata.task_id;
                    }

                    if (threadId) {
                      console.log(
                        '[MachinaStreamAdapter] ✅ Captured thread_id/document_id from start event:',
                        threadId
                      );
                    } else {
                      console.warn(
                        '[MachinaStreamAdapter] ⚠️ Start event has no thread_id, document_id or task_id in metadata'
                      );
                    }
                  }

                  const startContent = safeContentToString(chunk.content);
                  if (startContent && startContent !== '⚡ Processing your request...') {
                    fullText += startContent;
                    yield {
                      role: 'assistant' as const,
                      content: [
                        {
                          type: 'text' as const,
                          text: fullText,
                        },
                      ],
                      metadata: {
                        custom: {
                          suggestions,
                          threadId: threadId || config.threadId,
                        },
                      },
                    };
                  }
                }
              } catch (parseError) {
                console.error('[MachinaStreamAdapter] Failed to parse chunk:', line, parseError);
              }
            }
          }
        } finally {
          reader.releaseLock();
          console.log('[MachinaStreamAdapter] Reader lock released');
        }

        console.log(
          '[MachinaStreamAdapter] Processing complete. fullText length:',
          fullText.length
        );

        if (fullText) {
          yield {
            role: 'assistant' as const,
            content: [
              {
                type: 'text' as const,
                text: fullText,
              },
            ],
          };
        } else {
          console.warn('[MachinaStreamAdapter] Stream ended without any content');
        }
      } catch (error) {
        console.error('[MachinaStreamAdapter] Streaming error:', error);

        const errorMessage = error instanceof Error ? error.message : 'Failed to get response';

        yield {
          role: 'assistant' as const,
          content: [
            {
              type: 'text' as const,
              text: `❌ Error: ${errorMessage}\n\nPlease check the browser console for more details.`,
            },
          ],
        };
      }
    },
  };
};
