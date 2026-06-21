# Agentic Platform Starter Kit: TypeScript Basic

Get up and running with the agentic platform in 5 minutes.

**Target:** Teams new to the platform, want to see it in action fast.

---

## What's Included

- Minimal TypeScript setup (100 lines of code)
- Pre-configured LLM provider (MockLLMProvider for demo, ClaudeLLMProvider for production)
- Single PDLC pipeline run with output inspection
- Configuration template (.env.example)
- Full type safety with Zod validation

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Your Environment

Copy the environment template:

```bash
cp .env.example .env
```

Edit `.env` and set your LLM provider:

```
ANTHROPIC_API_KEY=your-api-key-here
LLM_PROVIDER=claude
LOG_LEVEL=info
COST_BUDGET_USD=10
```

**Note:** This demo uses `MockLLMProvider` by default (deterministic, no API key needed). To use real Claude, set `ANTHROPIC_API_KEY` and the code will switch to `ClaudeLLMProvider`.

### 3. Run the Demo

```bash
npm run demo
```

You'll see output like:

```
=== Agentic Platform Starter Kit (Basic) ===
This demonstrates the minimal quickstart for the platform

✓ LLM Provider initialized (MockLLMProvider)
✓ Platform services initialized (tracer, budget, hooks)
✓ Orchestrator created

Running PDLC Pipeline:
  Input: "Add OAuth 2.0 authentication to the API"

✓ PDLC Pipeline completed

=== Pipeline Output ===
Status: APPROVED
Cost: $0.00
Artifacts produced: 5

=== Stage Outputs ===
requirements: ✓ completed
architecture: ✓ completed
planning: ✓ completed
testing: ✓ completed
release-readiness: ✓ completed

=== Audit Log ===
Entries recorded: 15
First entry: 2024-06-21T10:30:00.000Z

✓ Demo completed successfully
```

---

## What's Happening?

The demo runs the **PDLC pipeline** (5-stage feature development lifecycle):

1. **Requirements Stage** → Converts feature request into structured requirements
2. **Architecture Stage** → Reviews architectural concerns
3. **Planning Stage** → Creates implementation plan
4. **Testing Stage** → Generates test strategy
5. **Release Readiness** → Assesses readiness to ship

All stages run with:
- **Security scanning** (prompt injection detection)
- **Cost tracking** (token accounting)
- **Audit logging** (immutable trail)
- **Governance** (policy enforcement, compliance checks)

The baseline orchestrator handles all of this automatically. Your code just provides:
- Feature request
- LLM provider
- Custom hooks (optional)

---

## Next Steps

### Option 1: Modify the Demo

Edit `src/index.ts` to try different feature requests:

```typescript
const featureRequest = featureRequestSchema.parse({
  featureRequest: 'Add rate limiting to the API',
  context: {
    team: 'Backend Team',
    product: 'API Gateway',
    domain: 'Performance'
  }
})
```

Run again:

```bash
npm run demo
```

### Option 2: Add Custom Logic with Hooks

Register a domain-specific hook (runs after a stage completes):

```typescript
// In src/index.ts, after orchestrator creation:
hooks.register('stage:architecture:post', async (context) => {
  const { output } = context
  logger.info('✓ Architecture review custom hook executed')
  // Your domain logic here
})
```

### Option 3: Use Real LLM Provider

Set your API key in `.env`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Then replace MockLLMProvider with ClaudeLLMProvider:

```typescript
import { ClaudeLLMProvider } from '@core/llm/ClaudeLLMProvider'

const llm = new ClaudeLLMProvider({ 
  apiKey: process.env.ANTHROPIC_API_KEY! 
})
```

---

## Key Concepts

### Orchestrator

The `ConvergedAgentOrchestrator` wires together:
- **LLM provider** (Claude, GPT-4, etc.)
- **Tracer** (records decision trace)
- **Budget tracker** (limits token spend)
- **Hook registry** (extension points)

You pass these to the orchestrator; it handles the rest.

### PDLC Pipeline

5-stage feature development lifecycle:

```
Feature Request
    ↓
[RequirementsAgent] → RequirementBrief
    ↓
[ArchitectureReviewAgent] → ArchitectureReview
    ↓
[PlanningAgent] → ImplementationPlan
    ↓
[TestingAgent] → TestPlan
    ↓
[HITL Gate] (human approval)
    ↓
[ReleaseReadinessAgent] → ReleaseReadinessReport
    ↓
Output: artifacts + audit log + trace + cost report
```

### Contracts (Zod Schemas)

All data flowing through the pipeline is validated with Zod schemas:

```typescript
import { requirementBriefSchema } from '@contracts/artifacts/RequirementBriefSchema'

const validated = requirementBriefSchema.parse(data)
```

This ensures type safety at boundaries.

---

## Troubleshooting

### "Module not found" errors

The `tsconfig.json` has path aliases (`@contracts/*`, `@core/*`). Make sure you're running from the project root:

```bash
npm run demo
```

Not from the starter-kits directory.

### "Cannot find LLM provider"

If you get this error, check your `.env` file:
- `LLM_PROVIDER` should be `claude` or `mock`
- If using `claude`, `ANTHROPIC_API_KEY` must be set

### "Cost budget exceeded"

The demo has a budget of $10 USD. If you're using real Claude, costs accumulate. Reduce budget in `.env`:

```
COST_BUDGET_USD=1
```

---

## Moving Beyond Basic

Once you're comfortable with this kit:

1. **Read the full architecture** — `docs/architecture/README.md`
2. **Try the full kit** — `starter-kits/typescript-full/` (production setup)
3. **Integrate into your product** — `docs/runbooks/progressive-adoption.md`
4. **Register domain hooks** — `core/hooks/HookRegistry.ts`

---

## Common Questions

**Q: Can I customize the PDLC stages?**
A: Not in the basic kit. In the full kit, you can use hooks to inject custom logic at each stage.

**Q: What if I want to use a different LLM?**
A: Implement the `LLMProvider` interface and pass it to the orchestrator. See `core/llm/` for examples.

**Q: Do I need to understand all 5 stages?**
A: Not for this demo. The orchestrator handles the complexity. But read the architecture guide for details.

**Q: Can I run this in production?**
A: This kit is for learning. For production, use the full kit (`starter-kits/typescript-full/`) with error handling, logging, and domain hooks.

---

## Related Documentation

- [Platform Architecture](../../docs/architecture/README.md)
- [Progressive Adoption Runbook](../../docs/runbooks/progressive-adoption.md)
- [New Team Onboarding](../../docs/onboarding/README.md)
- [Full Starter Kit](../typescript-full/README.md)

---

## Next: Try the Full Kit

Once you're comfortable here, move to the **TypeScript Full** kit for production-ready setup with hooks and error handling.

See: `starter-kits/typescript-full/`
