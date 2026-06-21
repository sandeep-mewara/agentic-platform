# Skill: Requirements Analysis

## Objective
Decompose a feature request into a structured RequirementBrief with clearly identified objectives, constraints, success criteria, and risks.

## Context
You are analyzing a user's feature request to understand what they want to build. Your job is to clarify ambiguities, break down the request into actionable objectives, identify constraints and dependencies, and surface potential risks early.

This brief becomes the input to all downstream stages (architecture, planning, testing, release readiness), so completeness and clarity are critical.

## Inputs

### featureRequest (string)
User's feature request in free-form natural language. Examples:
- "Add user authentication"
- "Build a payment processor that supports multiple currencies"
- "Migrate legacy auth system to OAuth 2.0"

## Task

### Step 1: Extract Core Objectives
Read the feature request carefully. What is the user trying to achieve?

- List 2–5 functional objectives
- Each should be a concrete capability (not a technology)
- Examples: "Implement OAuth 2.0 authentication", "Support role-based access control", "Provide session management"

### Step 2: Identify Constraints
What limitations or requirements constrain how you can implement this?

- Technical constraints: "Must work with existing database", "No external dependencies"
- Business constraints: "Must launch in 2 weeks", "Budget limited to 3 engineers"
- Regulatory: "GDPR compliant", "PCI-DSS for payment handling"
- Backward compatibility: "Must support existing user database"

List at least 1, ideally 3+ constraints.

### Step 3: Define Success Criteria
How will we know this feature is working well?

- Measurable outcomes (latency, uptime, user counts, error rates)
- Examples: "All users can login securely", "Session tokens expire after 24 hours", "Zero authentication failures in production"
- List 2–4 criteria

### Step 4: Document Assumptions
What are we assuming to be true about the system, users, or context?

- "HTTPS is enforced at infrastructure level"
- "Database supports transactions"
- "Users have valid email addresses"
- List 2–3 assumptions

### Step 5: Identify Risks
What could go wrong? What should the team watch out for?

- Security risks: "Token compromise if not properly stored"
- Performance risks: "OAuth roundtrips may add latency"
- Integration risks: "Legacy system may not support new auth scheme"

For each risk, assign a severity: LOW, MEDIUM, or HIGH.

## Output Format

Return ONLY valid JSON matching this schema:

```json
{
  "artifactId": "brief-<your-generated-id>",
  "featureRequest": "<original feature request text>",
  "objectives": [
    "<objective 1>",
    "<objective 2>",
    "<objective 3>"
  ],
  "constraints": [
    "<constraint 1>",
    "<constraint 2>",
    "<constraint 3>"
  ],
  "successCriteria": [
    "<criterion 1>",
    "<criterion 2>",
    "<criterion 3>"
  ],
  "assumptions": [
    "<assumption 1>",
    "<assumption 2>"
  ],
  "risks": [
    {
      "category": "<risk category>",
      "description": "<what could go wrong>",
      "severity": "HIGH|MEDIUM|LOW"
    }
  ],
  "estimatedEffort": {
    "scope": "SMALL|MEDIUM|LARGE",
    "daysEstimate": 5
  }
}
```

## Example

### Input
Feature request: "Add user authentication to the platform"

### Output
```json
{
  "artifactId": "brief-001",
  "featureRequest": "Add user authentication to the platform",
  "objectives": [
    "Implement OAuth 2.0 authentication",
    "Support role-based access control",
    "Provide session management"
  ],
  "constraints": [
    "Must support existing user database",
    "No external dependencies for auth (use stdlib)",
    "Backward compatible with current API"
  ],
  "successCriteria": [
    "All users can login securely",
    "Session tokens expire after 24 hours",
    "Audit log captures all auth events",
    "Performance impact < 100ms per request"
  ],
  "assumptions": [
    "HTTPS is enforced at infrastructure level",
    "Database supports transactions",
    "User database schema is mutable"
  ],
  "risks": [
    {
      "category": "Security",
      "description": "Token compromise if not properly stored",
      "severity": "HIGH"
    },
    {
      "category": "Performance",
      "description": "OAuth roundtrips may add latency",
      "severity": "MEDIUM"
    }
  ],
  "estimatedEffort": {
    "scope": "MEDIUM",
    "daysEstimate": 10
  }
}
```

## Quality Checklist

- [ ] At least 3 objectives extracted and clearly stated
- [ ] Constraints include technical, business, and regulatory (if applicable)
- [ ] Success criteria are measurable (not subjective like "good performance")
- [ ] Assumptions are explicit (don't assume the reader knows your context)
- [ ] Risks have severity levels (HIGH for security/data loss, MEDIUM for performance/integration)
- [ ] Estimated effort scope matches the number of objectives and constraints (SMALL = 1–2 objectives, MEDIUM = 3–5, LARGE = 5+)
- [ ] Output is valid JSON matching the schema exactly
