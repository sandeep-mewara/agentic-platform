# Extension: Tax Validation Agent (Python)

## Role
Demonstrates polyglot extensibility by validating RequirementBriefs against tax domain rules using Python subprocess.

## Technology
- **Language:** Python 3.9+
- **Dependencies:** Stdlib only (`json`, `sys`, `re`)
- **Contract:** JSON stdin/stdout
- **Integration:** Called via `PythonAgentAdapter` from TypeScript

## How It Works

### JSON Contract

**Input (stdin):** AgentRequest JSON
```json
{
  "agentId": "tax-validation-agent",
  "request": {
    "stage": "requirements-validation",
    "payload": {
      "artifactId": "brief-001",
      "featureRequest": "Build multi-currency tax filing system",
      "objectives": [...],
      "constraints": [...],
      "successCriteria": [...],
      "assumptions": [...],
      "risks": [...]
    }
  }
}
```

**Output (stdout):** AgentResponse JSON
```json
{
  "agentId": "tax-validation-agent",
  "status": "SUCCESS",
  "output": "{\"status\": \"APPROVED_WITH_CONDITIONS\", \"issues\": [...], \"recommendations\": [...]}",
  "metadata": {
    "validator": "tax_domain_rules",
    "rules_applied": 5,
    "tax_domain_relevant": true
  }
}
```

### Validation Rules

1. **Tax Keywords:** If tax-related, feature request must explicitly state domain
2. **Accuracy Requirements:** Tax features require explicit audit trail success criteria
3. **Multi-Currency:** Currency handling rules must be documented in constraints
4. **Deadlines:** Filing/deadline features must specify regulatory framework (IRS, etc.)
5. **Risk Documentation:** Tax features must explicitly identify audit, penalty, calculation risks

### Example Workflow

```
[TypeScript Orchestrator]
  ↓
[PythonAgentAdapter.spawnPythonAgent()]
  ↓ stdin: JSON AgentRequest
[tax_validation_agent.py]
  ↓ parse JSON
[validate_requirement_brief()]
  ↓ apply 5 rules
[construct AgentResponse]
  ↓ stdout: JSON
[TypeScript Orchestrator]
  ↓ parse, validate against agentSchema
[Validation result]
```

## Integration with Orchestrator

Called by orchestrator before requirements move to architecture stage:

```typescript
const adapter = new PythonAgentAdapter()
const validationResult = await adapter.spawnPythonAgent(
  'extensions/tax/python-agent/tax_validation_agent.py',
  agentRequest
)

if (validationResult.status === 'ERROR') {
  console.error('Tax validation failed:', validationResult.error)
  // Handle error or escalate
}

const validation = JSON.parse(validationResult.output)
if (validation.issues.length > 0) {
  // Log issues, add to audit trail
}
```

## Fallback Behavior

If Python 3.9+ is not installed:
- `PythonAgentAdapter` logs: `[POLYGLOT] Python not found — using mock response`
- Returns mock validation with all rules passed
- Demo continues with MockLLMProvider response
- See `core/hooks/PythonAgentAdapter.ts` for fallback logic

## Setup

### Prerequisites
```bash
python3 --version  # Must be 3.9+
```

### Run Standalone (debug)
```bash
# Prepare input
cat > /tmp/request.json << 'EOF'
{
  "agentId": "test",
  "payload": {
    "featureRequest": "Build tax filing system",
    "objectives": ["Support IRS e-filing"],
    "constraints": ["IRS 1098 format compliant"],
    "successCriteria": ["Audit trail captures all calculations"],
    "assumptions": [],
    "risks": [{"category": "Audit", "description": "...", "severity": "HIGH"}]
  }
}
EOF

# Run agent
python3 tax_validation_agent.py < /tmp/request.json | jq .
```

### Run via Orchestrator
```bash
npm run demo              # Full PDLC with Python validation (if Python available)
npm run demo:polyglot     # Explicit polyglot mode; fails if Python unavailable
```

## Article Section

Maps to **Polyglot Execution & Extensibility** section of the article. Demonstrates:
1. Language-agnostic agent contract (JSON stdin/stdout)
2. Domain expertise in non-JavaScript context (Python)
3. Graceful fallback if runtime unavailable
4. Type-safe integration via Zod validation

## Testing

Test pattern:
```typescript
const adapter = new PythonAgentAdapter()

// Tax-relevant brief
const briefWithTax = { featureRequest: "Tax filing system", ... }
const result = await adapter.spawnPythonAgent('...tax_validation_agent.py', req)

// Assertions:
// - status === 'SUCCESS'
// - output.issues includes accuracy/audit trail requirement
// - output.tax_domain_detected === true
```

## Future Extensions

Possible expansions of tax validation:
- GDPR compliance checks for tax data in EU
- GAAP accounting principle validation
- Transfer pricing documentation
- VAT/GST handling by jurisdiction
