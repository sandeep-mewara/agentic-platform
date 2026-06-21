# Scorecard

The scorecard collects metrics from PDLC stages and computes quality, cost, and latency scores. It provides markdown rendering and pass/fail status reporting.

## Overview

**Purpose:** Track and score PDLC execution quality, efficiency, and speed.

**How it works:**
1. Record metrics for each PDLC stage (duration, tokens, quality)
2. Compute aggregate scores (quality, cost, latency)
3. Render metrics table and summary status

## API

### `Scorecard` Class

```typescript
class Scorecard {
  recordStage(stage: string, duration: number, tokens: number, quality: number): void
  computeScores(): { qualityScore: number; costScore: number; latencyScore: number }
  renderTable(): string
  getSummary(): string
  toJSON(): ScorecardData
}
```

### `recordStage(stage: string, duration: number, tokens: number, quality: number): void`

Record metrics for one PDLC stage.

**Parameters:**
- `stage` (string) — Stage name (requirements, architecture, planning, testing, release)
- `duration` (number) — Execution time in milliseconds
- `tokens` (number) — LLM token count
- `quality` (number) — Quality score (0-100)

**Throws:** Error if quality not in 0-100 range.

**Example:**
```typescript
const scorecard = new Scorecard()
scorecard.recordStage('requirements', 1200, 350, 92)
scorecard.recordStage('architecture', 1500, 420, 88)
scorecard.recordStage('planning', 2000, 550, 85)
scorecard.recordStage('testing', 1800, 480, 90)
scorecard.recordStage('release', 1600, 400, 94)
```

### `computeScores(): { qualityScore: number; costScore: number; latencyScore: number }`

Calculate aggregate quality, cost, and latency scores.

**Returns:** Object with three score metrics (0-100).

**Quality Score:** Average quality across all recorded stages.
- **Formula:** `mean(all stage qualities)`
- **Example:** stages [92, 88, 85, 90, 94] → 89.8 → 90

**Cost Score:** Based on total token usage.
- **<1000 tokens:** 100
- **<2000 tokens:** 80
- **<3000 tokens:** 60
- **<5000 tokens:** 40
- **>5000 tokens:** 20

**Latency Score:** Based on total execution time.
- **<1000ms:** 100
- **<5000ms:** 80
- **<10000ms:** 60
- **<30000ms:** 40
- **>30000ms:** 20

**Example:**
```typescript
const scores = scorecard.computeScores()
console.log(scores.qualityScore)   // 90
console.log(scores.costScore)      // 80
console.log(scores.latencyScore)   // 80
```

### `renderTable(): string`

Render stage metrics and summary scores as markdown table.

**Returns:** Markdown string with stage details and aggregate scores.

**Example output:**
```
| Stage | Duration (ms) | Tokens | Quality |
|-------|---------------|--------|----------|
| requirements | 1200 | 350 | 92 |
| architecture | 1500 | 420 | 88 |
| planning | 2000 | 550 | 85 |
| testing | 1800 | 480 | 90 |
| release | 1600 | 400 | 94 |

### Summary Scores
| Metric | Score |
|--------|-------|
| Quality | 90 |
| Cost Efficiency | 80 |
| Latency | 80 |
```

### `getSummary(): string`

Return human-readable pass/fail summary.

**Returns:** String with status for each metric.

**Status values:**
- **✓ PASS** — Score >= 80
- **⚠ WARN** — Score >= 60 and < 80
- **✗ FAIL** — Score < 60

**Example:**
```typescript
console.log(scorecard.getSummary())
// Output: "Quality: ✓ PASS, Cost: ✓ PASS, Latency: ✓ PASS"
```

### `toJSON(): ScorecardData`

Serialize scorecard to JSON.

**Returns:** Object with records array and computed scores.

**Example:**
```typescript
const json = scorecard.toJSON()
// {
//   records: [
//     { stage: 'requirements', duration: 1200, tokens: 350, quality: 92 },
//     ...
//   ],
//   qualityScore: 90,
//   costScore: 80,
//   latencyScore: 80
// }
```

## Metrics Definition

### Quality Score (0-100)

**Definition:** Average quality across all PDLC stages.

**Formula:** `qualityScore = mean(stage.quality for all stages)`

**Interpretation:**
- **80-100:** Excellent pipeline quality
- **60-79:** Good quality, room for improvement
- **40-59:** Acceptable quality, needs attention
- **0-39:** Poor quality, significant rework needed

**Threshold:** ✓ PASS (80+), ⚠ WARN (60+), ✗ FAIL (<60)

