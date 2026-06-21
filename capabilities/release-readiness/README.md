# Capability: ReleaseReadinessAgent

## Role
Assesses overall release readiness and produces a decision report. Fifth and final stage of the PDLC pipeline (post-HITL gate).

## PDLC Stage
Stage 5: Release Readiness & Assessment

## Input
- `RequirementBrief`: Original requirements
- `ArchitectureReview`: Approved architecture
- `ImplementationPlan`: Implementation plan
- `TestPlan`: Test plan and quality assessment

## Output
- `ReleaseReadinessReport`: Zod-validated artifact with overall status, readiness checklist, quality metrics, blockers, recommendations, post-release checklist, and approvals

## Skills
Loads `skills/documentation/SKILL.md` (primary) for guidance on:
1. Synthesizing all prior artifacts
2. Assessing code completeness
3. Evaluating test coverage
4. Reviewing documentation
5. Assessing security posture
6. Documenting quality metrics
7. Identifying blockers and risks
8. Recommending release/hold decision

Uses `CodeReviewTool` (cross-cutting) for analyzing quality findings.

## Tools
Uses `DocumentationTool` for:
- Formatting readiness report as human-readable markdown
- Summarizing blockers
- Assessing release readiness (boolean check)
- Computing risk level (LOW/MEDIUM/HIGH heuristic)

## Pattern
```typescript
const agent = new ReleaseReadinessAgent(llm)
const report = await agent.run({ brief, architecture, plan, testPlan })
// Returns: ReleaseReadinessReport with readiness assessment
```

## Decision Gate Output
The `overallStatus` field informs HITL Gate decision:
- **APPROVED**: Release to production
- **REJECTED**: Return to engineering, fix issues
- **BLOCKED**: Escalate to stakeholders
- **PENDING_REVIEW**: Awaiting human review

## Article Section
Maps to **Release Assessment & Decision Gate** section of the article.

## Validation
- Input: RequirementBrief, ArchitectureReview, ImplementationPlan, TestPlan (all validated types)
- Output: ReleaseReadinessReport validated against ReleaseReadinessReportSchema
- Throws on validation failure (orchestrator handles retry)
