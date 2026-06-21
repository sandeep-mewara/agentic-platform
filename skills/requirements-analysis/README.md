# Skill: Requirements Analysis

## Role
Guides RequirementsAgent through decomposing a feature request into a structured RequirementBrief.

## PDLC Stage
Stage 1: Requirements Analysis

## Output Artifact
RequirementBrief with objectives, constraints, success criteria, assumptions, and risks.

## Article Section
Maps to **Requirements Analysis Capability** section. This skill:

- Operationalizes the initial requirements discovery phase
- Ensures consistent structure across all feature requests
- Surfaces constraints and risks early to inform architecture and planning

## Usage

RequirementsAgent loads this skill and passes it to the LLM:

```typescript
import { readFileSync } from 'fs'

class RequirementsAgent {
  async run(featureRequest: string): Promise<RequirementBrief> {
    const skill = readFileSync('./skills/requirements-analysis/SKILL.md', 'utf-8')
    const prompt = `${skill}\n\nFeature request: "${featureRequest}"`
    
    const output = await this.llm.complete(prompt)
    return RequirementBriefSchema.parse(JSON.parse(output))
  }
}
```

## Skill Components

### SKILL.md
Markdown instructions that guide the LLM through:
1. Extracting core objectives
2. Identifying constraints
3. Defining success criteria
4. Documenting assumptions
5. Identifying risks

See SKILL.md for the full prompt.

## Integration

- **Input:** featureRequest (string)
- **Output:** RequirementBrief (JSON)
- **Validation:** RequirementBriefSchema (Zod)
- **Consumed by:** ArchitectureReviewAgent, PlanningAgent

## Example

```
Input: "Add user authentication to the platform"

Output:
{
  "artifactId": "brief-001",
  "featureRequest": "Add user authentication to the platform",
  "objectives": [
    "Implement OAuth 2.0 authentication",
    "Support role-based access control",
    "Provide session management"
  ],
  ...
}
```

## Quality Notes

The skill includes a quality checklist to guide the LLM:

- At least 3 objectives
- Clear constraints (technical, business, regulatory)
- Measurable success criteria
- Explicit assumptions
- Risks with severity levels
- Estimated effort aligned with scope
