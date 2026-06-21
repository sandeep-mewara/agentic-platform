# Compliance Checker

Validates mandatory fields and detects PII in artifacts.

## Concepts

### ComplianceConfig
Configuration for compliance checking.

```typescript
interface ComplianceConfig {
  mandatoryFields?: string[]      // Required fields in artifact
  checkPII?: boolean              // Enable PII detection (default: true)
  allowedPIIPatterns?: RegExp[]   // Custom allowed patterns (future)
}
```

### ComplianceResult
Outcome of compliance check.

```typescript
interface ComplianceResult {
  isCompliant: boolean
  violations: ComplianceViolation[]
}

interface ComplianceViolation {
  type: 'MISSING_FIELD' | 'PII_DETECTED' | 'INVALID_FORMAT'
  field: string
  message: string
}
```

## ComplianceChecker API

```typescript
class ComplianceChecker {
  constructor(config?: ComplianceConfig)
  addMandatoryField(field: string): void
  addMandatoryFields(fields: string[]): void
  check(data: Record<string, unknown>): ComplianceResult
}
```

## What It Checks

### Mandatory Fields
- Field exists (not null/undefined)
- Field has valid type (string, number, boolean, array, or object)

```typescript
const checker = new ComplianceChecker({
  mandatoryFields: ['artifactId', 'featureRequest', 'objectives'],
})

const result = checker.check({
  artifactId: 'brief-001',
  featureRequest: 'Add auth',
  // objectives missing → VIOLATION
})
```

### PII Detection
Uses SecurityScanner to detect high-severity PII in any field:
- Email addresses
- Phone numbers
- Social Security Numbers
- Credit card numbers

```typescript
const result = checker.check({
  artifactId: 'brief-001',
  featureRequest: 'Add auth',
  objectives: ['Secure user@example.com'] // EMAIL detected
})

result.violations[0].type === 'PII_DETECTED' // true
```

## Examples

### Example 1: RequirementBrief Compliance

```typescript
const checker = new ComplianceChecker({
  mandatoryFields: [
    'artifactId',
    'featureRequest',
    'objectives',
    'successCriteria',
    'constraints',
  ],
})

const brief = {
  artifactId: 'brief-001',
  featureRequest: 'Add user authentication',
  objectives: ['OAuth 2.0', 'Session mgmt'],
  successCriteria: ['Sub-100ms login', 'Zero auth failures'],
  constraints: ['HTTPS required'],
}

const result = checker.check(brief)
if (!result.isCompliant) {
  result.violations.forEach(v => console.error(v.message))
}
```

### Example 2: Dynamic Mandatory Fields

```typescript
const checker = new ComplianceChecker()

// Add fields based on stage or context
if (stage === 'release-readiness') {
  checker.addMandatoryFields([
    'overallStatus',
    'readiness',
    'qualityMetrics',
    'approvals',
  ])
}

const report = getReleaseReadinessReport()
const result = checker.check(report)
```

## Article Section

Maps to **Governance & Compliance** section. Compliance checking:

- **Catches incomplete data:** Mandatory field validation prevents downstream errors
- **Prevents PII leakage:** SecurityScanner integration detects and flags sensitive data
- **Is non-invasive:** ComplianceChecker doesn't modify data; orchestrator decides to block or warn
- **Is product-extensible:** Teams add stage-specific mandatory field sets without modifying core

## Limitations

- PII detection is regex-based (can have false positives)
- Only checks for HIGH-severity PII (configurable in SecurityScanner)
- Nested object validation is JSON-stringified (may miss deeply-nested PII)

## Usage

```typescript
import { ComplianceChecker } from '@governance/compliance/checker'

const checker = new ComplianceChecker({
  mandatoryFields: ['id', 'name', 'status'],
  checkPII: true,
})

const result = checker.check(artifact)
if (!result.isCompliant) {
  throw new Error(`Compliance violations: ${result.violations.map(v => v.message).join(', ')}`)
}
```
