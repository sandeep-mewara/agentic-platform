# Platform Design: Architecture & Implementation Waves

How we built the agentic platform from foundation to adoption. Each Wave solves a specific problem and integrates with previous Waves.

**Goal:** By the end, you'll understand why we built components in Waves 1-11, how they integrate, and where to find each component in the code.

---

## The Building Story

```
Convergence Problem: Teams solve the same agentic challenges repeatedly
                     ↓
Track A (Discovery):  Audit what teams are building
Track B (Engineering): Build shared foundation
                     ↓
Result: Shared capabilities, customizable via hooks, evaluated by metrics
```

**This document:** The engineering track (Track B). Wave-by-Wave blueprint.

---

## Wave 1: Contracts — Data Interfaces

**Why Wave 1?** Everything flows through data. Define interfaces first, implementations second.

**Problem solved:** Teams need a shared vocabulary. Without contracts, each team's "RequirementBrief" looks different, making convergence impossible.

**What we built:**
- `RequirementBrief` — Feature request → structured requirements (objectives, constraints, risks)
- `ArchitectureReview` — Assessment of architectural concerns, recommendations, security flags
- `ImplementationPlan` — How to build it (phases, approach, timeline)
- `TestPlan` — How to validate it (test cases, coverage goals)
- `ReleaseReadinessReport` — Final approval for production release
- Supporting schemas: Trace, HITL, Workflow, Agent contracts

**Location:** `contracts/` — Zod schemas for all major artifacts

**Integration:** Wave 2+ agents validate input/output against these schemas. Teams know "a RequirementBrief looks like X; my orchestrator can depend on it."

**Example:**
```typescript
// From contracts/artifacts/RequirementBrief.ts
const RequirementBriefSchema = z.object({
  featureRequest: z.string(),
  objectives: z.array(z.string()),
  constraints: z.array(z.string()),
  successCriteria: z.array(z.string()),
  risks: z.array(RiskSchema),
  estimatedEffort: z.object({ scope: z.string(), daysEstimate: z.number() })
})
```

---

## Wave 2: Core Runtime — Orchestration & Cross-Cutting Concerns

**Why Wave 2?** Now that we have contracts, build the engine that will orchestrate stages.

**Problem solved:** Every team implements their own tracing, cost controls, security scanning. These aren't specialized; they're universal concerns. Build once, reuse everywhere.

**What we built:**

### LLM Abstraction (`core/llm/`)
- `LLMProvider` interface — standardize "complete(prompt): Promise<string>"
- `MockLLMProvider` — deterministic canned responses (no API key needed)
- `ClaudeLLMProvider` — real Claude via Anthropic SDK
- Teams plug in their own or use baseline

### Orchestrator (`core/orchestrator/`)
- `BaseOrchestrator` — abstract stage runner with security + telemetry + cost wiring
- `ConvergedAgentOrchestrator` — full PDLC (5 stages) with all cross-cutting concerns built-in

### Telemetry (`core/telemetry/`)
- `TraceEmitter` — record every span (stage, kind, status, timing)
- Every LLM call, every stage, every hook gets traced
- Teams see exactly what happened and why

### Security (`core/security/`)
- `SecurityScanner` — detect PII (SSN, email, phone, credit card), prompt injection, malicious patterns
- Runs on every user input before stage execution
- Non-blocking alerts, but immutable audit trail

### Cost Controls (`core/cost-controls/`)
- `SpendTracker` — accumulate token usage per request/session
- `TokenBudget` — enforce per-request caps
- Teams see cost per feature, can set guardrails

### Hooks (`core/hooks/`)
- `HookRegistry` — register custom logic at lifecycle points (stage:before, stage:after, lifecycle:start/end)
- `PythonAgentAdapter` — spawn polyglot agents (Python via JSON stdin/stdout)
- Core stays stable, teams extend via hooks

### Reliability (`core/reliability/`)
- Retry logic with exponential backoff
- Circuit breaker pattern (open/half-open/closed states)

**Location:** `core/` — All runtime components

**Integration:** BaseOrchestrator calls SecurityScanner before stage, TraceEmitter during stage, SpendTracker after LLM call, HookRegistry at lifecycle points. ConvergedAgentOrchestrator wires all 5 Waves 3-5 agents together.

