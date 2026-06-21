# Trace Contracts

Telemetry schemas for recording and reporting on PDLC execution.

## Schemas

### SpanContext
Unique identification and timing for a span within a trace. Used by all trace events.

- `traceId` — Unique trace ID for a PDLC run
- `spanId` — Unique span ID within trace
- `parentSpanId` — Parent span if nested
- `timestamp` — Unix timestamp (ms)
- `durationMs` — Span duration in milliseconds

### TraceEvent
A single observable event (LLM call, security scan, hook execution, etc.).

- `spanContext` — Timing and ID info
- `kind` — SpanKind enum (INTERNAL, LLM_CALL, HOOK_EXECUTION, SECURITY_SCAN, PYTHON_SUBPROCESS)
- `stage` — PDLC stage name or lifecycle event
- `status` — SUCCESS, FAILURE, PENDING
- `message` — Human-readable summary
- `metadata` — Stage-specific data
- `error` — Optional error details

### OperationTrace
Collection of all spans from a single PDLC run.

- `traceId`
- `startTime` — PDLC run start
- `endTime` — PDLC run end
- `spans` — All TraceEvent records
- `summary` — Aggregated counts by kind and status

## Article Section

Maps to **Telemetry & Cost Controls** section. TraceEmitter in `core/telemetry/TraceEmitter.ts` emits these contracts; all stages pass them to central registry for audit.

## Imports

```typescript
import { TraceEventSchema, SpanContextSchema, OperationTraceSchema } from '@contracts/trace/schema'
import { SpanKind } from '@contracts/trace/schema'
```
