# Extensions Layer

Product teams and domain experts extend the agentic platform by:
1. Creating domain-specific agents that override base capabilities
2. Implementing polyglot validation agents (Python, Go, etc.)
3. Integrating with external systems and services
4. Injecting domain expertise without modifying core platform code

## Extension Types

### 1. TypeScript Overrides

Subclass a base capability to inject domain-specific logic:

```typescript
class DomainComplianceAgent extends ArchitectureReviewAgent {
  async run(brief: RequirementBrief): Promise<ArchitectureReview> {
    // Pre-flight domain checks via hooks
    await this.hooks.executeHooks('stage:before', { ... })
    
    // Run base agent
    const baseReview = await super.run(brief)
    
    // Post-process: inject domain recommendations
    return this.enhanceWithDomainChecks(baseReview, brief)
  }
}
```

**Advantages:**
- Full type safety (TypeScript)
- Access to LLMProvider, HookRegistry, artifacts
- No performance overhead
- Testable and debuggable

**Examples:**
- FinanceComplianceAgent: Injects SOX compliance rules

### 2. Polyglot Agents (Python, Go, Rust)

Implement domain logic in specialized languages via JSON stdin/stdout:

```typescript
// TypeScript calls Python subprocess
const adapter = new PythonAgentAdapter()
const response = await adapter.spawnPythonAgent(
  'extensions/tax/python-agent/tax_validation_agent.py',
  agentRequest
)
```

Contract:
- Input: JSON AgentRequest
- Output: JSON AgentResponse
- Error handling: Graceful fallback if runtime unavailable

**Advantages:**
- Use domain-specialized languages
- Leverage existing libraries (pandas, scikit-learn, etc.)
- Decoupled from TypeScript runtime
- Independent testing and deployment

**Examples:**
- TaxValidationAgent: Python stdlib-only validator

### 3. Integration Adapters

Connect to external systems:

```typescript
class SlackNotificationHook {
  async execute(context: HookContext) {
    await slack.postMessage(context.stage, context.output)
  }
}

hooks.registerHook('stage:after', new SlackNotificationHook())
```

**Use Cases:**
- Slack/Teams notifications
- Database logging
- Analytics pipelines
- Third-party compliance services

### 4. Stub Extensions (Future)

Document planned extensions with domain rules and integration patterns:

**Examples:**
- HealthcareComplianceAgent: HIPAA validation (future)
- AISafetyAgent: Model fairness & governance (future)

## Directory Structure

```
extensions/
  finance/
    agent.ts            # FinanceComplianceAgent (TypeScript override)
    README.md           # Pattern, integration, testing
  
  tax/
    python-agent/
      tax_validation_agent.py     # Python validator (stdlib only)
      requirements.txt            # Dependencies (minimal)
      README.md                   # Contract, usage, setup
  
  healthcare/
    README.md           # HIPAA compliance agent (future)
  
  ai-products/
    README.md           # AI safety governance agent (future)
  
  index.ts              # Export all extensions
  README.md             # This file
```

## How Extensions Integrate

### With Orchestrator

Pass override agents to ConvergedAgentOrchestrator:

```typescript
const orchestrator = new ConvergedAgentOrchestrator(
  llm,
  undefined,              // stage 1: default RequirementsAgent
  new FinanceComplianceAgent(llm, hooks),  // stage 2: override
  undefined,              // stage 3: default PlanningAgent
  undefined,              // stage 4: default TestingAgent
  undefined               // stage 5: default ReleaseReadinessAgent
)
```

### With HookRegistry

Register extension hooks to observe/modify stage execution:

```typescript
const extensionHook = {
  stage: 'stage:after',
  handler: async (context) => {
    // Log to external system
    // Notify teams
    // Update metrics
  }
}

hooks.registerHook('stage:after', extensionHook.handler)
```

## Extension Patterns

### Pattern 1: Domain Validation (FinanceComplianceAgent)

1. Detect if domain-relevant (keyword scan)
2. Call base capability
3. Enhance output with domain-specific recommendations
4. Fire hooks to notify subscribers

**Use case:** Finance, healthcare, legal, tax

### Pattern 2: Polyglot Validation (TaxValidationAgent)

1. Receive JSON input via stdin
2. Apply domain rules (Python standard library)
3. Return JSON response via stdout
4. Integrate with PythonAgentAdapter

**Use case:** Data science, ML, specialized domains

### Pattern 3: Notification/Logging (Future)

1. Register hook for stage:after
2. Extract relevant data
3. Post to external system (Slack, database, etc.)

**Use case:** DevOps, observability, team coordination

### Pattern 4: System Integration (Future)

1. Replace mock providers with real implementations
2. Override LLMProvider with custom model calling
3. Override PolicyEngine with domain policies

**Use case:** Multi-tenant SaaS, regulated industries

## Article Section

Maps to **Extensibility & Domain Overrides** section of the article. Demonstrates:
1. Product teams extend without modifying platform
2. Domain expertise injected at capability boundaries
3. Multiple extension mechanisms (override, polyglot, hook, integration)
4. Type safety and testability throughout

## Testing Extensions

### TypeScript Override Testing

```typescript
test('FinanceComplianceAgent injects SOX recommendations', async () => {
  const agent = new FinanceComplianceAgent(mockLLM, hooks)
  const brief = { featureRequest: 'Build payment processor', ... }
  const review = await agent.run(brief)
  
  // Assertions
  expect(review.recommendations).toContain('Enable audit logging')
  expect(mockHooks.calls).toContainEqual({
    event: 'stage:before',
    stage: 'finance-compliance-check'
  })
})
```

### Polyglot Agent Testing

```typescript
test('TaxValidationAgent validates tax requirements', async () => {
  const adapter = new PythonAgentAdapter()
  const brief = { featureRequest: 'Tax filing system', ... }
  const response = await adapter.spawnPythonAgent(
    'extensions/tax/python-agent/tax_validation_agent.py',
    { payload: brief }
  )
  
  // Assertions
  const validation = JSON.parse(response.output)
  expect(validation.tax_domain_detected).toBe(true)
  expect(validation.recommendations).toContain('Add audit trail requirements')
})
```

## Future Extensions

Document your extension here:

- [ ] **HealthcareComplianceAgent** - HIPAA validation (future)
- [ ] **AISafetyAgent** - Model fairness governance (future)
- [ ] **SlackNotificationHook** - Team notifications (future)
- [ ] **DatadogIntegration** - Metrics and tracing (future)

Each extension should:
1. Have clear domain rules
2. Follow one of the established patterns
3. Include comprehensive documentation
4. Be independently testable
5. Integrate without modifying core platform

## Files

- `finance/agent.ts` — FinanceComplianceAgent (TypeScript override)
- `finance/README.md` — Finance extension pattern
- `tax/python-agent/tax_validation_agent.py` — Tax validator (Python)
- `tax/python-agent/README.md` — Polyglot integration guide
- `healthcare/README.md` — Healthcare compliance (future vision)
- `ai-products/README.md` — AI safety governance (future vision)
- `index.ts` — Exports all extensions
- `README.md` — This file
