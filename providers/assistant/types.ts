// Types for Assistant Provider - Machina API Integration

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  objects?: AssistantObject[];
  suggestions?: string[];
}

// Machina API Types

/**
 * Workflow parameter definition
 */
export interface WorkflowParameter {
  name: string;
  type?: string;
  required?: boolean;
  description?: string;
  default?: unknown;
}

/**
 * Workflow definition from Machina API
 */
export interface Workflow {
  _id: string;
  /**
   * Compatibility alias: some UI code expects `id` instead of `_id`.
   */
  id?: string;
  name: string;
  description?: string;
  type: string;
  inputs?: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  /**
   * Parameters for the workflow (derived from inputs or set explicitly)
   */
  parameters?: WorkflowParameter[];
  condition?: string;
  created?: string;
  status?: string;
}

/**
 * Agent definition from Machina API
 */
export interface Agent {
  _id: string;
  name: string;
  description?: string;
  workflows?: Workflow[];
  status?: string;
  created?: string;
  project_id?: string;
}

/**
 * Objects returned by the assistant (markets, bets, etc)
 */
export interface AssistantObject {
  id?: string;
  type?: string;
  title?: string;
  description?: string;
  [key: string]: unknown; // Flexible for different object types
}

/**
 * Stream message types from Machina API
 */
export type StreamMessageType =
  | 'start'
  | 'workflow_start'
  | 'workflow_complete'
  | 'workflow_skipped'
  | 'status_update'
  | 'content'
  | 'workflow_objects'
  | 'done'
  | 'error';

/**
 * Stream message from Machina API (NDJSON)
 */
export interface StreamMessage {
  type: StreamMessageType;
  content: string;
  metadata?: {
    agent_name?: string;
    agent_id?: string;
    task_id?: string;
    workflow_name?: string;
    workflow_index?: number;
    total_workflows?: number;
    progress_percent?: number;
    status_message?: string;
    partial?: boolean;
    success?: boolean;
    objects?: AssistantObject[];
    suggestions?: string[];
    content?: string; // Final content in 'done' event
  };
}

/**
 * Search filters for agents/workflows
 */
export interface SearchFilters {
  name?: string;
  status?: string;
  project_id?: string;
  [key: string]: unknown;
}

/**
 * Search request for Machina API
 */
export interface SearchRequest {
  filters: SearchFilters;
  sorters?: [string, number];
  page?: number;
  page_size?: number;
}

/**
 * Search response from Machina API
 */
export interface SearchResponse<T> {
  status: boolean;
  data: T[];
  totals?: {
    total: number;
    page: number;
    page_size: number;
  };
}

/**
 * Agent execution request
 */
export interface AgentExecutionRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string | Array<{ type: string; text?: string; [key: string]: unknown }>;
  }>;
  stream_workflows?: boolean;
  'context-agent'?: {
    thread_id?: string;
    [key: string]: unknown;
  };
}

/**
 * Voice message response
 */
export interface VoiceResponse {
  message: string;
  transcript: string;
  [key: string]: unknown;
}

/**
 * Assistant State
 */
export interface AssistantState {
  messages: Message[];
  workflows: Workflow[];
  agents: Agent[];
  selectedAgent: string | null;
  selectedWorkflow: string | null;
  workflowParameters: Record<string, string>;
  threadId: string | null;
  currentObjects: AssistantObject[];
  currentSuggestions: string[];
  streamingStatus: string | null;
  workflowProgress: {
    current: number;
    total: number;
    currentWorkflowName: string | null;
  };
  status: 'idle' | 'loading' | 'streaming' | 'failed';
  error?: string;
}
