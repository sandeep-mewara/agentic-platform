# Skill: Planning

## Role
Guides PlanningAgent through producing a detailed implementation plan from requirements and architecture review.

## PDLC Stage
Stage 3: Planning

## Output Artifact
ImplementationPlan with phases, tasks, technical approach, risk mitigations, success metrics, and rollback plan.

## Article Section
Maps to **Planning & Breakdown** capability section. This skill:

- Operationalizes requirements and architecture into executable tasks
- Identifies deferred decisions to keep planning fast
- Ensures rollback and success metrics are thought through before coding

## Usage

PlanningAgent loads this skill:

```typescript
class PlanningAgent {
  async run(brief: RequirementBrief, arch: ArchitectureReview): Promise<ImplementationPlan> {
    const skill = readFileSync('./skills/planning/SKILL.md', 'utf-8')
    const prompt = `${skill}\n\nRequirementBrief: ${JSON.stringify(brief)}\n\nArchitectureReview: ${JSON.stringify(arch)}`
    
    const output = await this.llm.complete(prompt)
    return ImplementationPlanSchema.parse(JSON.parse(output))
  }
}
```

## Skill Components

### SKILL.md
Markdown instructions that guide the LLM through:
1. Defining phases (typically 2–4)
2. Breaking phases into concrete tasks
3. Documenting technical approach
4. Planning risk mitigations
5. Defining success metrics
6. Planning rollback strategy

See SKILL.md for the full prompt.

## Integration

- **Input:** RequirementBrief (Stage 1) + ArchitectureReview (Stage 2)
- **Output:** ImplementationPlan (JSON)
- **Validation:** ImplementationPlanSchema (Zod)
- **Consumed by:** TestingAgent (for test planning), ReleaseReadinessAgent

## Example

```
Input: RequirementBrief + ArchitectureReview for authentication

Output:
{
  "artifactId": "plan-001",
  "overview": "Three-phase implementation: API contracts, backend, integration",
  "phases": [
    {
      "phaseNumber": 1,
      "name": "API & Token Service",
      "tasks": [
        {
          "taskId": "t1",
          "title": "Design OAuth 2.0 endpoints",
          "estimatedHours": 8
        },
        {
          "taskId": "t2",
          "title": "Implement token signing",
          "estimatedHours": 12,
          "dependencies": ["t1"]
        }
      ]
    }
  ],
  "technicalApproach": {
    "architecture": "Middleware-based token validation",
    "technologies": ["Node.js", "jsonwebtoken", "bcryptjs"],
    "deferredDecisions": ["Cache implementation", "Token revocation strategy"]
  },
  "riskMitigation": [
    {
      "risk": "Token compromise",
      "likelihood": "MEDIUM",
      "impact": "HIGH",
      "mitigation": "Use HTTPS, short expiry, refresh token rotation"
    }
  ],
  "successMetrics": [
    "Login latency < 500ms",
    "Token validation overhead < 5%"
  ],
  "rollbackPlan": "Feature-flag new auth; disable in config if critical issues arise"
}
```

## Philosophy

### Deferred Decisions
Don't over-plan. If a decision doesn't block the current phase, defer it:

- "Cache implementation (Redis vs in-memory)" — defer to implementation
- "Token revocation strategy" — can be added in Phase 2
- "Mobile client support" — can be a separate track

This keeps planning lean and lets architects/engineers make informed choices during implementation.

### Task Sizing
Aim for 4–12 hour tasks. Too small (1 hour) → micromanagement. Too large (40+ hours) → hard to estimate and coordinate.

### Dependencies
Make dependencies explicit. This helps TestingAgent understand test ordering.
