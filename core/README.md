# Core Runtime

The runtime layer that executes PDLC stages with security, telemetry, cost controls, and extensibility.

## Modules

- **llm/** — LLM provider abstraction (MockLLMProvider, ClaudeLLMProvider)
- **orchestrator/** — BaseOrchestrator (single stage) and ConvergedAgentOrchestrator (full PDLC pipeline)
- **hooks/** — HookRegistry (lifecycle hooks), PythonAgentAdapter (polyglot execution)
- **telemetry/** — TraceEmitter (observability and audit)
- **security/** — SecurityScanner (PII detection, injection heuristics)
- **cost-controls/** — TokenBudget, SpendTracker (per-request and session cost tracking)
- **reliability/** — RetryPolicy, CircuitBreaker (resilience patterns)

## Article Section

Maps to **Core Runtime & Orchestration** section. The runtime owns:

1. **Orchestration:** ConvergedAgentOrchestrator runs the full PDLC pipeline, calling SecurityScanner before each LLM prompt, firing HookRegistry before/after stages, emitting TraceEvent per stage, and tracking token spend.
2. **Extensibility:** HookRegistry allows product teams to inject behavior at lifecycle events without modifying core code.
3. **Polyglot capability:** PythonAgentAdapter demonstrates how extensions can spawn subprocess agents using JSON stdin/stdout contracts.
4. **Observability:** TraceEmitter collects all spans (LLM calls, security scans, hook executions) for audit and debugging.

## Usage

```typescript
import {
  getLLMProvider,
  TraceEmitter,
  HookRegistry,
  SpendTracker,
  ConvergedAgentOrchestrator,
} from '@core'

const llm = getLLMProvider() // mock or claude based on LLM_PROVIDER env
const trace = new TraceEmitter()
const hooks = new HookRegistry()
const spend = new SpendTracker()

const orchestrator = new ConvergedAgentOrchestrator(llm, trace, hooks, spend)
const output = await orchestrator.runPDLC({ featureRequest: '...' })

console.log(output.releaseReadinessReport.overallStatus)
console.log(trace.getTrace())
console.log(spend.getBreakdown())
```

## Imports

```typescript
import {
  LLMProvider,
  MockLLMProvider,
  ClaudeLLMProvider,
  getLLMProvider,
} from '@core/llm'
import { TraceEmitter } from '@core/telemetry/TraceEmitter'
import { SecurityScanner } from '@core/security/SecurityScanner'
import { HookRegistry } from '@core/hooks/HookRegistry'
import { PythonAgentAdapter } from '@core/hooks/PythonAgentAdapter'
import { TokenBudget, SpendTracker } from '@core/cost-controls/budget'
import { RetryPolicy, CircuitBreaker } from '@core/reliability/retry'
import { BaseOrchestrator } from '@core/orchestrator/BaseOrchestrator'
import { ConvergedAgentOrchestrator } from '@core/orchestrator/ConvergedAgentOrchestrator'
```
