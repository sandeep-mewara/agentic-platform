import { PythonAgentAdapter } from '@core/hooks/PythonAgentAdapter'
import { HookRegistry, HookContext } from '@core/hooks/HookRegistry'
import pino from 'pino'

const logger = pino()

/**
 * Integrate Python ML risk scorer into PDLC pipeline.
 */

export async function createMLRiskHook(agentPath: string) {
  const adapter = new PythonAgentAdapter(agentPath)

  return async (context: HookContext) => {
    const { output } = context

    logger.info('🤖 ML Risk Scorer Hook', { stage: context.stage })

    const request = {
      id: `ml-${Date.now()}`,
      skillId: 'risk-assessment',
      input: output || {},
      metadata: { hook: true }
    }

    try {
      const result = await adapter.call(request)

      if (result.status === 'success') {
        const riskScore = result.output.riskScore || 0
        const riskLevel = result.output.riskLevel || 'UNKNOWN'

        logger.info('📊 Risk Score', {
          score: riskScore,
          level: riskLevel,
          factors: result.output.riskFactors
        })

        // Add risk metadata to output
        output.mlRiskScore = riskScore
        output.mlRiskLevel = riskLevel
        output.mlRiskFactors = result.output.riskFactors

        // Add blocker if HIGH risk
        if (riskLevel === 'HIGH') {
          output.blockers = output.blockers || []
          output.blockers.push({
            id: 'ml-risk-high',
            category: 'architecture',
            severity: 'medium',
            description: `ML Risk Score ${riskScore} (HIGH): ${result.output.recommendations?.join('; ')}`
          })
        }

        logger.info('✓ ML scoring completed')
      } else {
        logger.error('✗ ML scoring failed', { error: result.error })
      }
    } catch (error) {
      logger.error('✗ ML hook error', {
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }
}

export function registerMLRiskHook(hooks: HookRegistry, agentPath: string): void {
  createMLRiskHook(agentPath).then((hook) => {
    hooks.register('stage:architecture:post', hook)
    logger.info('✓ ML risk scoring hook registered')
  })
}
