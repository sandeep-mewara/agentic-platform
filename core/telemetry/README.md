# Telemetry

Observability through span collection and trace assembly.

## Modules

### TraceEmitter
Records all events (LLM calls, security scans, hook executions) as spans within a trace.

```typescript
const trace = new TraceEmitter()

// Create span context (auto-assigns traceId, spanId)
const spanContext = trace.createSpanContext(parentSpanId)

// Record a span
trace.recordSpan(
  'requirements-analysis',
  SpanKind.LLM_CALL,
  'SUCCESS',
  spanContext,
  'LLM returned valid JSON',
  { model: 'mock', tokenCount: 1200 },
)

// Get assembled trace
const operationTrace = trace.getTrace()
// {
//   traceId: '...',
//   startTime: 1234567890,
//   endTime: 1234567900,
//   spans: [...],
//   summary: {
//     totalSpans: 42,
//     spansByKind: { LLM_CALL: 5, SECURITY_SCAN: 5, ... },
//     spansByStatus: { SUCCESS: 40, FAILURE: 2, ... }
//   }
// }
```

**Span kinds:**
- `INTERNAL` — Logical operations
- `LLM_CALL` — Language model completion
- `HOOK_EXECUTION` — Lifecycle hook execution
- `SECURITY_SCAN` — Security scanning
- `PYTHON_SUBPROCESS` — Python agent execution

## Article Section

Maps to **Telemetry & Observability** section. TraceEmitter:

- **Records all observable events** — Every LLM call, security scan, hook gets a span with timing
- **Enables debugging** — Full execution trace for post-mortem analysis
- **Powers audit** — Trace IDs link to HITL decisions, compliance logs, cost reports
- **Non-invasive** — No agent code needed to emit events; orchestrator owns telemetry

## Usage

```typescript
import { TraceEmitter } from '@core/telemetry/TraceEmitter'
import { SpanKind } from '@contracts/trace/schema'

const emitter = new TraceEmitter()
const spanCtx = emitter.createSpanContext()

emitter.recordSpan(
  'architecture-review',
  SpanKind.LLM_CALL,
  'SUCCESS',
  spanCtx,
  'Architecture review completed',
)

const trace = emitter.getTrace()
console.log(`Total spans: ${trace.summary.totalSpans}`)
console.log(`LLM calls: ${trace.summary.spansByKind['LLM_CALL']}`)
```
