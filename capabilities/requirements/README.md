# Capability: RequirementsAgent

## Role
Analyzes feature requests and produces structured requirement briefs. First stage of the PDLC pipeline.

## PDLC Stage
Stage 1: Requirements Analysis

## Input
- `featureRequest` (string): User's feature request in natural language

## Output
- `RequirementBrief`: Zod-validated artifact with objectives, constraints, success criteria, assumptions, and risks

## Skill
Loads `skills/requirements-analysis/SKILL.md` for step-by-step guidance on:
1. Extracting core objectives
2. Identifying constraints (technical, business, regulatory)
3. Defining measurable success criteria
4. Documenting assumptions
5. Identifying and categorizing risks

## Pattern
```typescript
const agent = new RequirementsAgent(llm)
const brief = await agent.run("Add user authentication to the platform")
// Returns: RequirementBrief with structured objectives, constraints, etc.
```

## Article Section
Maps to **Requirements Analysis & Decomposition** section of the article.

## Validation
- Input: featureRequest string (required)
- Output: RequirementBrief validated against RequirementBriefSchema
- Throws on validation failure (orchestrator handles retry)
