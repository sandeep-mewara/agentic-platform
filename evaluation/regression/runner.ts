import { z } from 'zod'
import fs from 'fs'
import path from 'path'

import {
  RequirementBriefSchema,
  ArchitectureReviewSchema,
  ImplementationPlanSchema,
  TestPlanSchema,
  ReleaseReadinessReportSchema,
} from '@contracts/artifacts/index'

const DiffReportSchema = z.object({
  stage: z.string(),
  passed: z.boolean(),
  missingFields: z.array(z.string()),
  typeMismatches: z.array(z.object({
    field: z.string(),
    expected: z.string(),
    actual: z.string(),
  })),
  errors: z.array(z.string()),
})

const RegressionReportSchema = z.object({
  runAt: z.number(),
  featureRequest: z.string(),
  stages: z.array(DiffReportSchema),
  allPassed: z.boolean(),
  summary: z.string(),
})

export type DiffReport = z.infer<typeof DiffReportSchema>
export type RegressionReport = z.infer<typeof RegressionReportSchema>

export interface GoldenDataset {
  featureRequest: string
  expectedOutputs: {
    stage1_requirementBrief: any
    stage2_architectureReview: any
    stage3_implementationPlan: any
    stage4_testPlan: any
    stage5_releaseReadinessReport: any
  }
  metadata: {
    createdAt: string
    description: string
  }
}

export interface DemoOutput {
  requirementBrief: any
  architectureReview: any
  implementationPlan: any
  testPlan: any
  releaseReadinessReport: any
}

export class RegressionRunner {
  loadGoldenDataset(filePath: string): GoldenDataset {
    try {
      const data = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      throw new Error(`Failed to load golden dataset: ${error}`)
    }
  }

  async runDemo(request: string): Promise<DemoOutput> {
    // This is a mock implementation that returns deterministic outputs
    // In Wave 11 (Examples), this will integrate with actual ConvergedAgentOrchestrator
    return {
      requirementBrief: {
        artifactId: 'brief-demo-001',
        featureRequest: request,
        objectives: ['Implement feature'],
        constraints: [],
        successCriteria: ['Works correctly'],
        assumptions: [],
        risks: [],
        metadata: {
          createdBy: 'DemoRunner',
          createdAt: Date.now(),
          version: '1.0',
        },
      },
      architectureReview: {
        artifactId: 'arch-demo-001',
        requirementBriefId: 'brief-demo-001',
        overallAssessment: 'APPROVED',
        summary: 'Architecture is sound',
        layerReview: [],
        recommendations: [],
        metadata: {
          createdBy: 'DemoRunner',
          createdAt: Date.now(),
          version: '1.0',
        },
      },
      implementationPlan: {
        artifactId: 'plan-demo-001',
        requirementBriefId: 'brief-demo-001',
        architectureReviewId: 'arch-demo-001',
        overview: 'Implementation plan',
        phases: [],
        metadata: {
          createdBy: 'DemoRunner',
          createdAt: Date.now(),
          version: '1.0',
        },
      },
      testPlan: {
        artifactId: 'test-demo-001',
        implementationPlanId: 'plan-demo-001',
        overview: 'Test plan',
        testCases: [],
        metadata: {
          createdBy: 'DemoRunner',
          createdAt: Date.now(),
          version: '1.0',
        },
      },
      releaseReadinessReport: {
        artifactId: 'release-demo-001',
        testPlanId: 'test-demo-001',
        hiltDecisionId: 'hitl-demo-001',
        overallStatus: 'APPROVED',
        executiveSummary: 'Ready for release',
        readiness: {
          codeComplete: true,
          testsPass: true,
          documentationComplete: true,
          performanceAcceptable: true,
          securityReview: 'APPROVED',
        },
        metadata: {
          createdBy: 'DemoRunner',
          createdAt: Date.now(),
          version: '1.0',
        },
      },
    }
  }

  compareOutputs(actual: DemoOutput, expected: GoldenDataset['expectedOutputs']): DiffReport[] {
    const diffs: DiffReport[] = []

    // Stage 1: RequirementBrief
    const stage1Diff = this.validateStage(
      'requirements',
      actual.requirementBrief,
      expected.stage1_requirementBrief,
      RequirementBriefSchema,
    )
    diffs.push(stage1Diff)

    // Stage 2: ArchitectureReview
    const stage2Diff = this.validateStage(
      'architecture',
      actual.architectureReview,
      expected.stage2_architectureReview,
      ArchitectureReviewSchema,
    )
    diffs.push(stage2Diff)

    // Stage 3: ImplementationPlan
    const stage3Diff = this.validateStage(
      'planning',
      actual.implementationPlan,
      expected.stage3_implementationPlan,
      ImplementationPlanSchema,
    )
    diffs.push(stage3Diff)

    // Stage 4: TestPlan
    const stage4Diff = this.validateStage(
      'testing',
      actual.testPlan,
      expected.stage4_testPlan,
      TestPlanSchema,
    )
    diffs.push(stage4Diff)

    // Stage 5: ReleaseReadinessReport
    const stage5Diff = this.validateStage(
      'release',
      actual.releaseReadinessReport,
      expected.stage5_releaseReadinessReport,
      ReleaseReadinessReportSchema,
    )
    diffs.push(stage5Diff)

    return diffs
  }

  private validateStage(
    stageName: string,
    actual: any,
    expected: any,
    schema: z.ZodType<any>,
  ): DiffReport {
    const missingFields: string[] = []
    const typeMismatches: DiffReport['typeMismatches'] = []
    const errors: string[] = []

    // Validate against schema
    try {
      schema.parse(actual)
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.push(...error.errors.map(e => `${e.path.join('.')}: ${e.message}`))
      }
    }

    // Check for missing fields
    if (expected) {
      const expectedKeys = Object.keys(expected)
      for (const key of expectedKeys) {
        if (!(key in actual)) {
          missingFields.push(key)
        } else if (typeof actual[key] !== typeof expected[key]) {
          typeMismatches.push({
            field: key,
            expected: typeof expected[key],
            actual: typeof actual[key],
          })
        }
      }
    }

    return {
      stage: stageName,
      passed: missingFields.length === 0 && typeMismatches.length === 0 && errors.length === 0,
      missingFields,
      typeMismatches,
      errors,
    }
  }

  generateReport(diffs: DiffReport[]): RegressionReport {
    const allPassed = diffs.every(d => d.passed)
    const failedStages = diffs.filter(d => !d.passed)

    let summary = 'All stages PASSED ✓'
    if (!allPassed) {
      summary = `${failedStages.length}/${diffs.length} stages FAILED:\n`
      for (const diff of failedStages) {
        summary += `  - ${diff.stage}: ${diff.errors.length} errors, ${diff.missingFields.length} missing fields, ${diff.typeMismatches.length} type mismatches\n`
      }
    }

    return RegressionReportSchema.parse({
      runAt: Date.now(),
      featureRequest: 'Golden Dataset PDLC',
      stages: diffs,
      allPassed,
      summary,
    })
  }
}
