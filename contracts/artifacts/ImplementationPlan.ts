import { z } from 'zod'

export const ImplementationPlanSchema = z.object({
  artifactId: z.string().describe('Unique artifact identifier'),
  requirementBriefId: z.string(),
  architectureReviewId: z.string(),
  overview: z.string().describe('High-level plan overview'),
  phases: z.array(z.object({
    phaseNumber: z.number(),
    name: z.string(),
    description: z.string(),
    estimatedDuration: z.object({
      value: z.number(),
      unit: z.enum(['DAYS', 'WEEKS', 'MONTHS']),
    }),
    tasks: z.array(z.object({
      taskId: z.string(),
      title: z.string(),
      description: z.string(),
      assignedTo: z.string().optional(),
      dependencies: z.array(z.string()).optional(),
      estimatedHours: z.number().optional(),
    })).describe('Granular tasks within phase'),
  })).describe('Implementation phases'),
  technicalApproach: z.object({
    architecture: z.string(),
    technologies: z.array(z.string()),
    patterns: z.array(z.string()).optional(),
    deferredDecisions: z.array(z.string()).optional(),
  }).optional(),
  riskMitigation: z.array(z.object({
    risk: z.string(),
    likelihood: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    impact: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    mitigation: z.string(),
  })).optional(),
  successMetrics: z.array(z.string()).optional(),
  rollbackPlan: z.string().optional(),
  metadata: z.object({
    createdBy: z.string(),
    createdAt: z.number(),
    version: z.string(),
  }).optional(),
})

export type ImplementationPlan = z.infer<typeof ImplementationPlanSchema>
