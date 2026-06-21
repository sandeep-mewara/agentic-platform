import { HookRegistry, HookContext } from '@core/hooks/HookRegistry'
import pino from 'pino'

const logger = pino()

/**
 * Finance domain hooks for SOX/tax compliance validation.
 */

export async function validateSOXCompliance(context: HookContext): Promise<void> {
  const { output } = context

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

    output.blockers = output.blockers || []
    output.blockers.push({
      id: 'sox-compliance-failed',
      category: 'compliance',
      severity: 'high',
      description: `SOX Compliance: ${violations.join('; ')}`
    })
  } else {
    logger.info('✓ SOX Compliance Check Passed')
  }
}

export async function validateTaxCompliance(context: HookContext): Promise<void> {
  const { output } = context

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

    output.blockers = output.blockers || []
    output.blockers.push({
      id: 'tax-compliance-failed',
      category: 'tax',
      severity: 'medium',
      description: `Tax Compliance: ${violations.join('; ')}`
    })
  } else {
    logger.info('✓ Tax Compliance Check Passed')
  }
}

export async function validateCostTracking(context: HookContext): Promise<void> {
  const { output } = context

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

    output.metadata = output.metadata || {}
    output.metadata.costWarning = `Feature estimated cost $${costData.estimatedCost} (${((costData.estimatedCost / costData.totalBudget) * 100).toFixed(1)}% of budget)`
  }
}

export function registerFinanceHooks(hooks: HookRegistry): void {
  // SOX compliance check after architecture review
  hooks.register('stage:architecture:post', validateSOXCompliance)

  // Tax compliance check after planning
  hooks.register('stage:planning:post', validateTaxCompliance)

  // Cost tracking after requirements
  hooks.register('stage:requirements:post', validateCostTracking)

  logger.info('✓ Finance compliance hooks registered')
}

export function registerConditionalFinanceHooks(
  hooks: HookRegistry,
  features: { sox?: boolean; tax?: boolean; cost?: boolean }
): void {
  if (features.sox !== false) {
    hooks.register('stage:architecture:post', validateSOXCompliance)
    logger.info('✓ SOX validation hook registered')
  }

  if (features.tax !== false) {
    hooks.register('stage:planning:post', validateTaxCompliance)
    logger.info('✓ Tax validation hook registered')
  }

  if (features.cost !== false) {
    hooks.register('stage:requirements:post', validateCostTracking)
    logger.info('✓ Cost tracking hook registered')
  }
}
