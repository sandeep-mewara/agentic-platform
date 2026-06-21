# Examples: Domain-Specific Reference Implementations

Three production-grade examples showing how to extend the agentic platform for specific domains.

Each example starts with a starter kit and adds domain-specific hooks, policies, and validation.

---

## Quick Decision Guide

| Example | Domain | Focus | Lines | When to Use |
|---------|--------|-------|-------|-------------|
| **Finance Compliance** | FinOps / Compliance | SOX/tax validation, compliance blocking | ~250 | Financial services, accounting |
| **Healthcare HIPAA** | Healthcare | PII protection, HIPAA audit, patient data | ~250 | Healthcare, biotech |
| **Python ML Agent** | Data Science / ML | Model inference, risk scoring | ~200 | ML teams, data science |

---

## 1. Finance Compliance Example

**Real-world scenario:** Finance team needs to validate architectural decisions against SOX compliance requirements before release.

- **Base:** TypeScript Full starter kit
- **Extends:** Hook-based compliance validation
- **Pattern:** Domain hooks that block release if compliance fails
- **Domain:** Financial operations, tax, multi-currency handling

### Key Features

- SOX compliance validation hook (post-architecture)
- Tax rule validation hook (post-planning)
- Multi-currency cost tracking
- Compliance blockers on release readiness
- Real-world feature request: "Add international payment support"

### Quick Start

```bash
cd examples/finance-compliance
npm install
npm run demo
```

Expected output:
```
✓ Finance orchestrator initialized
✓ Compliance hooks registered

Feature: "Add international payment support"

Stage: requirements → ✓
Stage: architecture → ⚠️ Compliance Check: Currency handling needed
Stage: planning → ✓ Tax rules validated
Stage: testing → ✓
Stage: release → ⚠️ BLOCKED: SOX compliance check failed (currency validation missing)

Result: Release blocked until compliance requirements addressed
```

---

## 2. Healthcare HIPAA Example

**Real-world scenario:** Healthcare team needs to protect patient data (PII) while maintaining audit trail.

- **Base:** TypeScript Full starter kit
- **Extends:** PII detection and masking hooks
- **Pattern:** Domain hooks that redact sensitive data and enforce compliance gating
- **Domain:** Healthcare, biotech, patient data management

### Key Features

- PII detection hook (blocks if unmasked patient data found)
- HIPAA audit trail (with automatic redaction)
- Patient data request validation
- Healthcare workflow customization
- Real-world feature request: "Add patient consent tracking"

### Quick Start

```bash
cd examples/healthcare-hipaa
npm install
npm run demo
```

Expected output:
```
✓ Healthcare orchestrator initialized
✓ HIPAA compliance hooks registered

Feature: "Add patient consent tracking"

Stage: requirements → ✓ (PII redacted in audit log)
Stage: architecture → ✓ (encryption validated)
Stage: planning → ✓
Stage: testing → ✓ (HIPAA test coverage verified)
Stage: release → ✓ (audit log approved, patient data protected)

Result: Release approved with HIPAA compliance verified
```

---

## 3. Python ML Agent Example

**Real-world scenario:** Data science team has ML model for risk scoring; integrate into PDLC pipeline for automated evaluation.

- **Base:** Python Extension + TypeScript Full starter kit
- **Extends:** Python agent for ML inference, chained through PDLC
- **Pattern:** Polyglot agents in sequence (TypeScript → Python → TypeScript)
- **Domain:** Machine learning, data science, risk assessment

### Key Features

- Python ML agent (code risk scoring, architecture assessment)
- Chained inference: architecture review output → ML model → release blocker
- Cost tracking for inference
- Real-world integration: model predicts architectural risk
- Real-world feature request: "Add real-time API validation"

### Quick Start

```bash
cd examples/python-ml-agent

# Set up Python
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run demo
npm install
npm run demo
```

Expected output:
```
✓ ML agent initialized
✓ Risk scorer loaded

Feature: "Add real-time API validation"

Stage: requirements → ✓
Stage: architecture → ✓
[ML Agent] Risk Score: 0.72 (HIGH RISK)
  - Missing rate limiting
  - Synchronous I/O pattern
  - Insufficient error handling

Stage: planning → ✓
Stage: testing → ✓
Stage: release → ⚠️ ML Risk Score HIGH (0.72): Recommend architecture review

Result: Release conditional on addressing high-risk areas
```

---

## How to Use These Examples

### For Learning

1. Pick the example matching your domain
2. Read its README (explains domain-specific patterns)
3. Run the demo (see it in action)
4. Explore the code (understand hook patterns)

### For Adoption

1. Copy the example directory
2. Customize hooks for your domain
3. Replace demo with your actual feature request
4. Integrate into your PDLC pipeline

