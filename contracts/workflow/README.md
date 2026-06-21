# Workflow Contracts

Stage definition and lifecycle contracts for PDLC execution.

## Schemas

### WorkflowStage
Definition of a single stage in the PDLC pipeline.

- `name` — Stage identifier (e.g., "requirements-analysis")
- `order` — Execution order in pipeline
- `description` — Human-readable purpose
- `capability` — Capability this stage exercises
- `requiredInputs` — Artifact types needed as input
- `producedOutputs` — Artifact types produced as output

### StageTransition
Rules for advancing from one stage to the next.

- `fromStage` — Source stage
- `toStage` — Target stage
- `condition` — Optional predicate (e.g., "approval_granted")
- `requiredApprovals` — Number of approvals needed for transition

### WorkflowDefinition
Complete pipeline definition with all stages and transitions.

- `name` — Workflow identifier
- `version` — Semantic version
- `stages` — Array of WorkflowStage
- `transitions` — Array of StageTransition
- `metadata` — Creation/update timestamps

### LifecycleState enum
- `NOT_STARTED` — Stage not yet executed
- `IN_PROGRESS` — Stage currently running
- `COMPLETED` — Stage finished successfully
- `FAILED` — Stage encountered error
- `BLOCKED` — Stage waiting on external condition

### StageExecution
Runtime record of a stage invocation.

- `stageId` — References WorkflowStage.name
- `state` — Current LifecycleState
- `startedAt`, `completedAt` — Unix timestamps (ms)
- `result` — Actual output artifact produced
- `error` — Optional error details
- `metadata` — Stage-specific runtime data

## Article Section

Maps to **Architecture & Orchestration** section. The ConvergedAgentOrchestrator in `core/orchestrator/` reads WorkflowDefinition and drives stages through StageExecution states while firing HookRegistry hooks at each transition.

## Imports

```typescript
import { WorkflowStageSchema, WorkflowDefinitionSchema, LifecycleState, StageExecutionSchema } from '@contracts/workflow/schema'
import { StageTransition } from '@contracts/workflow/schema'
```
