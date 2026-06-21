import { ConvergedAgentOrchestrator } from '@core/orchestrator/ConvergedAgentOrchestrator'
import { LLMProvider } from '@core/llm/LLMProvider'
import { TraceEmitter } from '@core/telemetry/TraceEmitter'
import { SpendTracker } from '@core/cost-controls/SpendTracker'
import { HookRegistry } from '@core/hooks/HookRegistry'
import pino from 'pino'

// Logger for orchestrator setup
const logger = pino()

/**
 * Creates and wires the full orchestrator with all platform services.
 * This demonstrates production-ready setup with error handling and observability.
 */
export function createFullOrchestrator(
  llm: LLMProvider,
  options?: {
    serviceName?: string
    budgetUSD?: number
    logLevel?: string
  }
): ConvergedAgentOrchestrator {
  const serviceName = options?.serviceName ?? 'agentic-platform'
  const budgetUSD = options?.budgetUSD ?? 100
  const logLevel = options?.logLevel ?? 'info'

  // 1. Create Tracer (Observability)
  const tracer = new TraceEmitter({
    serviceName,
    enabled: true,
    batchSize: 10,
    flushInterval: 5000
  })
  logger.info(`✓ TraceEmitter initialized (service: ${serviceName})`)

  // 2. Create Budget Tracker (Cost Control)
  const budget = new SpendTracker()
  logger.info(`✓ SpendTracker initialized`)

  // 3. Create Hook Registry (Extension Points)
  const hooks = new HookRegistry()
  logger.info('✓ HookRegistry initialized')

  // 4. Create Orchestrator
  const orchestrator = new ConvergedAgentOrchestrator(llm, tracer, hooks, budget)
  logger.info('✓ ConvergedAgentOrchestrator created')

  return orchestrator
}

/**
 * Registers platform-wide hooks for cross-cutting concerns.
 * These hooks run at key lifecycle points in the PDLC pipeline.
 */
export function registerPlatformHooks(hooks: HookRegistry): void {
  // Hook 1: Log pipeline start
  hooks.register('lifecycle:start', async (context) => {
    logger.info('📍 PDLC Pipeline started', {
      timestamp: new Date().toISOString(),
      featureRequest: context.input?.featureRequest?.substring(0, 50)
    })
  })

  // Hook 2: Log pipeline end
  hooks.register('lifecycle:end', async (context) => {
    logger.info('📍 PDLC Pipeline completed', {
      timestamp: new Date().toISOString(),
      status: context.output?.overallStatus
    })
  })

  // Hook 3: Error handling on stage failures
  hooks.register('error:stage', async (context) => {
    const error = context.error as Error | undefined
    logger.error('❌ Stage execution failed', {
      stage: context.stage,
      error: error?.message,
      timestamp: new Date().toISOString()
    })
  })

  // Hook 4: Cost tracking after each stage
  hooks.register('stage:post', async (context) => {
    const costReport = context.output?.costReport
    if (costReport) {
      logger.info('💰 Stage cost tracked', {
        stage: context.stage,
        stageCost: costReport.stageCost,
        totalCost: costReport.totalCost
      })
    }
  })
}

/**
 * Registers domain-specific hooks for your business logic.
 * This is where teams inject custom compliance, security, or product logic.
 */
export function registerDomainHooks(hooks: HookRegistry): void {
  // Example Hook 1: Compliance validation after architecture review
  hooks.register('stage:architecture:post', async (context) => {
    const { output } = context
    logger.info('🔐 Domain Hook: Architecture compliance check', {
      stage: 'architecture'
    })

    // Your custom compliance logic here
    // Example: validate against company architectural standards
    // if (!isCompliant(output)) {
    //   output.blockers = output.blockers || []
    //   output.blockers.push({
    //     id: 'compliance-001',
    //     category: 'compliance',
    //     description: 'Architecture does not meet compliance standards'
    //   })
    // }
  })

  // Example Hook 2: Security review after requirements
  hooks.register('stage:requirements:post', async (context) => {
    const { output } = context
    logger.info('🛡️ Domain Hook: Security requirements check', {
      stage: 'requirements'
    })

    // Your custom security logic here
    // Example: add security requirements if missing
    // if (!output.requirements?.includes('auth')) {
    //   output.requirements.push('authentication-required')
    // }
  })

  // Example Hook 3: Cost optimization before release
  hooks.register('stage:release-readiness:pre', async (context) => {
    const { input } = context
    logger.info('💡 Domain Hook: Cost optimization check', {
      stage: 'release-readiness'
    })

    // Your custom optimization logic here
    // Example: flag if cost is too high
  })
}
