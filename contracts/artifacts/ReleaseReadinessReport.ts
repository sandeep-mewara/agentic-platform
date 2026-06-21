import { z } from 'zod'

export const ReleaseReadinessReportSchema = z.object({
  artifactId: z.string().describe('Unique artifact identifier'),
  testPlanId: z.string(),
  hiltDecisionId: z.string(),
  overallStatus: z.enum(['APPROVED', 'REJECTED', 'BLOCKED', 'PENDING_REVIEW']),
  executiveSummary: z.string(),
  readiness: z.object({
    codeComplete: z.boolean(),
    testsPass: z.boolean(),
    documentationComplete: z.boolean(),
    performanceAcceptable: z.boolean(),
    securityReview: z.enum(['APPROVED', 'APPROVED_WITH_CONDITIONS', 'REJECTED']),
  }),
  qualityMetrics: z.object({
    codeQuality: z.object({
      score: z.number().min(0).max(100),
      issues: z.array(z.object({
        category: z.string(),
        count: z.number(),
        severity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
      })).optional(),
    }).optional(),
    testCoverage: z.object({
      unit: z.number().min(0).max(100),
      integration: z.number().min(0).max(100),
      e2e: z.number().min(0).max(100),
    }).optional(),
    documentation: z.object({
      readme: z.boolean(),
      apiDocs: z.boolean(),
      setupGuide: z.boolean(),
      troubleshooting: z.boolean(),
    }).optional(),
  }).optional(),
  blockers: z.array(z.object({
    id: z.string(),
    category: z.string(),
    description: z.string(),
    mitigation: z.string().optional(),
  })).optional().describe('Issues blocking release'),
  recommendations: z.array(z.string()).optional(),
  postReleaseChecklist: z.array(z.object({
    item: z.string(),
    responsible: z.string().optional(),
    dueDate: z.number().optional(),
  })).optional(),
  approvals: z.array(z.object({
    approver: z.string(),
    role: z.string(),
    status: z.enum(['APPROVED', 'REJECTED', 'PENDING']),
    timestamp: z.number().optional(),
    comment: z.string().optional(),
  })).optional(),
  metadata: z.object({
    createdBy: z.string(),
    createdAt: z.number(),
    version: z.string(),
    releaseVersion: z.string().optional(),
  }).optional(),
})

export type ReleaseReadinessReport = z.infer<typeof ReleaseReadinessReportSchema>
