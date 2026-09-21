import { z } from 'zod';

export const SubtopicSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string(),
  questions: z.array(z.string())
});

export const TopicAnalysisSchema = z.object({
  overview: z.string(),
  subtopics: z.array(SubtopicSchema).min(1),
  mainQuestions: z.array(z.string())
});

export const ResearchModeSchema = z.enum([
  'COMPREHENSIVE',
  'QUICK',
  'TECHNICAL',
  'COMPARATIVE',
  'HISTORICAL'
]);

export const ResearchRequestSchema = z.object({
  topic: z.string({ error: 'Research topic is required' }).trim().min(1, 'Research topic is required'),
  mode: ResearchModeSchema.default('COMPREHENSIVE'),
  includeFollowups: z.boolean().default(true),
  includeSynthesis: z.boolean().default(true)
});
