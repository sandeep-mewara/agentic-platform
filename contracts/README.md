# Contracts

Zod schemas defining the contracts between PDLC stages and external systems.

## Folders

- **trace/** — Telemetry and observability contracts (TraceEvent, SpanContext, OperationTrace)
- **hitl/** — Human-in-the-loop approval contracts (HITLRequest, HITLDecision)
- **workflow/** — Workflow and stage lifecycle contracts (WorkflowStage, LifecycleState, StageTransition)
- **agent/** — Agent invocation contracts (AgentRequest, AgentResponse, AgentMetadata)
- **artifacts/** — PDLC output artifacts (RequirementBrief, ArchitectureReview, ImplementationPlan, TestPlan, ReleaseReadinessReport)

## Article Section

Maps to the **Converge capabilities, not implementations** principle in the article. These contracts define the shape of data flowing through the platform, ensuring:

- Capabilities can be implemented independently (different agents, languages)
- All data is validated at stage boundaries
- Observability and audit are built-in
- Extensibility happens via hooks, not schema mutation

## Imports

```typescript
import { TraceEventSchema } from '@contracts/trace/schema'
import { HITLRequestSchema, ApprovalStatus } from '@contracts/hitl/schema'
import { WorkflowStageSchema, LifecycleState } from '@contracts/workflow/schema'
import { AgentRequestSchema, AgentResponseSchema } from '@contracts/agent/schema'
import { RequirementBriefSchema } from '@contracts/artifacts/RequirementBrief'
```
