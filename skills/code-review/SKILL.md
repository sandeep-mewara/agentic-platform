# Skill: Code Review

## Objective
Review code, plans, or artifacts for quality, risks, testing gaps, and security concerns.

## Context
This is a cross-cutting skill used by multiple agents:

1. **TestingAgent** (Stage 4): Reviews ImplementationPlan to identify test cases, risks, and gaps
2. **ReleaseReadinessAgent** (Stage 5): Reviews TestPlan and all prior artifacts to assess release readiness

Your job is to think critically about what could go wrong, what's missing, and what needs testing or hardening.

## Inputs

### For TestingAgent
- ImplementationPlan (phases, tasks, technical approach)

### For ReleaseReadinessAgent
- TestPlan (test cases, coverage targets)
- All prior artifacts (brief, architecture, plan)

## Task

### Step 1: Identify Gaps
What's missing from the plan or implementation?

- Test coverage gaps: "No tests for refresh token edge cases"
- Security gaps: "No rate limiting on login endpoint"
- Documentation gaps: "API docs don't cover error responses"
- Performance gaps: "No caching strategy for frequently-accessed data"

### Step 2: Risk Assessment
What could fail? What should we watch out for?

- Implementation risks: "Token revocation logic is deferred; could be security issue"
- Integration risks: "Database schema migration not tested in production environment"
- Operational risks: "No rollback plan for token format change"

Assign risk level: LOW, MEDIUM, HIGH.

### Step 3: Quality Review
Does the plan follow best practices?

- Are tasks reasonably sized (4–12 hours)?
- Are dependencies clear?
- Is rollback plan concrete (not vague)?
- Are success metrics measurable?

### Step 4: Testing Recommendations
What should testing focus on?

- Critical paths: OAuth flow, token refresh, session expiry
- Edge cases: Token expiry during request, concurrent logins, database errors
- Security: Token tampering, injection attacks, replay attacks
- Performance: Login latency, concurrent users, token validation overhead

### Step 5: Release Readiness Check (for Stage 5)
Before release, verify:

- [ ] All critical tests pass
- [ ] Security review completed
- [ ] Performance acceptable
- [ ] Documentation complete
- [ ] Rollback plan tested
- [ ] Audit trail working
- [ ] Zero HIGH-severity bugs

## Output Format

Return structured feedback as JSON. The CodeReviewTool will parse this into TestPlan or assessment.

```json
{
  "summary": "<overall assessment>",
  "findings": [
    {
      "type": "gap|risk|quality|testing|security",
      "severity": "LOW|MEDIUM|HIGH",
      "title": "<brief title>",
      "description": "<detailed description>",
      "recommendation": "<what to do about it>"
    }
  ],
  "testFocus": [
    "<area 1 to focus testing>",
    "<area 2>"
  ],
  "metrics": {
    "riskLevel": "LOW|MEDIUM|HIGH",
    "qualityScore": 1-10,
    "testCoverageTarget": 80
  }
}
```

## Example (TestingAgent reviewing ImplementationPlan)

### Input
ImplementationPlan for authentication feature.

### Output
```json
{
  "summary": "Plan is solid with clear phases and tasks. Key risks: token revocation deferred, integration testing light.",
  "findings": [
    {
      "type": "gap",
      "severity": "HIGH",
      "title": "No token revocation mechanism planned",
      "description": "Plan defers token revocation to post-launch. Users cannot force logout.",
      "recommendation": "Add token revocation to Phase 2; test revocation propagation."
    },
    {
      "type": "testing",
      "severity": "HIGH",
      "title": "Missing integration tests for OAuth flow",
      "description": "Plan focuses on unit tests. No mention of testing full OAuth redirect flow.",
      "recommendation": "Add E2E tests for /authorize → /token → /refresh → logout cycle."
    },
    {
      "type": "risk",
      "severity": "MEDIUM",
      "title": "Concurrent login handling unclear",
      "description": "What happens if user logs in on two devices simultaneously?",
      "recommendation": "Test and document concurrent login behavior."
    }
  ],
  "testFocus": [
    "Token refresh edge cases (expiry during request)",
    "Concurrent logins on multiple devices",
    "Database failure during token creation",
    "Rate limiting under load"
  ],
  "metrics": {
    "riskLevel": "MEDIUM",
    "qualityScore": 7,
    "testCoverageTarget": 85
  }
}
```

## Quality Checklist

- [ ] Identifies at least 2–3 significant gaps or risks
- [ ] Each finding has clear severity (not vague like "needs review")
- [ ] Recommendations are actionable (not vague)
- [ ] Testing focus areas are specific (not generic like "test everything")
- [ ] Metrics provide quantitative assessment (risk level, quality score)
- [ ] Output is valid JSON
