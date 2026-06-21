# Golden Datasets

Baseline datasets for regression testing: known inputs with expected outputs at each stage.

## Purpose

Establish regression testing baseline:
- **Reference data** — One complete, known-good PDLC execution
- **Regression detection** — Did we break something when we changed code?
- **Output validation** — Are all 5 stages producing the right types?

## Golden Run: pdlc.json

One complete PDLC execution from feature request to release readiness.

```json
{
  "id": "golden-pdlc-001",
  "featureRequest": "Add OAuth 2.0 authentication with JWT tokens",
  "stages": {
    "requirements-analysis": {
      "input": { "featureRequest": "..." },
      "expectedOutput": {
        "objectives": [...],
        "constraints": [...],
        "risks": [...],
        "estimatedEffort": { "scope": "medium", "daysEstimate": 5 }
      },
      "expectedSchema": "RequirementBrief"
    },
    "architecture-review": {
      "input": { "requirementBrief": {...} },
      "expectedOutput": {
        "overallAssessment": "APPROVED_WITH_CONDITIONS",
        "security": [...],
        "recommendations": [...]
      },
      "expectedSchema": "ArchitectureReview"
    },
    ...
  },
  "expectedFinalStatus": "APPROVED"
}
```

## Format

Each golden dataset contains:

| Field | Type | Purpose |
|-------|------|---------|
| `id` | string | Unique identifier |
| `featureRequest` | string | User input |
| `stages` | object | Expected output per stage |
| `stages[name].input` | object | What that stage receives |
| `stages[name].expectedOutput` | object | Expected structure/content |
| `stages[name].expectedSchema` | string | Zod schema name |
| `expectedFinalStatus` | string | APPROVED, REJECTED, etc. |

## Usage: Regression Testing

```typescript
import { RegressionRunner } from '../../evaluation/regression/runner'

const runner = new RegressionRunner(goldenDataset)
const results = await runner.run(orchestrator, featureRequest)

// Results: { passed: boolean, diffs: Array<{stage, expected, actual}> }
if (!results.passed) {
  console.log('Regressions detected:')
  results.diffs.forEach(d => {
    console.log(`  ${d.stage}: expected ${d.expected}, got ${d.actual}`)
  })
}
```

## How to Add More Golden Datasets

1. **Run a known-good PDLC execution**
   ```bash
   npm run demo > output.json
   ```

2. **Extract the stages + outputs**
   ```typescript
   const golden = {
     featureRequest: "...",
     stages: {
       "requirements-analysis": { expectedOutput: ... },
       ...
     },
     expectedFinalStatus: "APPROVED"
   }
   ```

3. **Add to pdlc.json**
   ```json
   {
     "datasets": [
       { golden dataset 1 },
       { golden dataset 2 }
     ]
   }
   ```

4. **Run regression**
   ```bash
   npm run regression
   ```

## Maintenance

**When to update golden datasets:**
- Baseline orchestrator changes behavior intentionally (e.g., adds new field)
- Output format changes (e.g., new severity levels)
- Mock LLM provider changes responses

**When NOT to update:**
- Bug fixes (update golden to match fix, not revert fix)
- Performance improvements (content unchanged, just faster)

## Wave

**Wave:** 8 (Evaluation)  
**Related:** [Wave 8: Evaluation](../../docs/DESIGN.md#wave-8-evaluation--metrics--regression-testing)

## Related

- [Regression Runner](../regression/README.md) — How to run regression tests
- [Scorecards](../scorecards/README.md) — Quality metrics (vs. golden for regression)
- [Benchmarks](../benchmarks/README.md) — Performance (vs. golden for correctness)
