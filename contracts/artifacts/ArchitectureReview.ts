import { z } from 'zod'

export const ArchitectureReviewSchema = z.object({
  artifactId: z.string().describe('Unique artifact identifier'),
  requirementBriefId: z.string().describe('ID of the RequirementBrief reviewed'),
  overallAssessment: z.enum(['APPROVED', 'APPROVED_WITH_CONDITIONS', 'REJECTED']),
  summary: z.string().describe('Executive summary of architectural review'),
  layerReview: z.array(z.object({
    layer: z.string().describe('Architecture layer (presentation, business, data, etc.)'),
    assessment: z.string(),
    concerns: z.array(z.string()).optional(),
  })).describe('Assessment per architectural layer'),
  dependencies: z.array(z.object({
    component: z.string(),
    reason: z.string(),
  })).optional().describe('New or changed dependencies'),
  scalability: z.object({
    concern: z.string().optional(),
    recommendation: z.string().optional(),
  }).optional(),
  security: z.array(z.object({
    category: z.string(),
    description: z.string(),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    mitigation: z.string().optional(),
  })).optional().describe('Security considerations'),
  compliance: z.array(z.string()).optional().describe('Regulatory/compliance impacts'),
  recommendations: z.array(z.string()).describe('Actionable recommendations'),
  metadata: z.object({
    createdBy: z.string(),
    createdAt: z.number(),
    version: z.string(),
  }).optional(),
})

export type ArchitectureReview = z.infer<typeof ArchitectureReviewSchema>
