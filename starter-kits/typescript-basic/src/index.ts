import { ConvergedAgentOrchestrator } from '@core/orchestrator/ConvergedAgentOrchestrator'
import { MockLLMProvider } from '@core/llm/MockLLMProvider'
import { TraceEmitter } from '@core/telemetry/TraceEmitter'
import { SpendTracker } from '@core/cost-controls/SpendTracker'
import { HookRegistry } from '@core/hooks/HookRegistry'
import pino from 'pino'

const logger = pino()

async function main() {
  logger.info('=== Agentic Platform Starter Kit (Basic) ===')
  logger.info('This demonstrates the minimal quickstart for the platform')
  logger.info('')

  // 1. Initialize LLM Provider
  // Using MockLLMProvider for this demo (deterministic output)
  // In production, use ClaudeLLMProvider with your API key
  const llm = new MockLLMProvider()
  logger.info('✓ LLM Provider initialized (MockLLMProvider)')

  // 2. Initialize Platform Services
  const tracer = new TraceEmitter({ serviceName: 'starter-basic' })
  const budget = new SpendTracker()
  const hooks = new HookRegistry()
  logger.info('✓ Platform services initialized (tracer, budget, hooks)')

  // 3. Create Orchestrator
  const orchestrator = new ConvergedAgentOrchestrator(llm, tracer, hooks, budget)
  logger.info('✓ Orchestrator created')
  logger.info('')

  // 4. Define a Feature Request
  const featureRequest = {
    featureRequest: 'Add OAuth 2.0 authentication to the API'
  }

  logger.info('Running PDLC Pipeline:')
  logger.info(`  Input: "${featureRequest.featureRequest}"`)
  logger.info('')

  // 5. Run the PDLC Pipeline
  try {
    const result = await orchestrator.runPDLC(featureRequest)

    logger.info('✓ PDLC Pipeline completed')
    logger.info('')

    // 6. Inspect Results
    logger.info('=== Pipeline Output ===')
    logger.info(`Requirements: ${result.requirementBrief?.objectives?.length ?? 0} objectives`)
    logger.info(`Architecture: ${result.architectureReview?.overallAssessment}`)
    logger.info(`Plan: ${result.implementationPlan?.phases?.length ?? 0} phases`)
    logger.info(`Tests: ${result.testPlan?.testSuites?.length ?? 0} test suites`)
    logger.info(`Release Status: ${result.releaseReadinessReport?.overallStatus}`)

    logger.info('')
    logger.info('✓ Demo completed successfully')
  } catch (error) {
    logger.error('✗ Pipeline failed:', error)
    process.exit(1)
  }
}

main()
