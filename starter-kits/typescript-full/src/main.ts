import 'dotenv/config'
import { createFullOrchestrator, registerPlatformHooks } from './orchestrator'
import { registerAllDomainHooks } from './hooks'
import { MockLLMProvider } from '@core/llm/MockLLMProvider'
import { ClaudeLLMProvider } from '@core/llm/ClaudeLLMProvider'
import pino from 'pino'

const logger = pino()

/**
 * Select LLM Provider based on environment.
 * Uses real Claude if API key is set, otherwise falls back to MockLLMProvider.
 */
function selectLLMProvider() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  const provider = process.env.LLM_PROVIDER || 'mock'

  if (provider === 'claude' && apiKey) {
    logger.info('Using ClaudeLLMProvider (real API)')
    return new ClaudeLLMProvider({ apiKey })
  }

  logger.info('Using MockLLMProvider (deterministic demo)')
  return new MockLLMProvider()
}

async function main() {
  try {
    logger.info('=== Agentic Platform Starter Kit (Full) ===')
    logger.info('Production-ready setup with hooks and error handling')
    logger.info('')

    // 1. Select and initialize LLM provider
    const llm = selectLLMProvider()

    // 2. Create orchestrator with full platform services
    const orchestrator = createFullOrchestrator(llm, {
      serviceName: 'starter-full',
      budgetUSD: Number(process.env.COST_BUDGET_USD || '100'),
      logLevel: process.env.LOG_LEVEL || 'info'
    })

    // 3. Get hooks from orchestrator
    const hooks = orchestrator.hooks

    // 4. Register platform-wide hooks (observability, cost tracking, error handling)
    registerPlatformHooks(hooks)

    // 5. Register domain-specific hooks (your custom business logic)
    registerAllDomainHooks(hooks)

    logger.info('')
    logger.info('Initialization complete. Starting PDLC pipeline...')
    logger.info('')

    // 6. Define feature request
    const featureRequest = {
      featureRequest: 'Add API rate limiting to prevent abuse'
    }

    logger.info(`Feature: "${featureRequest.featureRequest}"`)
    logger.info('')

    // 7. Run pipeline
    const result = await orchestrator.runPDLC(featureRequest)

    logger.info('')
    logger.info('=== Pipeline Results ===')
    logger.info(`Requirements: ${result.requirementBrief?.objectives?.length ?? 0} objectives`)
    logger.info(`Architecture: ${result.architectureReview?.overallAssessment}`)
    logger.info(`Plan: ${result.implementationPlan?.phases?.length ?? 0} phases`)
    logger.info(`Tests: ${result.testPlan?.testSuites?.length ?? 0} test suites`)
    logger.info(`Release Status: ${result.releaseReadinessReport?.overallStatus}`)

    logger.info('')
    logger.info('✓ Pipeline execution successful')
  } catch (error) {
    logger.error('Pipeline execution failed', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    process.exit(1)
  }
}

main()
