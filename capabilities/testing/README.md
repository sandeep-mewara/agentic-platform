# Capability: TestingAgent

## Role
Produces comprehensive test plans and conducts code review. Fourth stage of the PDLC pipeline.

## PDLC Stage
Stage 4: Testing & Quality Review

## Input
- `ImplementationPlan`: Output from PlanningAgent

## Output
- `TestPlan`: Zod-validated artifact with test strategy, test cases, performance tests, security tests, quality gates, and regression tests

## Skill
Loads `skills/code-review/SKILL.md` (cross-cutting skill) for guidance on:
1. Analyzing implementation plan for critical paths and edge cases
2. Designing test cases (unit, integration, E2E)
3. Identifying performance test requirements
4. Planning security tests (injection, auth, encryption)
5. Defining quality gates and success criteria
6. Planning regression test coverage

## Tool
Uses `CodeReviewTool` for:
- Parsing structured feedback from LLM output
- Filtering findings by type (bug, style, performance, security)
- Filtering by severity (CRITICAL, HIGH, MEDIUM, LOW)
- Counting issues by category

## Pattern
```typescript
const agent = new TestingAgent(llm)
const testPlan = await agent.run(implementationPlan)
// Returns: TestPlan with test cases and quality gates
```

## Quality Gates
Test plan includes `qualityGates[]` that define:
- Test coverage targets (unit, integration, E2E)
- Critical path test coverage
- Performance benchmarks
- Security test requirements

## Article Section
Maps to **Testing Strategy & Quality Validation** section of the article.

## Validation
- Input: ImplementationPlan (validated type)
- Output: TestPlan validated against TestPlanSchema
- Throws on validation failure (orchestrator handles retry)
