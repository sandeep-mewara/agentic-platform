import { z } from 'zod'

export const TestPlanSchema = z.object({
  artifactId: z.string().describe('Unique artifact identifier'),
  implementationPlanId: z.string(),
  overview: z.string().describe('Test strategy overview'),
  testStrategy: z.object({
    unitTestCoverage: z.number().describe('Target coverage percentage (0-100)'),
    integrationTestScope: z.array(z.string()).describe('Integration boundaries to test'),
    e2eScenarios: z.array(z.string()).describe('End-to-end user scenarios'),
  }).optional(),
  testCases: z.array(z.object({
    testId: z.string(),
    title: z.string(),
    description: z.string(),
    type: z.enum(['UNIT', 'INTEGRATION', 'E2E', 'PERFORMANCE']),
    preconditions: z.array(z.string()).optional(),
    steps: z.array(z.string()).describe('Test execution steps'),
    expectedResult: z.string(),
    priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  })).describe('Detailed test cases'),
  performanceTests: z.array(z.object({
    metric: z.string(),
    baseline: z.number(),
    target: z.number(),
    unit: z.string(),
  })).optional().describe('Performance benchmarks'),
  securityTests: z.array(z.string()).optional().describe('Security test scenarios'),
  qualityGates: z.array(z.object({
    name: z.string(),
    criterion: z.string(),
    threshold: z.string(),
  })).optional().describe('Must-pass quality checks'),
  regressionTests: z.array(z.string()).optional().describe('Regression test suite'),
  metadata: z.object({
    createdBy: z.string(),
    createdAt: z.number(),
    version: z.string(),
  }).optional(),
})

export type TestPlan = z.infer<typeof TestPlanSchema>
