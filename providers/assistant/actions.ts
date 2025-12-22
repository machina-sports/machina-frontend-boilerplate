import { createAsyncThunk } from '@reduxjs/toolkit';
import { assistantService } from './service';
import type { Message, Agent, Workflow } from './types';
import { handleStreamMessage, addUserMessage } from './reducer';
import { convertBlobToOptimizedPCM } from '@/lib/audio';

/**
 * Fetch available workflows
 */
export const fetchWorkflows = createAsyncThunk(
  'assistant/fetchWorkflows',
  async (filters?: Record<string, any>) => {
    const workflows = await assistantService.getWorkflows(filters || {});
    return workflows;
  }
);

/**
 * Fetch available agents
 */
export const fetchAgents = createAsyncThunk(
  'assistant/fetchAgents',
  async (filters?: Record<string, any>) => {
    const agents = await assistantService.getAgents(filters || {});
    return agents;
  }
);

/**
 * Fetch workflow details
 */
export const fetchWorkflowDetails = createAsyncThunk(
  'assistant/fetchWorkflowDetails',
  async (workflowId: string) => {
    const workflow = await assistantService.getWorkflowDetails(workflowId);
    return workflow;
  }
);

/**
 * Fetch agent details
 */
export const fetchAgentDetails = createAsyncThunk(
  'assistant/fetchAgentDetails',
  async (agentNameOrId: string) => {
    const agent = await assistantService.getAgentDetails(agentNameOrId);
    return agent;
  }
);

/**
 * Stream agent execution
 * This action dispatches stream messages as they arrive
 */
export const streamAgentExecution = createAsyncThunk(
  'assistant/streamAgentExecution',
  async (
    params: {
      agentName: string;
      message: string;
      threadId?: string;
      streamWorkflows?: boolean;
    },
    { dispatch, getState, rejectWithValue }
  ) => {
    try {
      // Get conversation history from current state
      const state = getState() as any;
      const messages = state.assistant.messages || [];

      // Build conversation history (last 10 messages for context)
      const conversationHistory = messages
        .slice(-10)
        .filter((msg: any) => msg.role === 'user' || msg.role === 'assistant')
        .map((msg: any) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

      // Add new user message
      conversationHistory.push({
        role: 'user',
        content: params.message,
      });

      // Dispatch user message to state
      dispatch(addUserMessage(params.message));

      // Stream agent execution
      const streamGenerator = assistantService.streamAgent({
        agentName: params.agentName,
        messages: conversationHistory,
        threadId: params.threadId,
        streamWorkflows: params.streamWorkflows ?? true,
      });

      // Process stream messages
      for await (const streamMessage of streamGenerator) {
        // Dispatch each stream message to reducer
        dispatch(handleStreamMessage(streamMessage));

        // Stop on done or error
        if (streamMessage.type === 'done' || streamMessage.type === 'error') {
          break;
        }
      }

      return { success: true };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to stream agent execution');
    }
  }
);

/**
 * Send a voice message to the assistant
 */
export const sendVoiceMessage = createAsyncThunk(
  'assistant/sendVoiceMessage',
  async (
    params: {
      audioBlob: Blob;
      agentId: string;
      connectorId?: string;
      languageCode?: string;
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      // 1. Convert audio to optimized Raw PCM (LINEAR16) with 16kHz sample rate
      // This reduces the payload size by ~60-70% while maintaining speech quality
      const { buffer, sampleRate } = await convertBlobToOptimizedPCM(params.audioBlob, 16000);

      // 2. Convert buffer to Base64 for server-side upload
      const base64Audio = btoa(
        new Uint8Array(buffer).reduce((acc, byte) => acc + String.fromCharCode(byte), '')
      );
      const dataUri = `data:application/octet-stream;base64,${base64Audio}`;

      // 3. Execute the voice-chat workflow directly with the Base64 data
      // We use executeWorkflow because voice-chat is registered as a workflow in _install.yml
      const response = await assistantService.executeWorkflow(params.agentId, {
        audio_base64: dataUri,
        language_code: params.languageCode || 'en-US',
        alternative_language_codes: params.languageCode ? [] : ['pt-BR'],
        sample_rate_hertz: sampleRate,
        encoding: 'LINEAR16',
      });

      // Ponto Crítico 1: Sempre procurar em data.outputs
      const result = response.data?.outputs;
      const isSuccess = response.status === true || response.status === 'success';

      if (isSuccess && result) {
        // Add the transcription as a user message
        if (result.transcript) {
          dispatch(addUserMessage(result.transcript));
        }
        return result;
      } else {
        throw new Error(response.message || 'Failed to process voice message');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send voice message');
    }
  }
);

/**
 * Send a message to the assistant (legacy, non-streaming)
 * @deprecated Use streamAgentExecution instead for better UX
 */
export const sendMessage = createAsyncThunk(
  'assistant/sendMessage',
  async (
    params: {
      message: string;
      workflowId: string;
      parameters: Record<string, string>;
      threadId?: string;
    },
    { rejectWithValue, getState }
  ) => {
    try {
      // Get conversation history from current state
      const state = getState() as any;
      const messages = state.assistant.messages || [];

      // Build conversation history (last 10 messages for context)
      const conversationHistory = messages
        .slice(-10)
        .filter((msg: any) => msg.role === 'user' || msg.role === 'assistant')
        .map((msg: any) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

      const response = await assistantService.sendMessage({
        ...params,
        conversationHistory,
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send message');
    }
  }
);

/**
 * Create a new thread
 */
export const createThread = createAsyncThunk('assistant/createThread', async () => {
  const response = await assistantService.createThread();
  return response.threadId;
});
