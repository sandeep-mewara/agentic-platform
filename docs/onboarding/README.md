# New Team Onboarding: Getting Started with the Platform

Welcome to the agentic platform! This guide walks new teams through the first steps of understanding and using the baseline.

**Estimated time:** 2-3 hours (read) + 1-2 weeks (hands-on)

---

## Before You Start

**Verify you have:**
- [ ] Node.js 20+ installed
- [ ] Git access to agentic-platform repository
- [ ] Basic familiarity with TypeScript and async/await
- [ ] Understanding of LLMs (API keys, tokens, cost)
- [ ] Access to an LLM provider (Claude, GPT-4, etc.) — or use MockLLMProvider
- [ ] 1-2 engineers to lead platform integration (not full team)

**Your team should have:**
- [ ] An active agentic implementation (or plan to build one)
- [ ] A clear use case (e.g., "we need requirements analysis + architecture review")
- [ ] Product roadmap that can absorb 1-2 weeks of integration work
- [ ] Willingness to adopt baseline components progressively

---

## 30-Minute Quick Start

### 1. Understand the Problem We're Solving

**The platform answers:** How do we converge agentic implementations without losing innovation?

**Key insight:** We converge *capabilities*, not implementations.

**What's a capability?**
- Requirements analysis (convert requests → structured requirements)
- Architecture review (evaluate architectural concerns)
- Test planning (convert plans → test strategies)
- Release readiness (assess readiness to ship)
- Cost control (track & limit LLM spending)
- Observability (record decisions and debug)

All teams need these. The baseline provides them once; teams plug in.

### 2. See It In Action (5 min)

Run the demo:

```bash
cd /Users/smewara/GitHub/agentic-platform
npm install
npm run demo
```

You'll see:
```
[PDLC] Starting PDLC pipeline...
[PDLC] Stage 1/5: Requirements Analysis
  Input: "Add OAuth 2.0 authentication..."
  Output: RequirementBrief { objectives, constraints, risks, ... }

[PDLC] Stage 2/5: Architecture Review
  Input: RequirementBrief
  Output: ArchitectureReview { layerReview, scalability, security, ... }

... (stages 3, 4, 5) ...

[PDLC] Pipeline complete: APPROVED
```

This is the baseline in action: 5-stage PDLC with built-in governance.

### 3. Explore the Code Structure (10 min)

```
agentic-platform/
├── contracts/          ← Zod schemas (data interfaces)
├── core/               ← Common runtime (orchestration, cost, security)
├── governance/         ← Policies, compliance, audit
├── skills/             ← Reusable utilities (search, memory, retrieval)
├── capabilities/       ← 5 agents (requirements, architecture, planning, testing, release)
├── extensions/         ← Domain-specific overrides (finance, tax, healthcare)
├── registry/           ← Catalog of agents, skills, workflows
├── evaluation/         ← Testing & metrics (golden datasets, regression, scorecards)
├── docs/               ← Architecture, adoption, onboarding guides
└── examples/           ← Reference implementations and demos
```

Key takeaway: **Contracts define interfaces; Core provides common concerns; Teams extend without breaking core.**

### 4. Read the Architecture Overview (10 min)

**Option A (Recommended):** [Platform Design: Wave-by-Wave](../DESIGN.md) — Understand *why* each component was built in the order it was. Takes 10-15 min, very concrete.

**Option B:** [Architecture Principles](../architecture/README.md) — Understand the philosophy and design thinking. Good for understanding "why we chose this approach" vs. others.

**Both:** 5 minutes on either: Understand:
- Layer 1: Knowledge & Context (trusted organizational decisions)
- Layer 2: Contracts (standardized data interfaces)
- Layer 3: Skills (reusable utilities)
- Layer 4: Agents (5 standardized roles)
- Layer 5: Baseline Orchestration (PDLC pipeline)
- Layer 6: Overrides (your custom logic)
- Layer 7: Registry (discoverable components)
- Layer 8: Adoption (docs and onboarding)

**Key insight:** Your code goes in Layers 6 (custom logic) or extends Layers 3/4 (utilities/agents). Layers 1-5 are the stable baseline.

