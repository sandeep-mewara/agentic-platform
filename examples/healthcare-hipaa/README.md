# Healthcare HIPAA Example

Real-world example: Healthcare team protects patient data (PII) while maintaining HIPAA compliance and audit trails.

**Base:** TypeScript Full starter kit + HIPAA hooks

**Target:** Healthcare, biotech, patient data management

---

## Quick Start

```bash
npm install
npm run demo
```

---

## What This Example Shows

### 1. PII Detection
Hook scans output for personally identifiable information (SSN, medical IDs, patient names, emails, phones).

**Blocks release** if PII found unmasked.

### 2. HIPAA Compliance
Hook verifies architecture addresses:
- Data encryption (TLS/SSL)
- Access control (authorization)
- Audit trail logging

**Adds blocker** if gaps found.

### 3. PII Masking
Hook redacts PII before audit logging: `123-45-6789` → `***REDACTED***`

---

## Domain Hooks

```typescript
// Hook 1: Detect PII
hooks.register('lifecycle:start', detectPII)

// Hook 2: HIPAA compliance
hooks.register('stage:architecture:post', validateHIPAACompliance)

// Hook 3: Mask PII before audit
hooks.register('lifecycle:end', maskPII)
```

---

## Customization

Edit `src/hooks.ts` to:
- Add PII patterns (SSN, MRN, etc.)
- Modify HIPAA checks
- Change redaction format

Example: Add medical record number pattern
```typescript
medicalId: /MRN[:\s]+\d{6,}/gi
```

---

## Files

- `src/hooks.ts` — PII detection, HIPAA validation
- `src/main.ts` — Demo entry point
- `README.md` — This guide

---

## Key Pattern: PII Redaction

```typescript
const PII_PATTERNS = {
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  medicalId: /MRN[:\s]+\d{6,}/gi,
  // ... more patterns
}

// Replace all PII with ***REDACTED***
text = text.replace(pattern, '***REDACTED***')
```

---

## Compliance Checking

```typescript
const hasEncryption = text.includes('encrypt')
const hasAccessControl = text.includes('authorization')
const hasAudit = text.includes('audit')

if (!hasEncryption || !hasAccessControl || !hasAudit) {
  // Add blocker
}
```

---

## Related Examples

- [Finance Compliance](../finance-compliance/) — Compliance blocking patterns
- [Python ML Agent](../python-ml-agent/) — Risk assessment

---

**This example demonstrates how to enforce HIPAA compliance and protect patient data without modifying platform core. 🏥**
