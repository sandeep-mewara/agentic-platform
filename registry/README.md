# Registry & Discovery Layer

The registry provides a centralized, queryable catalog of all agents, skills, workflows, and patterns in the agentic platform. It enables discovery, composition, and orchestration without hard-coded dependencies.

## Overview

**Design principle:** Static JSON catalogs + type-safe Zod validation. No service, no database, no dynamic registration (for reference implementation).

**Use cases:**
1. Discover available agents by capability or tag
2. Find which skills are reusable vs. single-purpose
3. Understand agent/skill dependencies
4. Select workflows for different scenarios
5. Learn available execution patterns

## Catalogs

### Agents (`agents/catalog.json`)

Lists all capability agents and extensions.

```json
[
  {
    "id": "agent-requirements-core",
    "name": "RequirementsAgent",
    "capability": "requirements|architecture|planning|testing|release|extension",
    "owner": "Platform Team",
    "version": "1.0.0",
    "description": "...",
    "tags": ["core", "pdlc-stage-1", "llm-powered"]
  }
]
```

**Fields:**
- `id`: Unique identifier (e.g., agent-{name}-{team})
- `name`: Human-readable name
- `capability`: PDLC stage (requirements/architecture/planning/testing/release) or extension
- `owner`: Team responsible for the agent
- `version`: Semantic version
- `description`: What the agent does
- `tags`: Categorization (core/extension, stage number, special traits)

**Current agents:**
- RequirementsAgent, ArchitectureReviewAgent, PlanningAgent, TestingAgent, ReleaseReadinessAgent (core)
- FinanceComplianceAgent, TaxValidationAgent (extensions)

### Skills (`skills/catalog.json`)

Lists all skill assets (SKILL.md files).

```json
[
  {
    "id": "skill-code-review",
    "name": "Code Review & Quality Analysis",
    "path": "skills/code-review/SKILL.md",
    "reusable": true,
    "usedBy": ["agent-testing-core", "agent-release-core"]
  }
]
```

**Fields:**
- `id`: Unique identifier
- `name`: Human-readable name
- `path`: Relative path to SKILL.md
- `reusable`: Boolean — can multiple agents use this skill?
- `usedBy`: Array of agent IDs that use this skill

**Key insight:** `code-review/SKILL.md` is reusable (used by both TestingAgent and ReleaseReadinessAgent), demonstrating cross-cutting skill reuse.

### Workflows (`workflows/catalog.json`)

Predefined stage sequences for different scenarios.

```json
[
  {
    "id": "workflow-full-pdlc",
    "name": "Full PDLC Pipeline",
    "stages": ["requirements", "architecture", "planning", "testing", "release"],
    "description": "Complete product development lifecycle..."
  }
]
```

**Fields:**
- `id`: Unique identifier
- `name`: Human-readable name
- `stages`: Ordered array of stage names
- `description`: Use case and context

**Current workflows:**
1. **Full PDLC** — All 5 stages (default)
2. **Architecture-Focused** — Just requirements + architecture (quick validation)
3. **Finance Compliance** — Full PDLC with SOX checks
4. **Quality-Focused** — Planning + Testing + Release (for existing features)

### Patterns (`patterns/catalog.json`)

Orchestration patterns for stage execution.

```json
[
  {
    "id": "pattern-sequential-pdlc",
    "name": "Sequential PDLC",
    "type": "sequential|parallel|critique",
    "description": "..."
  }
]
```

**Pattern types:**
- **Sequential** — Each stage completes before next. Standard PDLC.
- **Parallel** — Multiple agents/extensions run simultaneously (e.g., architecture + finance compliance + tax validation). Converge at gates.
- **Critique** — Multiple independent reviewers vote/consensus on decision gates.

## RegistryReader API

Type-safe catalog loader and query utilities.

### Load Catalogs

```typescript
import { RegistryReader } from '@registry'

// Load specific catalog
const agents = RegistryReader.loadAgents('registry/agents/catalog.json')
const skills = RegistryReader.loadSkills('registry/skills/catalog.json')
const workflows = RegistryReader.loadWorkflows('registry/workflows/catalog.json')
const patterns = RegistryReader.loadPatterns('registry/patterns/catalog.json')
```

All entries validated against Zod schemas. Throws on:
- Invalid JSON
- Schema validation error
- Missing required fields

### Query APIs

#### Agents

```typescript
// Find agents by capability
const coreAgents = RegistryReader.findAgentsByCapability(agents, 'requirements')

// Find agents by tag
const extensions = RegistryReader.findAgentsByTag(agents, 'extension')
```

