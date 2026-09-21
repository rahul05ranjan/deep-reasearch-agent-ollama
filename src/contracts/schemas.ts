import { z } from 'zod';

export const SubtopicSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string(),
  questions: z.array(z.string())
});

export type Subtopic = z.infer<typeof SubtopicSchema>;

export const TopicAnalysisSchema = z.object({
  overview: z.string(),
  subtopics: z.array(SubtopicSchema).min(1),
  mainQuestions: z.array(z.string())
});

export type TopicAnalysis = z.infer<typeof TopicAnalysisSchema>;

export const ResearchModeSchema = z.enum([
  'COMPREHENSIVE',
  'QUICK',
  'TECHNICAL',
  'COMPARATIVE',
  'HISTORICAL'
]);

export type ResearchMode = z.infer<typeof ResearchModeSchema>;

export const ResearchRequestSchema = z.object({
  topic: z.string({ error: 'Research topic is required' }).trim().min(1, 'Research topic is required'),
  mode: ResearchModeSchema.default('COMPREHENSIVE'),
  includeFollowups: z.boolean().default(true),
  includeSynthesis: z.boolean().default(true)
});

export type ResearchRequest = z.infer<typeof ResearchRequestSchema>;

export interface ResearchFinding {
  content: string;
  description?: string;
  questions?: string[];
}

export type ResearchResults = Record<string, ResearchFinding>;

export interface ProgressEvent {
  stage: string;
  message?: string;
  data?: unknown;
  totalSteps?: number;
  currentStep?: number;
  step?: number;
  subtopic?: string;
  title?: string;
  success?: boolean;
  error?: string;
}

export interface ResearchPerformanceStats {
  totalTime: string;
  model: string;
  timestamp: string;
}

export interface ResearchReport {
  topic: string;
  mode: ResearchMode;
  analysis: TopicAnalysis;
  researchResults: ResearchResults;
  synthesis: string | null;
  followupQuestions: string[] | null;
  executiveSummary: string | null;
  performanceStats: ResearchPerformanceStats;
}
