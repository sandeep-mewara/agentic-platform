# Policy Engine

Guardrail policies and evaluation for PDLC stage outputs.

## Concepts

### GuardrailPolicy
Defines a set of rules to evaluate outputs at a stage boundary.

```typescript
interface GuardrailPolicy {
  id: string                      // Unique policy ID
  name: string                    // Human-readable name
  description: string             // What this policy guards
  enabled: boolean                // Can be toggled on/off
  rules: PolicyRule[]             // Rules to evaluate
  severity: 'INFO' | 'WARN' | 'ERROR'  // Violation severity
}
```

### PolicyRule
A single condition to check.

```typescript
interface PolicyRule {
  name: string                    // Rule identifier
  condition: (context) => boolean // Predicate function
  message: string                 // Message if fails
}
```

### PolicyContext
Data provided to rule conditions.

```typescript
interface PolicyContext {
  stage: string                   // PDLC stage name
  input?: unknown                 // Stage input
  output?: unknown                // Stage output
  metadata?: Record<string, unknown>
}
```

### PolicyResult
Evaluation outcome.

```typescript
interface PolicyResult {
  policyId: string
  passed: boolean
  violations: PolicyViolation[]
}

interface PolicyViolation {
  rule: string
  message: string
  severity: 'INFO' | 'WARN' | 'ERROR'
}
```

## PolicyEngine API

```typescript
class PolicyEngine {
  registerPolicy(policy: GuardrailPolicy): void
  registerPolicies(policies: GuardrailPolicy[]): void
  evaluate(context: PolicyContext): PolicyResult[]
  getPolicy(policyId: string): GuardrailPolicy | undefined
  listPolicies(): GuardrailPolicy[]
  disablePolicy(policyId: string): void
  enablePolicy(policyId: string): void
}
```

## Examples

### Example 1: RequirementBrief Quality Policy

```typescript
const policy: GuardrailPolicy = {
  id: 'brief-quality',
  name: 'Requirement Brief Quality',
  description: 'Ensures RequirementBrief has sufficient detail',
  enabled: true,
  severity: 'ERROR',
  rules: [
    {
      name: 'has-objectives',
      condition: (ctx) => Array.isArray(ctx.output?.objectives) && ctx.output.objectives.length >= 3,
      message: 'Brief must have at least 3 objectives',
    },
    {
      name: 'has-success-criteria',
      condition: (ctx) => Array.isArray(ctx.output?.successCriteria) && ctx.output.successCriteria.length >= 2,
      message: 'Brief must have at least 2 success criteria',
    },
    {
      name: 'has-constraints',
      condition: (ctx) => Array.isArray(ctx.output?.constraints) && ctx.output.constraints.length >= 1,
      message: 'Brief must document at least 1 constraint',
    },
  ],
}

const engine = new PolicyEngine()
engine.registerPolicy(policy)

const results = engine.evaluate({
  stage: 'requirements-analysis',
  output: requirementBrief,
})

if (!results[0].passed) {
  console.error('Brief quality violations:')
  results[0].violations.forEach(v => console.error(`  - ${v.message}`))
}
```

### Example 2: Finance Compliance Policy

Product teams extend with domain-specific policies:

```typescript
const financePolicy: GuardrailPolicy = {
  id: 'sox-compliance',
  name: 'SOX Compliance Check',
  description: 'Ensures changes meet SOX audit requirements',
  enabled: true,
  severity: 'ERROR',
  rules: [
    {
      name: 'requires-audit-trail',
      condition: (ctx) => ctx.metadata?.auditTrail !== undefined,
      message: 'Finance changes must include audit trail',
    },
    {
      name: 'requires-approval',
      condition: (ctx) => ctx.metadata?.approvers?.length >= 2,
      message: 'Finance changes require 2+ approvers',
    },
  ],
}
```

## Article Section

Maps to **Governance & Policies** section. Policies:

- **Are composable:** Multiple policies can guard the same stage
- **Are dynamic:** Can be enabled/disabled at runtime based on context
- **Are extensible:** Product teams add domain-specific policies without modifying core
- **Fail gracefully:** PolicyEngine returns all violations; caller decides whether to block or warn

## Usage

```typescript
import { PolicyEngine } from '@governance/policies/engine'

const engine = new PolicyEngine()
engine.registerPolicies([policy1, policy2, policy3])

const results = engine.evaluate(context)
const hasErrors = results.some(r => !r.passed && r.violations.some(v => v.severity === 'ERROR'))
if (hasErrors) {
  throw new Error('Policy violations detected')
}
```
