# Cost Controls

Token budget enforcement and spend tracking.

## Modules

### TokenBudget
Per-request token limit enforcement.

```typescript
const budget = new TokenBudget(10000) // max 10k tokens

const spent = 2500
if (!budget.isWithinBudget(spent)) {
  throw new Error('Request exceeds token budget')
}
const remaining = budget.getRemainingTokens(spent) // 7500
```

**Use case:** Fail fast if a single request would exceed cost limits.

### SpendTracker
Session-level token spend accumulation and breakdown.

```typescript
const tracker = new SpendTracker()

tracker.recordSpend(250, 'requirements-analysis', 'RequirementsAgent')
tracker.recordSpend(300, 'architecture-review', 'ArchitectureReviewAgent')
tracker.recordSpend(280, 'requirements-analysis', 'AnotherAgent')

const summary = tracker.getBreakdown()
// {
//   total: 830,
//   byStage: {
//     'requirements-analysis': 530,
//     'architecture-review': 300
//   },
//   byAgent: {
//     'RequirementsAgent': 250,
//     'ArchitectureReviewAgent': 300,
//     'AnotherAgent': 280
//   }
// }
```

**Use cases:**
- Report per-stage token costs
- Alert if session spend exceeds threshold
- Disable expensive stages if budget low
- Optimize LLM provider choice based on cost

## Article Section

Maps to **Cost Controls & Budget** section. The pattern enables:

- **Request-level limits:** TokenBudget prevents runaway single prompts
- **Session-level visibility:** SpendTracker shows cost breakdown by stage and agent
- **Graceful degradation:** Product teams can disable expensive stages or switch to cheaper models if budget running low

## Usage

```typescript
import { TokenBudget, SpendTracker } from '@core/cost-controls/budget'

const budget = new TokenBudget(50000)
const tracker = new SpendTracker()

// Simulate stage execution
const estimatedTokens = 2500
if (!budget.isWithinBudget(estimatedTokens)) {
  console.log('Cannot afford next stage')
  process.exit(1)
}

tracker.recordSpend(estimatedTokens, 'requirements-analysis')

const summary = tracker.getBreakdown()
console.log(`Session spend: ${summary.total}/${50000} tokens`)
```

## Integration with BaseOrchestrator

BaseOrchestrator automatically tracks token spend:
```typescript
// In BaseOrchestrator.runStage():
const estimatedTokens = Math.ceil(input.prompt.length / 4) + Math.ceil(result.length / 4)
this.spendTracker.recordSpend(estimatedTokens, input.stage)
```

Estimation: ~1 token per 4 characters (approximation).
