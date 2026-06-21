# Agentic Platform Starter Kit: TypeScript Full

Production-ready setup for integrating the agentic platform into your product.

**Target:** Teams building production services, need customization hooks, error handling, and observability.

---

## What's Included

- Full orchestrator wiring with all platform services
- Platform hooks (observability, cost tracking, error handling)
- Domain-specific hook examples (compliance, security, cost, business logic)
- Error handling and graceful degradation
- Environment-based LLM provider selection
- Cost tracking and budget enforcement
- Full type safety with Zod validation

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
# LLM Provider
ANTHROPIC_API_KEY=your-api-key-here
LLM_PROVIDER=claude

# Platform Configuration
COST_BUDGET_USD=100
LOG_LEVEL=info
NODE_ENV=development
```

### 3. Run the Demo

```bash
npm run demo
```

Output:

```
=== Agentic Platform Starter Kit (Full) ===
Production-ready setup with hooks and error handling

Using MockLLMProvider (deterministic demo)
✓ TraceEmitter initialized (service: starter-full)
✓ SpendTracker initialized (budget: $100)
✓ HookRegistry initialized
✓ ConvergedAgentOrchestrator created

✓ All domain hooks registered

Initialization complete. Starting PDLC pipeline...

Feature: "Add API rate limiting to prevent abuse"

=== Pipeline Results ===
Status: APPROVED
Total Cost: $0.0000
Tokens Used: 0
Artifacts: 5 produced
  - requirements: reqreq-001
  - architecture: arch-001
  - plan: plan-001
  - tests: tests-001
  - release: release-001
Audit Entries: 15

✓ Pipeline execution successful
```

---

## Architecture

### File Structure

```
src/
  main.ts           ← Entry point (orchestrator setup, hook registration, pipeline execution)
  orchestrator.ts   ← LLMProvider selection, service wiring, platform hook registration
  hooks.ts          ← Domain-specific hooks (compliance, security, cost, business logic)
```

### Data Flow

```
main.ts
  ↓
selectLLMProvider() → ClaudeLLMProvider or MockLLMProvider
  ↓
createFullOrchestrator(llm) → ConvergedAgentOrchestrator + all services
  ↓
registerPlatformHooks(hooks) → observability, cost, error handling
  ↓
registerAllDomainHooks(hooks) → your business logic
  ↓
orchestrator.runPDLC(featureRequest) → 5-stage pipeline
  ↓
result → status, artifacts, audit log, cost report
```

---

## Key Components

### 1. orchestrator.ts

Creates the full orchestrator with all platform services:

```typescript
const orchestrator = createFullOrchestrator(llm, {
  serviceName: 'my-service',
  budgetUSD: 100,
  logLevel: 'info'
})
```

**Services wired automatically:**
- **TraceEmitter** — Records decision trace (observability)
- **SpendTracker** — Tracks token spend (cost control)
- **HookRegistry** — Extension points (customization)

### 2. Platform Hooks

Registered in `registerPlatformHooks()`. These run automatically:

- `lifecycle:start` — Pipeline started
- `lifecycle:end` — Pipeline completed
- `stage:post` — After each stage (cost tracking)
- `error:stage` — On stage failure

Example: Automatic cost tracking after each stage.

### 3. Domain Hooks

Define in `hooks.ts`. Examples include:

- **Compliance** — Validate against policies
- **Security** — Check for PII, injection risks
- **Cost** — Enforce budget constraints
- **Business Logic** — Validate against product requirements

Register in `registerAllDomainHooks()`:

```typescript
hooks.register('stage:architecture:post', validateSecurityHook)
hooks.register('stage:release-readiness:pre', validateCostHook)
```

---

## Customization Patterns

### Pattern 1: Add a Compliance Hook

```typescript
// In hooks.ts
export async function validateFinanceComplianceHook(context: HookContext): Promise<void> {
  const { output } = context
  
  // Call your compliance API
  const result = await checkFinanceCompliance(output)
  
  if (!result.passed) {
    output.blockers = output.blockers || []
    output.blockers.push({
      id: 'finance-compliance-failed',
      category: 'compliance',
      description: result.errors.join('; ')
    })
  }
}

