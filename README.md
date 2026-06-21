# Agentic Platform

Reference implementation companion to **"Agentic Development: From Divergence to a Self-Evolving Platform"**.

This is an educational, runnable exploration of a Core + Hook agentic platform architecture. Not production-grade.

## Quick Start

```bash
npm install
npm run demo              # Full PDLC demo, mocks Python if unavailable
npm run demo:polyglot     # Real Python subprocess; fails clearly if Python not installed
npm test                  # Vitest smoke + unit tests
```

## Project Structure

| Folder | Wave | Purpose |
|--------|------|---------|
| `contracts/` | 1 | Zod schemas: trace, HITL, workflow, agent, artifacts |
| `core/` | 2 | LLMProvider, orchestrator, hooks, telemetry, security, cost controls |
| `governance/` | 3 | Policies, compliance, audit |
| `skills/` | 4 | SKILL.md assets + optional tool.ts/tool.py |
| `capabilities/` | 5 | Agent implementations (Requirements, Architecture, Planning, Testing, ReleaseReadiness) |
| `extensions/` | 6 | TypeScript overrides (Finance) + Python subprocess (Tax) |
| `registry/` | 7 | Static JSON catalogs (agents, skills, workflows, patterns) |
| `evaluation/` | 8 | Golden datasets, regression tests, scorecards |
| `docs/` | 9 | Mapping to article, architecture overview, runbooks, promotion guide |
| `starter-kits/` | 10 | Copyable templates for new capabilities and extensions |
| `examples/` | 11 | Reference implementations for domains (finance, healthcare, ML) |

## Architecture Highlights

### Skills & Tools
Skills are **lightweight markdown instruction assets** (SKILL.md) that live in `skills/<name>/`. Tools are **executable utilities** (tool.ts or tool.py) that live alongside the skill they operationalize.

### Capabilities
Agents compose skills + tools through the orchestrator. Pattern:
```typescript
class XAgent {
  constructor(private llm: LLMProvider, private skill: Skill) {}
  async run(input: InputSchema): Promise<OutputSchema> {
    const prompt = buildPrompt(this.skill.instructions, input)
    const raw = await this.llm.complete(prompt)
    return parseAndValidate(raw)  // Zod parse
  }
}
```

### PDLC Demo Flow
```
FeatureRequest
  → RequirementsAgent (uses skills/requirements-analysis/)
  → ArchitectureReviewAgent (uses skills/architecture-review/)
  → PlanningAgent (uses skills/planning/)
  → TestingAgent (uses skills/code-review/)
  → HITL Gate (auto-approve in mock mode)
  → ReleaseReadinessAgent (uses skills/documentation/ + skills/code-review/)
  → Output: trace records, cost counters, hook events, audit log, scorecard
```

### LLM Provider
- **Default:** `MockLLMProvider` (no API key needed, deterministic canned responses)
- **Optional:** `ClaudeLLMProvider` (requires `ANTHROPIC_API_KEY` and `LLM_PROVIDER=claude`)

### Extensibility
- **TypeScript overrides:** Extend agents and inject hooks (e.g., `extensions/finance/`)
- **Python subprocess:** Polyglot capability via JSON stdin/stdout contract (e.g., `extensions/tax/python-agent/`)

## Article Mapping

| Section | Repo Location | Key Concept |
|---------|---------------|-------------|
| Converge capabilities, not implementations | `contracts/` + `capabilities/` | Zod contracts define capabilities; agents implement them |
| Skills & Tools Layer | `skills/` | SKILL.md + optional tool.ts/py per skill |
| Capability composition | `capabilities/` + `core/BaseOrchestrator.ts` | Agents wire skills + tools; orchestrator runs the PDLC |
| Hook-driven extensibility | `core/hooks/HookRegistry.ts` + `extensions/` | Register hooks per lifecycle stage; extend without modifying core |
| Governance & Compliance | `governance/` | Policy engine, compliance checker, audit writer |
| Telemetry & Cost Controls | `core/telemetry/` + `core/cost-controls/` | TraceEmitter, SpendTracker per request/session |
| Registry & Discovery | `registry/` | Static JSON catalogs; findByCapability, loadCatalog patterns |
| Evaluation | `evaluation/` | Golden datasets, regression runner, scorecards |

## Environment Variables

- `LLM_PROVIDER` — `mock` (default) or `claude`
- `ANTHROPIC_API_KEY` — Required only if `LLM_PROVIDER=claude`

Example:
```bash
cp .env.example .env
# Edit .env to set ANTHROPIC_API_KEY if using real Claude
```

## Tests

```bash
npm test                 # Run all tests (smoke + unit)
npm run test:watch      # Watch mode
```

Coverage:
- Smoke: Full PDLC demo produces ReleaseReadinessReport with APPROVED status
- Unit: HookRegistry, TraceEmitter, SecurityScanner behavior

## Implementation Status

- Wave 1 (Contracts): ✓
- Wave 2–11: In progress

## License

Educational reference only. See article for full context.
