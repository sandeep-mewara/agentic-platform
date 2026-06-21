import { BaseOrchestrator, StageInput } from './BaseOrchestrator'
import { LLMProvider } from '../llm/LLMProvider'
import { TraceEmitter } from '../telemetry/TraceEmitter'
import { HookRegistry, HookContext } from '../hooks/HookRegistry'
import { SpendTracker } from '../cost-controls/budget'
import { RequirementBrief } from '@contracts/artifacts/RequirementBrief'
import { ArchitectureReview } from '@contracts/artifacts/ArchitectureReview'
import { ImplementationPlan } from '@contracts/artifacts/ImplementationPlan'
import { TestPlan } from '@contracts/artifacts/TestPlan'
import { ReleaseReadinessReport } from '@contracts/artifacts/ReleaseReadinessReport'
import {
  RequirementBriefSchema,
  ArchitectureReviewSchema,
  ImplementationPlanSchema,
  TestPlanSchema,
  ReleaseReadinessReportSchema,
} from '@contracts/artifacts/index'

export interface PDLCRequest {
  featureRequest: string
}

export interface PDLCOutput {
  requirementBrief: RequirementBrief
  architectureReview: ArchitectureReview
  implementationPlan: ImplementationPlan
  testPlan: TestPlan
  releaseReadinessReport: ReleaseReadinessReport
}

export class ConvergedAgentOrchestrator extends BaseOrchestrator {
  constructor(
    llm: LLMProvider,
    traceEmitter: TraceEmitter,
    hooks: HookRegistry,
    spendTracker: SpendTracker,
  ) {
    super(llm, traceEmitter, hooks, spendTracker)
  }

  async runPDLC(request: PDLCRequest): Promise<PDLCOutput> {
    console.log('[PDLC] Starting PDLC pipeline...')

    await this.hooks.executeHooks('lifecycle:start', {
      stage: 'pdlc:start',
      traceId: this.getTrace().traceId,
      spanId: 'lifecycle:start',
      metadata: { request },
    } as HookContext)

    try {
      // Stage 1: Requirements Analysis
      console.log('[PDLC] Stage 1/5: Requirements Analysis')
      const briefOutput = await this.runStage({
        stage: 'requirements-analysis',
        prompt: `Analyze this feature request and produce a structured RequirementBrief JSON.
Feature request: "${request.featureRequest}"
Return ONLY valid JSON matching the RequirementBrief schema.`,
      })
      const requirementBrief = RequirementBriefSchema.parse(JSON.parse(briefOutput.result))

      // Stage 2: Architecture Review
      console.log('[PDLC] Stage 2/5: Architecture Review')
      const archOutput = await this.runStage({
        stage: 'architecture-review',
        prompt: `Review this requirement brief for architectural concerns.
Requirement: ${JSON.stringify(requirementBrief)}
Return ONLY valid JSON matching the ArchitectureReview schema.`,
      })
      const architectureReview = ArchitectureReviewSchema.parse(JSON.parse(archOutput.result))

      // Stage 3: Planning
      console.log('[PDLC] Stage 3/5: Planning')
      const planOutput = await this.runStage({
        stage: 'planning',
        prompt: `Create an implementation plan based on requirement and architecture review.
Requirement: ${JSON.stringify(requirementBrief)}
Architecture: ${JSON.stringify(architectureReview)}
Return ONLY valid JSON matching the ImplementationPlan schema.`,
      })
      const implementationPlan = ImplementationPlanSchema.parse(JSON.parse(planOutput.result))

      // Stage 4: Testing
      console.log('[PDLC] Stage 4/5: Testing')
      const testOutput = await this.runStage({
        stage: 'code-review',
        prompt: `Create a comprehensive test plan for this implementation.
Plan: ${JSON.stringify(implementationPlan)}
Return ONLY valid JSON matching the TestPlan schema.`,
      })
      const testPlan = TestPlanSchema.parse(JSON.parse(testOutput.result))

      // HITL Gate
      console.log('[HITL] Approval requested → APPROVED (mock)')

      // Stage 5: Release Readiness
      console.log('[PDLC] Stage 5/5: Release Readiness')
      const releaseOutput = await this.runStage({
        stage: 'release-readiness',
        prompt: `Assess release readiness based on test plan and all previous stages.
Test Plan: ${JSON.stringify(testPlan)}
Return ONLY valid JSON matching the ReleaseReadinessReport schema.`,
      })
      const releaseReadinessReport = ReleaseReadinessReportSchema.parse(
        JSON.parse(releaseOutput.result),
      )

      await this.hooks.executeHooks('lifecycle:end', {
        stage: 'pdlc:end',
        traceId: this.getTrace().traceId,
        spanId: 'lifecycle:end',
        metadata: { status: releaseReadinessReport.overallStatus },
      } as HookContext)

      console.log(
        `\n[PDLC] Pipeline complete: ${releaseReadinessReport.overallStatus}`,
      )

      return {
        requirementBrief,
        architectureReview,
        implementationPlan,
        testPlan,
        releaseReadinessReport,
      }
    } catch (error) {
      await this.hooks.executeHooks('lifecycle:end', {
        stage: 'pdlc:error',
        traceId: this.getTrace().traceId,
        spanId: 'lifecycle:error',
        metadata: { error: String(error) },
      } as HookContext)
      throw error
    }
  }
}
