# Evaluation Layer

The evaluation layer provides testing and quality assessment tools for validating PDLC pipeline correctness and performance. It includes golden datasets for regression testing and scorecard metrics for quality monitoring.

## Overview

**Design principle:** Deterministic, repeatable evaluation against golden datasets. Regression runner validates output structures; scorecard metrics measure quality, cost, and latency.

**Use cases:**
1. Verify PDLC outputs match expected structures (regression testing)
2. Measure quality, cost, and latency metrics across pipeline stages
3. Detect regressions when code changes
4. Compare real LLM outputs against baselines
5. Monitor quality drift over time

## Components

### 1. Golden Datasets

Predefined, complete PDLC runs with expected outputs at each stage. Used as regression test baselines.

**Location:** `golden-datasets/pdlc.json`

**Format:** One feature request with expected outputs from all 5 PDLC stages:
- Stage 1: RequirementBrief
- Stage 2: ArchitectureReview
- Stage 3: ImplementationPlan
- Stage 4: TestPlan
- Stage 5: ReleaseReadinessReport

**Example:**
```json
{
  "featureRequest": "Add OAuth 2.0 authentication...",
  "expectedOutputs": {
    "stage1_requirementBrief": { ... },
    "stage2_architectureReview": { ... },
    "stage3_implementationPlan": { ... },
    "stage4_testPlan": { ... },
    "stage5_releaseReadinessReport": { ... }
  },
  "metadata": {
    "createdAt": "2024-06-21T12:00:00Z",
    "description": "..."
  }
}
```

### 2. Regression Runner

Loads golden datasets, runs demo, compares outputs, generates regression reports.

**Location:** `regression/runner.ts`

**Class: `RegressionRunner`**

```typescript
class RegressionRunner {
  loadGoldenDataset(filePath: string): GoldenDataset
  async runDemo(request: string): Promise<DemoOutput>
  compareOutputs(actual: DemoOutput, expected: GoldenDataset['expectedOutputs']): DiffReport[]
  generateReport(diffs: DiffReport[]): RegressionReport
}
```

**Methods:**
- `loadGoldenDataset()` — Load JSON golden dataset from file
- `runDemo()` — Run PDLC demo with given feature request (currently mock, integrates with real orchestrator in Wave 11)
- `compareOutputs()` — Compare actual outputs against golden expected outputs; returns per-stage diff reports
- `generateReport()` — Aggregate diffs into regression report with pass/fail status

**Usage Pattern:**
```typescript
const runner = new RegressionRunner()
const dataset = runner.loadGoldenDataset('evaluation/golden-datasets/pdlc.json')
const actual = await runner.runDemo(dataset.featureRequest)
const diffs = runner.compareOutputs(actual, dataset.expectedOutputs)
const report = runner.generateReport(diffs)

if (report.allPassed) {
  console.log('✓ Regression test PASSED')
} else {
  console.log('✗ Regression test FAILED')
  console.log(report.summary)
  for (const stage of report.stages) {
    if (!stage.passed) {
      console.log(`Stage ${stage.stage}:`)
      console.log(`  - Errors: ${stage.errors.join(', ')}`)
      console.log(`  - Missing fields: ${stage.missingFields.join(', ')}`)
    }
  }
}
```

### 3. Scorecard

Collects metrics from PDLC stages and computes quality, cost, and latency scores.

**Location:** `scorecards/report.ts`

**Class: `Scorecard`**

```typescript
class Scorecard {
  recordStage(stage: string, duration: number, tokens: number, quality: number): void
  computeScores(): { qualityScore: number; costScore: number; latencyScore: number }
  renderTable(): string   // Markdown table
  getSummary(): string    // PASS/WARN/FAIL summary
  toJSON(): ScorecardData
}
```

**Methods:**
- `recordStage()` — Record metrics for one PDLC stage
- `computeScores()` — Calculate quality, cost, and latency scores (0-100)
- `renderTable()` — Render stage metrics as markdown table
- `getSummary()` — Return PASS/WARN/FAIL status string
- `toJSON()` — Serialize scorecard to JSON

