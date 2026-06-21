# Tax Compliance Extension

Polyglot extension demonstrating Python subprocess integration for domain-specific tax validation.

## Purpose

Extend the baseline orchestrator with tax-specific logic:
- **Multi-currency validation** — Ensure architecture handles multiple currencies
- **International tax rules** — Support regional variations (US, EU, etc.)
- **Compliance checks** — Verify rounding, precision, audit trail requirements

## Architecture

```
TypeScript Orchestrator
        ↓
  HookRegistry (stage:after)
        ↓
Python Agent (JSON stdin/stdout)
  extensions/tax/python-agent/tax_validation_agent.py
        ↓
  Validates ImplementationPlan
        ↓
  Returns status + blockers
```

## Implementation

**TypeScript side:**
- Hook registered at `stage:after` (planning stage)
- Calls `PythonAgentAdapter.spawnPythonAgent(path, request)`
- Handles Python unavailable gracefully (fallback to mock)

**Python side:**
- Reads JSON from stdin
- Runs tax validation logic (stdlib only)
- Writes JSON to stdout
- Exits with status code

## Contract

**Input (to Python agent):**
```json
{
  "id": "tax-validation-001",
  "skillId": "tax-validation",
  "input": { "implementationPlan": {...} },
  "metadata": { "hook": true },
  "agentMetadata": {
    "agentId": "tax-validator",
    "version": "1.0.0"
  }
}
```

**Output (from Python agent):**
```json
{
  "id": "tax-validation-001",
  "status": "SUCCESS" | "FAILURE",
  "output": {
    "passed": true,
    "errors": [],
    "warnings": ["multi-currency not mentioned"]
  }
}
```

## Files

- `python-agent/tax_validation_agent.py` — Main validation logic
- `python-agent/requirements.txt` — Dependencies (empty, stdlib only)
- `python-agent/README.md` — Python-side documentation

## Wave

**Wave:** 6 (Extensions)  
**Pattern:** Polyglot (Python subprocess)  
**Related:** [Wave 6: Extensions](../../docs/DESIGN.md#wave-6-extensions--domain-specific-customization)

## Running

```bash
# Test Python agent directly
python3 extensions/tax/python-agent/tax_validation_agent.py < input.json

# Test via TypeScript hook
npm run demo                    # Includes tax validation hook
npm run demo:polyglot           # Forces Python (fails if Python unavailable)
```

## How to Extend

To add more tax rules:
1. Edit `python-agent/tax_validation_agent.py`
2. Add new validation functions
3. Update test cases in `python-agent/tests/` (if tests exist)
4. Document new rules in this README

## Related

- [PythonAgentAdapter](../../core/hooks/PythonAgentAdapter.ts) — How Python agents are invoked
- [Extension Pattern Guide](../../docs/DESIGN.md#wave-6-extensions--domain-specific-customization)
- [Progressive Adoption: Step 6](../../docs/runbooks/progressive-adoption.md#step-6-register-unique-overrides-week-6)