**Example:**
```typescript
// From core/orchestrator/BaseOrchestrator.ts
class BaseOrchestrator {
  async runStage(stage, input, hooks) {
    // 1. Security scan input
    const scanned = await scanner.scanInput(input)
    
    // 2. Fire pre-stage hooks
    await hooks.execute('stage:before', { stage, input })
    
    // 3. Run the actual stage (LLM call)
    const output = await llm.complete(prompt)
    
    // 4. Track cost
    await spendTracker.record(tokensUsed)
    
    // 5. Emit trace
    tracer.recordSpan(stage, kind, status, spanContext, message)
    
    // 6. Fire post-stage hooks
    await hooks.execute('stage:after', { stage, output })
    
    return output
  }
}
```

---

## Wave 3: Governance — Policies, Compliance, Audit

**Why Wave 3?** Now we have runtime infrastructure. Add governance that runs alongside execution (not in front of it).

**Problem solved:** Teams need to enforce policies (cost limits, compliance checks, audit trails) without modifying orchestrator per team. Build policy engine once.

**What we built:**

### Policy Engine (`governance/policies/`)
- GuardrailPolicy — rules (e.g., "cost per request < $5", "no PII in output")
- PolicyEngine.evaluate() — check request against policies
- Blocks execution or warns based on severity

### Compliance Checker (`governance/compliance/`)
- Mandatory field validation (e.g., "ReleaseReadinessReport must have approval record")
- PII-clean gate (final output validated for PII before returning)
- Teams define domain-specific compliance rules

### Audit Writer (`governance/audit/`)
- Immutable audit log (append-only, never updated)
- Every decision recorded: who requested, what was approved, when, why
- Survives incidents (separate storage, long retention)

**Location:** `governance/` — Policy engine, compliance checker, audit writer

**Integration:** Governance runs in the control plane (underneath all stages). SecurityScanner + AuditWriter + ComplianceChecker fire at every stage without teams knowing.

**Example:**
```typescript
// From governance/policies/engine.ts
interface GuardrailPolicy {
  id: string
  rule: (request: any) => boolean
  action: 'block' | 'warn'
  reason: string
}

const costPolicy: GuardrailPolicy = {
  id: 'max-cost-per-request',
  rule: (request) => spendTracker.currentCost() < 5.0,
  action: 'block',
  reason: 'Cost exceeds budget'
}
```

---

## Wave 4: Skills — Reusable Utilities

**Why Wave 4?** Now we have governance. Define the utilities (skills) that agents will compose.

**Problem solved:** Teams implement their own retrieval, memory, search. These are primitives. Build once as skills, agents consume them.

**What we built:**

### Skill Pattern
- `SKILL.md` — Markdown instructions (how to use the skill, when to apply it)
- `tool.ts` or `tool.py` — Executable implementation (optional, skill can be pure prompt)
- Every skill lives in `skills/<name>/`

### Core Skills
1. **requirements-analysis** — Decompose feature request into structured requirements
2. **architecture-review** — Evaluate requirements for architectural concerns
3. **planning** — Convert brief + review into implementation plan
4. **code-review** — Analyze plan for quality issues, risks, gaps
5. **documentation** — Produce release-ready documentation

### Inner-Source Skills (Extra)
6. **retrieval** — Vector + BM25 semantic search
7. **memory** — Record and recall decisions
8. **search** — Keyword and semantic search combined

**Location:** `skills/` — Each skill has its own directory with SKILL.md

**Integration:** Agents in Wave 5 load skills (read SKILL.md), build prompts from instructions, call LLM, validate output. Skills define the "what to do"; agents define the "when and how."

**Example:**
```markdown
# requirements-analysis/SKILL.md

## Purpose
Convert a feature request into a structured RequirementBrief with:
- Clear objectives (what success looks like)
- Constraints (what's off-limits)
- Risks (what could go wrong)

## Instructions
1. Read the feature request
2. Identify 3-5 key objectives
3. List constraints (performance, security, compliance)
4. Assess risks and categorize by severity
5. Estimate effort
```

---

## Wave 5: Capabilities — Agents Composing Skills

**Why Wave 5?** Now we have reusable skills. Build agents that compose skills to solve problems.

**Problem solved:** Teams need standardized "personas" (Requirements Agent, Architecture Agent, etc.) that know how to use skills in sequence.

**What we built:**

