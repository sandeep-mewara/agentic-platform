# Memory Skill

Managed memory context for agents to record and recall prior architectural decisions.

## Purpose

Enable agents to:
- **Record** decisions made in prior stages (e.g., "we chose CQRS pattern")
- **Recall** decisions from context management (e.g., "what patterns have we already committed to?")
- **Prevent semantic drift** — ensure consistency across agent outputs

## Pattern

```typescript
import { ContextManager } from '@skills/memory/tool'

const memory = new ContextManager()

// Record a decision
memory.recordDecision('architecture', {
  pattern: 'CQRS',
  rationale: 'Separates read and write models for scalability',
  decidedAt: 'architecture-review stage',
  approvedBy: 'architecture-council'
})

// Recall decisions
const priorDecisions = memory.recall('architecture patterns')
// Returns: [{ pattern: 'CQRS', rationale: '...', ... }]
```

## Status

**Status:** Inner-source skill (not yet implemented)  
**Wave:** 4 (Skills Layer)  
**Contributed by:** (Open for team contributions)  
**Target:** Wave 13 or later (based on adoption)

## How to Contribute

1. **Implement** the ContextManager class in `tool.ts`
2. **Create tests** validating record/recall behavior
3. **Update this README** with API details
4. **Register in registry** (`registry/skills/catalog.json`)
5. **Document use cases** (which agents benefit from this?)

## Related

- [Wave 4: Skills Layer](../../docs/DESIGN.md#wave-4-skills--reusable-utilities)
- [Retrieval Skill](retrieval/README.md) — Search for documents (vs. memory for decisions)
- [Search Skill](search/README.md) — Find patterns in codebase (vs. memory for decisions)
