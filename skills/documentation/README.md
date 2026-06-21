# Skill: Documentation

## Role
Guides ReleaseReadinessAgent through assessing release readiness and producing a comprehensive readiness report.

## PDLC Stage
Stage 5: Release Readiness

## Output Artifact
ReleaseReadinessReport with readiness checks, quality metrics, blockers, recommendations, and approval signatures.

## Article Section
Maps to **Release Assessment & Decision Gate** section. This skill:

- Synthesizes all prior artifacts to provide holistic readiness assessment
- Documents quality metrics to inform release decision
- Produces human-readable report for HITL Gate review
- Enables post-release tracking via checklist

## Usage

ReleaseReadinessAgent loads this skill:

```typescript
class ReleaseReadinessAgent {
  async run(
    testPlan: TestPlan,
    allArtifacts: { brief, arch, plan },
  ): Promise<ReleaseReadinessReport> {
    const skill = readFileSync('./skills/documentation/SKILL.md', 'utf-8')
    const prompt = `${skill}\n\nArtifacts to assess:\n${JSON.stringify({testPlan, ...allArtifacts})}`
    
    const output = await this.llm.complete(prompt)
    const report = ReleaseReadinessReportSchema.parse(JSON.parse(output))
    
    // Use DocumentationTool to format report
    const tool = new DocumentationTool()
    console.log(tool.formatAsMarkdown(report))
    
    return report
  }
}
```

## Skill Components

### SKILL.md
Markdown instructions that guide the LLM through:
1. Code completeness check
2. Testing assessment
3. Documentation review
4. Security review
5. Quality metrics assembly
6. Approval checklist
7. Blocker and recommendation identification

See SKILL.md for the full prompt.

### tool.ts: DocumentationTool
Formats and analyzes readiness reports.

**Methods:**

```typescript
formatAsMarkdown(report): string
  // Formats report as human-readable markdown with sections:
  // - Readiness Checklist
  // - Quality Metrics (code, tests, docs)
  // - Blockers with mitigations
  // - Recommendations
  // - Post-Release Checklist
  // - Approvals

summarizeBlockers(report): string[]
  // Returns array of blocker summaries (category + description)

isReadyForRelease(report): boolean
  // true if status is APPROVED, all readiness checks true,
  // security APPROVED, and no blockers

getRiskLevel(report): 'LOW' | 'MEDIUM' | 'HIGH'
  // Heuristic: HIGH if security blocker or review failed,
  // MEDIUM if code quality or test coverage low,
  // LOW otherwise
```

## Example

### Input
TestPlan + all prior artifacts for authentication.

### LLM Output
```json
{
  "artifactId": "report-001",
  "testPlanId": "testplan-001",
  "overallStatus": "APPROVED",
  "executiveSummary": "Authentication feature is production-ready. All critical tests pass, documentation complete, security review approved.",
  "readiness": {
    "codeComplete": true,
    "testsPass": true,
    "documentationComplete": true,
    "performanceAcceptable": true,
    "securityReview": "APPROVED"
  },
  "qualityMetrics": {
    "codeQuality": {"score": 92, "issues": [...]},
    "testCoverage": {"unit": 87, "integration": 92, "e2e": 88},
    "documentation": {"readme": true, "apiDocs": true, ...}
  },
  "blockers": [],
  "recommendations": ["Monitor latency", "Plan token revocation"],
  "approvals": [...]
}
```

### Formatted by DocumentationTool
```markdown
# Release Readiness Report

**Status:** APPROVED

## Executive Summary
Authentication feature is production-ready...

## Readiness Checklist
- Code Complete: ✓
- Tests Pass: ✓
- Documentation Complete: ✓
- Performance Acceptable: ✓
- Security Review: APPROVED

## Quality Metrics
### Code Quality
Score: 92/100
Issues:
- Code Style: 3 (LOW)

### Test Coverage
- Unit: 87%
- Integration: 92%
- E2E: 88%

[... more sections ...]
```

### Analyzed by DocumentationTool
```typescript
const tool = new DocumentationTool()

tool.isReadyForRelease(report)  // true
tool.getRiskLevel(report)        // 'LOW'
tool.summarizeBlockers(report)   // [] (no blockers)
```

## Decision Gate Input

The HITL Gate receives this report and one of:
- **APPROVED** → Approve and release
- **REJECTED** → Return to engineering
- **BLOCKED** → Escalate to stakeholders
- **PENDING_REVIEW** → Awaiting approval

## Philosophy

**Comprehensive Assessment:** The readiness report synthesizes all prior work (brief, architecture, plan, tests) into a single decision artifact.

**Human-Centered:** The report is formatted for human decision-makers, not machines. Includes narrative summary, quality metrics, blockers, and approvals.

**Post-Release Tracking:** The checklist persists post-launch to ensure agreed-upon follow-up tasks are completed.
