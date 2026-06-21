import { HookRegistry, HookContext } from '@core/hooks/HookRegistry'
import pino from 'pino'

const logger = pino()

/**
 * Finance domain hooks for SOX/tax compliance validation.
 */

export async function validateSOXCompliance(context: HookContext): Promise<void> {
  const { output } = context as { output: Record<string, unknown> }

  logger.info('📋 SOX Compliance Check', { stage: context.stage })

  // Check: Does architecture handle financial controls?
  const reviewText = JSON.stringify(output || {}).toLowerCase()
  const hasControlsDiscussion = reviewText.includes('control') || reviewText.includes('audit')
  const hasAccessControl = reviewText.includes('authorization') || reviewText.includes('permission')
  const hasAuditTrail = reviewText.includes('audit') || reviewText.includes('immutable')

  const violations = []

  if (!hasControlsDiscussion) {
    violations.push('Financial controls not mentioned in architecture')
  }

  if (!hasAccessControl) {
    violations.push('Access control requirements not addressed')
  }

  if (!hasAuditTrail) {
    violations.push('Audit trail/immutability not addressed')
  }

  if (violations.length > 0) {
    logger.warn('⚠️ SOX Compliance Issues Found', { violations })

    const blockers = output.blockers as unknown[] || []
    blockers.push({
      id: 'sox-compliance-failed',
      category: 'compliance',
      severity: 'high',
      description: `SOX Compliance: ${violations.join('; ')}`
    })
    output.blockers = blockers
  } else {
    logger.info('✓ SOX Compliance Check Passed')
  }
}

export async function validateTaxCompliance(context: HookContext): Promise<void> {
  const { output } = context as { output: Record<string, unknown> }

  logger.info('💰 Tax Compliance Check', { stage: context.stage })

  const planText = JSON.stringify(output || {}).toLowerCase()
  const supportsCurrency = planText.includes('currency') || planText.includes('exchange')
  const handlesRounding = planText.includes('rounding') || planText.includes('precision')
  const supportsMultipleCountries =
    planText.includes('country') || planText.includes('regional') || planText.includes('international')

  const violations = []

  if (!supportsCurrency) {
    violations.push('Multi-currency handling not addressed')
  }

  if (!handlesRounding) {
    violations.push('Rounding/precision rules not specified')
  }

  if (!supportsMultipleCountries) {
    violations.push('Multiple country support not planned')
  }

  if (violations.length > 0) {
    logger.warn('⚠️ Tax Compliance Issues Found', { violations })

    const blockers = output.blockers as unknown[] || []
    blockers.push({
      id: 'tax-compliance-failed',
      category: 'tax',
      severity: 'medium',
      description: `Tax Compliance: ${violations.join('; ')}`
    })
    output.blockers = blockers
  } else {
    logger.info('✓ Tax Compliance Check Passed')
  }
}

export async function validateCostTracking(context: HookContext): Promise<void> {
  const { output } = context as { output: Record<string, unknown> }

  logger.info('💳 Financial Cost Tracking', { stage: context.stage })

  // Track cost per feature
  const costData = {
    feature: 'example-feature',
    estimatedCost: 150,
    costPerUser: 1.5,
    totalBudget: 10000
  }

  logger.info('💸 Cost Analysis', costData)

  // Check: Is estimated cost reasonable?
  if (costData.estimatedCost > costData.totalBudget * 0.05) {
    logger.warn('⚠️ Cost Alert: Feature cost is >5% of budget', costData)

    const metadata = output.metadata as Record<string, unknown> || {}
    metadata.costWarning = `Feature estimated cost $${costData.estimatedCost} (${((costData.estimatedCost / costData.totalBudget) * 100).toFixed(1)}% of budget)`
    output.metadata = metadata
  }
}

export function registerFinanceHooks(hooks: HookRegistry): void {
  // Finance hooks run after each stage and check context to determine applicability
  hooks.registerHook('stage:after', async (context: HookContext) => {
    // SOX compliance check after architecture review
    if (context.stage === 'architecture-review') {
      await validateSOXCompliance(context)
    }

    // Tax compliance check after planning
    if (context.stage === 'planning') {
      await validateTaxCompliance(context)
    }

    // Cost tracking after requirements
    if (context.stage === 'requirements-analysis') {
      await validateCostTracking(context)
    }
  })

  logger.info('✓ Finance compliance hooks registered')
}

export function registerConditionalFinanceHooks(
  hooks: HookRegistry,
  features: { sox?: boolean; tax?: boolean; cost?: boolean }
): void {
  hooks.registerHook('stage:after', async (context: HookContext) => {
    if (features.sox !== false && context.stage === 'architecture-review') {
      await validateSOXCompliance(context)
      logger.info('✓ SOX validation executed')
    }

    if (features.tax !== false && context.stage === 'planning') {
      await validateTaxCompliance(context)
      logger.info('✓ Tax validation executed')
    }

    if (features.cost !== false && context.stage === 'requirements-analysis') {
      await validateCostTracking(context)
      logger.info('✓ Cost tracking executed')
    }
  })
}