**Usage Pattern:**
```typescript
const scorecard = new Scorecard()

// Record each stage
scorecard.recordStage('requirements', 1200, 350, 92)   // duration (ms), tokens, quality
scorecard.recordStage('architecture', 1500, 420, 88)
scorecard.recordStage('planning', 2000, 550, 85)
scorecard.recordStage('testing', 1800, 480, 90)
scorecard.recordStage('release', 1600, 400, 94)

// Compute and display
const scores = scorecard.computeScores()
console.log(scorecard.renderTable())
console.log(scorecard.getSummary())  // "Quality: ✓ PASS, Cost: ✓ PASS, Latency: ✓ PASS"
```

## Metrics Definition

### Quality Score (0-100)
Average quality across all PDLC stages.
- **Formula:** Mean of stage-level quality scores
- **Used for:** Assessing overall PDLC output quality
- **Threshold:** 80+ = PASS, 60+ = WARN, <60 = FAIL

### Cost Score (0-100)
Based on total token usage across pipeline.
- **<1000 tokens:** 100 (very efficient)
- **<2000 tokens:** 80 (efficient)
- **<3000 tokens:** 60 (acceptable)
- **<5000 tokens:** 40 (expensive)
- **>5000 tokens:** 20 (very expensive)
- **Used for:** Monitoring LLM usage efficiency
- **Threshold:** 80+ = PASS, 60+ = WARN, <60 = FAIL

### Latency Score (0-100)
Based on total execution time (all stages combined).
- **<1 second:** 100 (excellent)
- **<5 seconds:** 80 (good)
- **<10 seconds:** 60 (acceptable)
- **<30 seconds:** 40 (slow)
- **>30 seconds:** 20 (very slow)
- **Used for:** Monitoring pipeline responsiveness
- **Threshold:** 80+ = PASS, 60+ = WARN, <60 = FAIL

## Integration with Demo

**Wave 11 (Examples):** Will include a demo runner that:
1. Loads golden datasets
2. Runs PDLC orchestrator with real LLM (e.g., Claude)
3. Compares outputs using regression runner
4. Records metrics in scorecard
5. Displays results with pass/fail status

## File Structure

```
evaluation/
  golden-datasets/
    pdlc.json             # One complete golden PDLC run
  
  regression/
    runner.ts             # RegressionRunner class
    README.md
  
  scorecards/
    report.ts             # Scorecard class
    README.md
  
  index.ts                # Exports
  README.md               # This file
```

## Cross-Review Notes

**Wave 8 Requirements:**
- ✅ Zod schemas for all data types (DiffReport, RegressionReport, ScoreRecord, ScorecardData)
- ✅ RegressionRunner with 4 methods (loadGoldenDataset, runDemo, compareOutputs, generateReport)
- ✅ Scorecard with metrics (qualityScore, costScore, latencyScore)
- ✅ Golden dataset with realistic PDLC run
- ✅ READMEs documenting all classes and metrics
- ✅ index.ts exports all public types and classes
- ✅ TypeScript compilation: --noEmit clean
- ✅ No new circular dependencies (imports only from contracts)

## Article Section

Maps to **Evaluation Layer** section of article. Demonstrates:
1. Regression testing pattern for pipeline validation
2. Metric collection and scoring for quality assessment
3. Golden dataset concept for deterministic testing
4. Foundation for real LLM quality monitoring (Wave 11 examples)

## Future Work

- [ ] Fuzzy matching for broader diff tolerance (handle minor output variations)
- [ ] Integration with CI/CD (auto-run regression on commits)
- [ ] Historical metrics tracking (monitor quality drift over time)
- [ ] Real Claude integration (test with actual LLM responses)
- [ ] Comparative analysis (new vs. baseline metrics)
- [ ] Custom metric plugins (extensible scoring)
- [ ] Web dashboard for metric visualization

## Related Waves

- **Wave 1-4:** Contracts, Core, Governance, Skills
- **Wave 5-7:** Capabilities, Extensions, Registry
- **Wave 8:** Evaluation (this layer)
- **Wave 9:** Documentation
- **Wave 10:** Starter Kits
- **Wave 11:** Examples & Demo