### Agent Pattern
```typescript
class XAgent {
  constructor(
    private llm: LLMProvider,
    private skill: Skill
  ) {}
  
  async run(input: InputSchema): Promise<OutputSchema> {
    // 1. Load skill instructions from SKILL.md
    const instructions = await loadSkill(this.skill)
    
    // 2. Build prompt combining instructions + input
    const prompt = buildPrompt(instructions, input)
    
    // 3. Call LLM (orchestrator handles security/telemetry/cost)
    const raw = await this.llm.complete(prompt)
    
    // 4. Parse and validate output against contract schema
    const parsed = JSON.parse(raw)
    const validated = OutputSchema.parse(parsed)
    
    return validated
  }
}
```

### 5 Core Agents
1. **RequirementsAgent** — Uses `skills/requirements-analysis/` → Produces RequirementBrief
2. **ArchitectureReviewAgent** — Uses `skills/architecture-review/` → Produces ArchitectureReview
3. **PlanningAgent** — Uses `skills/planning/` → Produces ImplementationPlan
4. **TestingAgent** — Uses `skills/code-review/` → Produces TestPlan
5. **ReleaseReadinessAgent** — Uses `skills/documentation/` + `skills/code-review/` → Produces ReleaseReadinessReport

**Location:** `capabilities/<agent-name>/agent.ts` — Each agent lives in its own directory

**Integration:** ConvergedAgentOrchestrator instantiates all 5 agents and runs them in sequence: Req → Arch → Plan → Test → Release. Each agent's output becomes the next agent's input (contracts ensure compatibility).

**Example:**
```typescript
// From capabilities/requirements/agent.ts
class RequirementsAgent {
  constructor(
    private llm: LLMProvider,
    private skill: Skill
  ) {}
  
  async run(request: FeatureRequest): Promise<RequirementBrief> {
    const instructions = await loadSkill(this.skill)
    const prompt = `${instructions}\n\nFeature Request: ${request.title}\n\n${request.description}`
    const raw = await this.llm.complete(prompt)
    const brief = RequirementBriefSchema.parse(JSON.parse(raw))
    return brief
  }
}
```

---

## Wave 6: Extensions — Domain-Specific Customization

**Why Wave 6?** Now we have 5 standard agents. Teams have special needs. Allow extensions without breaking core.

**Problem solved:** Finance needs SOX compliance checks. Healthcare needs HIPAA checks. Tax needs multi-currency validation. Don't hardcode all domains in core orchestrator. Instead, let teams extend via agents or hooks.

**What we built:**

### Extension Patterns

**Pattern A: Agent-Level Override (TypeScript)**
- Extend a base agent, override behavior
- Example: `FinanceComplianceAgent extends ArchitectureReviewAgent`
- Used when you need different logic, not just extra hooks

