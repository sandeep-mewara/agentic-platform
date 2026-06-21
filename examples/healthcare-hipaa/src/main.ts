import 'dotenv/config'
import { ConvergedAgentOrchestrator } from '@core/orchestrator/ConvergedAgentOrchestrator'
import { MockLLMProvider } from '@core/llm/MockLLMProvider'
import { TraceEmitter } from '@core/telemetry/TraceEmitter'
import { SpendTracker } from '@core/cost-controls/budget'
import { HookRegistry } from '@core/hooks/HookRegistry'
import { registerHealthcareHooks } from './hooks'
import pino from 'pino'

const logger = pino()

async function main() {
  try {
    logger.info('=== Healthcare HIPAA Example ===')
    logger.info('Demonstrating PII protection and HIPAA compliance in PDLC')
    logger.info('')

    const llm = new MockLLMProvider()
    const tracer = new TraceEmitter()
    const budget = new SpendTracker()
    const hooks = new HookRegistry()

    registerHealthcareHooks(hooks)

    const orchestrator = new ConvergedAgentOrchestrator(llm, tracer, hooks, budget)
    logger.info('✓ Healthcare orchestrator with HIPAA hooks initialized')
    logger.info('')

    const featureRequest = {
      featureRequest: 'Add patient consent tracking and audit logging for medical records access'
    }

    logger.info(`Feature: "${featureRequest.featureRequest}"`)
    logger.info('')

    const result = await orchestrator.runPDLC(featureRequest)

    logger.info('=== Results ===')
    logger.info(`Requirements: ✓`)
    logger.info(`Architecture: ${result.architectureReview?.overallAssessment}`)
    logger.info(`Release Status: ${result.releaseReadinessReport?.overallStatus}`)
    logger.info('')
    logger.info('✓ Healthcare example completed')
  } catch (error) {
    logger.error('Error:', error)
    process.exit(1)
  }
}

main()
