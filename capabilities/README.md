# Capabilities Layer

The capabilities layer implements the five core agents that execute each stage of the Product Development Lifecycle (PDLC) pipeline.

## Overview

Each capability agent:
1. Receives input (from prior stage or user)
2. Loads its corresponding SKILL.md from the skills layer
3. Calls the LLM provider with the skill as instruction
4. Parses and validates output against Zod contract schemas
5. Returns typed artifact for next stage or final output

## Agents

### 1. RequirementsAgent
**PDLC Stage 1: Requirements Analysis**

Decomposes feature requests into structured requirement briefs.
- Input: featureRequest (string)
- Output: RequirementBrief
- Skill: `skills/requirements-analysis/SKILL.md`

### 2. ArchitectureReviewAgent
**PDLC Stage 2: Architecture Review**

Evaluates requirements against architectural layers.
- Input: RequirementBrief
- Output: ArchitectureReview
- Skill: `skills/architecture-review/SKILL.md`
- Decision gate: overallAssessment (APPROVED / APPROVED_WITH_CONDITIONS / REJECTED)

### 3. PlanningAgent
**PDLC Stage 3: Implementation Planning**

Produces detailed implementation plans with phased task breakdown.
- Input: RequirementBrief + ArchitectureReview
- Output: ImplementationPlan
- Skill: `skills/planning/SKILL.md`

### 4. TestingAgent
**PDLC Stage 4: Testing & Quality Review**

Designs test coverage and conducts code review.
- Input: ImplementationPlan
- Output: TestPlan
- Skill: `skills/code-review/SKILL.md` (cross-cutting)
- Tool: CodeReviewTool

### 5. ReleaseReadinessAgent
**PDLC Stage 5: Release Readiness Assessment**

Synthesizes all artifacts for final release decision.
- Input: RequirementBrief + ArchitectureReview + ImplementationPlan + TestPlan
- Output: ReleaseReadinessReport
- Skills: `skills/documentation/SKILL.md` (primary) + `skills/code-review/SKILL.md` (cross-cutting)
- Tools: DocumentationTool + CodeReviewTool
- Decision gate: overallStatus (APPROVED / REJECTED / BLOCKED / PENDING_REVIEW)

## Data Flow

```
FeatureRequest
    ↓
[RequirementsAgent] → RequirementBrief
    ↓
[ArchitectureReviewAgent] → ArchitectureReview
    ↓
[PlanningAgent] → ImplementationPlan
    ↓
[TestingAgent] → TestPlan
    ↓
[HITL Gate] (human approval)
    ↓
[ReleaseReadinessAgent] → ReleaseReadinessReport
    ↓
[Output]
```

## Integration with Core

All agents are instantiated by `ConvergedAgentOrchestrator` with:
- LLMProvider (mock or real Claude)
- No direct access to orchestrator concerns (security, telemetry, hooks, cost tracking)
- Orchestrator wraps each agent's run() call with cross-cutting concerns

## Pattern

Each agent follows the same pattern:

```typescript
class XAgent {
  constructor(llm: LLMProvider) {}
  
  async run(input: InputType): Promise<OutputType> {
    // 1. Load SKILL.md
    const skill = readFileSync('./skills/<name>/SKILL.md', 'utf-8')
    
    // 2. Build prompt with skill + input
    const prompt = `${skill}\n\n${JSON.stringify(input)}`
    
    // 3. Call LLM
    const output = await this.llm.complete(prompt)
    
    // 4. Parse and validate
    return OutputSchema.parse(JSON.parse(output))
  }
}
```

## Skills & Tools

### Skills (Markdown Instructions)
- `requirements-analysis/SKILL.md` — Requirements decomposition guide
- `architecture-review/SKILL.md` — Architecture validation guide
- `planning/SKILL.md` — Implementation planning guide
- `code-review/SKILL.md` — Cross-cutting code review guide
- `documentation/SKILL.md` — Release readiness assessment guide

### Tools (Executable Utilities)
- `CodeReviewTool` — Used by TestingAgent + ReleaseReadinessAgent for structured feedback
- `DocumentationTool` — Used by ReleaseReadinessAgent for markdown formatting and risk assessment

## Type Safety

All agent inputs and outputs are:
- Validated against Zod schemas from `@contracts/artifacts/`
- Type-safe via TypeScript inference (`z.infer<>`)
- Enforced at boundary (agent ↔ orchestrator)

## Article Section

Maps to **Agent Capabilities & Lifecycle** section of the article. Each agent executes one stage of the PDLC, with skills providing reusable instructions and tools providing optional utilities.

## Files

- `requirements/agent.ts` — RequirementsAgent implementation
- `architecture-review/agent.ts` — ArchitectureReviewAgent implementation
- `planning/agent.ts` — PlanningAgent implementation
- `testing/agent.ts` — TestingAgent implementation
- `release-readiness/agent.ts` — ReleaseReadinessAgent implementation
- `index.ts` — Exports all agents
- `*/README.md` — Per-agent documentation
