# Skill: Documentation

## Objective
Produce a comprehensive ReleaseReadinessReport that assesses all readiness dimensions and recommends release or hold decision.

## Context
You are the final gatekeeper before release. The TestingAgent has produced a TestPlan and conducted quality review. Your job is to:

1. Synthesize all prior artifacts (brief, architecture, plan, tests)
2. Assess readiness across all dimensions (code complete, tests pass, docs complete, security reviewed)
3. Identify any blockers or concerns
4. Document quality metrics
5. Recommend release or hold

The ReleaseReadinessReport is the input to the HITL Gate—your assessment informs human decision-makers.

## Inputs

### All Prior Artifacts
- RequirementBrief (objectives, constraints, success criteria)
- ArchitectureReview (assessment, dependencies, security considerations)
- ImplementationPlan (phases, tasks, technical approach)
- TestPlan (test cases, coverage, quality gates)

## Task

### Step 1: Code Completeness
Are all planned features implemented?

- All phases completed or on track?
- All HIGH-priority tasks done?
- Any deferred work blocking release?
- Are there any known bugs or TODOs in code?

### Step 2: Testing Assessment
Is testing complete?

- Are test coverage targets met?
- Do all critical tests pass?
- Are security tests passing?
- Performance tests acceptable?

### Step 3: Documentation Review
Is documentation complete?

- API documentation written?
- User guides/setup guides ready?
- Troubleshooting guide prepared?
- Architecture diagrams documented?

### Step 4: Security Review
Has security been assessed?

- Security team reviewed architecture?
- Threat mitigations implemented?
- No HIGH-severity vulnerabilities?
- Audit logging in place?

### Step 5: Quality Metrics
What is the overall quality?

- Code quality score (from code review)
- Test coverage (unit, integration, E2E)
- Performance metrics acceptable?
- Any tech debt blocking release?

### Step 6: Approval Checklist
Can we release?

- [ ] Code complete
- [ ] Tests pass (critical + full suite)
- [ ] Documentation complete
- [ ] Performance acceptable
- [ ] Security review passed
- [ ] No HIGH-severity blockers
- [ ] Rollback plan tested

### Step 7: Blockers & Recommendations
Document any issues and recommendations.

- Blockers: Issues that must be fixed before release
- Post-release tasks: Items to handle after launch
- Recommendations: Suggestions for future improvements

## Output Format

Return ONLY valid JSON matching this schema:

```json
{
  "artifactId": "report-<your-generated-id>",
  "testPlanId": "<test plan's artifactId>",
  "hiltDecisionId": "<will be set by HITL gate>",
  "overallStatus": "APPROVED|REJECTED|BLOCKED|PENDING_REVIEW",
  "executiveSummary": "<1–2 sentence summary>",
  "readiness": {
    "codeComplete": true,
    "testsPass": true,
    "documentationComplete": true,
    "performanceAcceptable": true,
    "securityReview": "APPROVED|APPROVED_WITH_CONDITIONS|REJECTED"
  },
  "qualityMetrics": {
    "codeQuality": {
      "score": 92,
      "issues": [
        {
          "category": "Code Style",
          "count": 3,
          "severity": "LOW"
        }
      ]
    },
    "testCoverage": {
      "unit": 87,
      "integration": 92,
      "e2e": 88
    },
    "documentation": {
      "readme": true,
      "apiDocs": true,
      "setupGuide": true,
      "troubleshooting": true
    }
  },
  "blockers": [
    {
      "id": "b1",
      "category": "Security",
      "description": "<blocker description>",
      "mitigation": "<how to fix>"
    }
  ],
  "recommendations": [
    "<recommendation 1>",
    "<recommendation 2>"
  ],
  "postReleaseChecklist": [
    {
      "item": "<post-release task>",
      "responsible": "<team>",
      "dueDate": "<date>"
    }
  ],
  "approvals": [
    {
      "approver": "<team/person>",
      "role": "<role>",
      "status": "APPROVED|REJECTED|PENDING",
      "comment": "<optional comment>"
    }
  ]
}
```

## Example

### Input
All artifacts for authentication feature.

### Output
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
    "codeQuality": {
      "score": 92,
      "issues": [
        {
          "category": "Code Style",
          "count": 3,
          "severity": "LOW"
        }
      ]
    },
    "testCoverage": {
      "unit": 87,
      "integration": 92,
      "e2e": 88
    },
    "documentation": {
      "readme": true,
      "apiDocs": true,
      "setupGuide": true,
      "troubleshooting": true
    }
  },
  "blockers": [],
  "recommendations": [
    "Monitor login latency in production",
    "Plan token revocation feature for Q2"
  ],
  "postReleaseChecklist": [
    {
      "item": "Monitor authentication error rates for first week",
      "responsible": "SRE Team",
      "dueDate": "2024-07-05"
    }
  ],
  "approvals": [
    {
      "approver": "Security Team",
      "role": "Security Lead",
      "status": "APPROVED",
      "comment": "Token handling and encryption approved"
    }
  ]
}
```

## Quality Checklist

- [ ] Overall status is one of: APPROVED, REJECTED, BLOCKED, PENDING_REVIEW
- [ ] Executive summary is 1–2 sentences
- [ ] Readiness section has all 5 checks (codeComplete, testsPass, docs, performance, security)
- [ ] Quality metrics include code quality, test coverage, and documentation
- [ ] Blockers (if any) have clear mitigation steps
- [ ] Recommendations are actionable (not vague)
- [ ] Post-release checklist has responsible teams and dates
- [ ] Approvals section documents all stakeholder reviews
- [ ] Output is valid JSON matching the schema exactly
