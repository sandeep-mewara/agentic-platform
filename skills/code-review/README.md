# Skill: Code Review

## Role
Cross-cutting skill for quality, risk, and testing analysis. Used by TestingAgent and ReleaseReadinessAgent.

## PDLC Stages
- **Stage 4 (Testing):** TestingAgent reviews ImplementationPlan to produce TestPlan
- **Stage 5 (Release Readiness):** ReleaseReadinessAgent reviews all artifacts to assess readiness

## Output Artifacts
- **TestingAgent → TestPlan:** Test cases, test focus areas, quality gates
- **ReleaseReadinessAgent → ReleaseReadinessReport:** Quality assessment, blockers, metrics

## Article Section
Maps to **Code Review & Quality Assurance** section. This skill:

- Identifies gaps and risks before testing/release
- Provides structured feedback (findings, severity, recommendations)
- Enables both agents to reuse the same quality-check logic

## Reusability

This is the **cross-cutting skill** example from the article:

1. **TestingAgent** loads the skill and passes ImplementationPlan → receives TestPlan
2. **ReleaseReadinessAgent** loads the skill and passes TestPlan + artifacts → receives readiness assessment

Both agents use the same SKILL.md and CodeReviewTool, demonstrating **skill composability**.

## Usage

### TestingAgent

```typescript
class TestingAgent {
  async run(plan: ImplementationPlan): Promise<TestPlan> {
    const skill = readFileSync('./skills/code-review/SKILL.md', 'utf-8')
    const prompt = `${skill}\n\nReview this implementation plan:\n${JSON.stringify(plan)}`
    
    const output = await this.llm.complete(prompt)
    const tool = new CodeReviewTool()
    const review = tool.parse(output)
    
    // Convert review into TestPlan
    return this.buildTestPlan(review)
  }
}
```

### ReleaseReadinessAgent

```typescript
class ReleaseReadinessAgent {
  async run(testPlan: TestPlan, allArtifacts: Artifacts): Promise<ReleaseReadinessReport> {
    const skill = readFileSync('./skills/code-review/SKILL.md', 'utf-8')
    const prompt = `${skill}\n\nAssess release readiness:\n${JSON.stringify({testPlan, ...allArtifacts})}`
    
    const output = await this.llm.complete(prompt)
    const tool = new CodeReviewTool()
    const review = tool.parse(output)
    
    // Convert review into ReleaseReadinessReport
    return this.buildReleaseReport(review)
  }
}
```

## Skill Components

### SKILL.md
Markdown instructions that guide the LLM through:
1. Identifying gaps (test, security, documentation, performance)
2. Risk assessment (implementation, integration, operational)
3. Quality review (task sizing, dependencies, metrics)
4. Testing recommendations (critical paths, edge cases, security)
5. Release readiness check (verification checklist)

See SKILL.md for the full prompt.

### tool.ts: CodeReviewTool
Parses LLM output into structured `ParsedReview`:

```typescript
interface ParsedReview {
  summary: string
  findings: ReviewFinding[]
  testFocus: string[]
  metrics: ReviewMetrics
}

interface ReviewFinding {
  type: 'gap' | 'risk' | 'quality' | 'testing' | 'security'
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
  title: string
  description: string
  recommendation: string
}

interface ReviewMetrics {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  qualityScore: number         // 1–10
  testCoverageTarget?: number  // e.g., 85
}
```

**Helper methods:**

```typescript
filterByType(review, 'gap')           // Get all gap findings
filterBySeverity(review, 'HIGH')      // Get all high-severity findings
countBySeverity(review)               // {LOW: 2, MEDIUM: 3, HIGH: 1}
hasCriticalIssues(review)             // true if HIGH findings or HIGH risk
```

## Example (TestingAgent)

### Input
ImplementationPlan for authentication.

### LLM Output
```json
{
  "summary": "Plan is solid with clear phases. Key risks: token revocation deferred, integration testing light.",
  "findings": [
    {
      "type": "gap",
      "severity": "HIGH",
      "title": "No token revocation mechanism",
      "description": "Plan defers token revocation to post-launch. Users cannot force logout.",
      "recommendation": "Add token revocation to Phase 2."
    },
    {
      "type": "testing",
      "severity": "HIGH",
      "title": "Missing integration tests for OAuth flow",
      "description": "No E2E tests for full OAuth redirect flow.",
      "recommendation": "Add E2E tests for /authorize → /token → /refresh cycle."
    }
  ],
  "testFocus": [
    "Token refresh edge cases",
    "Concurrent logins",
    "Database failures"
  ],
  "metrics": {
    "riskLevel": "MEDIUM",
    "qualityScore": 7,
    "testCoverageTarget": 85
  }
}
```

### Parsed by CodeReviewTool
```typescript
const tool = new CodeReviewTool()
const review = tool.parse(llmOutput)

review.summary
// "Plan is solid with clear phases..."

review.findings.length
// 2

review.metrics.riskLevel
// "MEDIUM"

tool.hasCriticalIssues(review)
// true (has HIGH-severity findings)

tool.filterBySeverity(review, 'HIGH')
// [gap finding, testing finding]
```

### Converted to TestPlan
TestingAgent uses the parsed review to build TestPlan with test cases covering all `testFocus` areas.

## Philosophy

This skill enables **skill composability**:

- Same SKILL.md prompt can be used by different agents with different inputs
- Same CodeReviewTool parses output for different downstream use cases
- New agents can reuse both skill and tool without modification

This demonstrates the article's principle: **Skills are lightweight reusable assets, not tied to specific agents.**
