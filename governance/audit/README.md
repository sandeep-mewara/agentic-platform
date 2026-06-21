# Audit Writer

Immutable audit log for governance events.

## Concepts

### AuditEntry
A single audit log record.

```typescript
interface AuditEntry {
  timestamp: number                       // Unix timestamp (ms)
  traceId: string                         // Links to trace/HITL request
  event: string                           // Event type
  stage?: string                          // PDLC stage
  actor?: string                          // Decision maker or system
  action: string                          // What happened
  result: 'SUCCESS' | 'FAILURE' | 'BLOCKED'
  details: Record<string, unknown>        // Event-specific context
}
```

## AuditWriter API

```typescript
class AuditWriter {
  constructor(logPath?: string = './audit_log.jsonl')
  
  record(entry: AuditEntry): void
  recordDecision(traceId, stage, decision, approved, details?): void
  recordPolicyViolation(traceId, stage, policyId, violations): void
  recordComplianceCheck(traceId, stage, isCompliant, violations?): void
  recordSecurityEvent(traceId, stage, threatType, severity, details?): void
  recordLLMCall(traceId, stage, model, tokens): void
  
  getLogPath(): string
}
```

## Log Format

Append-only JSONL (JSON Lines): one entry per line.

```json
{"timestamp":1719000000000,"traceId":"trace-001","event":"LLM_CALL","stage":"requirements-analysis","action":"LLM call to mock","result":"SUCCESS","details":{"model":"mock","tokens":250}}
{"timestamp":1719000001000,"traceId":"trace-001","event":"COMPLIANCE_CHECK","stage":"requirements-analysis","action":"Compliance check passed","result":"SUCCESS","details":{"violations":[]}}
{"timestamp":1719000002000,"traceId":"trace-001","event":"POLICY_VIOLATION","stage":"architecture-review","action":"Policy brief-quality violated","result":"BLOCKED","details":{"policyId":"brief-quality","violations":["Brief must have at least 3 objectives"]}}
{"timestamp":1719000003000,"traceId":"trace-001","event":"DECISION_GATE","stage":"release-readiness","action":"HITL approval","result":"SUCCESS","details":{"approver":"security-team"}}
```

## Examples

### Example 1: Record HITL Decision

```typescript
const auditor = new AuditWriter('./audit_log.jsonl')

auditor.recordDecision(
  traceId,
  'release-readiness',
  'HITL approval by security team',
  true,  // approved
  { approver: 'security-team', reason: 'All tests pass' },
)
```

### Example 2: Record Policy Violation

```typescript
const results = engine.evaluate(context)
const violations = results
  .filter(r => !r.passed)
  .flatMap(r => r.violations.map(v => v.rule))

if (violations.length > 0) {
  auditor.recordPolicyViolation(
    traceId,
    'requirements-analysis',
    'brief-quality',
    violations,
  )
}
```

### Example 3: Record Compliance Check

```typescript
const compliance = checker.check(requirementBrief)
auditor.recordComplianceCheck(
  traceId,
  'requirements-analysis',
  compliance.isCompliant,
  compliance.violations.map(v => v.message),
)
```

### Example 4: Record Security Event

```typescript
const scanResult = security.scanInput(prompt)
if (!scanResult.isClean) {
  for (const threat of scanResult.threats) {
    auditor.recordSecurityEvent(
      traceId,
      'planning',
      threat.type,
      threat.severity,
      { matched: threat.matched, description: threat.description },
    )
  }
}
```

## Article Section

Maps to **Audit & Compliance Trail** section. Audit logging:

- **Immutable:** JSONL append-only prevents tampering
- **Comprehensive:** Records governance decisions, policy violations, compliance checks, security events, LLM calls
- **Traceable:** Every entry links to trace ID and stage for correlation
- **Machine-readable:** JSON format enables parsing, querying, reporting

## Use Cases

### Compliance Reporting
Query audit log for all governance decisions in a time range:
```bash
cat audit_log.jsonl | jq 'select(.event == "DECISION_GATE")'
```

### Root Cause Analysis
Find all events for a specific trace:
```bash
cat audit_log.jsonl | jq "select(.traceId == \"trace-001\")"
```

### Cost Accounting
Sum tokens spent across all LLM calls:
```bash
cat audit_log.jsonl | jq 'select(.event == "LLM_CALL") | .details.tokens' | awk '{sum+=$1} END {print sum}'
```

### Security Incident Response
Find all PII detections:
```bash
cat audit_log.jsonl | jq 'select(.event == "SECURITY_EVENT" and .details.threatType == "PII")'
```

## Usage

```typescript
import { AuditWriter } from '@governance/audit/writer'

const auditor = new AuditWriter('./audit_log.jsonl')

// Record various events during PDLC execution
auditor.recordLLMCall(traceId, 'requirements-analysis', 'mock', 250)
auditor.recordComplianceCheck(traceId, 'requirements-analysis', true)
auditor.recordDecision(traceId, 'release-readiness', 'HITL approval', true)

console.log(`Audit log written to: ${auditor.getLogPath()}`)
```
