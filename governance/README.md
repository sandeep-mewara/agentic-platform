# Governance

Policy engine, compliance checking, and audit logging for PDLC governance.

## Modules

- **policies/** — PolicyEngine with GuardrailPolicy definitions and evaluation
- **compliance/** — ComplianceChecker with mandatory field validation and PII detection
- **audit/** — AuditWriter that records all governance events to audit_log.jsonl

## Article Section

Maps to **Governance & Compliance** section. The governance layer enables:

1. **Policy Engine:** Product teams define guardrail policies (e.g., "all RequirementBriefs must have at least 3 success criteria") and evaluate them at stage boundaries
2. **Compliance Checking:** Mandatory field validation and PII-clean gates prevent incomplete or unsafe data from flowing through PDLC
3. **Audit Trail:** Every governance decision (policy violation, compliance check, security event, HITL approval) is recorded to immutable audit log

## Usage

```typescript
import {
  PolicyEngine,
  ComplianceChecker,
  AuditWriter,
  type GuardrailPolicy,
} from '@governance'

// Define policy
const policy: GuardrailPolicy = {
  id: 'brief-quality',
  name: 'Requirement Brief Quality',
  enabled: true,
  severity: 'ERROR',
  rules: [
    {
      name: 'min-objectives',
      condition: (ctx) => Array.isArray(ctx.output?.objectives) && ctx.output.objectives.length >= 3,
      message: 'RequirementBrief must have at least 3 objectives',
    },
  ],
}

const engine = new PolicyEngine()
engine.registerPolicy(policy)

const results = engine.evaluate({
  stage: 'requirements-analysis',
  output: { objectives: ['A', 'B'] },
})

// Check compliance
const checker = new ComplianceChecker({
  mandatoryFields: ['artifactId', 'featureRequest', 'objectives'],
})

const compliance = checker.check(requirementBrief)
if (!compliance.isCompliant) {
  console.error('Compliance violations:', compliance.violations)
}

// Record to audit log
const auditor = new AuditWriter('./audit_log.jsonl')
auditor.recordComplianceCheck(traceId, 'requirements-analysis', compliance.isCompliant)
auditor.recordPolicyViolation(traceId, 'requirements-analysis', 'brief-quality', ['min-objectives'])
```

## Imports

```typescript
import { PolicyEngine, type GuardrailPolicy } from '@governance/policies/engine'
import { ComplianceChecker, type ComplianceResult } from '@governance/compliance/checker'
import { AuditWriter, type AuditEntry } from '@governance/audit/writer'
```
