import ClientBaseService from '@/libs/client/base.service';
import type {
  Workflow,
  Agent,
  Message,
  SearchRequest,
  SearchResponse,
  AgentExecutionRequest,
  StreamMessage,
  AssistantObject,
} from './types';

class AssistantService extends ClientBaseService {
  prefix = '/api/assistant';

  /**
   * Fetch available workflows from Machina API
   */
  async getWorkflows(filters: Record<string, any> = {}): Promise<Workflow[]> {
    try {
      const searchRequest: SearchRequest = {
        filters,
        page: 1,
        page_size: 100,
      };

      const response = await this.post<SearchResponse<Workflow>>(
        searchRequest,
        this.prefix + '/workflows',
        {}
      );

      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
      return [];
    }
  }

  /**
   * Fetch available agents from Machina API
   */
  async getAgents(filters: Record<string, any> = {}): Promise<Agent[]> {
    try {
      const searchRequest: SearchRequest = {
        filters,
        page: 1,
        page_size: 100,
      };

      const response = await this.post<SearchResponse<Agent>>(
        searchRequest,
        this.prefix + '/agents',
        {}
      );

      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      return [];
    }
  }

  /**
   * Fetch workflow details by ID
   */
  async getWorkflowDetails(workflowId: string): Promise<Workflow> {
    const response = await this.get<{ data: Workflow }>(
      this.prefix + `/workflows/${workflowId}`,
      {}
    );
    return response.data;
  }

  /**
   * Fetch agent details by name or ID
   */
  async getAgentDetails(agentNameOrId: string): Promise<Agent> {
    const response = await this.get<{ data: Agent }>(this.prefix + `/agents/${agentNameOrId}`, {});
    return response.data;
  }

  /**
   * Stream agent execution with async generator
   *
   * Usage:
   * for await (const message of assistantService.streamAgent(...)) {
   *   console.log(message);
   * }
   */
  async *streamAgent(params: {
    agentName: string;
    messages?: Array<{
      role: 'user' | 'assistant' | 'system';
      content: string;
    }>;
    threadId?: string;
    streamWorkflows?: boolean;
    contextAgent?: Record<string, any>;
  }): AsyncGenerator<StreamMessage, void, unknown> {
    // Build request
    const request: AgentExecutionRequest = {
      messages: params.messages || [],
      stream_workflows: params.streamWorkflows ?? true,
    };

    request['context-agent'] = {
      ...(params.threadId ? { thread_id: params.threadId } : {}),
      ...(params.contextAgent || {}),
    };

    // Stream through proxy endpoint
    const streamPath = `${this.prefix}/stream/${params.agentName}`;

    try {
      const response = await fetch(streamPath, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine) {
              try {
                const message = JSON.parse(trimmedLine) as StreamMessage;
                yield message;

                // Stop on done or error
                if (message.type === 'done' || message.type === 'error') {
                  return;
                }
              } catch (parseError) {
                console.error('Failed to parse stream message:', trimmedLine, parseError);
              }
            }
          }
        }

        // Process remaining buffer
        if (buffer.trim()) {
          try {
            const message = JSON.parse(buffer.trim()) as StreamMessage;
            yield message;
          } catch (parseError) {
            console.error('Failed to parse final buffer:', buffer, parseError);
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Stream error:', error);
      throw error;
    }
  }

  /**
   * Execute agent (non-streaming, for backwards compatibility)
   */
  async executeAgent(params: {
    agentName: string;
    messages?: Array<{
      role: 'user' | 'assistant' | 'system';
      content: string;
    }>;
    threadId?: string;
    contextAgent?: Record<string, any>;
  }): Promise<{ content: string; objects: AssistantObject[]; suggestions: string[] }> {
    const messages: StreamMessage[] = [];

    for await (const message of this.streamAgent({
      ...params,
      streamWorkflows: true,
    })) {
      messages.push(message);
    }

    // Extract final result from 'done' message
    const doneMessage = messages.find((m) => m.type === 'done');

    return {
      content: doneMessage?.metadata?.content || '',
      objects: doneMessage?.metadata?.objects || [],
      suggestions: doneMessage?.metadata?.suggestions || [],
    };
  }

  /**
   * Create a new thread (generate UUID client-side)
   */
  async createThread(): Promise<{ threadId: string }> {
    // Generate UUID v4
    const threadId = crypto.randomUUID();
    return { threadId };
  }

  /**
   * Legacy method for backwards compatibility
   * @deprecated Use streamAgent instead
   */
  async sendMessage(params: {
    message: string;
    workflowId: string;
    parameters: Record<string, string>;
    threadId?: string;
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  }): Promise<{ message: Message; threadId: string }> {
    // Build messages array
    const messages = [
      ...(params.conversationHistory || []),
      { role: 'user' as const, content: params.message },
    ];

    // Execute agent
    const result = await this.executeAgent({
      agentName: params.workflowId, // Assuming workflowId is agent name
      messages,
      threadId: params.threadId,
    });

    // Build response message
    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: result.content,
      timestamp: Date.now(),
      objects: result.objects,
      suggestions: result.suggestions,
    };

    return {
      message: assistantMessage,
      threadId: params.threadId || crypto.randomUUID(),
    };
  }
}

export const assistantService = new AssistantService();
