# Regression Runner

The regression runner validates PDLC pipeline outputs against golden datasets. It loads expected outputs, runs the demo, compares results, and generates regression reports.

## Overview

**Purpose:** Detect regressions when code changes. Compare actual PDLC outputs against golden baselines.

**How it works:**
1. Load golden dataset (feature request + expected outputs)
2. Run demo with same feature request
3. Compare actual outputs against expected (Zod validation + field checking)
4. Aggregate diffs into pass/fail report

## API

### `RegressionRunner` Class

```typescript
class RegressionRunner {
  loadGoldenDataset(filePath: string): GoldenDataset
  async runDemo(request: string): Promise<DemoOutput>
  compareOutputs(actual: DemoOutput, expected: GoldenDataset['expectedOutputs']): DiffReport[]
  generateReport(diffs: DiffReport[]): RegressionReport
}
```

### `loadGoldenDataset(filePath: string): GoldenDataset`

Loads golden dataset JSON file.

**Returns:** `GoldenDataset` with featureRequest and expectedOutputs for all 5 stages.

**Throws:** Error if file not found or JSON invalid.

**Example:**
```typescript
const runner = new RegressionRunner()
const dataset = runner.loadGoldenDataset('evaluation/golden-datasets/pdlc.json')
console.log(dataset.featureRequest)  // "Add OAuth 2.0 authentication..."
```

### `async runDemo(request: string): Promise<DemoOutput>`

Runs PDLC demo with given feature request.

**Returns:** `DemoOutput` with outputs from all 5 stages.

**Note:** Current implementation returns mock outputs. Wave 11 will integrate with real `ConvergedAgentOrchestrator`.

**Example:**
```typescript
const output = await runner.runDemo('Add authentication')
console.log(output.requirementBrief)      // RequirementBrief object
console.log(output.architectureReview)    // ArchitectureReview object
console.log(output.releaseReadinessReport) // ReleaseReadinessReport object
```

### `compareOutputs(actual: DemoOutput, expected: GoldenDataset['expectedOutputs']): DiffReport[]`

Validates actual outputs against expected. Returns one `DiffReport` per stage.

**Validation:**
1. **Zod schema validation** — Does actual match artifact schema?
2. **Field presence** — Are all expected fields present in actual?
3. **Type matching** — Do fields have correct types?

**Returns:** Array of `DiffReport` objects, one per stage.

**DiffReport fields:**
- `stage` (string) — Stage name (requirements, architecture, planning, testing, release)
- `passed` (boolean) — Did this stage pass validation?
- `missingFields` (string[]) — Expected fields not present in actual
- `typeMismatches` (object[]) — Fields with wrong type
  - `field` — Field name
  - `expected` — Expected type
  - `actual` — Actual type
- `errors` (string[]) — Zod validation errors

**Example:**
```typescript
const diffs = runner.compareOutputs(actual, dataset.expectedOutputs)
for (const diff of diffs) {
  console.log(`${diff.stage}: ${diff.passed ? 'PASS' : 'FAIL'}`)
  if (!diff.passed) {
    console.log(`  Errors: ${diff.errors}`)
    console.log(`  Missing: ${diff.missingFields}`)
    console.log(`  Type mismatches: ${diff.typeMismatches}`)
  }
}
```

### `generateReport(diffs: DiffReport[]): RegressionReport`

Aggregates per-stage diffs into final regression report.

**Returns:** `RegressionReport` with:
- `runAt` (number) — Timestamp
- `featureRequest` (string) — Feature request text
- `stages` (DiffReport[]) — Per-stage results
- `allPassed` (boolean) — Did all stages pass?
- `summary` (string) — Human-readable summary

**Example:**
```typescript
const report = runner.generateReport(diffs)
console.log(report.summary)
// "All stages PASSED ✓"
// or
// "2/5 stages FAILED:
//   - architecture: 1 errors, 2 missing fields, 0 type mismatches
//   - testing: 0 errors, 3 missing fields, 1 type mismatch"
```

