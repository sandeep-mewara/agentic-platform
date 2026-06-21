# Skill: Architecture Review

## Role
Guides ArchitectureReviewAgent through reviewing a RequirementBrief for architectural soundness.

## PDLC Stage
Stage 2: Architecture Review

## Output Artifact
ArchitectureReview with layer assessments, dependencies, security considerations, and recommendations.

## Article Section
Maps to **Architecture Evaluation Capability** section. This skill:

- Applies architecture expertise to catch design issues early
- Documents dependencies and risks that planning must address
- Ensures security and scalability are considered before implementation

## Usage

ArchitectureReviewAgent loads this skill:

```typescript
class ArchitectureReviewAgent {
  async run(brief: RequirementBrief): Promise<ArchitectureReview> {
    const skill = readFileSync('./skills/architecture-review/SKILL.md', 'utf-8')
    const prompt = `${skill}\n\nRequirementBrief: ${JSON.stringify(brief)}`
    
    const output = await this.llm.complete(prompt)
    return ArchitectureReviewSchema.parse(JSON.parse(output))
  }
}
```

## Skill Components

### SKILL.md
Markdown instructions that guide the LLM through:
1. Assessing feasibility
2. Layer-by-layer review (API, Business, Data, Security, Observability)
3. Identifying dependencies
4. Security review
5. Scalability assessment
6. Recommendations

See SKILL.md for the full prompt.

## Integration

- **Input:** RequirementBrief (from Stage 1)
- **Output:** ArchitectureReview (JSON)
- **Validation:** ArchitectureReviewSchema (Zod)
- **Consumed by:** PlanningAgent, ReleaseReadinessAgent

## Example

```
Input: RequirementBrief for "Add user authentication"

Output:
{
  "artifactId": "arch-001",
  "overallAssessment": "APPROVED_WITH_CONDITIONS",
  "summary": "Architecture is sound but requires hardening in token storage...",
  "layerReview": [
    {
      "layer": "API Layer",
      "assessment": "OAuth 2.0 integration well-designed",
      "concerns": ["Token refresh logic must be idempotent"]
    },
    ...
  ],
  "security": [
    {
      "category": "Token Storage",
      "description": "Use encrypted columns for sensitive tokens",
      "severity": "HIGH",
      "mitigation": "Enable column-level encryption at rest"
    }
  ],
  "recommendations": [
    "Implement key rotation every 90 days",
    "Add rate limiting to login endpoint"
  ]
}
```

## Decision Gate

ArchitectureReviewAgent's overall assessment can gate the pipeline:

- `APPROVED` — Proceed to planning
- `APPROVED_WITH_CONDITIONS` — Proceed, but planning must address conditions
- `REJECTED` — Return to requirements; significant architectural issues

The assessment is informational; the orchestrator decides whether to block.
