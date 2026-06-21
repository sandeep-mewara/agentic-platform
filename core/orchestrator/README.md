# Orchestrators

Runtime execution for PDLC stages with embedded security, telemetry, and cost controls.

## Modules

### BaseOrchestrator
Runs a single stage with:
1. **Pre-stage hook** — `stage:before` event
2. **Security scan** — SecurityScanner checks prompt for PII, injection patterns
3. **LLM call** — Delegates to LLMProvider.complete()
4. **Telemetry** — Emits TraceEvent spans (security scan, LLM call)
5. **Cost tracking** — Records token spend by stage
6. **Post-stage hook** — `stage:after` event

```typescript
async runStage(input: StageInput): Promise<StageOutput>
```

Throws on security violations or LLM errors.

### ConvergedAgentOrchestrator extends BaseOrchestrator
Runs the complete 5-stage PDLC pipeline:

1. **Stage 1: Requirements Analysis** → RequirementBrief
   - Prompt: "Analyze feature request, produce RequirementBrief JSON"
   - Parse and validate output against RequirementBriefSchema

2. **Stage 2: Architecture Review** → ArchitectureReview
   - Prompt: "Review requirement brief for architectural concerns"
   - Input: RequirementBrief from Stage 1

3. **Stage 3: Planning** → ImplementationPlan
   - Prompt: "Create implementation plan"
   - Input: RequirementBrief + ArchitectureReview

4. **Stage 4: Testing** → TestPlan
   - Prompt: "Create comprehensive test plan"
   - Input: ImplementationPlan

5. **HITL Gate** (auto-approve in demo)
   - Requests human approval (mock: auto-APPROVED)

6. **Stage 5: Release Readiness** → ReleaseReadinessReport
   - Prompt: "Assess release readiness"
   - Input: TestPlan + all previous stages

Each stage is run through BaseOrchestrator.runStage(), ensuring unified telemetry, security, and cost tracking.

## Article Section

Maps to **Orchestration & Stage Coordination** section. The orchestrators embody the article's principle that:

- **Orchestration centralizes cross-cutting concerns:** All stages run through BaseOrchestrator, which owns security, telemetry, cost controls, hooks
- **Agents are side-effect free:** Each capability just produces output; orchestrator manages lifecycle
- **Extensibility via hooks:** Product teams hook into `stage:before`, `stage:after`, `stage:error` without modifying orchestrator code

## Usage

```typescript
import { ConvergedAgentOrchestrator } from '@core/orchestrator/ConvergedAgentOrchestrator'
import { getLLMProvider, TraceEmitter, HookRegistry, SpendTracker } from '@core'

const orchestrator = new ConvergedAgentOrchestrator(
  getLLMProvider(),
  new TraceEmitter(),
  new HookRegistry(),
  new SpendTracker(),
)

const output = await orchestrator.runPDLC({
  featureRequest: 'Add user authentication',
})

console.log(output.releaseReadinessReport.overallStatus) // e.g., APPROVED
```

## Trace & Cost Access

```typescript
const trace = orchestrator.getTrace() // OperationTrace with all spans
const spend = orchestrator.getSpendSummary() // {total, byStage, byAgent}
```
