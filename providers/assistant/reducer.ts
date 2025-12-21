import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AssistantState, Message, AssistantObject, StreamMessage } from './types';
import {
  fetchWorkflows,
  fetchAgents,
  sendMessage,
  sendVoiceMessage,
  createThread,
  fetchWorkflowDetails,
} from './actions';

const initialState: AssistantState = {
  messages: [],
  workflows: [],
  agents: [],
  selectedAgent: null,
  selectedWorkflow: null,
  workflowParameters: {},
  threadId: null,
  currentObjects: [],
  currentSuggestions: [],
  streamingStatus: null,
  workflowProgress: {
    current: 0,
    total: 0,
    currentWorkflowName: null,
  },
  status: 'idle',
};

const AssistantReducer = createSlice({
  name: 'assistant',
  initialState,
  reducers: {
    setSelectedAgent: (state, action: PayloadAction<string>) => {
      state.selectedAgent = action.payload;
    },
    setSelectedWorkflow: (state, action: PayloadAction<string>) => {
      state.selectedWorkflow = action.payload;
      state.workflowParameters = {};
    },
    setWorkflowParameter: (state, action: PayloadAction<{ key: string; value: string }>) => {
      state.workflowParameters[action.payload.key] = action.payload.value;
    },
    addUserMessage: (state, action: PayloadAction<string>) => {
      const message: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: action.payload,
        timestamp: Date.now(),
      };
      state.messages.push(message);
    },
    addAssistantMessage: (
      state,
      action: PayloadAction<{
        content: string;
        objects?: AssistantObject[];
        suggestions?: string[];
      }>
    ) => {
      const message: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: action.payload.content,
        timestamp: Date.now(),
        objects: action.payload.objects,
        suggestions: action.payload.suggestions,
      };
      state.messages.push(message);
    },
    updateLastAssistantMessage: (state, action: PayloadAction<string>) => {
      const lastMessage = state.messages[state.messages.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        lastMessage.content += action.payload;
      }
    },
    setStreamingStatus: (state, action: PayloadAction<string | null>) => {
      state.streamingStatus = action.payload;
    },
    setWorkflowProgress: (
      state,
      action: PayloadAction<{
        current: number;
        total: number;
        currentWorkflowName: string | null;
      }>
    ) => {
      state.workflowProgress = action.payload;
    },
    setCurrentObjects: (state, action: PayloadAction<AssistantObject[]>) => {
      state.currentObjects = action.payload;
    },
    addCurrentObjects: (state, action: PayloadAction<AssistantObject[]>) => {
      state.currentObjects = [...state.currentObjects, ...action.payload];
    },
    setCurrentSuggestions: (state, action: PayloadAction<string[]>) => {
      state.currentSuggestions = action.payload;
    },
    clearStreamingState: (state) => {
      state.streamingStatus = null;
      state.workflowProgress = {
        current: 0,
        total: 0,
        currentWorkflowName: null,
      };
      state.currentObjects = [];
      state.currentSuggestions = [];
    },
    clearMessages: (state) => {
      state.messages = [];
      state.threadId = null;
      state.currentObjects = [];
      state.currentSuggestions = [];
      state.streamingStatus = null;
      state.workflowProgress = {
        current: 0,
        total: 0,
        currentWorkflowName: null,
      };
    },
    clearError: (state) => {
      state.error = undefined;
    },
    // Handle stream messages
    handleStreamMessage: (state, action: PayloadAction<StreamMessage>) => {
      const message = action.payload;

      switch (message.type) {
        case 'start':
          state.status = 'streaming';
          state.streamingStatus = message.content;
          // Create placeholder assistant message
          state.messages.push({
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
          });
          break;

        case 'workflow_start':
          state.streamingStatus = message.content;
          if (message.metadata) {
            state.workflowProgress = {
              current: message.metadata.workflow_index || 0,
              total: message.metadata.total_workflows || 0,
              currentWorkflowName: message.metadata.workflow_name || null,
            };
          }
          break;

        case 'workflow_complete':
          state.streamingStatus = message.content;
          break;

        case 'status_update':
          state.streamingStatus = message.content;
          break;

        case 'content':
          // Append to last assistant message
          const lastMsg = state.messages[state.messages.length - 1];
          if (lastMsg && lastMsg.role === 'assistant') {
            lastMsg.content += message.content;
          }
          break;

        case 'workflow_objects':
          if (message.metadata?.objects) {
            state.currentObjects = message.metadata.objects;
          }
          break;

        case 'done':
          state.status = 'idle';
          state.streamingStatus = null;

          // Update last message with final data
          const finalMsg = state.messages[state.messages.length - 1];
          if (finalMsg && finalMsg.role === 'assistant') {
            if (message.metadata?.content) {
              finalMsg.content = message.metadata.content;
            }
            if (message.metadata?.objects) {
              finalMsg.objects = message.metadata.objects;
              state.currentObjects = message.metadata.objects;
            }
            if (message.metadata?.suggestions) {
              finalMsg.suggestions = message.metadata.suggestions;
              state.currentSuggestions = message.metadata.suggestions;
            }
          }

          // Reset workflow progress
          state.workflowProgress = {
            current: 0,
            total: 0,
            currentWorkflowName: null,
          };
          break;

        case 'error':
          state.status = 'failed';
          state.error = message.content;
          state.streamingStatus = null;
          break;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Workflows
      .addCase(fetchWorkflows.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(fetchWorkflows.fulfilled, (state, action) => {
        // Normalize workflows so both `_id` and `id` are available for UI code
        state.workflows = (action.payload as any[]).map((w) => ({
          ...w,
          id: w._id || w.id,
        }));
        state.status = 'idle';
      })
      .addCase(fetchWorkflows.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // Fetch Agents
      .addCase(fetchAgents.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(fetchAgents.fulfilled, (state, action) => {
        state.agents = action.payload;
        state.status = 'idle';
      })
      .addCase(fetchAgents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // Fetch Workflow Details
      .addCase(fetchWorkflowDetails.fulfilled, (state, action) => {
        const payload = action.payload as any;
        const normalized = { ...payload, id: payload._id || payload.id };
        const existingIndex = state.workflows.findIndex(
          (w) => (w.id || w._id) === (normalized.id || normalized._id)
        );
        if (existingIndex >= 0) {
          state.workflows[existingIndex] = normalized;
        } else {
          state.workflows.push(normalized);
        }
      })
      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.status = 'streaming';
        state.error = undefined;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload.message);
        state.threadId = action.payload.threadId;
        state.status = 'idle';
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.status = 'failed';
        const errorMessage =
          (action.payload as string) || action.error.message || 'Failed to send message';
        state.error = errorMessage;
        console.error('Send message failed:', errorMessage, action);
      })
      // Send Voice Message
      .addCase(sendVoiceMessage.pending, (state) => {
        state.status = 'streaming';
        state.error = undefined;
      })
      .addCase(sendVoiceMessage.fulfilled, (state, action) => {
        const { message, transcript } = action.payload;
        // The user message (transcript) was already added by the action dispatching addUserMessage
        // Now add the assistant response
        state.messages.push({
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: message,
          timestamp: Date.now(),
        });
        state.status = 'idle';
      })
      .addCase(sendVoiceMessage.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to process voice message';
      })
      // Create Thread
      .addCase(createThread.fulfilled, (state, action) => {
        state.threadId = action.payload;
      });
  },
});

export const {
  setSelectedAgent,
  setSelectedWorkflow,
  setWorkflowParameter,
  addUserMessage,
  addAssistantMessage,
  updateLastAssistantMessage,
  setStreamingStatus,
  setWorkflowProgress,
  setCurrentObjects,
  addCurrentObjects,
  setCurrentSuggestions,
  clearStreamingState,
  clearMessages,
  clearError,
  handleStreamMessage,
} = AssistantReducer.actions;

export default AssistantReducer;
