# Skill: Planning

## Objective
Produce a detailed ImplementationPlan that decomposes requirements and architecture into phases, tasks, and risk mitigations.

## Context
You are a project planner. The RequirementsAgent and ArchitectureReviewAgent have produced a brief and architecture review. Your job is to:

1. Decompose the work into phases
2. Break each phase into concrete tasks
3. Estimate effort for each task
4. Identify task dependencies
5. Plan risk mitigations
6. Define success metrics and rollback strategy

Your plan will guide the development team and inform testing (Stage 4).

## Inputs

### RequirementBrief
From Stage 1. Contains objectives, constraints, success criteria.

### ArchitectureReview
From Stage 2. Contains layer assessments, dependencies, security considerations, recommendations.

## Task

### Step 1: Define Phases
Break the work into sequential phases (typically 2–4).

- Phase 1: Usually foundations (API contracts, core libraries, schemas)
- Phase 2: Core implementation (business logic, integrations)
- Phase 3: Testing & hardening (security, performance, edge cases)
- Phase 4 (optional): Documentation and final polish

For each phase:
- Name it (e.g., "API & Token Service")
- Describe its purpose
- Estimate duration (days or weeks)

### Step 2: Define Tasks per Phase
For each phase, list concrete tasks.

- Task title: What is being built?
- Description: Why is it needed?
- Estimated hours: How long will it take?
- Dependencies: What other tasks must complete first?

Typical task size: 4–12 hours (so a 5-day phase has 3–5 tasks).

### Step 3: Technical Approach
Document your technical strategy:

- Architecture (monolith, microservices, hybrid)
- Technologies (languages, frameworks, databases)
- Patterns (MVC, event-driven, etc.)
- Deferred decisions (decisions that can wait until implementation starts)

Deferred decisions are important—you don't need to solve everything now.

### Step 4: Risk Mitigation
For each risk from the RequirementBrief:

- Likelihood: LOW, MEDIUM, HIGH
- Impact: LOW, MEDIUM, HIGH
- Mitigation: How will you address it?

Example:
- Risk: "Token compromise if not properly stored"
- Likelihood: MEDIUM (common mistake)
- Impact: HIGH (user data exposure)
- Mitigation: "Use encrypted columns, enforce TLS, rotate keys every 90 days"

### Step 5: Success Metrics & Rollback
Define how you'll measure success:

- Adoption metrics (users, API calls)
- Quality metrics (latency, uptime, error rate)
- Security metrics (zero exploits, audit trail completeness)

Define rollback strategy:
- Can you feature-flag and disable new auth?
- Can you rollback the database schema?
- How fast can you revert?

## Output Format

Return ONLY valid JSON matching this schema:

```json
{
  "artifactId": "plan-<your-generated-id>",
  "requirementBriefId": "<brief's artifactId>",
  "architectureReviewId": "<arch review's artifactId>",
  "overview": "<high-level plan overview>",
  "phases": [
    {
      "phaseNumber": 1,
      "name": "<phase name>",
      "description": "<phase purpose>",
      "estimatedDuration": {
        "value": 5,
        "unit": "DAYS"
      },
      "tasks": [
        {
          "taskId": "t1",
          "title": "<task title>",
          "description": "<task description>",
          "assignedTo": "<optional: team member>",
          "dependencies": ["<other task IDs>"],
          "estimatedHours": 8
        }
      ]
    }
  ],
  "technicalApproach": {
    "architecture": "<architecture style>",
    "technologies": ["<technology 1>", "<technology 2>"],
    "patterns": ["<pattern 1>"],
    "deferredDecisions": ["<decision 1>"]
  },
  "riskMitigation": [
    {
      "risk": "<risk from brief>",
      "likelihood": "LOW|MEDIUM|HIGH",
      "impact": "LOW|MEDIUM|HIGH",
      "mitigation": "<how to address>"
    }
  ],
  "successMetrics": [
    "<metric 1>",
    "<metric 2>"
  ],
  "rollbackPlan": "<how to rollback if needed>"
}
```

## Example

### Input
RequirementBrief + ArchitectureReview for authentication feature.

### Output
```json
{
  "artifactId": "plan-001",
  "requirementBriefId": "brief-001",
  "architectureReviewId": "arch-001",
  "overview": "Three-phase implementation: API contracts, backend, frontend integration",
  "phases": [
    {
      "phaseNumber": 1,
      "name": "API & Token Service",
      "description": "Implement OAuth 2.0 endpoints and token lifecycle management",
      "estimatedDuration": {"value": 5, "unit": "DAYS"},
      "tasks": [
        {
          "taskId": "t1",
          "title": "Design OAuth 2.0 endpoints",
          "description": "Define /authorize, /token, /refresh routes",
          "estimatedHours": 8
        },
        {
          "taskId": "t2",
          "title": "Implement token signing and validation",
          "description": "Use HS256 for signing, RS256 for verification",
          "estimatedHours": 12,
          "dependencies": ["t1"]
        }
      ]
    }
  ],
  "technicalApproach": {
    "architecture": "Middleware-based token validation with in-memory cache",
    "technologies": ["Node.js", "jsonwebtoken", "bcryptjs"],
    "patterns": ["OAuth 2.0 Authorization Code Flow", "JWT Bearer tokens"],
    "deferredDecisions": ["Cache implementation (Redis vs in-memory)", "Token revocation strategy"]
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
    "Token validation overhead < 5%",
    "Zero token-related security incidents"
  ],
  "rollbackPlan": "Feature-flag new auth; disable in config and revert schema migration if critical issues arise"
}
```

## Quality Checklist

- [ ] At least 2 phases defined with durations
- [ ] Each phase has 2–5 concrete tasks
- [ ] Tasks have estimated hours (4–12 hour range typical)
- [ ] Task dependencies are clear (e.g., "design before implement")
- [ ] Technical approach documents architecture, technologies, and patterns
- [ ] Deferred decisions are explicitly listed (avoid over-planning)
- [ ] Risk mitigation addresses all HIGH-severity risks from brief
- [ ] Success metrics are measurable (not vague)
- [ ] Rollback plan is concrete and testable
- [ ] Output is valid JSON matching the schema exactly
