# Agents Catalog

Directory of all registered agents in the platform, their capabilities, ownership, and versions.

## Purpose

Enable discovery and lifecycle management of agents:
- **Discoverability** — What agents are available?
- **Capability mapping** — Which agent solves which problem?
- **Ownership tracking** — Who maintains this agent?
- **Version management** — Which versions are active?

## Schema

Each agent entry follows this structure:

```json
{
  "id": "requirements-agent",
  "name": "Requirements Analysis Agent",
  "capability": "requirements-analysis",
  "owner": "platform-team",
  "version": "1.0.0",
  "description": "Decomposes feature requests into structured requirements with objectives, constraints, risks",
  "tags": ["core", "pdlc", "wave-5"],
  "metadata": {
    "skill": "skills/requirements-analysis/",
    "inputSchema": "FeatureRequest",
    "outputSchema": "RequirementBrief",
    "status": "stable"
  }
}
```

## Field Definitions

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| `id` | string | ✓ | Unique identifier (kebab-case) |
| `name` | string | ✓ | Human-readable name |
| `capability` | string | ✓ | Capability it provides (e.g., "requirements-analysis") |
| `owner` | string | ✓ | Team/person responsible (platform-team, finance-team, etc.) |
| `version` | string | ✓ | SemVer (1.0.0) |
| `description` | string | ✓ | What this agent does (1-2 sentences) |
| `tags` | string[] | — | Keywords (core, pdlc, wave-5, experimental, etc.) |
| `metadata.skill` | string | — | Path to associated SKILL.md |
| `metadata.inputSchema` | string | — | Expected input type |
| `metadata.outputSchema` | string | — | Expected output type |
| `metadata.status` | string | — | stable, beta, experimental, deprecated |

## Current Agents

See `catalog.json` for the current list of registered agents.

## How to Register a New Agent

### Step 1: Create the Agent
```
capabilities/your-domain/
├── agent.ts          # Implementation
├── SKILL.md          # Instructions
└── README.md         # Documentation
```

### Step 2: Add to Catalog
```json
{
  "id": "your-domain-agent",
  "name": "Your Domain Agent",
  "capability": "your-capability",
  "owner": "your-team",
  "version": "1.0.0",
  "description": "...",
  "tags": ["wave-5"],
  "metadata": {
    "skill": "capabilities/your-domain/",
    "inputSchema": "YourInputType",
    "outputSchema": "YourOutputType",
    "status": "stable"
  }
}
```

### Step 3: Verify Discovery
```typescript
import { RegistryReader } from '@registry/RegistryReader'

const reader = new RegistryReader()
const agents = reader.loadCatalog('registry/agents/catalog.json')
const yours = agents.find(a => a.id === 'your-domain-agent')
console.log('Registered:', yours.name)
```

## Usage

### Load All Agents
```typescript
import { RegistryReader } from '@registry/RegistryReader'

const reader = new RegistryReader()
const agents = await reader.loadCatalog('registry/agents/catalog.json')
```

### Find by Capability
```typescript
const requirementsAgent = agents.find(
  a => a.capability === 'requirements-analysis'
)
```

### Find by Owner
```typescript
const financeAgents = agents.filter(a => a.owner === 'finance-team')
```

## Wave

**Wave:** 7 (Registry & Discovery)  
**Related:** [Wave 7: Registry](../../docs/DESIGN.md#wave-7-registry--discoverability)

## Related

- [Skills Catalog](../skills/README.md) — Similar structure for skills
- [Workflows Catalog](../workflows/README.md) — Orchestration sequences
- [Patterns Catalog](../patterns/README.md) — Execution patterns
- [RegistryReader](../RegistryReader.ts) — How to load catalogs
