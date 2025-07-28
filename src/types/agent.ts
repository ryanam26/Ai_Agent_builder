import { z } from 'zod';

export const ToolSchema = z.object({
  name: z.string(),
  description: z.string(),
  parameters: z.record(z.any()),
  implementation: z.string().optional(),
  apiEndpoint: z.string().optional(),
  documentationUrl: z.string().optional(),
});

export const AgentConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  systemPrompt: z.string(),
  tools: z.array(ToolSchema),
  capabilities: z.array(z.string()),
  constraints: z.array(z.string()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AgentDescriptionSchema = z.object({
  description: z.string(),
  requirements: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
  mentionedTools: z.array(z.string()).optional(),
  impliedCapabilities: z.array(z.string()).optional(),
});

export const PlanStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  requiredTools: z.array(z.string()),
  estimatedTime: z.string(),
  dependencies: z.array(z.string()).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed']),
});

export const AgentPlanSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  steps: z.array(PlanStepSchema),
  totalEstimatedTime: z.string(),
  createdAt: z.date(),
});

export type Tool = z.infer<typeof ToolSchema>;
export type AgentConfig = z.infer<typeof AgentConfigSchema>;
export type AgentDescription = z.infer<typeof AgentDescriptionSchema>;
export type PlanStep = z.infer<typeof PlanStepSchema>;
export type AgentPlan = z.infer<typeof AgentPlanSchema>;