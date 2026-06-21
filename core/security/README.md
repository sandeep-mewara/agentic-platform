# Security Scanner

Input validation and threat detection before prompts reach the LLM.

## Modules

### SecurityScanner
Scans prompts for PII exposure, injection attacks, and malicious patterns.

```typescript
const scanner = new SecurityScanner()
const result = scanner.scanInput(userPrompt)
// {
//   isClean: false,
//   threats: [
//     {
//       type: 'PII',
//       severity: 'HIGH',
//       matched: 'user@example.com',
//       description: 'Email address detected'
//     },
//     {
//       type: 'INJECTION',
//       severity: 'MEDIUM',
//       matched: '`${command}`',
//       description: 'Potential injection pattern detected'
//     }
//   ]
// }
```

**Threat types:**
- `PII` — Email, phone, SSN, credit card
- `INJECTION` — SQL, template, JSP, command substitution
- `MALICIOUS_PATTERN` — eval(), exec, prototype pollution

**Severity levels:**
- `HIGH` — Block immediately (PII, code execution)
- `MEDIUM` — Warn and block (common injections)
- `LOW` — Log but allow (suspicious but harmless)

## Patterns Detected

### PII
- Email: `[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`
- Phone: `(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}`
- SSN: `\d{3}-\d{2}-\d{4}`
- Credit card: `\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}`

### Injection
- Template literals: `{{...}}`, `<%...%>`, `` `${...}` ``
- Command substitution: `$(...)``, backticks
- SQL: `DROP TABLE`, `DELETE FROM`, `UNION SELECT`
- Code execution: `exec(`, `System.exec`

### Malicious
- `eval(`, `System.exec`, `__proto__`, `constructor.prototype`

## Article Section

Maps to **Governance & Compliance** section. Security scanning:

- **Happens at the boundary** — Every prompt checked before LLM sees it
- **Blocks high-severity threats** — PII, code execution immediately rejected
- **Allows graceful degradation** — MEDIUM threats logged but allowed (depends on policy)
- **Non-blocking for demo** — Mock provider can return responses even with threats (configurable)

## Usage

```typescript
import { SecurityScanner } from '@core/security/SecurityScanner'

const scanner = new SecurityScanner()

const result = scanner.scanInput('Please analyze user@example.com')
if (!result.isClean) {
  console.error('High-severity threats found:')
  result.threats.filter(t => t.severity === 'HIGH').forEach(t => {
    console.error(`  ${t.type}: ${t.matched}`)
  })
}
```

## Limitations

- Regex-based detection; can have false positives (e.g., phone-number-like patterns in code)
- Not cryptographic; aims to catch common mistakes, not determined adversaries
- Configurable patterns: easy to add domain-specific regex (PCI, HIPAA, etc.)
