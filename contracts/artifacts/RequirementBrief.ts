import { z } from 'zod'

export const RequirementBriefSchema = z.object({
  artifactId: z.string().describe('Unique artifact identifier'),
  featureRequest: z.string().describe('Original user feature request'),
  objectives: z.array(z.string()).describe('Extracted functional objectives'),
  constraints: z.array(z.string()).describe('Technical and business constraints'),
  successCriteria: z.array(z.string()).describe('Measurable success metrics'),
  assumptions: z.array(z.string()).describe('Explicit assumptions made'),
  risks: z.array(z.object({
    category: z.string(),
    description: z.string(),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  })).describe('Identified risks'),
  estimatedEffort: z.object({
    scope: z.enum(['SMALL', 'MEDIUM', 'LARGE']),
    daysEstimate: z.number().optional(),
  }).optional(),
  metadata: z.object({
    createdBy: z.string(),
    createdAt: z.number(),
    version: z.string(),
  }).optional(),
})

export type RequirementBrief = z.infer<typeof RequirementBriefSchema>
