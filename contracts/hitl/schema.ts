import { z } from 'zod'

export enum ApprovalStatus {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING',
}

export const HITLRequestSchema = z.object({
  requestId: z.string().describe('Unique HITL request identifier'),
  stage: z.string().describe('PDLC stage requesting approval'),
  traceId: z.string().describe('Associated trace ID for audit'),
  summary: z.string().describe('Human-readable summary of what requires approval'),
  context: z.record(z.unknown()).describe('Stage-specific context for decision making'),
  deadline: z.number().optional().describe('Unix timestamp (ms) when approval expires'),
  requiredApprovals: z.number().optional().default(1).describe('Number of approvals needed'),
})

export type HITLRequest = z.infer<typeof HITLRequestSchema>

export const HITLDecisionSchema = z.object({
  requestId: z.string().describe('References HITLRequest.requestId'),
  status: z.nativeEnum(ApprovalStatus),
  decidedAt: z.number().describe('Unix timestamp (ms) when decision was made'),
  decidedBy: z.string().describe('Identity of decision maker'),
  reason: z.string().optional().describe('Explanation for approval/rejection'),
  metadata: z.record(z.unknown()).optional().describe('Additional decision context'),
})

export type HITLDecision = z.infer<typeof HITLDecisionSchema>
