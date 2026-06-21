# Agentic Platform — Quick Reference for Claude

## What Is This?

Reference implementation of an agentic development platform that **converges capabilities, not implementations**. Demonstrates how to build a stable baseline (shared requirements analysis, architecture review, governance) while preserving flexibility for domain-specific customization via hooks.

Companion to the article: *"Agentic Development: From Divergence to a Self-Evolving Platform"*

---

## Five Core Concepts

1. **Contracts** (Wave 1) — Zod schemas define data interfaces between components (RequirementBrief, ArchitectureReview, etc.)
2. **Orchestrator** (Wave 2) — ConvergedAgentOrchestrator runs the 5-stage PDLC pipeline with built-in security, telemetry, cost tracking
3. **Skills** (Wave 4) — Reusable utilities with markdown instructions (SKILL.md) + optional tools (tool.ts/tool.py)
4. **Capabilities** (Wave 5) — Agents compose skills. Pattern: load SKILL.md → build prompt → call LLM → validate output
5. **Hooks** (Wave 2, 6) — Extension points for custom logic. Pattern: `HookRegistry.registerHook(event, handler)` fires at lifecycle points

---

## Architecture: Waves 1-12

| Wave | Layer | What | Location |
|------|-------|------|----------|
| 1 | Contracts | Zod schemas | `contracts/` |
| 2 | Core Runtime | Orchestrator, LLM, hooks, telemetry, security | `core/` |
| 3 | Governance | Policies, compliance, audit | `governance/` |
| 4 | Skills | Reusable utilities (SKILL.md + tools) | `skills/` |
| 5 | Capabilities | 5 agents (Req, Arch, Plan, Test, Release) | `capabilities/` |
| 6 | Extensions | Domain-specific overrides (Finance, Tax, Healthcare) | `extensions/` |
| 7 | Registry | Catalogs (agents, skills, workflows, patterns) | `registry/` |
| 8 | Evaluation | Golden datasets, regression runner, scorecards | `evaluation/` |
| 9 | Docs | Architecture, adoption, governance guides | `docs/` |
| 10 | Starter Kits | Templates for new capabilities and extensions | `starter-kits/` |
| 11 | Examples | Reference implementations (finance, healthcare, ML) | `examples/` |
| 12 | Tests | 44 tests + verification gates | `tests/` |

**See [docs/DESIGN.md](docs/DESIGN.md) for full Wave-by-Wave rationale.**

---

## File Structure (Quick Reference)

```
agentic-platform/
├── README.md                 ← Start here
├── CLAUDE.md                 ← This file
├── docs/DESIGN.md            ← Full architecture explanation
├── contracts/                ← Zod schemas (data contracts)
├── core/                     ← Orchestrator, LLM, hooks, telemetry
├── capabilities/             ← 5 agents
├── skills/                   ← Reusable utilities
├── extensions/               ← Domain-specific overrides
├── registry/                 ← Catalogs
├── evaluation/               ← Testing & metrics
├── examples/                 ← Reference implementations
├── starter-kits/             ← Templates
└── tests/                    ← 44 tests (smoke + unit)
```

---

## Common Tasks

### Add a New Agent
```typescript
// 1. Create directory
capabilities/my-agent/
  ├── agent.ts               // Implement XAgent class
  ├── SKILL.md               // Prompt instructions
  └── README.md              // Documentation

// 2. Pattern: agent.ts
class MyAgent {
  constructor(private llm: LLMProvider, private skill: Skill) {}
  async run(input: InputSchema): Promise<OutputSchema> {
    const prompt = buildPrompt(skill.instructions, input)
    const raw = await llm.complete(prompt)
    return OutputSchema.parse(JSON.parse(raw))  // Zod validation
  }
}

// 3. Register in orchestrator
new ConvergedAgentOrchestrator(llm, tracer, hooks, spendTracker)
```

### Add a New Skill
```typescript
// 1. Create directory
skills/my-skill/
  ├── SKILL.md               // Markdown instructions for LLM
  ├── tool.ts (optional)     // TypeScript utility
  ├── tool.py (optional)     // Python utility
  └── README.md              // Documentation

// 2. Agent loads and uses it
const skill = await loadSkill('my-skill')
const prompt = `${skill.instructions}\n\nInput: ${input}`
```

### Add Domain-Specific Logic
```typescript
// Use hooks, don't modify core orchestrator
hooks.registerHook('stage:after', async (context) => {
  if (context.stage === 'architecture-review') {
    // Your domain logic here (finance, healthcare, etc.)
    // Can add to blockers, metadata
  }
})
```

---

## Before You Start: Three Commands

```bash
# 1. Run the demo (see full PDLC pipeline end-to-end)
npm run demo

# 2. Run tests (verify all 44 tests pass)
npm test

# 3. Read the architecture
cat docs/DESIGN.md | less
```

---

## Key Design Decisions

| Decision | Why | Trade-off |
|----------|-----|-----------|
| Converge capabilities, not implementations | Flexibility + consistency | Teams need to adopt contracts |
| Zod for runtime validation | Catches LLM output errors immediately | Small perf overhead |
| HookRegistry for extensibility | No core modification needed | Hooks must fire at right points |
| 5-stage PDLC sequence | Covers all real scenarios | Some teams will customize order |
| Mock LLM provider by default | No API key needed for learning | Deterministic responses (unrealistic) |

---

## Going Deeper

| Topic | Where |
|-------|-------|
| Full architecture + rationale | [docs/DESIGN.md](docs/DESIGN.md) |
| Getting started (first week) | [docs/onboarding/README.md](docs/onboarding/README.md) |
| Adopting baseline (4-6 weeks) | [docs/runbooks/progressive-adoption.md](docs/runbooks/progressive-adoption.md) |
| Extension patterns | [docs/DESIGN.md#wave-6](docs/DESIGN.md#wave-6-extensions--domain-specific-customization) |
| Testing strategy | [tests/README.md](tests/README.md) |
| What can go wrong | [docs/common-failure-modes.md](docs/common-failure-modes.md) |

---

## Quick Links

- **Main README:** [README.md](README.md)
- **Architecture Design:** [docs/DESIGN.md](docs/DESIGN.md)
- **Platform Design Decisions:** [docs/architecture/README.md](docs/architecture/README.md)
- **Run Demo:** `npm run demo`
- **Run Tests:** `npm test`

---

## Conventions (From Global CLAUDE.md)

This repo follows the user's global Claude conventions:
- No preamble or affirmations
- Terse prose (target ≤200 tokens/turn for explanations)
- Prefer exploring code via Terragraph/grep over Read tool for source files
- Tests must pass before committing
- Cross-review all changes before commits
- Terragraph index persists; use it for code searches

See ~/.claude/CLAUDE.md for full global conventions.
