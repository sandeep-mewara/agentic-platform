# Extension: FinanceComplianceAgent

## Role
Extends ArchitectureReviewAgent to inject SOX (Sarbanes-Oxley) compliance checks into architecture reviews for financial systems.

## Extensibility Pattern
Demonstrates native TypeScript extensibility:

```typescript
class FinanceComplianceAgent extends ArchitectureReviewAgent {
  async run(requirementBrief) {
    // Pre-flight: SOX relevance check via hooks
    await this.hooks.executeHooks('stage:before', {...})
    
    // Run base ArchitectureReviewAgent
    const baseReview = await super.run(requirementBrief)
    
    // Post-process: Inject SOX recommendations
    const enhanced = this.injectSoxCompliance(baseReview, requirementBrief)
    
    // Post-flight: Notify listeners
    await this.hooks.executeHooks('stage:after', {...})
    
    return enhanced
  }
}
```

## How It Works

1. **Detection**: Scans RequirementBrief for keywords (financial, payment, accounting, ledger, audit, compliance)
2. **Base Review**: Calls parent ArchitectureReviewAgent.run() for standard architecture review
3. **Enhancement**: If SOX-relevant, injects domain-specific recommendations:
   - Enable audit logging for all financial data access
   - Implement RBAC for sensitive operations
   - Document all system changes with chain of custody
   - Ensure data retention per SOX 404
   - Conduct security assessment on third-party integrations
4. **Notification**: Fires hooks to notify orchestrator of compliance injection

## Integration with Orchestrator

When used in ConvergedAgentOrchestrator:

```typescript
const orchestrator = new ConvergedAgentOrchestrator(
  llm,
  new FinanceComplianceAgent(llm, hooks)  // override base agent
)
```

The orchestrator treats FinanceComplianceAgent as the ArchitectureReviewAgent, running it in stage 2. Hook subscribers receive notifications of compliance checks.

## Hooks Fired

- `stage:before` with context `{ stage: 'finance-compliance-check' }`
- `stage:after` with context `{ stage: 'finance-compliance-check', complianceInjected: true }`

## Article Section

Maps to **Extensibility & Domain Overrides** section of the article. Demonstrates how product teams can:
1. Extend base capabilities without modifying core code
2. Inject domain-specific validation and recommendations
3. Integrate with orchestrator hooks for observability

## Type Safety

- Extends ArchitectureReviewAgent (inherits type safety)
- Override run() preserves input/output types
- No runtime validation needed (Zod schemas from base)

## Testing

Test pattern:
```typescript
const agent = new FinanceComplianceAgent(mockLLM, mockHooks)
const review = await agent.run(requirementBriefWithFinancialKeywords)

// Assertions:
// - Base architecture review produced
// - SOX recommendations injected
// - Hooks called with correct stage names
// - overallAssessment preserved or enhanced
```
