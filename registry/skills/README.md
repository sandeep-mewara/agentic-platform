# Skills Catalog

Directory of all available skills, their reusability, and which agents use them.

## Purpose

Enable agents to discover and compose reusable skills:
- **Skill inventory** — What utilities are available?
- **Reusability tracking** — Is this skill used by multiple agents?
- **Dependency mapping** — Which agents depend on which skills?

## Schema

Each skill entry follows this structure:

```json
{
  "id": "code-review",
  "name": "Code Review Skill",
  "path": "skills/code-review/",
  "reusable": true,
  "usedBy": ["testing-agent", "release-readiness-agent"],
  "version": "1.0.0",
  "description": "Structured code review with checklist for quality, risks, and gaps",
  "tags": ["core", "pdlc", "wave-4"]
}
```

## Field Definitions

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| `id` | string | ✓ | Unique identifier (kebab-case) |
| `name` | string | ✓ | Human-readable name |
| `path` | string | ✓ | Directory path (skills/name/) |
| `reusable` | boolean | ✓ | Can multiple agents use this? |
| `usedBy` | string[] | — | List of agents that use this skill |
| `version` | string | ✓ | SemVer (1.0.0) |
| `description` | string | ✓ | What this skill teaches (1-2 sentences) |
| `tags` | string[] | — | Keywords (core, wave-4, experimental, etc.) |

## Current Skills

See `catalog.json` for the current list of registered skills.

## Skill Types

### Core Skills (Wave 4)
- **requirements-analysis** — Decompose feature requests
- **architecture-review** — Evaluate architectural concerns
- **planning** — Produce implementation plans
- **code-review** — Analyze code/plans for quality
- **documentation** — Produce release summaries

### Inner-Source Skills (Wave 4+)
- **memory** — Record and recall decisions (not yet implemented)
- **retrieval** — Vector + BM25 semantic search (not yet implemented)
- **search** — Keyword-focused search (not yet implemented)

## How to Register a Skill

### Step 1: Create the Skill
```
skills/your-skill/
├── SKILL.md      # Markdown instructions
├── tool.ts       # Optional: executable utility
├── tool.py       # Optional: Python utility
└── README.md     # Documentation
```

### Step 2: Add to Catalog
```json
{
  "id": "your-skill",
  "name": "Your Skill",
  "path": "skills/your-skill/",
  "reusable": true,
  "usedBy": ["agent-1", "agent-2"],
  "version": "1.0.0",
  "description": "...",
  "tags": ["wave-4"]
}
```

### Step 3: Verify Discovery
```typescript
import { RegistryReader } from '@registry/RegistryReader'

const reader = new RegistryReader()
const skills = reader.loadCatalog('registry/skills/catalog.json')
const yours = skills.find(s => s.id === 'your-skill')
console.log('Registered:', yours.name)
```

## Usage

### Load All Skills
```typescript
import { RegistryReader } from '@registry/RegistryReader'

const reader = new RegistryReader()
const skills = await reader.loadCatalog('registry/skills/catalog.json')
```

### Find Reusable Skills
```typescript
const reusable = skills.filter(s => s.reusable)
```

### Find Skills Used by Agent
```typescript
const testingSkills = skills.filter(s =>
  s.usedBy && s.usedBy.includes('testing-agent')
)
```

## Skill vs. Tool

**Skill:** Markdown instructions (SKILL.md) + optional tool  
**Tool:** Executable utility (tool.ts or tool.py)

A skill can be:
- **Instruction-only:** SKILL.md guides the LLM, no code needed
- **Instruction + Tool:** SKILL.md explains, tool.ts implements utility functions

## Wave

**Wave:** 4 (Skills Layer)  
**Wave 7:** Registry & Discovery  
**Related:** [Wave 4: Skills](../../docs/DESIGN.md#wave-4-skills--reusable-utilities)

## Related

- [Agents Catalog](../agents/README.md) — Agents that use skills
- [Workflows Catalog](../workflows/README.md) — Orchestration sequences
- [RegistryReader](../RegistryReader.ts) — How to load catalogs
- [Progressive Adoption: Step 4](../../docs/runbooks/progressive-adoption.md#step-4-swap-out-common-skills-week-4)
