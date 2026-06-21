# Python ML Agent Example

Real-world example: Data science team integrates ML risk scoring model into PDLC pipeline for automated architectural evaluation.

**Pattern:** Python agent (ML inference) → TypeScript orchestrator (PDLC) → Risk-based release blocking

**Target:** ML teams, data science, risk assessment

---

## Quick Start

```bash
# Set up Python
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Test agent directly
echo '{"id": "test", "skillId": "risk-assessment", "input": {"architecture": "basic design"}, "metadata": {}}' | python agent.py
```

Expected output:
```json
{"id": "test", "skillId": "risk-assessment", "timestamp": "...", "status": "success", "output": {"riskScore": 0.8, "riskLevel": "HIGH", ...}}
```

---

## What This Example Shows

### 1. Python ML Model
Risk scorer evaluates architecture for safety gaps:
- Missing error handling
- Synchronous I/O (no async)
- No rate limiting
- Missing caching
- Missing authentication

### 2. Risk Scoring
Produces risk score (0-1):
- **HIGH** (>0.7): Blocks release, provides recommendations
- **MEDIUM** (0.4-0.7): Warning, listed in release report
- **LOW** (<0.4): Approved

### 3. Hook Integration
Runs after architecture stage:
```typescript
hooks.register('stage:architecture:post', mlRiskHook)
```

Adds risk data to output for downstream decisions.

---

## How It Works

```
TypeScript Orchestrator
    ↓
[Architecture Stage] produces review
    ↓
[ML Risk Hook fires]
    ↓
PythonAgentAdapter spawns Python process
    ↓
Python agent.py evaluates architecture
    ↓
Returns risk score + recommendations
    ↓
High risk → adds blocker
    ↓
Release status adjusted
```

---

## Customization

### Add Risk Factor

In `agent.py`:
```python
if 'your_check' not in text:
    risk_factors.append('your_factor')
    total_risk += 0.15  # Adjust weight
```

### Adjust Weights

```python
RISK_WEIGHTS = {
    'missing_error_handling': 0.30,  # Increased
    'synchronous_io': 0.15,           # Decreased
    # ...
}
```

### Change Risk Threshold

In `integration.ts`:
```typescript
if (riskLevel === 'HIGH' || riskScore > 0.6) {  // Lower threshold
  // Add blocker
}
```

---

## Files

- `agent.py` — Risk scoring logic
- `integration.ts` — TypeScript orchestrator integration
- `requirements.txt` — Python dependencies
- `README.md` — This guide

---

## Key Pattern: Polyglot Agents

```typescript
// TypeScript: Create adapter and register hook
const adapter = new PythonAgentAdapter('./agent.py')

hooks.register('stage:architecture:post', async (context) => {
  const result = await adapter.call(request)
  // Use result in TypeScript context
})
```

---

## Risk Scoring Logic

```python
class RiskScorer:
    RISK_WEIGHTS = {
        'missing_error_handling': 0.25,
        'synchronous_io': 0.20,
        'missing_rate_limit': 0.20,
        # ...
    }
    
    def score_architecture(self, text):
        # Check for each risk factor
        # Sum weights
        # Return score 0-1
```

---

## Testing

### Test HIGH risk
```python
text = "basic api without error handling"
# Result: HIGH (0.8)
```

### Test LOW risk
```python
text = "async api with auth, rate limit, cache, error handling, audit"
# Result: LOW (0.1)
```

---

## Related Examples

- [Finance Compliance](../finance-compliance/) — Compliance patterns
- [Healthcare HIPAA](../healthcare-hipaa/) — PII protection
- [Python Extension Starter Kit](../../starter-kits/python-extension/) — Base pattern

---

**This example demonstrates how to integrate Python ML models into the PDLC pipeline using the JSON contract and hook system. 🤖**