// In registerAllDomainHooks()
hooks.register('stage:release-readiness:pre', validateFinanceComplianceHook)
```

### Pattern 2: Conditional Hook Registration

```typescript
// Register hooks based on feature flags
registerConditionalHooks(hooks, {
  compliance: process.env.ENABLE_COMPLIANCE === 'true',
  security: process.env.ENABLE_SECURITY === 'true',
  cost: process.env.ENABLE_COST_CHECKS === 'true'
})
```

### Pattern 3: Enrich Output with Metadata

```typescript
hooks.register('lifecycle:end', async (context) => {
  const { output } = context
  output.metadata = output.metadata || {}
  output.metadata.processedAt = new Date().toISOString()
  output.metadata.team = 'my-team'
  output.metadata.version = '1.0.0'
})
```

### Pattern 4: Custom Error Handling

```typescript
hooks.register('error:stage', async (context) => {
  const error = context.error as Error
  
  // Log to your error tracking service
  await logErrorToSentry({
    message: error.message,
    stage: context.stage,
    timestamp: new Date()
  })
  
  // Send alert
  await notifyOnCall({
    severity: 'high',
    message: `PDLC stage ${context.stage} failed`
  })
})
```

---

## Production Patterns

### Error Handling

```typescript
try {
  const result = await orchestrator.runPDLC(featureRequest)
  // Process result
} catch (error) {
  logger.error('Pipeline failed', { error })
  // Recovery logic: retry, fallback, escalate, etc.
}
```

### Cost Control

Environment-based budget:

```typescript
const budgetUSD = Number(process.env.COST_BUDGET_USD || '100')
```

SpendTracker enforces hard limit:

```typescript
// If budget exceeded, pipeline stops automatically
```

### Observability

TraceEmitter records all decisions:

```typescript
// Traces are batched and flushed periodically
// Query traces for debugging, metrics, audit
const traces = await tracer.query({ serviceName: 'my-service' })
```

---

## Advanced Scenarios

### Scenario 1: Multi-Team Setup

Each team registers domain-specific hooks:

```typescript
// Finance team
registerConditionalHooks(hooks, { compliance: true })

// Security team
registerConditionalHooks(hooks, { security: true })

// FinOps team
registerConditionalHooks(hooks, { cost: true })
```

### Scenario 2: A/B Testing Workflows

Register alternative hooks based on experiment:

```typescript
if (isInExperiment('new-security-rules')) {
  hooks.register('stage:architecture:post', newSecurityHook)
} else {
  hooks.register('stage:architecture:post', legacySecurityHook)
}
```

### Scenario 3: Graceful Degradation

Make hooks non-blocking:

```typescript
hooks.register('stage:post', async (context) => {
  try {
    await validateOptionalComplianceRules(context)
  } catch (error) {
    logger.warn('Compliance validation failed, continuing', { error })
    // Don't block pipeline if hook fails
  }
})
```

---

## Troubleshooting

### "Module not found" errors

The `tsconfig.json` uses path aliases. Run from project root:

```bash
npm run demo
```

### Cost budget exceeded

SpendTracker enforces `hardLimit: true`. Pipeline stops if exceeded.

Increase budget:

```env
COST_BUDGET_USD=500
```

Or debug cost:

```typescript
logger.info('Cost so far', {
  spent: budget.spent(),
  remaining: budget.remaining(),
  limit: budget.budgetUSD
})
```

### Hooks not running

Verify registration order:

1. Create orchestrator
2. Get hooks from orchestrator
3. Register hooks
4. Run pipeline

```typescript
const orchestrator = createFullOrchestrator(llm)
const hooks = orchestrator.hooks  // ← Must get from orchestrator
registerAllDomainHooks(hooks)     // ← Then register
await orchestrator.runPDLC(...)   // ← Then run
```

---

## Moving to Production

### Checklist

- [ ] Replace MockLLMProvider with real Claude
- [ ] Implement domain-specific hooks
- [ ] Add error handling and recovery
- [ ] Set up monitoring/alerting
- [ ] Configure cost budgets
- [ ] Load-test the pipeline
- [ ] Test graceful degradation

### Monitoring

Track these metrics:

```
- Pipeline success rate (%)
- Average latency (ms)
- Total cost per request ($)
- Tokens per stage
- Hook execution time (ms)
```

---

## Related Documentation

- [Platform Architecture](../../docs/architecture/README.md)
- [Progressive Adoption Runbook](../../docs/runbooks/progressive-adoption.md)
- [Hook Registry API](../../core/hooks/README.md)
- [Cost Control](../../core/cost-controls/README.md)
- [Telemetry & Tracing](../../core/telemetry/README.md)

---

## Next Steps

1. **Customize hooks** — Edit `hooks.ts` with your business logic
2. **Add monitoring** — Integrate with your observability stack
3. **Test with real LLM** — Switch to `ClaudeLLMProvider`
4. **Deploy** — Run in your environment with domain hooks
5. **Iterate** — Monitor metrics, refine hooks, improve quality

---

## FAQ

**Q: Can I modify the core orchestrator?**
A: No. Use hooks instead. They're designed for this.

**Q: What if I need a different PDLC structure?**
A: Use hooks to inject custom logic at each stage. For major workflow changes, build on top of the orchestrator.

**Q: How do I debug hook execution?**
A: Check logs (set `LOG_LEVEL=debug`). Hooks log their execution.

**Q: Can multiple teams use the same instance?**
A: Yes. Each team registers its own hooks. They run in sequence.

**Q: What if a hook fails?**
A: By default, it blocks the pipeline. Use try-catch in hooks to make them non-blocking.

**Q: How do I roll back a hook?**
A: Unregister it:

```typescript
hooks.unregister('stage:architecture:post', myHook)
```

---

See the **Basic Kit** for an even simpler starting point: `starter-kits/typescript-basic/`