### For Extension

1. Start with the example closest to your domain
2. Add additional hooks for your requirements
3. Register in the hook registry
4. Test with your feature requests

---

## File Structure

```
examples/
├── finance-compliance/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── src/
│   │   ├── hooks.ts      (compliance validation)
│   │   ├── main.ts       (demo)
│   │   └── config.ts     (finance settings)
│   └── README.md         (finance adoption guide)
│
├── healthcare-hipaa/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── src/
│   │   ├── hooks.ts      (HIPAA validation)
│   │   ├── main.ts       (demo)
│   │   └── config.ts     (healthcare settings)
│   └── README.md         (healthcare adoption guide)
│
├── python-ml-agent/
│   ├── requirements.txt
│   ├── agent.py          (ML inference)
│   ├── integration.ts    (orchestrator integration)
│   ├── .env.example
│   ├── package.json
│   └── README.md         (ML adoption guide)
│
└── README.md (this file)
```

---

## Common Patterns Across Examples

### Pattern 1: Validate After Stage

```typescript
hooks.register('stage:architecture:post', async (context) => {
  const validation = await validateDomainLogic(context.output)
  if (!validation.passed) {
    context.output.blockers = context.output.blockers || []
    context.output.blockers.push({
      id: 'domain-validation-failed',
      category: 'domain',
      description: validation.errors.join('; ')
    })
  }
})
```

### Pattern 2: Redact Sensitive Data

```typescript
hooks.register('lifecycle:end', async (context) => {
  const sensitiveFields = ['ssn', 'credit_card', 'api_key']
  const output = JSON.stringify(context.output)
  for (const field of sensitiveFields) {
    output = output.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '***')
  }
  context.output = JSON.parse(output)
})
```

### Pattern 3: Chain Python Agent

```typescript
const mlAdapter = new PythonAgentAdapter('./agent.py')
hooks.register('stage:architecture:post', async (context) => {
  const result = await mlAdapter.call({
    id: `ml-${Date.now()}`,
    skillId: 'risk-assessment',
    input: context.output
  })
  context.output.mlRiskScore = result.output.riskScore
})
```

---

## Next Steps

### To Use an Example

1. **Copy to your project**
   ```bash
   cp -r examples/finance-compliance my-finance-integration
   ```

2. **Customize for your domain**
   - Edit hooks.ts for your policies
   - Update feature request in main.ts
   - Modify config.ts for your settings

3. **Integrate into your product**
   - Wire hooks into your orchestrator
   - Replace mock demo with real request
   - Monitor compliance metrics

### To Create a New Example

See [Extension Guide](../docs/architecture/README.md) for patterns.

Follow this structure:
1. Choose starter kit (Basic/Full/Python)
2. Create domain hooks
3. Demo with real-world feature request
4. Document patterns in README

### To Promote to Baseline

If your example's override proves broadly useful (3+ teams, strong metrics):
1. Measure with Wave 8: Run [regression tests](../evaluation/README.md) and generate [scorecards](../evaluation/scorecards/README.md)
2. Gather metrics: quality score, cost delta, reliability over time
3. Submit to Architecture Council with metrics evidence
4. Follow [Promotion Lifecycle](../docs/promotion-lifecycle/README.md) for evaluation → baseline graduation
5. Your pattern becomes baseline capability for all teams

---

## Troubleshooting

### Example won't run

Check:
- Dependencies installed (`npm install`, `pip install -r requirements.txt`)
- Environment configured (`.env.example` → `.env`)
- TypeScript path aliases working (run from project root)
- Python version 3.6+ for Python examples

### Hooks not executing

Check:
- Hook registered before orchestrator runs
- Hook name matches stage lifecycle point (`stage:architecture:post`, etc.)
- No syntax errors in hook function

### Compliance blocking unexpected

Check:
- Hook validation logic (review console output)
- Feature request triggers the validation
- Blockers are being added to output correctly

---

## Related Documentation

- [Starter Kits](../starter-kits/README.md) — Base templates these examples extend
- [Platform Architecture](../docs/architecture/README.md) — Design principles
- [Extension Guide](../docs/architecture/README.md#layer-6-overrides) — How to customize
- [Promotion Lifecycle](../docs/promotion-lifecycle/README.md) — How examples become baseline
- [Progressive Adoption](../docs/runbooks/progressive-adoption.md) — Integration path

---

## Key Takeaway

These examples show **how to customize the platform for your domain** without modifying core. Each uses the same hook patterns you can apply to your use case.

**Start with:** The example matching your domain.
**Extend with:** Your own domain-specific policies.
**Promote to:** Baseline once proven broadly useful.

Let's build together. 🚀
