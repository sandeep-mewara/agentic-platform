import { z } from 'zod'

export const AgentMetadataSchema = z.object({
  agentId: z.string().describe('Unique agent identifier'),
  agentName: z.string().describe('Human-readable agent name'),
  capability: z.string().describe('Capability this agent exercises'),
  version: z.string().describe('Agent version'),
  owner: z.string().optional().describe('Team or person owning this agent'),
})

export type AgentMetadata = z.infer<typeof AgentMetadataSchema>

export const AgentRequestSchema = z.object({
  id: z.string().describe('Unique request identifier'),
  agentMetadata: AgentMetadataSchema,
  input: z.unknown().describe('Agent-specific input artifact'),
  context: z.record(z.unknown()).optional().describe('PDLC stage context'),
  traceId: z.string().describe('Trace ID for audit linkage'),
  spanId: z.string().describe('Span ID for telemetry'),
  timestamp: z.number().describe('Request timestamp (Unix ms)'),
})

export type AgentRequest = z.infer<typeof AgentRequestSchema>

export const AgentResponseSchema = z.object({
  id: z.string().describe('Request ID this response answers'),
  agentId: z.string(),
  output: z.unknown().describe('Agent-produced artifact'),
  status: z.enum(['SUCCESS', 'FAILURE']),
  message: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    stackTrace: z.string().optional(),
  }).optional(),
  timestamp: z.number().describe('Response timestamp (Unix ms)'),
})

export type AgentResponse = z.infer<typeof AgentResponseSchema>
