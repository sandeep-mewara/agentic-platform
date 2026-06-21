import { ConvergedAgentOrchestrator } from '@core/orchestrator/ConvergedAgentOrchestrator'
import { MockLLMProvider } from '@core/llm/MockLLMProvider'
import { TraceEmitter } from '@core/telemetry/TraceEmitter'
import { SpendTracker } from '@core/cost-controls/budget'
import { HookRegistry } from '@core/hooks/HookRegistry'

async function main() {
  console.log('=== Agentic Platform — PDLC Demo ===')
  console.log('')

  // Initialize services
  const llm = new MockLLMProvider()
  const tracer = new TraceEmitter()
  const budget = new SpendTracker()
  const hooks = new HookRegistry()

  console.log('[SETUP] ✓ LLM provider initialized')
  console.log('[SETUP] ✓ Platform services initialized')
  console.log('')

  // Create orchestrator
  const orchestrator = new ConvergedAgentOrchestrator(llm, tracer, hooks, budget)
  console.log('[SETUP] ✓ Orchestrator created')
  console.log('')

  // Run demo
  const featureRequest = {
    featureRequest: 'Add OAuth 2.0 authentication with JWT tokens for API security',
  }

  console.log('[DEMO] Feature request:', featureRequest.featureRequest)
  console.log('')

  try {
    const result = await orchestrator.runPDLC(featureRequest)

    console.log('[DEMO] ✓ Pipeline completed successfully')
    console.log('')

    // Display results
    console.log('=== Pipeline Output Summary ===')
    console.log('')

    console.log('[STAGE 1] Requirements Analysis')
    if (result.requirementBrief) {
      console.log(`  Objectives: ${result.requirementBrief.objectives?.length ?? 0}`)
      console.log(`  Constraints: ${result.requirementBrief.constraints?.length ?? 0}`)
      console.log(`  Risks: ${result.requirementBrief.risks?.length ?? 0}`)
    }
    console.log('')

    console.log('[STAGE 2] Architecture Review')
    if (result.architectureReview) {
      console.log(`  Assessment: ${result.architectureReview.overallAssessment}`)
      console.log(`  Security concerns: ${result.architectureReview.security?.length ?? 0}`)
      console.log(`  Recommendations: ${result.architectureReview.recommendations?.length ?? 0}`)
    }
    console.log('')

    console.log('[STAGE 3] Planning')
    if (result.implementationPlan) {
      console.log(`  Phases: ${result.implementationPlan.phases?.length ?? 0}`)
      console.log(`  Approach: ${result.implementationPlan.technicalApproach?.architecture ?? 'N/A'}`)
    }
    console.log('')

    console.log('[STAGE 4] Testing')
    if (result.testPlan) {
      console.log(`  Test cases: ${result.testPlan.testCases?.length ?? 0}`)
      const unitCoverage = result.testPlan.testStrategy?.unitTestCoverage
      if (unitCoverage) {
        console.log(`  Coverage goal: ${unitCoverage}%`)
      }
    }
    console.log('')

    console.log('[HITL] Human-in-the-Loop: APPROVED (mock decision)')
    console.log('')

    console.log('[STAGE 5] Release Readiness')
    if (result.releaseReadinessReport) {
      console.log(`  Status: ${result.releaseReadinessReport.overallStatus}`)
      console.log(`  Summary: ${result.releaseReadinessReport.executiveSummary?.substring(0, 60)}...`)
    }
    console.log('')

    // Telemetry
    const trace = tracer.getTrace()
    const spent = budget.getTotalSpend()

    console.log('=== Telemetry ===')
    console.log(`Trace spans recorded: ${trace.spans.length}`)
    console.log(`Total tokens spent (estimate): ${spent}`)
    console.log(`Cost budget remaining: unlimited (mock)`)
    console.log('')

    console.log('✓ Demo completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('[ERROR] Pipeline failed:', error)
    process.exit(1)
  }
}

main()
