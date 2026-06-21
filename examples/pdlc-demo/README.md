# PDLC Demo: Complete End-to-End Example

Runnable demonstration of the full 5-stage Product Development Lifecycle (PDLC) pipeline.

## What It Does

Executes a feature request through all 5 stages and displays:
1. **Stage outputs** — What each stage produces
2. **Trace records** — Execution timeline with timestamps
3. **Cost tracking** — Token usage per stage
4. **Hook execution** — When hooks fire
5. **Audit log** — Immutable record of decisions
6. **Scorecard** — Quality metrics (quality score, cost, latency)

## Running the Demo

### Quick Start (Default: Mock LLM)
```bash
npm run demo
```

No API key needed. Uses MockLLMProvider with deterministic responses.

### With Real Claude
```bash
export ANTHROPIC_API_KEY=sk-...
export LLM_PROVIDER=claude
npm run demo
```

Requires valid Claude API key.

### With Python Extension
```bash
npm run demo:polyglot
```

Forces Python subprocess (tax validation). Fails clearly if Python 3.9+ not available.

## What to Observe

### Stage Outputs
```
[PDLC] Stage 1/5: Requirements Analysis
  → RequirementBrief: objectives, constraints, risks, estimated effort

[PDLC] Stage 2/5: Architecture Review
  → ArchitectureReview: assessment, security concerns, recommendations

[PDLC] Stage 3/5: Planning
  → ImplementationPlan: phases, approach, timeline

[PDLC] Stage 4/5: Testing
  → TestPlan: test cases, coverage goal

[HITL] Approval requested → APPROVED (mock)

[PDLC] Stage 5/5: Release Readiness
  → ReleaseReadinessReport: status (APPROVED), summary
```

### Telemetry
```
Trace spans recorded: 15        ← Every action tracked
Total tokens spent: ~3,400      ← Cost per feature
Cost budget remaining: unlimited ← Spending tracked
```

### Hook Execution
Registered hooks fire at each stage:
- Finance hooks (if registered)
- Healthcare hooks (if registered)
- Tax validation (Python)
- Custom hooks

### Final Status
```
ReleaseReadinessReport: APPROVED ← Feature is production-ready
```

## Customization

### Change Feature Request
Edit `run.ts`:
```typescript
const featureRequest = "Your feature request here"
```

### Use Real LLM Provider
```typescript
import { ClaudeLLMProvider } from '@core/llm'

const llm = new ClaudeLLMProvider(process.env.ANTHROPIC_API_KEY)
```

### Register Domain-Specific Hooks
```typescript
import { registerFinanceHooks } from '../../examples/finance-compliance/src/hooks'

registerFinanceHooks(hooks)
```

### Add Custom Logic
Register hooks before running pipeline:
```typescript
hooks.registerHook('stage:after', async (context) => {
  if (context.stage === 'architecture-review') {
    console.log('Custom hook: checking your constraint')
  }
})
```

## File Structure

```
examples/pdlc-demo/
├── run.ts              ← Entry point (npm run demo)
└── README.md           ← This file
```

## What's Happening Behind the Scenes

```
Input: FeatureRequest
  ↓
[Security] Scan for PII, prompt injection
  ↓
[Telemetry] Start trace, create span
  ↓
[LLM] Call Claude/Mock with stage prompt
  ↓
[Validation] Parse response, validate against Zod schema
  ↓
[Cost] Track tokens spent
  ↓
[Hooks] Execute registered hooks
  ↓
[Audit] Log the decision
  ↓
Output: Stage artifact (RequirementBrief, etc.)
```

This repeats for all 5 stages. At Stage 4, HITL gate requires approval before Stage 5.

## Wave

**Wave:** 11 (Examples)  
**Related:** [Wave 11: Examples](../../docs/DESIGN.md#wave-11-examples--reference-implementations)

## Next Steps

1. **Run the demo** — See the pipeline in action
2. **Read the output** — Understand each stage
3. **Modify the input** — Try different feature requests
4. **Add hooks** — Register custom logic
5. **Read the code** — `run.ts` shows how to orchestrate

## Related

- [Main README](../../README.md) — Quick start
- [Platform Design](../../docs/DESIGN.md) — Understand Waves 1-12
- [Progressive Adoption](../../docs/runbooks/progressive-adoption.md) — How to adopt baseline
- [Other Examples](../) — Finance, Healthcare, ML examples
