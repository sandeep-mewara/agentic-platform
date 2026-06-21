# Workflows Catalog

Directory of orchestration sequences: standard pipelines and domain-specific variations.

## Purpose

Define and discover orchestration workflows:
- **Standard workflow** — The 5-stage PDLC
- **Domain workflows** — Finance-specific, healthcare-specific sequences
- **Custom workflows** — Teams define their own sequences
- **Execution strategy** — Sequential, parallel, with gates

## Schema

Each workflow entry follows this structure:

```json
{
  "id": "pdlc-baseline",
  "name": "5-Stage PDLC",
  "type": "sequential",
  "stages": [
    "requirements-analysis",
    "architecture-review",
    "planning",
    "testing",
    "release-readiness"
  ],
  "description": "Standard product development lifecycle: from feature request to production readiness",
  "tags": ["core", "baseline", "wave-5"],
  "metadata": {
    "gatesBefore": ["testing"],
    "executionPattern": "sequential",
    "estimatedDuration": "15s"
  }
}
```

## Field Definitions

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| `id` | string | ✓ | Unique identifier (kebab-case) |
| `name` | string | ✓ | Human-readable name |
| `type` | string | ✓ | sequential, parallel, critique |
| `stages` | string[] | ✓ | Ordered list of stage IDs |
| `description` | string | ✓ | What this workflow does (1-2 sentences) |
| `tags` | string[] | — | Keywords (core, baseline, wave-5, etc.) |
| `metadata.gatesBefore` | string[] | — | Which stages require HITL approval before proceeding |
| `metadata.executionPattern` | string | — | How stages execute (sequential, parallel, etc.) |
| `metadata.estimatedDuration` | string | — | Expected end-to-end time |

## Current Workflows

See `catalog.json` for the current list of registered workflows.

## Workflow Patterns

### Sequential (Default)
Stages execute one after another. Output of stage N → input of stage N+1.

```
Stage 1 → Stage 2 → Stage 3 → ... → Stage N
```

**Use when:** Output of one stage directly feeds the next (PDLC)

### Parallel
Stages execute concurrently. All receive same input, results merged.

```
   ├─ Stage A ─┐
   ├─ Stage B ─┤
   └─ Stage C ─┘
        ↓
    Merge Results
```

**Use when:** Stages are independent reviews of same artifact (e.g., security review + performance review in parallel)

### Critique
Stage A executes, stage B critiques it, stage A revises based on feedback (loop).

```
Stage 1 → Critique → Revise? → No → Done
              ↑                   ↑
              └───── Yes ─────────┘
```

**Use when:** Iterative refinement (e.g., architecture review → security critique → revised architecture)

## How to Define a Workflow

### Step 1: Plan Stages
Decide which agents/stages, in what order, with what gates.

### Step 2: Add to Catalog
```json
{
  "id": "finance-pdlc",
  "name": "Finance PDLC",
  "type": "sequential",
  "stages": [
    "requirements-analysis",
    "architecture-review",     // Finance team reviews for SOX
    "planning",
    "testing",
    "release-readiness"
  ],
  "description": "PDLC with finance compliance gates",
  "tags": ["finance", "domain-specific"],
  "metadata": {
    "gatesBefore": ["release-readiness"],
    "executionPattern": "sequential"
  }
}
```

### Step 3: Register in Orchestrator
```typescript
const orchestrator = new ConvergedAgentOrchestrator(
  llmProvider,
  tracer,
  hooks,
  spendTracker
)
// Orchestrator uses workflow from registry
const workflow = registry.findWorkflow('finance-pdlc')
```

## Usage

### Load All Workflows
```typescript
import { RegistryReader } from '@registry/RegistryReader'

const reader = new RegistryReader()
const workflows = await reader.loadCatalog('registry/workflows/catalog.json')
```

### Find Baseline Workflow
```typescript
const pdlc = workflows.find(w => w.tags && w.tags.includes('baseline'))
```

### Find Domain-Specific Workflows
```typescript
const financeWorkflows = workflows.filter(w =>
  w.tags && w.tags.includes('finance')
)
```

## Wave

**Wave:** 5 (Capabilities) define stages  
**Wave 7:** Registry & Discovery define workflow catalog  
**Related:** [Wave 5: Capabilities](../../docs/DESIGN.md#wave-5-capabilities--agents-composing-skills)

## Related

- [Agents Catalog](../agents/README.md) — Agents that execute stages
- [Patterns Catalog](../patterns/README.md) — Execution strategies
- [ConvergedAgentOrchestrator](../../core/orchestrator/ConvergedAgentOrchestrator.ts) — Runs workflows
