import 'dotenv/config'
import { ConvergedAgentOrchestrator } from '@core/orchestrator/ConvergedAgentOrchestrator'
import { MockLLMProvider } from '@core/llm/MockLLMProvider'
import { ClaudeLLMProvider } from '@core/llm/ClaudeLLMProvider'
import { TraceEmitter } from '@core/telemetry/TraceEmitter'
import { SpendTracker } from '@core/cost-controls/SpendTracker'
import { HookRegistry } from '@core/hooks/HookRegistry'
import { registerFinanceHooks } from './hooks'
import { financeConfig } from './config'
import pino from 'pino'

const logger = pino()

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
    logger.info('=== Finance Compliance Example ===')
    logger.info('Demonstrating SOX/tax compliance validation in PDLC pipeline')
    logger.info('')

    // 1. Select LLM provider
    const llm = selectLLMProvider()

    // 2. Initialize platform services
    const tracer = new TraceEmitter({ serviceName: 'finance-compliance' })
    const budget = new SpendTracker()
    const hooks = new HookRegistry()
    logger.info('✓ Platform services initialized')
    logger.info('')

    // 3. Register finance compliance hooks
    registerFinanceHooks(hooks)

    // 4. Create orchestrator with finance configuration
    const orchestrator = new ConvergedAgentOrchestrator(llm, tracer, hooks, budget)
    logger.info('✓ Orchestrator created with finance hooks')
    logger.info('')

    // 5. Log finance configuration
    logger.info('📊 Finance Configuration')
    logger.info(`  Budget: $${financeConfig.limits.budgetUSD}`)
    logger.info(`  Currencies: ${financeConfig.currencies.supported.join(', ')}`)
    logger.info(`  SOX Validation: ${financeConfig.compliance.enableSOXValidation}`)
    logger.info(`  Tax Validation: ${financeConfig.compliance.enableTaxValidation}`)
    logger.info('')

    // 6. Real-world finance feature request
    const featureRequest = {
      featureRequest:
        'Add international payment processing with multi-currency support for USD, EUR, GBP, and JPY'
    }

    logger.info('🎯 Feature Request:')
    logger.info(`"${featureRequest.featureRequest}"`)
    logger.info('')

    // 7. Run PDLC pipeline
    logger.info('Running PDLC pipeline with finance compliance checks...')
    logger.info('')

    const result = await orchestrator.runPDLC(featureRequest)

    // 8. Inspect results
    logger.info('=== Pipeline Results ===')
    logger.info(`Requirements: ${result.requirementBrief?.objectives?.length ?? 0} objectives`)
    logger.info(`Architecture: ${result.architectureReview?.overallAssessment}`)

    // Show compliance blockers
    if (result.architectureReview?.blockers && result.architectureReview.blockers.length > 0) {
      logger.info('⚠️ Compliance Issues Found:')
      result.architectureReview.blockers.forEach((blocker) => {
        logger.info(`  - [${blocker.category}] ${blocker.description}`)
      })
    }

    logger.info(`Plan: ${result.implementationPlan?.phases?.length ?? 0} phases`)
    logger.info(`Tests: ${result.testPlan?.testSuites?.length ?? 0} test suites`)
    logger.info(`Release Status: ${result.releaseReadinessReport?.overallStatus}`)

    // Show final blockers
    if (result.releaseReadinessReport?.blockers && result.releaseReadinessReport.blockers.length > 0) {
      logger.info('')
      logger.info('🔐 Release Blockers:')
      result.releaseReadinessReport.blockers.forEach((blocker) => {
        logger.info(`  - [${blocker.category}] ${blocker.description}`)
      })
    }

    logger.info('')
    logger.info('✓ Finance compliance example completed')
  } catch (error) {
    logger.error('Pipeline execution failed', {
      error: error instanceof Error ? error.message : String(error)
    })
    process.exit(1)
  }
}

main()
