import { describe, it, expect } from 'vitest'
import { TraceEmitter } from '@core/telemetry/TraceEmitter'
import { SpanKind } from '@contracts/trace/schema'

describe('TraceEmitter', () => {
  it('should create a trace with unique ID', () => {
    const tracer = new TraceEmitter()
    const trace = tracer.getTrace()

    expect(trace.traceId).toBeDefined()
    expect(typeof trace.traceId).toBe('string')
    expect(trace.traceId.length).toBeGreaterThan(0)
  })

  it('should emit trace events via recordSpan', () => {
    const tracer = new TraceEmitter()
    const trace = tracer.getTrace()

    const spanContext = tracer.createSpanContext('span-1')

    expect(() => {
      tracer.recordSpan(
        'requirements-analysis',
        SpanKind.LLM_CALL,
        'SUCCESS',
        spanContext,
        'Test event',
      )
    }).not.toThrow()
  })

  it('should collect recorded spans in order', () => {
    const tracer = new TraceEmitter()

    const spanContext1 = tracer.createSpanContext('span-1')
    const spanContext2 = tracer.createSpanContext('span-2')

    tracer.recordSpan(
      'requirements-analysis',
      SpanKind.SECURITY_SCAN,
      'SUCCESS',
      spanContext1,
      'First event',
    )

    tracer.recordSpan(
      'requirements-analysis',
      SpanKind.LLM_CALL,
      'SUCCESS',
      spanContext2,
      'Second event',
    )

    const trace = tracer.getTrace()
    expect(trace.spans.length).toBe(2)
    expect(trace.spans[0].stage).toBe('requirements-analysis')
    expect(trace.spans[1].stage).toBe('requirements-analysis')
  })

  it('should include required fields in trace events', () => {
    const tracer = new TraceEmitter()
    const spanContext = tracer.createSpanContext('span-1')

    tracer.recordSpan(
      'architecture-review',
      SpanKind.LLM_CALL,
      'SUCCESS',
      spanContext,
      'Test message',
    )

    const trace = tracer.getTrace()

    expect(trace.spans[0]).toHaveProperty('stage')
    expect(trace.spans[0]).toHaveProperty('kind')
    expect(trace.spans[0]).toHaveProperty('status')
    expect(trace.spans[0]).toHaveProperty('spanContext')
    expect(trace.spans[0].spanContext).toHaveProperty('traceId')
    expect(trace.spans[0].spanContext).toHaveProperty('spanId')
  })

  it('should create unique trace IDs for different emitters', () => {
    const tracer1 = new TraceEmitter()
    const tracer2 = new TraceEmitter()

    const trace1 = tracer1.getTrace()
    const trace2 = tracer2.getTrace()

    expect(trace1.traceId).not.toBe(trace2.traceId)
  })

  it('should track multiple stages through lifecycle', () => {
    const tracer = new TraceEmitter()

    const stages = [
      'requirements-analysis',
      'architecture-review',
      'planning',
      'code-review',
      'release-readiness',
    ]

    stages.forEach((stage, idx) => {
      const spanContext = tracer.createSpanContext(`span-${idx}`)
      tracer.recordSpan(stage, SpanKind.LLM_CALL, 'SUCCESS', spanContext, `Stage: ${stage}`)
    })

    const trace = tracer.getTrace()
    expect(trace.spans.length).toBe(5)

    // Verify stages in order
    expect(trace.spans[0].stage).toBe('requirements-analysis')
    expect(trace.spans[1].stage).toBe('architecture-review')
    expect(trace.spans[2].stage).toBe('planning')
    expect(trace.spans[3].stage).toBe('code-review')
    expect(trace.spans[4].stage).toBe('release-readiness')
  })

  it('should capture span context with trace ID and span ID', () => {
    const tracer = new TraceEmitter()
    const traceId = tracer.getTrace().traceId

    const spanContext = tracer.createSpanContext('span-123-abc')

    expect(spanContext.traceId).toBe(traceId)
    expect(spanContext.spanId).toBe('span-123-abc')
  })

  it('should provide trace summary', () => {
    const tracer = new TraceEmitter()

    const spanContext = tracer.createSpanContext('span-1')
    tracer.recordSpan('requirements-analysis', SpanKind.INTERNAL, 'SUCCESS', spanContext, 'test')

    const trace = tracer.getTrace()
    expect(trace.summary).toBeDefined()
    if (trace.summary) {
      expect(trace.summary.totalSpans).toBe(1)
    }
  })

  it('should record span kinds', () => {
    const tracer = new TraceEmitter()

    const sc1 = tracer.createSpanContext('span-1')
    const sc2 = tracer.createSpanContext('span-2')
    const sc3 = tracer.createSpanContext('span-3')

    tracer.recordSpan('stage1', SpanKind.SECURITY_SCAN, 'SUCCESS', sc1, 'scan')
    tracer.recordSpan('stage2', SpanKind.LLM_CALL, 'SUCCESS', sc2, 'llm')
    tracer.recordSpan('stage3', SpanKind.INTERNAL, 'SUCCESS', sc3, 'internal')

    const trace = tracer.getTrace()
    expect(trace.spans[0].kind).toBe(SpanKind.SECURITY_SCAN)
    expect(trace.spans[1].kind).toBe(SpanKind.LLM_CALL)
    expect(trace.spans[2].kind).toBe(SpanKind.INTERNAL)
  })

  it('should record span status', () => {
    const tracer = new TraceEmitter()

    const sc1 = tracer.createSpanContext('span-1')
    const sc2 = tracer.createSpanContext('span-2')

    tracer.recordSpan('stage1', SpanKind.LLM_CALL, 'SUCCESS', sc1, 'success')
    tracer.recordSpan('stage2', SpanKind.LLM_CALL, 'FAILURE', sc2, 'failure')

    const trace = tracer.getTrace()
    expect(trace.spans[0].status).toBe('SUCCESS')
    expect(trace.spans[1].status).toBe('FAILURE')
  })
})
