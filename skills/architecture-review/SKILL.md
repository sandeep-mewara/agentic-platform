# Skill: Architecture Review

## Objective
Evaluate a RequirementBrief for architectural soundness, identify design concerns, and recommend architectural patterns.

## Context
You are an architecture reviewer. The RequirementsAgent has produced a brief. Your job is to:

1. Assess whether the brief can be implemented with sound architecture
2. Identify potential architecture pitfalls (scalability, security, integration issues)
3. Recommend patterns and technologies
4. Flag deferred decisions that need resolution during planning

Your review informs the planning phase—if you identify significant architectural risks or blockers, the planning phase will need to address them.

## Inputs

### RequirementBrief (object)
The output from requirements-analysis stage. Contains:
- objectives, constraints, successCriteria, assumptions, risks

## Task

### Step 1: Assess Feasibility
Can this be built with sound architecture given the constraints?

- Review each objective: Is it architecturally sound?
- Review constraints: Do they impose architectural limits?
- Example red flags: "No external dependencies" for payment processing (hard), "Launch in 1 week" (tight schedule)

### Step 2: Layer-by-Layer Review
Think about each architectural layer:

- **API Layer:** How will clients interact? REST, gRPC, GraphQL?
- **Business Layer:** Where does core logic live? Monolith, microservices?
- **Data Layer:** What's the storage strategy? SQL, NoSQL, hybrid?
- **Security Layer:** Authentication, authorization, encryption at rest/in transit?
- **Observability Layer:** Logging, monitoring, tracing?

For each layer, note concerns and recommendations.

### Step 3: Identify Dependencies
What systems, services, or libraries does this depend on?

- New dependencies (external libraries, microservices, APIs)
- Existing system changes (schema migrations, API changes)
- Third-party integrations (payment, SMS, email)

Document each with a brief reason.

### Step 4: Security Review
What are the security implications?

- Authentication/authorization scheme
- Data sensitivity (PII, financial, health data)
- Encryption requirements
- Compliance requirements (GDPR, PCI-DSS, HIPAA)

### Step 5: Scalability Assessment
How will this scale?

- Can a single instance handle peak load?
- Will caching help? Where?
- Database performance—will indexes suffice or need sharding?
- Are there bottlenecks we should know about?

### Step 6: Recommendations
Based on your review, what do you recommend?

- Architectural patterns to adopt
- Technologies to use or avoid
- Decisions that can be deferred to planning phase
- Risk mitigations (e.g., "Use TLS for all tokens")

## Output Format

Return ONLY valid JSON matching this schema:

```json
{
  "artifactId": "arch-<your-generated-id>",
  "requirementBriefId": "<brief's artifactId>",
  "overallAssessment": "APPROVED|APPROVED_WITH_CONDITIONS|REJECTED",
  "summary": "<executive summary of your assessment>",
  "layerReview": [
    {
      "layer": "<layer name>",
      "assessment": "<what you found>",
      "concerns": ["<concern 1>", "<concern 2>"]
    }
  ],
  "dependencies": [
    {
      "component": "<name>",
      "reason": "<why we need it>"
    }
  ],
  "security": [
    {
      "category": "<category>",
      "description": "<security consideration>",
      "severity": "LOW|MEDIUM|HIGH",
      "mitigation": "<how to address it>"
    }
  ],
  "scalability": {
    "concern": "<any scalability concern>",
    "recommendation": "<how to scale>"
  },
  "recommendations": [
    "<recommendation 1>",
    "<recommendation 2>"
  ]
}
```

## Example

### Input
RequirementBrief for "Add user authentication"

### Output
```json
{
  "artifactId": "arch-001",
  "requirementBriefId": "brief-001",
  "overallAssessment": "APPROVED_WITH_CONDITIONS",
  "summary": "Architecture is sound but requires hardening in token storage and key rotation.",
  "layerReview": [
    {
      "layer": "API Layer",
      "assessment": "OAuth 2.0 integration well-designed",
      "concerns": ["Token refresh logic must be idempotent"]
    },
    {
      "layer": "Data Layer",
      "assessment": "Session schema supports audit requirements"
    }
  ],
  "dependencies": [
    {
      "component": "Database",
      "reason": "Session token storage"
    }
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
    "Add rate limiting to login endpoint",
    "Log all privilege escalations"
  ]
}
```

## Quality Checklist

- [ ] Overall assessment is one of: APPROVED, APPROVED_WITH_CONDITIONS, REJECTED
- [ ] Summary concisely explains the assessment
- [ ] Layer review covers at least API, Business, and Data layers
- [ ] Security section identifies HIGH-severity risks with mitigations
- [ ] Dependencies are clearly explained (why do we need this?)
- [ ] Recommendations are actionable (not vague like "make it secure")
- [ ] Output is valid JSON matching the schema exactly
