import {
  Workflow,
  Layers,
  Database,
  Puzzle,
  HelpCircle,
  Rocket,
  BookOpen,
  MessageSquare,
  Mic,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface SuggestionItem {
  title: string;
  label: string;
  prompt: string;
  icon: LucideIcon;
}

export interface SuggestionCategory {
  category: string;
  items: SuggestionItem[];
}

export const SUGGESTIONS: SuggestionCategory[] = [
  {
    category: 'Fundamentals',
    items: [
      {
        title: 'Workflows',
        label: 'Learn how to build workflows',
        prompt: 'How do I create workflows in Machina?',
        icon: Workflow,
      },
      {
        title: 'Architecture',
        label: 'Understand the system',
        prompt: 'What is the architecture of Machina?',
        icon: Layers,
      },
    ],
  },
  {
    category: 'Integrations',
    items: [
      {
        title: 'Custom Connectors',
        label: 'Build your own integrations',
        prompt: 'How do I create custom connectors in Machina?',
        icon: Puzzle,
      },
      {
        title: 'External APIs',
        label: 'Connect to external services',
        prompt: 'How do I use external APIs and storage in Machina?',
        icon: Rocket,
      },
    ],
  },
  {
    category: 'Data & AI',
    items: [
      {
        title: 'Vector Search',
        label: 'Store and search documents',
        prompt: 'How do I use document database and vector search in Machina?',
        icon: Database,
      },
      {
        title: 'Chat Completion',
        label: 'Implement chat features',
        prompt: 'How do I use chat completion in Machina?',
        icon: MessageSquare,
      },
    ],
  },
  {
    category: 'Examples',
    items: [
      {
        title: 'Quizzes',
        label: 'Build interactive quizzes',
        prompt: 'How do I create quizzes with Machina?',
        icon: HelpCircle,
      },
      {
        title: 'Podcasts',
        label: 'Generate podcast content',
        prompt: 'How do I create podcasts with Machina?',
        icon: Mic,
      },
    ],
  },
  {
    category: 'Boilerplate',
    items: [
      {
        title: 'Frontend',
        label: 'Machina Frontend Boilerplate',
        prompt: 'Tell me about the Machina Frontend Boilerplate and its tech stack.',
        icon: BookOpen,
      },
      {
        title: 'Next.js',
        label: 'Next.js 16 App Router',
        prompt: 'How is Next.js 16 and the App Router used in this boilerplate?',
        icon: Rocket,
      },
      {
        title: 'Redux',
        label: 'State management logic',
        prompt: 'How do I use Redux Toolkit (actions, reducers, services) in Machina?',
        icon: Layers,
      },
      {
        title: 'Architecture',
        label: 'System Architecture',
        prompt: 'Explain the Boilerplate Architecture (Providers, HTTP Layer, Components).',
        icon: Workflow,
      },
      {
        title: 'Coding Standards',
        label: 'Best practices and standards',
        prompt: 'What are the coding standards and recommended practices for this project?',
        icon: Puzzle,
      },
      {
        title: 'Security',
        label: 'Security & API Keys',
        prompt: 'How is security handled regarding API keys and sensitive information?',
        icon: Database,
      },
      {
        title: 'BFF',
        label: 'Backend for Frontend pattern',
        prompt: 'Show me how the BFF pattern works and how to use proxy routes.',
        icon: MessageSquare,
      },
    ],
  },
];
