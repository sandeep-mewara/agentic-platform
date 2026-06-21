import { TraceEvent, SpanContext, OperationTrace, SpanKind } from '@contracts/trace/schema'
import crypto from 'crypto'

export class TraceEmitter {
  private traceId: string
  private spans: TraceEvent[] = []
  private startTime: number

  constructor(traceId?: string) {
    this.traceId = traceId || crypto.randomUUID()
    this.startTime = Date.now()
  }

  emit(event: TraceEvent): void {
    this.spans.push(event)
  }

  createSpanContext(spanId?: string, parentSpanId?: string): SpanContext {
    return {
      traceId: this.traceId,
      spanId: spanId || crypto.randomUUID(),
      parentSpanId,
      timestamp: Date.now(),
      durationMs: 0,
    }
  }

  recordSpan(
    stage: string,
    kind: SpanKind,
    status: 'SUCCESS' | 'FAILURE' | 'PENDING',
    spanContext: SpanContext,
    message?: string,
    metadata?: Record<string, unknown>,
    error?: { code: string; message: string },
  ): void {
    const now = Date.now()
    const event: TraceEvent = {
      spanContext: {
        ...spanContext,
        durationMs: now - spanContext.timestamp,
      },
      kind,
      stage,
      status,
      message,
      metadata,
      error,
    }
    this.emit(event)
  }

  getTrace(): OperationTrace {
    const endTime = Date.now()
    const summary = this.computeSummary()
    return {
      traceId: this.traceId,
      startTime: this.startTime,
      endTime,
      spans: this.spans,
      summary,
    }
  }

  private computeSummary() {
    const spansByKind: Record<string, number> = {}
    const spansByStatus: Record<string, number> = {}

    for (const span of this.spans) {
      spansByKind[span.kind] = (spansByKind[span.kind] || 0) + 1
      spansByStatus[span.status] = (spansByStatus[span.status] || 0) + 1
    }

    return {
      totalSpans: this.spans.length,
      spansByKind,
      spansByStatus,
    }
  }

  getTraceId(): string {
    return this.traceId
  }
}