#### Skills

```typescript
// Find skill by ID
const skill = RegistryReader.findSkillById(skills, 'skill-code-review')

// Find all skills used by an agent
const skillsForTesting = RegistryReader.findSkillsByAgent(skills, 'agent-testing-core')

// Find reusable skills
const reusable = RegistryReader.findReusableSkills(skills)
```

#### Workflows

```typescript
// Find workflow by name
const workflow = RegistryReader.findWorkflowByName(workflows, 'Full PDLC Pipeline')
```

#### Patterns

```typescript
// Find patterns by type
const sequential = RegistryReader.findPatternsByType(patterns, 'sequential')
const parallel = RegistryReader.findPatternsByType(patterns, 'parallel')
```

## Discovery Examples

### Example 1: "Find all reusable skills"

```typescript
const reusableSkills = RegistryReader.findReusableSkills(skills)
// Result: [code-review/SKILL.md] — only 1 is reusable
```

**Insight:** Most skills are single-purpose (requirements-analysis, architecture-review, etc.), but code-review is designed for cross-cutting reuse.

### Example 2: "Which agents are used in the Finance Compliance workflow?"

```typescript
const workflow = RegistryReader.findWorkflowByName(
  workflows,
  'Finance Compliance Pipeline'
)
// stages: ["requirements", "architecture", "planning", "testing", "release"]

const agentsInStages = stages.map(stage =>
  RegistryReader.findAgentsByCapability(agents, stage)
)
// But we substitute architecture with FinanceComplianceAgent
```

### Example 3: "What skills support the Testing stage?"

```typescript
const testingAgent = RegistryReader.findAgentsByCapability(agents, 'testing')[0]
const testingSkills = RegistryReader.findSkillsByAgent(skills, testingAgent.id)
// Result: [code-review/SKILL.md]
```

### Example 4: "Suggest a pattern for high-stakes financial features"

```typescript
// Parallel pattern: core architecture + finance compliance + tax validation
const parallel = RegistryReader.findPatternsByType(patterns, 'parallel')[0]
// Result: Pattern to run multiple validators simultaneously
```

## Schemas & Types

All catalogs validated against Zod schemas:

```typescript
// Fully typed
type AgentEntry = z.infer<typeof AgentEntrySchema>
type SkillEntry = z.infer<typeof SkillEntrySchema>
type WorkflowEntry = z.infer<typeof WorkflowEntrySchema>
type PatternEntry = z.infer<typeof PatternEntrySchema>
```

## Integration with Orchestrator

**Current approach:** ConvergedAgentOrchestrator has hardcoded agent mappings.

**Future enhancement:** Could accept workflow from registry:

```typescript
// Future: registry-driven orchestrator
const workflow = RegistryReader.findWorkflowByName(
  workflows,
  'Finance Compliance Pipeline'
)
const orchestrator = new WorkflowOrchestrator(llm, workflow, agents, patterns)
const output = await orchestrator.run(featureRequest)
```

## File Structure

```
registry/
  schemas.ts              # Zod schemas for catalog entries
  RegistryReader.ts       # Type-safe loader and query utilities
  agents/
    catalog.json          # 7 agents (core + extensions)
  skills/
    catalog.json          # 5 skills (4 single + 1 reusable)
  workflows/
    catalog.json          # 4 predefined workflows
  patterns/
    catalog.json          # 4 execution patterns
  index.ts                # Exports schemas and reader
  README.md               # This file
```

## Article Section

Maps to **Registry & Discovery Layer** section of the article. Demonstrates:
1. Declarative catalog of capabilities (no code coupling)
2. Type-safe schema validation (Zod)
3. Query-based discovery API
4. Support for composition and dynamic orchestration
5. Foundation for future service-based registry

## Extensibility

To add a new agent to the registry:

1. Implement agent in capabilities/ or extensions/
2. Add entry to `agents/catalog.json` with id, name, capability, owner, version, description, tags
3. Update `skills/catalog.json` if the agent uses any skills (add agent ID to usedBy)
4. If creating new skill, add entry to skills/catalog.json with id, name, path, reusable, usedBy
5. RegistryReader automatically indexes and validates

No code changes needed to RegistryReader — catalogs are self-documenting.

## Future Work

- [ ] GraphQL API for registry queries (service-based)
- [ ] Agent dependency resolution (e.g., "find all agents needed for workflow X")
- [ ] Semantic search (find agents by capability description, not just name)
- [ ] Cost/latency metrics per agent
- [ ] Capability versioning and migrations
- [ ] Integration with package management (npm, pip) for agent distribution
