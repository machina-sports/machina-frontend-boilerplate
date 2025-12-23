import { Workflow, Layers, Database, Puzzle, HelpCircle, Rocket, BookOpen, MessageSquare, Mic } from 'lucide-react';
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
];
