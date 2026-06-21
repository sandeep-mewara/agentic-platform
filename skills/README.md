# Skills

Markdown instruction assets that guide agents through PDLC stages.

## Pattern

Each skill lives in its own directory:

```
skills/<skill-name>/
  SKILL.md          # Markdown instructions: what to do, how to think, examples
  tool.ts           # Optional: executable utility that operationalizes the skill
  README.md         # Role in PDLC, article mapping, usage examples
```

Skills are **lightweight reusable assets**—just markdown prompts. Tools are **optional executables** that implement complex logic (parsing, formatting, validation).

## Skills Inventory

| Skill | Capability | Used By | Output |
|-------|-----------|---------|--------|
| requirements-analysis/ | RequirementsAgent | — | RequirementBrief |
| architecture-review/ | ArchitectureReviewAgent | — | ArchitectureReview |
| planning/ | PlanningAgent | — | ImplementationPlan |
| code-review/ | TestingAgent, ReleaseReadinessAgent | Cross-cutting | TestPlan, feedback |
| documentation/ | ReleaseReadinessAgent | — | ReleaseReadinessReport |

**code-review/ is cross-cutting:** Both TestingAgent (for test planning) and ReleaseReadinessAgent (for readiness assessment) reuse the same skill and tool. Demonstrates skill composability.

## Article Section

Maps to **Skills & Tools Layer** section. Skills:

- **Are prompts, not code:** Pure markdown instruction assets that live alongside the tool they guide
- **Are reusable:** code-review skill is shared by Testing and ReleaseReadiness agents
- **Are composable:** Multiple skills can be chained in a single agent run
- **Are versionable:** SKILL.md versions independently of agent versions
- **Are product-extensible:** Teams add domain-specific skills (compliance, security) without modifying core

## Skill Structure

### SKILL.md
Markdown instructions for an LLM. Typically includes:

1. **Objective:** What you're trying to accomplish
2. **Context:** Background about the domain/stage
3. **Inputs:** What data you receive and its structure
4. **Task:** Step-by-step instructions on what to do
5. **Output format:** Expected JSON schema or structure
6. **Examples:** Sample inputs and outputs
7. **Quality checklist:** What makes good output

Example:

```markdown
# Skill: Requirements Analysis

## Objective
Decompose a feature request into a structured RequirementBrief.

## Inputs
- featureRequest: User's feature request (free-form text)

## Task
1. Extract core objectives from the request
2. Identify constraints and dependencies
3. Define success criteria
4. Document assumptions
5. Identify risks

## Output Format
Return ONLY valid JSON matching RequirementBrief schema:
{
  "artifactId": "brief-<timestamp>",
  "featureRequest": "...",
  "objectives": [...],
  "constraints": [...],
  "successCriteria": [...],
  "assumptions": [...],
  "risks": [{"category": "...", "description": "...", "severity": "..."}]
}

## Example
[Input and output example...]

## Quality Checklist
- [ ] At least 3 objectives identified
- [ ] Constraints clearly stated
- [ ] Success criteria are measurable
- [ ] Risks have severity levels
```

### tool.ts (optional)
Executable utility that the agent calls. Examples:

- **CodeReviewTool:** Parses unstructured LLM feedback into structured TestPlan/violations
- **DocumentationTool:** Formats structured data into human-readable ReleaseReadinessReport

```typescript
export class CodeReviewTool {
  parse(llmOutput: string): ParsedReview {
    // Extract structured feedback from LLM response
    // Return {findings, recommendations, riskLevel, ...}
  }
}
```

### README.md
Documents the skill's role in PDLC:

- Which agent uses it
- What capability it enables
- How it connects to article sections
- Usage examples

## Imports

```typescript
// Skills are markdown, loaded as text by agents
// No TypeScript imports needed for SKILL.md files

// Tools are optional and imported by agents
import { CodeReviewTool } from '@skills/code-review/tool'
import { DocumentationTool } from '@skills/documentation/tool'
```

## Usage Example

```typescript
// In an agent:
const skill = readFileSync('./skills/requirements-analysis/SKILL.md', 'utf-8')
const prompt = `${skill}\n\nAnalyze this feature request: "${featureRequest}"`
const output = await llm.complete(prompt)
const brief = RequirementBriefSchema.parse(JSON.parse(output))
```
