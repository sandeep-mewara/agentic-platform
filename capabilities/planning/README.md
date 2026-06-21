# Capability: PlanningAgent

## Role
Produces detailed implementation plans from requirements and architecture. Third stage of the PDLC pipeline.

## PDLC Stage
Stage 3: Planning

## Input
- `RequirementBrief`: Output from RequirementsAgent
- `ArchitectureReview`: Output from ArchitectureReviewAgent

## Output
- `ImplementationPlan`: Zod-validated artifact with phases, tasks (with dependencies), technical approach, risk mitigation strategies, success metrics, and rollback plan

## Skill
Loads `skills/planning/SKILL.md` for guidance on:
1. Decomposing objectives into phases (2-4 phases typically)
2. Defining tasks within each phase with dependencies
3. Documenting technical approach (architecture choices, technologies, patterns)
4. Identifying deferred decisions
5. Planning risk mitigation
6. Defining success metrics and rollback procedures

## Pattern
```typescript
const agent = new PlanningAgent(llm)
const plan = await agent.run({ brief, architecture })
// Returns: ImplementationPlan with phases and task breakdown
```

## Task Dependencies
Tasks can reference other tasks via `dependsOn` field, enabling:
- Critical path analysis
- Parallel execution identification
- Sequencing of work

## Article Section
Maps to **Implementation Planning & Decomposition** section of the article.

## Validation
- Input: RequirementBrief + ArchitectureReview (validated types)
- Output: ImplementationPlan validated against ImplementationPlanSchema
- Throws on validation failure (orchestrator handles retry)
