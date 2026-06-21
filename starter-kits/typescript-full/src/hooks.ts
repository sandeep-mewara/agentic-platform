import { HookRegistry, HookContext } from '@core/hooks/HookRegistry'
import pino from 'pino'

const logger = pino()

/**
 * Custom domain hook for compliance validation.
 * Example: Finance teams might validate SOX compliance
 */
export async function validateComplianceHook(context: HookContext): Promise<void> {
  const { output, stage } = context

  logger.info('Running compliance validation hook', { stage })

  // Custom validation logic
  // This is where you'd call your compliance APIs, check policies, etc.
  // Example:
  // const result = await checkSOXCompliance(output)
  // if (!result.passed) {
  //   output.blockers = output.blockers || []
  //   output.blockers.push({
  //     id: 'sox-validation-failed',
  //     category: 'compliance',
  //     description: result.errors.join('; ')
  //   })
  // }
}

/**
 * Custom domain hook for security checks.
 * Example: InfoSec teams might verify no PII is exposed
 */
export async function validateSecurityHook(context: HookContext): Promise<void> {
  const { output, stage } = context

  logger.info('Running security validation hook', { stage })

  // Custom security logic
  // This is where you'd check for PII exposure, injection risks, etc.
  // Example:
  // const piiFound = detectPII(output)
  // if (piiFound.length > 0) {
  //   logger.warn('PII detected in output', { piiFound })
  // }
}

/**
 * Custom domain hook for cost optimization.
 * Example: FinOps teams might flag high-cost changes
 */
export async function validateCostHook(context: HookContext): Promise<void> {
  const { output } = context
  const costReport = output?.costReport

  if (!costReport) return

  logger.info('Running cost optimization hook', {
    totalCost: costReport.totalCost,
    threshold: 50 // Flag if cost > $50
  })

  // Custom cost logic
  // This is where you'd apply FinOps policies, budget constraints, etc.
  // Example:
  // if (costReport.totalCost > COST_THRESHOLD) {
  //   output.blockers = output.blockers || []
  //   output.blockers.push({
  //     id: 'cost-threshold-exceeded',
  //     category: 'cost',
  //     description: `Cost $${costReport.totalCost} exceeds threshold $${COST_THRESHOLD}`
  //   })
  // }
}

/**
 * Custom domain hook for business logic validation.
 * Example: Product teams might validate against business requirements
 */
export async function validateBusinessLogicHook(context: HookContext): Promise<void> {
  const { output, input } = context

  logger.info('Running business logic validation hook')

  // Custom business logic
  // This is where you'd validate the proposal against product roadmap, customer needs, etc.
  // Example:
  // const { featureRequest } = input
  // if (isOnProductRoadmap(featureRequest)) {
  //   output.metadata = output.metadata || {}
  //   output.metadata.roadmapAlignment = 'high'
  // }
}

/**
 * Register all domain hooks at once.
 * Call this from your main setup to wire all custom logic.
 */
export function registerAllDomainHooks(hooks: HookRegistry): void {
  // Register hooks at specific lifecycle points
  hooks.register('stage:requirements:post', validateBusinessLogicHook)
  hooks.register('stage:architecture:post', validateSecurityHook)
  hooks.register('stage:release-readiness:pre', validateCostHook)
  hooks.register('stage:release-readiness:pre', validateComplianceHook)

  logger.info('✓ All domain hooks registered')
}

/**
 * Example: Register conditional hooks based on feature flags or environment.
 * This demonstrates dynamic hook registration.
 */
export function registerConditionalHooks(
  hooks: HookRegistry,
  features: { compliance?: boolean; security?: boolean; cost?: boolean }
): void {
  if (features.compliance) {
    hooks.register('stage:release-readiness:pre', validateComplianceHook)
    logger.info('✓ Compliance hook registered')
  }

  if (features.security) {
    hooks.register('stage:architecture:post', validateSecurityHook)
    logger.info('✓ Security hook registered')
  }

  if (features.cost) {
    hooks.register('stage:release-readiness:pre', validateCostHook)
    logger.info('✓ Cost validation hook registered')
  }
}

/**
 * Example: Register hooks that modify output based on domain context.
 * This demonstrates how to enrich outputs with domain-specific metadata.
 */
export function registerMetadataEnrichmentHooks(hooks: HookRegistry): void {
  hooks.register('lifecycle:end', async (context) => {
    const { output } = context

    // Add domain metadata to final output
    output.metadata = output.metadata || {}
    output.metadata.processedAt = new Date().toISOString()
    output.metadata.environment = process.env.NODE_ENV || 'development'
    output.metadata.kit = 'typescript-full'

    logger.info('✓ Output enriched with metadata')
  })
}
