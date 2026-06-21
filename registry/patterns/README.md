# Patterns Catalog

Directory of execution patterns: how stages orchestrate and interact.

## Purpose

Define interaction patterns between stages:
- **Sequential** — Linear execution (Stage A → B → C)
- **Parallel** — Concurrent execution (A, B, C in parallel)
- **Critique** — Iterative refinement (A → B reviews → revise)
- **Branch** — Conditional execution (if X then A else B)

## Schema

Each pattern entry follows this structure:

```json
{
  "id": "sequential",
  "name": "Sequential Execution",
  "type": "sequential",
  "description": "Execute stages one after another. Output of stage N becomes input of stage N+1.",
  "tags": ["core", "baseline"],
  "dataFlow": "linear",
  "properties": {
    "blocking": true,
    "errorHandling": "fail-fast"
  }
}
```

## Field Definitions

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| `id` | string | ✓ | Unique identifier (kebab-case) |
| `name` | string | ✓ | Human-readable name |
| `type` | string | ✓ | sequential, parallel, critique, branch |
| `description` | string | ✓ | How this pattern works (1-3 sentences) |
| `tags` | string[] | — | Keywords (core, experimental, etc.) |
| `dataFlow` | string | ✓ | linear, fan-out, fan-in, cyclic |
| `properties.blocking` | boolean | — | Does pattern block on results? |
| `properties.errorHandling` | string | — | fail-fast, fail-silent, retry |

## Current Patterns

See `catalog.json` for current patterns.

## Pattern Types

### Sequential
Stages execute one-by-one in order.

```
Stage 1 → Stage 2 → Stage 3 → Stage 4 → Stage 5
Input    Output₁   Output₂   Output₃   Output₄
```

**Blocking:** Yes  
**Error handling:** Fail-fast (stop on error)  
**Best for:** PDLC (each stage depends on previous)  
**Example:** Requirements → Architecture → Planning → Testing → Release

### Parallel
Stages execute concurrently. All receive same input.

```
        ├─ Security Review ─┐
Input ──┼─ Performance Audit ┼── Merge → Output
        └─ Compliance Check ┘
```

**Blocking:** Yes (wait for all to complete)  
**Error handling:** Collect all errors, decide if blocking  
**Best for:** Independent reviews of same artifact  
**Example:** Stage 2 input → reviewed by Security + Compliance + Performance simultaneously

### Critique
Stage A executes, Stage B critiques it. If issues found, revise and loop.

```
        ┌─ Critique ─┐
        │     ↓     │
Stage 1 ┤ Revisable? ├─ Stage 2
        │   Yes/No  │
        └───────────┘
```

**Blocking:** Yes  
**Error handling:** Retry on critique feedback, max retries  
**Best for:** Iterative refinement  
**Example:** Architecture proposal → Security critique → revised architecture

### Branch
Conditional execution based on prior stage output.

```
Stage 1
  ↓
Is cost > budget?
  ├─ Yes → Optimization stage → Final
  └─ No  → Proceed → Final
```

**Blocking:** Yes  
**Error handling:** Depends on branch  
**Best for:** Conditional logic based on results  
**Example:** If cost exceeds budget, run optimization loop before release

## How to Define a Pattern

### Step 1: Visualize Flow
Sketch how stages interact.

### Step 2: Document Properties
- Is it blocking?
- What's the data flow?
- How are errors handled?

### Step 3: Add to Catalog
```json
{
  "id": "critique",
  "name": "Critique Pattern",
  "type": "critique",
  "description": "Stage A executes, Stage B provides feedback, Stage A revises if needed.",
  "tags": ["iterative"],
  "dataFlow": "cyclic",
  "properties": {
    "blocking": true,
    "errorHandling": "retry"
  }
}
```

## Implementation in Orchestrator

The ConvergedAgentOrchestrator implements the **sequential** pattern (standard PDLC).

Teams can override to use different patterns:

```typescript
const workflow = registry.findWorkflow('finance-pdlc')
const pattern = registry.findPattern(workflow.metadata.executionPattern)

// Execute based on pattern
if (pattern.type === 'sequential') {
  await runSequential(stages)
} else if (pattern.type === 'parallel') {
  await runParallel(stages)
} else if (pattern.type === 'critique') {
  await runCritique(stages)
}
```

## Wave

**Wave:** 7 (Registry & Discovery)  
**Implemented in:** Wave 5 (Capabilities) via ConvergedAgentOrchestrator  
**Related:** [Wave 7: Registry](../../docs/DESIGN.md#wave-7-registry--discoverability)

## Related

- [Workflows Catalog](../workflows/README.md) — Uses patterns
- [ConvergedAgentOrchestrator](../../core/orchestrator/ConvergedAgentOrchestrator.ts) — Orchestrates patterns
- [Extension: Hooks for Custom Patterns](../../extensions/) — Teams can inject custom patterns via hooks
