# Artifact Contracts

Zod schemas for PDLC stage outputs and inter-stage inputs.

## Artifacts by Stage

| Artifact | Produced By | Consumed By |
|----------|-------------|------------|
| RequirementBrief | RequirementsAgent | ArchitectureReviewAgent, PlanningAgent |
| ArchitectureReview | ArchitectureReviewAgent | PlanningAgent |
| ImplementationPlan | PlanningAgent | TestingAgent |
| TestPlan | TestingAgent | ReleaseReadinessAgent |
| ReleaseReadinessReport | ReleaseReadinessAgent | End of PDLC |

## Schema Details

### RequirementBrief
Output from Stage 1 (Requirements Analysis).

- `featureRequest` — Original user request
- `objectives`, `constraints`, `successCriteria`, `assumptions` — Decomposed requirements
- `risks` — Identified risks with severity levels
- `estimatedEffort` — Effort scope and estimate

### ArchitectureReview
Output from Stage 2 (Architecture Review).

- `overallAssessment` — APPROVED, APPROVED_WITH_CONDITIONS, or REJECTED
- `layerReview` — Per-layer (presentation, business, data, etc.) assessment
- `dependencies` — New/changed component dependencies
- `scalability`, `security`, `compliance` — Domain-specific reviews
- `recommendations` — Actionable next steps

### ImplementationPlan
Output from Stage 3 (Planning).

- `phases` — Decomposed implementation phases with tasks
- `technicalApproach` — Architecture, technologies, patterns, deferred decisions
- `riskMitigation` — Risk-by-risk mitigation plans
- `successMetrics`, `rollbackPlan`

### TestPlan
Output from Stage 4 (Testing).

- `testStrategy` — Unit, integration, E2E scopes
- `testCases` — Detailed test scenarios with steps and expected results
- `performanceTests`, `securityTests` — Domain-specific test suites
- `qualityGates` — Must-pass checks

### ReleaseReadinessReport
Output from Stage 5 (Release Readiness). Final PDLC output before decision.

- `overallStatus` — APPROVED, REJECTED, BLOCKED, or PENDING_REVIEW
- `readiness` — Boolean checks (code complete, tests pass, docs complete, etc.)
- `qualityMetrics` — Code quality, test coverage, documentation
- `blockers` — Issues preventing release
- `approvals` — Multi-signer approval records
- `postReleaseChecklist` — Post-deployment verification items

## Article Section

Maps to **Workflow & Stage Artifacts** section. Each artifact is a convergence point — any agent implementing the same capability must produce compatible output (validated by Zod at stage boundary).

## Imports

```typescript
import { RequirementBriefSchema, type RequirementBrief } from '@contracts/artifacts/RequirementBrief'
import { ArchitectureReviewSchema } from '@contracts/artifacts/ArchitectureReview'
import { ImplementationPlanSchema } from '@contracts/artifacts/ImplementationPlan'
import { TestPlanSchema } from '@contracts/artifacts/TestPlan'
import { ReleaseReadinessReportSchema } from '@contracts/artifacts/ReleaseReadinessReport'
```