---

## 1-2 Week Hands-On: Integration Path

Follow the [Progressive Adoption Runbook](../runbooks/progressive-adoption.md).

It walks through 6 steps spread over 4-6 weeks:

1. **Keep local clones active** (Week 1)
   - Your current implementation keeps working
   - No feature freeze

2. **Connect unified telemetry** (Week 2)
   - See cost and latency metrics in dashboards
   - No orchestrator changes yet

3. **Offload foundational plumbing** (Week 3)
   - Use platform's security, cost controls, reliability
   - Remove duplicate code

4. **Swap out common skills** (Week 4)
   - Use platform's retrieval, memory, search
   - Retire home-grown utilities

5. **Migrate core orchestrator** (Week 5)
   - Wire up ConvergedAgentOrchestrator
   - Run full 5-stage PDLC

6. **Register domain-specific hooks** (Week 6)
   - Keep your specialized logic as hooks
   - Core orchestrator stays stable

**Result:** Your team uses baseline orchestration with domain-specific customizations, no duplicated code, visible cost/quality metrics.

---

## Key Concepts: Contracts

All data flowing through the platform is validated with Zod schemas.

**Why?** Type safety at boundaries. If data is wrong, you find out immediately.

### 5 Core Contracts

1. **RequirementBrief** (input → stage 1 output)
   ```typescript
   {
     featureRequest: string
     objectives: string[]
     constraints: string[]
     successCriteria: string[]
     risks: Array<{ category, description, severity }>
     estimatedEffort: { scope, daysEstimate }
   }
   ```

2. **ArchitectureReview** (stage 1 output → stage 2 output)
   ```typescript
   {
     overallAssessment: 'APPROVED' | 'APPROVED_WITH_CONDITIONS' | 'REJECTED'
     summary: string
     layerReview: Array<{ layer, assessment, concerns }>
     scalability: { concern, recommendation }
     security: Array<{ category, description, severity, mitigation }>
     recommendations: string[]
   }
   ```

3. **ImplementationPlan** (stage 2 output → stage 3 output)
4. **TestPlan** (stage 3 output → stage 4 output)
5. **ReleaseReadinessReport** (stage 4 output → stage 5 output)

**Key insight:** Your code doesn't need to know about these contracts directly. The baseline orchestrator handles validation. But if you're debugging, these schemas tell you what's expected.

---

## Key Concepts: Hooks

The platform provides extension points called **hooks**. Register your domain-specific logic as hooks; it'll run at the right time without modifying the baseline.

### Example: Finance Team Compliance Hook

```typescript
import { HookRegistry } from '@core/hooks/HookRegistry'

const hooks = new HookRegistry()

// Register a hook: "after architecture review stage, validate SOX compliance"
hooks.register('stage:architecture:post', async (context) => {
  const { output } = context  // ArchitectureReview object
  
  // Your custom logic
  const saxCheck = await validateSOXCompliance(output)
  
  // If issues found, add to blockers
  if (!saxCheck.passed) {
    if (!output.blockers) output.blockers = []
    output.blockers.push({
      id: 'sox-001',
      category: 'compliance',
      description: saxCheck.errors.join('; ')
    })
  }
})
```

When the baseline orchestrator reaches the architecture stage post-hook, your code runs automatically.

**Hook Lifecycle:**
```
STAGE 1     STAGE 2     STAGE 3     GATE       STAGE 4     STAGE 5
 ↓           ↓           ↓          ↓           ↓           ↓
[pre]  [post] [pre]  [post] [pre]  [post] [before] [pre]  [post] [pre]  [post]
       ↓                                      ↓            ↓
  Your hooks run here ←────────────────────────────────────
```

You can hook into:
- `stage:{name}:pre` — before stage executes (validate input)
- `stage:{name}:post` — after stage executes (inspect output, add metadata)
- `lifecycle:start`, `lifecycle:end` — pipeline start/end

---

## Key Concepts: Skills

**Skills** are reusable utilities. Instead of each team implementing their own retrieval system or memory manager, teams use shared skills.

### Available Skills