**Pattern B: Hook-Based Extension (Any Language)**
- Register hooks at lifecycle points
- Example: After architecture stage, inject finance compliance checks
- Cleaner (doesn't fork agent code), more flexible

**Pattern C: Polyglot Extension (Python)**
- Write logic in Python, invoke via JSON contract
- Example: `extensions/tax/python-agent/tax_validation_agent.py`
- Good for data-heavy or ML logic

### Built Extensions
1. **Finance** — SOX compliance validation (TypeScript override)
2. **Tax** — Multi-currency validation (Python polyglot)
3. **Healthcare** — HIPAA compliance checks (hook example)
4. **AI Products** — Safety/fairness review (future, documented)

**Location:** `extensions/<domain>/` — Each extension has README documenting the pattern

**Integration:** Extensions run alongside core orchestrator via HookRegistry. They see the output of each stage, can add to `blockers` array, can inject metadata. They don't modify core logic.

**Example:**
```typescript
// From extensions/finance/hooks.ts
hooks.registerHook('stage:after', async (context: HookContext) => {
  if (context.stage === 'architecture-review') {
    // Finance-specific: validate SOX compliance
    const saxCheck = await validateSOXCompliance(context.output)
    if (!saxCheck.passed) {
      context.output.blockers = context.output.blockers || []
      context.output.blockers.push({
        id: 'sox-001',
        category: 'compliance',
        description: saxCheck.errors.join('; ')
      })
    }
  }
})
```

---

## Wave 7: Registry — Discoverability

**Why Wave 7?** Now we have core + extensions. Teams need to discover what's available without hardcoding dependencies.

**Problem solved:** Teams can't maintain a mental model of all agents, skills, workflows, patterns. Registry makes them discoverable.

**What we built:**

### Catalogs (Static JSON)
1. **agents/catalog.json** — All registered agents with ownership, version, capability
2. **skills/catalog.json** — All available skills with reusability, dependencies
3. **workflows/catalog.json** — All orchestration sequences (PDLC, Finance-specific, etc.)
4. **patterns/catalog.json** — Execution patterns (sequential, parallel, critique)

### RegistryReader
- `loadCatalog<T>(path)` — Load and validate catalog entries
- `findByCapability(catalog, query)` — Discover agents/skills solving a problem
- `search(catalog, filter)` — Filter by team, version, risk level

**Location:** `registry/` — JSON catalogs + RegistryReader.ts

**Integration:** Tools query registry at runtime to discover what's available. No hardcoded dependencies. New agents/skills registered in JSON, immediately discoverable.

**Example:**
```json
// registry/agents/catalog.json
[
  {
    "id": "requirements-agent",
    "name": "Requirements Analysis Agent",
    "capability": "requirements-analysis",
    "owner": "platform-team",
    "version": "1.0.0",
    "description": "Decomposes feature requests into structured requirements",
    "tags": ["core", "pdlc"]
  },
  ...
]
```

---

## Wave 8: Evaluation — Metrics & Regression Testing

**Why Wave 8?** Now we have core + registry. How do we know if the baseline is better than custom implementations? Measure.

**Problem solved:** Decisions about promotion (override → baseline) are opinion-based. Build objective evaluation framework.

**What we built:**

### Golden Datasets (`evaluation/golden-datasets/`)
- `pdlc.json` — One complete golden run: feature request → expected outputs at each stage
- Baseline for regression (did we break something?)
- Reference for quality evaluation

### Regression Runner (`evaluation/regression/`)
- Run demo against golden dataset
- Compare actual vs. expected outputs
- Flag differences (quality regression, change in behavior)

### Scorecards (`evaluation/scorecards/`)
- Measure quality, cost, latency for each stage
- Compare baseline vs. custom implementations
- Data-driven promotion decisions

### Benchmarks (Stub)
- Framework for running performance benchmarks
- Latency, throughput, cost curves
- Used to choose between implementations

**Location:** `evaluation/` — Golden datasets, runner, scorecards, benchmarks

**Integration:** Evaluation plane runs continuously. When a team proposes an override for promotion (Wave 9), Architecture Council checks evaluation metrics. "Does it improve quality? Cost? Latency?" Data wins, not opinion.

**Example:**
```typescript
// From evaluation/regression/runner.ts
const runner = new RegressionRunner(goldenDataset)
const results = await runner.run(orchestrator, featureRequest)
// Results: { quality: 92%, cost: $1.20, latency: 1.8s, blockers: [] }
```

---

## Wave 9: Documentation — Adoption & Governance Guides

**Why Wave 9?** Now we have a complete platform. Teams need to understand how to use it.

**Problem solved:** Platform is powerful but complex. New teams need guidance on adoption, extension, governance.

**What we built:**

### Architecture Documentation (`docs/architecture/README.md`)
- Core principles (converge capabilities, not implementations)
- 8-layer architecture model
- Component classification
- Design thinking

### Progressive Adoption Runbook (`docs/runbooks/progressive-adoption.md`)
- 6-step adoption path (telemetry → plumbing → skills → orchestrator → hooks)
- Spread over 4-6 weeks, no feature freeze
- Testing checklist, rollback plan, success metrics

### Promotion Lifecycle (`docs/promotion-lifecycle/README.md`)
- How overrides graduate to baseline
- 5-phase process (discovery → analysis → refactoring → beta → GA)
- Governance framework, decommissioning policy

### Onboarding Guide (`docs/onboarding/README.md`)
- First week hands-on (30 min quick start, day-by-day breakdown)
- Key concepts (contracts, hooks, skills)
- FAQ, getting help, next steps

### Failure Modes (`docs/common-failure-modes.md`)
- 10 architectural roadblocks (converging implementations, early standardization, etc.)
- Why they fail, how to recognize, prevention, recovery
- Decision framework

### Design Document (THIS FILE - `docs/DESIGN.md`)
- Wave-by-Wave architecture rationale
- Why each component was built
- How they integrate
- Where to find code

**Location:** `docs/` — All user-facing guides

**Integration:** README links to these docs. New teams start with onboarding, then progressive adoption. Architecture team references governance guides. Common failure modes prevent missteps.

---

## Wave 10: Starter Kits — Templates for Extension

**Why Wave 10?** Now we have adoption guides. Teams need templates to bootstrap new capabilities and extensions.

**Problem solved:** Building a new agent or extension is easy in theory but has boilerplate (tsconfig, package.json, agent pattern). Starter kits remove friction.

**What we built:**

### Capability Template (`starter-kits/typescript-basic/`)
- Bare-bones agent + skill + tests
- Copy, fill in blanks, done
- Learns agents by building one

### Full Stack Template (`starter-kits/typescript-full/`)
- Agent + skill + hooks + tests + CI/CD
- Production-ready structure
- For teams going all-in on baseline

### Python Extension Template (`starter-kits/python-extension/`)
- Agent written in Python
- JSON stdin/stdout contract
- For teams with Python logic (ML, data-heavy)

**Location:** `starter-kits/` — Each kit has README with "copy and modify" instructions

**Integration:** New team reads onboarding, decides "I want to build a custom Requirements Agent for healthcare." They copy capability template, fill in the SKILL.md, implement the logic, plug it in.

**Example:**
```
starter-kits/typescript-basic/
├── agent.ts          # Bare-bones XAgent
├── SKILL.md          # Placeholder skill (fill this in)
├── tool.ts           # Optional utility
├── agent.test.ts     # Test template
├── tsconfig.json
├── package.json
└── README.md         # "Copy this folder to capabilities/your-name/"
```

---

## Wave 11: Examples — Reference Implementations

**Why Wave 11?** Now we have templates. Show real examples in specific domains.

**Problem solved:** Templates are abstract. Teams need to see: "here's how a finance team extends the platform" or "here's how a healthcare team adds HIPAA checks."

**What we built:**

### Reference Implementations
1. **finance-compliance** — Demonstrates SOX/tax validation hooks (TypeScript)
2. **healthcare-hipaa** — Demonstrates PII detection and HIPAA compliance (TypeScript)
3. **python-ml-agent** — Demonstrates polyglot ML risk scoring (Python agent integrated via hooks)

### Root Demo (`examples/pdlc-demo/run.ts`)
- End-to-end PDLC pipeline
- All 5 stages executing in sequence
- Demonstrates telemetry, cost tracking, hook execution, audit logging

**Location:** `examples/` — Each example has src/ + main.ts + README

**Integration:** New team reads onboarding → copies starter kit → runs example demo → sees the pattern → builds their own.

**Example:**
```typescript
// From examples/finance-compliance/src/main.ts
const orchestrator = new ConvergedAgentOrchestrator(
  llmProvider,
  tracer,
  hooks,
  spendTracker
)

// Register finance-specific hooks
registerFinanceHooks(hooks)

// Run demo
const output = await orchestrator.runPDLC({ featureRequest: '...' })
console.log('Final Status:', output.releaseReadinessReport.status)
```

---

## Wave 12: Tests, Verification & Quality Gates

**Why Wave 12?** Now we have a complete platform (Waves 1-11). Verify it all works end-to-end.

**Problem solved:** No gap between "we built this" and "people can use this reliably."

**What we built:**

### Smoke Tests (`tests/smoke/pdlc-demo.test.ts`)
- Full PDLC pipeline executes end-to-end
- All 5 stages complete without errors
- Final ReleaseReadinessReport has APPROVED status

### Unit Tests
- **HookRegistry** (11 tests) — Hook registration, execution, multiple hooks per event, lifecycle hooks
- **TraceEmitter** (10 tests) — Trace creation, span recording, span context capture, summary generation
- **SecurityScanner** (20 tests) — PII detection, injection patterns, malicious patterns, severity levels

### Configuration & Build
- `vitest.config.ts` — Path aliases (@contracts, @core, @governance, @skills, @capabilities, @registry, @extensions, @evaluation)
- `npm run build` — TypeScript strict mode compilation (0 errors)
- `npm run demo` — Root-level entry point for non-developers

**Location:** `tests/` — Smoke + unit tests; `examples/pdlc-demo/run.ts` — Root demo

**Integration:** All 44 tests pass. Demo runs end-to-end. TypeScript compilation succeeds. Platform is ready to use.

---

## Architecture Integration Map

```
Users / Teams
  ↓
examples/ (Wave 11) - Reference implementations
  ↓
starter-kits/ (Wave 10) - Templates for building
  ↓
docs/ (Wave 9) - Adoption guides, governance
  ↓
evaluation/ (Wave 8) - Measure quality, cost, latency
  ↓
registry/ (Wave 7) - Discover agents, skills, workflows
  ↓
extensions/ (Wave 6) - Domain-specific customization (hooks, Python)
  ↓
capabilities/ (Wave 5) - 5 agents composing skills
  ↓
skills/ (Wave 4) - Reusable utilities (SKILL.md + tool.ts/py)
  ↓
governance/ (Wave 3) - Policies, compliance, audit
  ↓
core/ (Wave 2) - Orchestrator, hooks, telemetry, security, cost controls
  ↓
contracts/ (Wave 1) - Zod schemas for data contracts
```

Each Wave depends on the ones below it. Wave 5 agents depend on Wave 4 skills, which depend on Wave 1 contracts. Teams extend at Wave 6, manage via Wave 7 registry, measure via Wave 8.

---

## Design Decisions & Tradeoffs

### Why Converge Capabilities, Not Implementations?
**Tradeoff:** Flexibility vs. Control
- **Alternative:** Force everyone to use the same codebase
- **Why we didn't:** Breaks for specialized domains (healthcare, finance), stifles innovation, reduces adoption
- **Our approach:** Define data contracts (capabilities), let teams implement however they want, enable innovation to flow back to baseline

### Why HookRegistry Pattern?
**Tradeoff:** Simplicity vs. Extensibility
- **Alternative:** Hardcode all domain logic in orchestrator, or let teams fork
- **Why we didn't:** Forking diverges forever; hardcoding doesn't scale to 20 domains
- **Our approach:** Hooks at well-defined lifecycle points, teams register custom logic, core stays stable

### Why 5-Stage PDLC?
**Tradeoff:** Specificity vs. Generality
- **Alternative:** 3 stages (Req → Build → Test) or 7 stages (more granular)
- **Why we chose 5:** Covers requirements → architecture → planning → testing → release (all real scenarios), without over-specifying
- **Teams can override:** Skip stages, reorder stages, inject custom stages via hooks

### Why Zod for Contracts?
**Tradeoff:** Runtime safety vs. Performance
- **Alternative:** TypeScript interfaces only, or no validation
- **Why we chose Zod:** Catches invalid data at boundaries (LLM often produces wrong JSON), enables safe composition, minimal performance overhead
- **Teams can override:** Use different schema validator for their extensions

### Why Static Registry (JSON)?
**Tradeoff:** Simplicity vs. Real-Time Updates
- **Alternative:** Database + API, real-time indexing
- **Why we chose static:** No external dependencies, fast lookup, easy to version control
- **Upgrade path:** Can add dynamic registry layer later without changing interface

---

## Next: Where to Explore

### Understand the Code
- Start with `core/orchestrator/ConvergedAgentOrchestrator.ts` (main engine)
- Read `capabilities/requirements/agent.ts` (typical agent pattern)
- Check `extensions/finance/hooks.ts` (typical hook pattern)

### Understand the Flow
- Run `npm run demo` and trace the output (5 stages, trace records, metrics)
- Read `tests/smoke/pdlc-demo.test.ts` (how demo is tested)

### Understand the Adoption Path
- Read `docs/runbooks/progressive-adoption.md` (6 steps to baseline adoption)
- Read `docs/onboarding/README.md` (first week for new teams)

### Understand the Governance
- Read `docs/promotion-lifecycle/README.md` (how overrides graduate)
- Read `docs/common-failure-modes.md` (what can go wrong)

---

## Related Documentation

- [Architecture Principles](architecture/README.md) — Core concepts and design thinking
- [Progressive Adoption Runbook](runbooks/progressive-adoption.md) — 6-step adoption path
- [Override → Baseline Promotion](promotion-lifecycle/README.md) — Governance lifecycle
- [New Team Onboarding](onboarding/README.md) — First week hands-on
- [Common Failure Modes](common-failure-modes.md) — What to avoid

---

## Key Takeaway

Each Wave solves a specific problem and integrates with previous Waves. Wave 1 (Contracts) provides the foundation. Wave 2 (Core Runtime) builds orchestration on that foundation. Waves 3-5 add specialized concerns. Waves 6-11 enable extension and adoption. Wave 12 verifies everything works.

The result: a stable baseline that converges on capabilities (shared requirements analysis, architecture review, cost control, audit), while preserving flexibility for domains to innovate.
