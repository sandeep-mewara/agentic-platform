# Capability: ArchitectureReviewAgent

## Role
Evaluates requirements against architectural layers and produces a comprehensive architecture review. Second stage of the PDLC pipeline.

## PDLC Stage
Stage 2: Architecture Review

## Input
- `RequirementBrief`: Output from RequirementsAgent

## Output
- `ArchitectureReview`: Zod-validated artifact with overall assessment, layer reviews, dependencies, security considerations, scalability analysis, and compliance notes

## Skill
Loads `skills/architecture-review/SKILL.md` for guidance on:
1. Assessing architecture across API, business, data, and security layers
2. Identifying dependencies and integration points
3. Documenting security considerations and threat mitigations
4. Evaluating scalability implications
5. Checking compliance requirements
6. Producing recommendations

## Pattern
```typescript
const agent = new ArchitectureReviewAgent(llm)
const review = await agent.run(requirementBrief)
// Returns: ArchitectureReview with layered assessment
```

## Decision Gate
The `overallAssessment` field indicates:
- **APPROVED**: Architecture is sound, proceed to planning
- **APPROVED_WITH_CONDITIONS**: Approve with noted conditions/mitigations
- **REJECTED**: Architecture requires redesign before proceeding

## Article Section
Maps to **Architectural Validation & Layer Review** section of the article.

## Validation
- Input: RequirementBrief (validated type)
- Output: ArchitectureReview validated against ArchitectureReviewSchema
- Throws on validation failure (orchestrator handles retry)