| Skill | Purpose | Location |
|-------|---------|----------|
| **Code Review** | Analyze code for quality issues | `@skills/code-review/` |
| **Retrieval** | Fetch relevant documents (vector + BM25) | `@skills/retrieval/` |
| **Memory** | Record and recall decisions | `@skills/memory/` |
| **Search** | Semantic + keyword search | `@skills/search/` |
| **Documentation** | Quality document writing | `@skills/documentation/` |

### Using a Skill

```typescript
import { SemanticRetrieval } from '@skills/retrieval/tool'

const retriever = new SemanticRetrieval()
const results = await retriever.search(
  'SOX compliance requirements',
  { topK: 5 }
)
// Returns: Array<{ text, score, source }>
```

**Key principle:** Agents consume skills; agents don't rebuild skills. If you need retrieval, use `@skills/retrieval/`. If you need something new, propose it; don't reinvent.

---

## Common Pitfalls & How to Avoid Them

### Pitfall 1: "We'll build everything custom and ignore the baseline"
**Why bad:** Duplicates work, harder to maintain, miss governance layer
**How to avoid:** Start with Step 1-2 of adoption runbook (telemetry + plumbing). See benefits immediately (cost visibility, security scanning).

### Pitfall 2: "We need to modify the core orchestrator for our use case"
**Why bad:** Core orchestrator diverges, hard to upgrade, breaks for other teams
**How to avoid:** Use hooks for domain-specific logic. Hooks are designed for exactly this.

### Pitfall 3: "We'll adopt the baseline, but we don't need most of it"
**Why bad:** Miss governance benefits (audit, compliance, cost control), fail security reviews
**How to avoid:** Adopt full orchestrator (Step 5), selectively disable unneeded hooks. Keep security/audit/traceability.

### Pitfall 4: "Our domain is so specialized, the baseline won't work for us"
**Why bad:** Actually, most specialization fits in hooks or skill extensions
**How to avoid:** Talk to platform team *before* deciding. Most "special" cases are handled by hooks. Or become first example of your domain.

### Pitfall 5: "We'll adopt, then iterate on our override later"
**Why bad:** Override code becomes legacy, never gets revisited, technical debt
**How to avoid:** Budget for refinement in your first month. Iterate with feedback from Step 2 (telemetry). Share improvements back.

---

## Your First Week: Step-by-Step

### Day 1: Read & Understand

- [ ] Read this onboarding guide
- [ ] Read [Architecture Overview](../architecture/README.md)
- [ ] Skim [Adoption Runbook](../runbooks/progressive-adoption.md)
- [ ] Run `npm run demo` and explore the output

**Time:** 2-3 hours

### Day 2-3: Explore the Codebase

- [ ] Clone repo, install dependencies
- [ ] Read `contracts/` (understand Zod schemas)
- [ ] Read `core/orchestrator/ConvergedAgentOrchestrator.ts` (the main engine)
- [ ] Read `capabilities/index.ts` (the 5 agents)
- [ ] Look at `extensions/finance/agent.ts` (agent-level customization pattern)
- [ ] Look at `examples/finance-compliance/` (hook-based customization pattern)

**Time:** 2-3 hours

### Day 4-5: Run & Modify Demo

- [ ] Run `npm run demo` with different feature requests
- [ ] Look at demo output (what are the 5 stages producing?)
- [ ] Check evaluation metrics in logs (quality score, cost/tokens, latency per stage)
  - See [Evaluation Layer](../evaluation/README.md) for how to run regression tests
  - See [Scorecard Metrics](../evaluation/scorecards/README.md) for quality definitions
- [ ] Modify demo to use your LLM provider instead of MockProvider

**Time:** 2-3 hours

### Week 1: Choose Your Starter Kit

- [ ] Review [Starter Kits Decision Guide](../../starter-kits/README.md)
- [ ] Pick one: TypeScript Basic (learning), TypeScript Full (production), or Python Extension (integration)
- [ ] Copy kit to your project
- [ ] Run its demo: `npm install && npm run demo`

**Time:** 1-2 hours

### Week 2: Start Integration (Step 1 of Adoption)

