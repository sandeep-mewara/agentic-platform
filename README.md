# Agentic Platform

Reference implementation companion to **"Agentic Development: From Divergence to a Self-Evolving Platform"**.

## The Problem We Solve

Teams building agentic systems face a choice: **Converge implementations or converge capabilities?**

Forcing teams to use the same codebase stifles innovation and breaks for specialized domains. This platform demonstrates a better approach: **converge on shared capabilities (requirements analysis, architecture review, cost control, audit) while allowing teams to customize through hooks and extensions.**

The result: teams ship faster, governance is preserved, and the best ideas graduate from team-specific innovations to organization-wide baseline.

## Quick Start

```bash
npm install
npm run demo              # Full PDLC demo, mocks Python if unavailable
npm run demo:polyglot     # Real Python subprocess; fails clearly if Python not installed
npm test                  # Vitest smoke + unit tests (44 tests, all passing)
```

See it in action: a 5-stage feature-to-release pipeline (Requirements → Architecture → Planning → Testing → Release) with traceability, cost tracking, and governance gates.

---

## Where to Go Next

**I want to...** | **Start here**
---|---
Understand how the platform is architected | [docs/DESIGN.md](docs/DESIGN.md) — Wave-by-Wave architecture with rationale
Get my team started adopting the baseline | [docs/onboarding/README.md](docs/onboarding/README.md) — First week hands-on guide
Adopt progressively over 4-6 weeks | [docs/runbooks/progressive-adoption.md](docs/runbooks/progressive-adoption.md) — 6-step adoption path with checkpoints
Learn the philosophy & principles | [docs/architecture/README.md](docs/architecture/README.md) — Core concepts, 8-layer model, design thinking
Extend the platform for my domain | [extensions/](extensions/) — See finance, healthcare, ML examples
Understand failure modes to avoid | [docs/common-failure-modes.md](docs/common-failure-modes.md) — 10 patterns + recovery paths
Know how overrides graduate to baseline | [docs/promotion-lifecycle/README.md](docs/promotion-lifecycle/README.md) — 5-phase promotion process

---

## Folder Structure at a Glance

| Folder | Purpose |
|--------|---------|
| `contracts/` | Zod schemas: data contracts for all components |
| `core/` | Core runtime: LLM, orchestrator, hooks, telemetry, security, cost controls |
| `governance/` | Policies, compliance, audit |
| `skills/` | Reusable utilities (SKILL.md + optional tool.ts/tool.py) |
| `capabilities/` | 5 agents: Requirements, Architecture, Planning, Testing, Release |
| `extensions/` | Domain-specific overrides (Finance, Tax, Healthcare, AI) |
| `registry/` | Static catalogs: agents, skills, workflows, patterns |
| `evaluation/` | Testing & metrics: golden datasets, regression runner, scorecards |
| `docs/` | Complete documentation (architecture, adoption, governance, onboarding) |
| `starter-kits/` | Templates for new capabilities and extensions |
| `examples/` | Reference implementations (finance-compliance, healthcare-hipaa, python-ml-agent) |

For details on Wave 1-11 architecture and why components were built in that order, see [docs/DESIGN.md](docs/DESIGN.md).

---

## Configuration

- `LLM_PROVIDER` — `mock` (default, no API key needed) or `claude` (requires ANTHROPIC_API_KEY)
- `ANTHROPIC_API_KEY` — Optional, only needed for real Claude LLM provider

Setup:
```bash
cp .env.example .env
# Optional: Edit .env to set ANTHROPIC_API_KEY if using real Claude
```

---

## Tests

```bash
npm test                 # Run all tests (smoke + unit)
npm run test:watch      # Watch mode
```

All 44 tests pass: 3 smoke tests (integration) + 11 HookRegistry + 10 TraceEmitter + 20 SecurityScanner.

Coverage:
- Smoke: Full PDLC demo produces ReleaseReadinessReport with APPROVED status
- Unit: HookRegistry, TraceEmitter, SecurityScanner behavior

## Implementation Status

- Wave 1 (Contracts): ✓
- Wave 2–11: In progress

## License

Educational reference only. See article for full context.