**Used for:** Assessing overall PDLC output quality and correctness.

**Example:**
```
Stages: [92, 88, 85, 90, 94]
Quality Score: (92 + 88 + 85 + 90 + 94) / 5 = 90 → ✓ PASS
```

### Cost Score (0-100)

**Definition:** LLM token usage efficiency.

**Formula:**
```
tokens < 1000   → 100 (very efficient)
tokens < 2000   → 80  (efficient)
tokens < 3000   → 60  (acceptable)
tokens < 5000   → 40  (expensive)
tokens >= 5000  → 20  (very expensive)
```

**Interpretation:**
- **100:** Minimal token usage (< 1000 tokens)
- **80:** Good efficiency (1000-2000 tokens)
- **60:** Acceptable but could optimize (2000-3000 tokens)
- **40:** High usage, consider optimization (3000-5000 tokens)
- **20:** Very high usage, likely issues (> 5000 tokens)

**Threshold:** ✓ PASS (80+), ⚠ WARN (60+), ✗ FAIL (<60)

**Used for:** Monitoring LLM API costs and token efficiency.

**Typical range:** 1000-2000 tokens for a full PDLC run.

**Example:**
```
Stage tokens: [350, 420, 550, 480, 400]
Total tokens: 2200
Cost Score: 80 (efficient) → ✓ PASS
```

### Latency Score (0-100)

**Definition:** PDLC execution time efficiency.

**Formula:**
```
duration < 1000ms   → 100 (excellent)
duration < 5000ms   → 80  (good)
duration < 10000ms  → 60  (acceptable)
duration < 30000ms  → 40  (slow)
duration >= 30000ms → 20  (very slow)
```

**Interpretation:**
- **100:** Very fast (< 1 second)
- **80:** Good responsiveness (1-5 seconds)
- **60:** Acceptable latency (5-10 seconds)
- **40:** Slow, may impact UX (10-30 seconds)
- **20:** Very slow, poor UX (> 30 seconds)

**Threshold:** ✓ PASS (80+), ⚠ WARN (60+), ✗ FAIL (<60)

**Used for:** Monitoring PDLC responsiveness and user experience.

**Typical range:** 3000-5000ms (3-5 seconds) for full PDLC pipeline.

**Example:**
```
Stage durations: [1200, 1500, 2000, 1800, 1600]ms
Total duration: 8100ms
Latency Score: 60 (acceptable) → ⚠ WARN
```

## Usage Pattern

```typescript
import { Scorecard } from '@evaluation'

const scorecard = new Scorecard()

// Record stage metrics during or after PDLC execution
scorecard.recordStage('requirements', 1200, 350, 92)
scorecard.recordStage('architecture', 1500, 420, 88)
scorecard.recordStage('planning', 2000, 550, 85)
scorecard.recordStage('testing', 1800, 480, 90)
scorecard.recordStage('release', 1600, 400, 94)

// Display metrics
console.log(scorecard.renderTable())
console.log('\n' + scorecard.getSummary())

// Serialize for storage
const json = scorecard.toJSON()
console.log(JSON.stringify(json, null, 2))
```

## Example Output

```
Scorecard Results
=================

| Stage | Duration (ms) | Tokens | Quality |
|-------|---------------|--------|----------|
| requirements | 1200 | 350 | 92 |
| architecture | 1500 | 420 | 88 |
| planning | 2000 | 550 | 85 |
| testing | 1800 | 480 | 90 |
| release | 1600 | 400 | 94 |

### Summary Scores
| Metric | Score |
|--------|-------|
| Quality | 90 |
| Cost Efficiency | 80 |
| Latency | 60 |

Quality: ✓ PASS, Cost: ✓ PASS, Latency: ⚠ WARN
```

## Integration with Wave 11

**Wave 11 (Examples)** will use Scorecard to:
1. Collect metrics during real PDLC demo execution
2. Display scorecard metrics in demo output
3. Compare current run vs. golden baseline
4. Track metrics over time for quality monitoring

## Design Notes

- **Simple aggregation:** Uses mean for quality, thresholds for cost/latency
- **Extensible scoring:** Can customize thresholds or add new metrics
- **No persistence:** Scorecard is in-memory; use `toJSON()` to serialize
- **Markdown rendering:** Output compatible with documentation and reports
- **Status symbols:** ✓ PASS, ⚠ WARN, ✗ FAIL for visual clarity

## Related Documentation

- [Evaluation Layer README](../README.md) — Overview
- [Regression Runner](../regression/runner.ts) — Output validation
- [Golden Datasets](../golden-datasets/) — Baseline data