- [ ] Create "baseline-adoption" branch
- [ ] Document your current stack
- [ ] Schedule sync with platform team (30 min architecture review)
- [ ] Plan Step 2 (telemetry integration)

**Time:** 2-3 hours hands-on + 1 sync meeting

---

## Getting Help

### Resource Location

| Question | Where to Look |
|----------|---------------|
| "What's a RequirementBrief?" | `contracts/artifacts/RequirementBrief.ts` |
| "How do I use the orchestrator?" | `core/orchestrator/README.md` |
| "What hooks can I register?" | `core/hooks/HookRegistry.ts` + `docs/architecture/README.md` |
| "How do I adopt the baseline?" | `docs/runbooks/progressive-adoption.md` |
| "Can we promote our override to baseline?" | `docs/promotion-lifecycle/README.md` |
| "I hit an error. What does it mean?" | Check relevant README in the error's module |

### Getting Answers

1. **Check the READMEs** (every module has one)
2. **Review examples** (`extensions/` has real use cases)
3. **Read the tests** (code + assertions = documentation)
4. **Ask in async channels** (Slack, Discord, GitHub issues)
5. **Schedule sync with platform team** (for architecture questions)

---

## Next Steps After Onboarding

### Immediate (Week 2-3)

1. **Start Step 1 of adoption runbook** (keep local clone active)
2. **Set up telemetry dashboard** (Step 2)
3. **Schedule architecture review** (platform team feedback on your setup)

### Short-term (Month 1-2)

1. **Complete Step 3-5** (migrate to baseline orchestrator)
2. **Register domain-specific hooks** (Step 6)
3. **Monitor metrics** (cost, quality, latency)
4. **Get your team familiar** with baseline patterns

### Medium-term (Month 2-3)

1. **Identify opportunities for promotion** (Step 6 hooks becoming general)
2. **Contribute back to platform** (bug fixes, improvements)
3. **Help onboard next team** (sharing learnings)

### Long-term

1. **Evolve your domain logic** (hooks → extensions → baseline)
2. **Participate in Architecture Council** (decisions on platform evolution)
3. **Shape platform roadmap** (your feedback matters)

---

## FAQ

**Q: Do we have to use the baseline orchestrator?**
A: For governance + traceability benefits, yes. But you can start with telemetry + plumbing (Steps 1-3) and evaluate Step 5 afterward.

**Q: Can we keep our custom LLM provider?**
A: Absolutely. Pass it to the orchestrator constructor. Baseline doesn't care which LLM you use.

**Q: What if the 5 PDLC stages don't match our workflow?**
A: Use hooks to insert custom logic, reorder stages, or skip stages. Or keep your orchestrator and only use baseline skills + governance layer.

**Q: How much will this slow us down?**
A: Step 1-2 = low friction (read-only, no code changes). Step 3-5 = 1-2 weeks of integration work, paid off immediately by removing duplicated plumbing. Net positive within month 1.

**Q: What if we hit a blocker?**
A: See [Common Failure Modes](../common-failure-modes.md) or ask platform team. Most blockers are addressed by hooks or configuration.

**Q: Can we roll back if adoption doesn't work?**
A: Yes. Keep old implementation running in parallel (shadow mode), gradually migrate. Can stop at any point and revert.

---

## Key Takeaway

The platform isn't all-or-nothing. You adopt progressively, seeing benefits at each step. Start with telemetry (visibility into cost/quality). Move to reusing platform's utilities (less duplicate code). Finally, adopt orchestrator (governance + consistency).

**Your innovation stays yours.** Hooks let you customize behavior without modifying core. When your customization proves broadly useful, we promote it to baseline (recognition + shared maintenance).

Welcome to the platform. Let's build together. 🚀

---

## Related Documentation

- [Platform Architecture](../architecture/README.md)
- [Progressive Adoption Runbook](../runbooks/progressive-adoption.md)
- [Override → Baseline Promotion](../promotion-lifecycle/README.md)
- [Common Failure Modes to Monitor](../common-failure-modes.md)
- [Main README](../../README.md) (repo overview)
