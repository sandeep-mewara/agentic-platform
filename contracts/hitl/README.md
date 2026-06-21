# HITL (Human-in-the-Loop) Contracts

Approval request/decision contracts for human oversight gates in the PDLC.

## Schemas

### HITLRequest
Initiates a human approval request at a workflow gate.

- `requestId` — Unique request identifier
- `stage` — PDLC stage requesting approval (e.g., "release-readiness")
- `traceId` — Associated trace ID for audit
- `summary` — Human-readable summary of what needs approval
- `context` — Stage-specific data for decision making
- `deadline` — Unix timestamp (ms) when approval expires
- `requiredApprovals` — Number of approvals needed (default 1)

### HITLDecision
Response to a HITL request from a human (or mock) decision provider.

- `requestId` — References the HITLRequest.requestId
- `status` — ApprovalStatus enum (APPROVED, REJECTED, PENDING)
- `decidedAt` — Unix timestamp (ms)
- `decidedBy` — Identity of decision maker
- `reason` — Explanation for decision
- `metadata` — Additional context

### ApprovalStatus enum
- `APPROVED` — Request approved
- `REJECTED` — Request denied
- `PENDING` — Awaiting decision

## Article Section

Maps to **Governance & Compliance** section. In the PDLC demo flow, the HITL gate between Testing and ReleaseReadiness uses this contract. `MockDecisionProvider` in `core/` auto-approves for demo purposes; real deployments inject actual approval logic via HookRegistry.

## Imports

```typescript
import { HITLRequestSchema, HITLDecisionSchema, ApprovalStatus } from '@contracts/hitl/schema'
```