## Usage Pattern

```typescript
import { RegressionRunner } from '@evaluation'

const runner = new RegressionRunner()

try {
  // 1. Load golden dataset
  const dataset = runner.loadGoldenDataset('evaluation/golden-datasets/pdlc.json')
  console.log(`Testing feature: ${dataset.featureRequest}`)

  // 2. Run demo
  console.log('Running demo...')
  const actual = await runner.runDemo(dataset.featureRequest)

  // 3. Compare outputs
  console.log('Comparing outputs...')
  const diffs = runner.compareOutputs(actual, dataset.expectedOutputs)

  // 4. Generate report
  const report = runner.generateReport(diffs)
  console.log(report.summary)

  // 5. Check result
  if (report.allPassed) {
    console.log('✓ Regression test PASSED')
    process.exit(0)
  } else {
    console.log('✗ Regression test FAILED')
    for (const stage of report.stages) {
      if (!stage.passed) {
        console.log(`\nStage: ${stage.stage}`)
        if (stage.errors.length > 0) {
          console.log(`Validation errors: ${stage.errors.join(', ')}`)
        }
        if (stage.missingFields.length > 0) {
          console.log(`Missing fields: ${stage.missingFields.join(', ')}`)
        }
      }
    }
    process.exit(1)
  }
} catch (error) {
  console.error('Regression test error:', error)
  process.exit(1)
}
```

## Interpreting Diff Reports

### All Stages Pass
```
stage: "requirements"
passed: true
missingFields: []
typeMismatches: []
errors: []
```
→ Actual output matches golden dataset structure.

### Missing Fields
```
stage: "architecture"
passed: false
missingFields: ["scalability", "compliance"]
typeMismatches: []
errors: []
```
→ Expected fields not present in actual. Likely the agent didn't generate these fields.

### Type Mismatch
```
stage: "planning"
passed: false
missingFields: []
typeMismatches: [
  { field: "phases", expected: "object", actual: "string" },
  { field: "metadata.createdAt", expected: "number", actual: "string" }
]
errors: []
```
→ Fields present but with wrong type. Check LLM output format or schema changes.

### Validation Errors
```
stage: "testing"
passed: false
missingFields: []
typeMismatches: []
errors: [
  "testCases: Expected array, got string",
  "qualityGates.0.name: String too short (min 1 char)"
]
```
→ Zod schema validation failed. Check artifact schema definitions.

## Example Output

Running regression test on golden dataset:

```
Testing feature: Add OAuth 2.0 authentication to support single sign-on (SSO)...
Running demo...
Comparing outputs...
Regression Report
=================
runAt: 1719379200000
featureRequest: "Add OAuth 2.0 authentication..."

Stages:
  ✓ requirements: PASS
  ✓ architecture: PASS
  ✓ planning: PASS
  ✓ testing: PASS
  ✓ release: PASS

Result: All stages PASSED ✓
```

## Integration with Wave 11

**Wave 11 (Examples)** will provide:
1. Real PDLC demo runner (integrating with `ConvergedAgentOrchestrator`)
2. Multiple golden datasets (various feature types)
3. Automated regression test runner (CI/CD integration)
4. Regression test dashboard

## Design Notes

- **Deterministic testing:** Golden datasets provide fixed baselines independent of LLM randomness
- **Mock demo:** Current `runDemo()` returns mock outputs for Wave 8. Wave 11 will integrate real orchestrator
- **Schema validation:** Uses Zod schemas from Wave 1 (Contracts)
- **No database:** All data is file-based JSON and in-memory
- **Extensible:** Can add fuzzy matching, custom validators, or additional metrics

## Related Documentation

- [Golden Datasets](../golden-datasets/) — Baseline data format
- [Evaluation Layer README](../README.md) — Overview
- [Scorecard](../scorecards/report.ts) — Metrics collection
