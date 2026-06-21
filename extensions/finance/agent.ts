import { ArchitectureReviewAgent } from '@capabilities/architecture-review/agent'
import { LLMProvider } from '@core/llm'
import { HookRegistry } from '@core/hooks/HookRegistry'
import { type RequirementBrief } from '@contracts/artifacts/RequirementBrief'
import { type ArchitectureReview } from '@contracts/artifacts/ArchitectureReview'

/**
 * FinanceComplianceAgent extends ArchitectureReviewAgent to inject SOX compliance checks.
 *
 * Demonstrates native TypeScript extensibility:
 * 1. Subclass the base capability
 * 2. Override run() to inject domain-specific validation before/after base execution
 * 3. Register hooks with HookRegistry to notify subscribers of compliance checks
 */
export class FinanceComplianceAgent extends ArchitectureReviewAgent {
  constructor(llm: LLMProvider, private hooks: HookRegistry) {
    super(llm)
  }

  async run(requirementBrief: RequirementBrief): Promise<ArchitectureReview> {
    // Pre-flight: Check for SOX-relevant constraints
    await this.hooks.executeHooks('stage:before', {
      stage: 'finance-compliance-check',
      traceId: 'trace-' + Math.random().toString(36).slice(2, 11),
      spanId: 'span-' + Math.random().toString(36).slice(2, 11),
      input: requirementBrief,
      metadata: { objectiveCount: requirementBrief.objectives.length },
    })

    // Run base ArchitectureReviewAgent
    const baseReview = await super.run(requirementBrief)

    // Post-processing: Inject SOX compliance assessment
    const enhancedReview = this.injectSoxCompliance(baseReview, requirementBrief)

    // Notify listeners of compliance injection
    await this.hooks.executeHooks('stage:after', {
      stage: 'finance-compliance-check',
      traceId: 'trace-' + Math.random().toString(36).slice(2, 11),
      spanId: 'span-' + Math.random().toString(36).slice(2, 11),
      output: enhancedReview,
      metadata: { complianceInjected: true },
    })

    return enhancedReview
  }

  private injectSoxCompliance(
    review: ArchitectureReview,
    brief: RequirementBrief,
  ): ArchitectureReview {
    const isSoxRelevant = this.isSoxRelevant(brief)

    if (!isSoxRelevant) {
      return review
    }

    // Add SOX-specific recommendations
    const sox: string[] = [
      'Enable audit logging for all financial data access',
      'Implement role-based access control (RBAC) for sensitive operations',
      'Document all changes to financial systems with complete chain of custody',
      'Ensure data retention policies comply with SOX 404 requirements',
      'Conduct security assessment on any third-party integrations',
    ]

    return {
      ...review,
      recommendations: [...(review.recommendations || []), ...sox],
    }
  }

  private isSoxRelevant(brief: RequirementBrief): boolean {
    const keywords = /financial|payment|accounting|ledger|audit|compliance/i
    const briefText = JSON.stringify(brief).toLowerCase()
    return keywords.test(briefText)
  }
}
