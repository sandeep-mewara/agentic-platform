import { PythonAgentAdapter } from '@core/hooks/PythonAgentAdapter'
import { HookRegistry, HookContext } from '@core/hooks/HookRegistry'
import pino from 'pino'

const logger = pino()

/**
 * Integrate Python ML risk scorer into PDLC pipeline.
 */

export async function createMLRiskHook(agentPath: string) {
  return async (context: HookContext) => {
    const { output } = context as { output: Record<string, unknown> }

    logger.info('🤖 ML Risk Scorer Hook', { stage: context.stage })

    const request = {
      id: `ml-${Date.now()}`,
      skillId: 'risk-assessment',
      input: output || {},
      metadata: { hook: true },
      agentMetadata: {
        agentId: 'ml-risk-scorer',
        version: '1.0.0',
      },
    }

    try {
      const result = await PythonAgentAdapter.spawnPythonAgent(agentPath, request as any)

      if (result.status === 'SUCCESS') {
        const riskData = result.output as Record<string, unknown>
        const riskScore = riskData.riskScore as number || 0
        const riskLevel = riskData.riskLevel as string || 'UNKNOWN'

        logger.info('📊 Risk Score', {
          score: riskScore,
          level: riskLevel,
          factors: riskData.riskFactors
        })

        // Add risk metadata to output
        output.mlRiskScore = riskScore
        output.mlRiskLevel = riskLevel
        output.mlRiskFactors = riskData.riskFactors

        // Add blocker if HIGH risk
        if (riskLevel === 'HIGH') {
          const blockers = output.blockers as unknown[] || []
          blockers.push({
            id: 'ml-risk-high',
            category: 'architecture',
            severity: 'medium',
            description: `ML Risk Score ${riskScore} (HIGH): ${(riskData.recommendations as string[])?.join('; ')}`
          })
          output.blockers = blockers
        }

        logger.info('✓ ML scoring completed')
      } else {
        logger.error('✗ ML scoring failed', { error: result.status })
      }
    } catch (error) {
      logger.error('✗ ML hook error', {
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }
}

export async function registerMLRiskHook(hooks: HookRegistry, agentPath: string): Promise<void> {
  const hook = await createMLRiskHook(agentPath)
  hooks.registerHook('stage:after', async (context: HookContext) => {
    // Run ML risk scoring after architecture stage
    if (context.stage === 'architecture-review') {
      await hook(context)
    }
  })
  logger.info('✓ ML risk scoring hook registered')
}
