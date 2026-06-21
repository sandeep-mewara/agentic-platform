import { z } from 'zod'

export enum SpanKind {
  INTERNAL = 'INTERNAL',
  LLM_CALL = 'LLM_CALL',
  HOOK_EXECUTION = 'HOOK_EXECUTION',
  SECURITY_SCAN = 'SECURITY_SCAN',
  PYTHON_SUBPROCESS = 'PYTHON_SUBPROCESS',
}

export const SpanContextSchema = z.object({
  traceId: z.string().describe('Unique trace identifier for a PDLC run'),
  spanId: z.string().describe('Unique span identifier within trace'),
  parentSpanId: z.string().optional().describe('Parent span if nested'),
  timestamp: z.number().describe('Unix timestamp (ms) when span started'),
  durationMs: z.number().describe('Span duration in milliseconds'),
})

export type SpanContext = z.infer<typeof SpanContextSchema>

export const TraceEventSchema = z.object({
  spanContext: SpanContextSchema,
  kind: z.nativeEnum(SpanKind),
  stage: z.string().describe('PDLC stage name or lifecycle event'),
  status: z.enum(['SUCCESS', 'FAILURE', 'PENDING']),
  message: z.string().optional().describe('Human-readable event summary'),
  metadata: z.record(z.unknown()).optional().describe('Stage-specific metadata'),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }).optional(),
})

export type TraceEvent = z.infer<typeof TraceEventSchema>

export const OperationTraceSchema = z.object({
  traceId: z.string(),
  startTime: z.number().describe('PDLC run start time (Unix ms)'),
  endTime: z.number().optional().describe('PDLC run end time (Unix ms)'),
  spans: z.array(TraceEventSchema).describe('All spans recorded during PDLC run'),
  summary: z.object({
    totalSpans: z.number(),
    spansByKind: z.record(z.number()),
    spansByStatus: z.record(z.number()),
  }).optional(),
})

export type OperationTrace = z.infer<typeof OperationTraceSchema>
