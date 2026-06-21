# Progressive Adoption Runbook

Step-by-step outside-in guide for teams to adopt the platform baseline without disrupting active product delivery.

**Goal:** Make adoption easier than unmanaged divergence.

**Key principle:** Keep local clones active while progressively adopting shared platform components. Do not freeze feature delivery for platform migration.

---

## Pre-Adoption Checklist

Before starting adoption, verify:

- [ ] Your team has a working agentic implementation (local clone or custom orchestrator)
- [ ] You have identified repeated patterns in your codebase (candidates for baseline)
- [ ] You have capacity for 1-2 engineers to lead adoption (not full team effort)
- [ ] Your roadmap can accommodate integration work without dropping critical features
- [ ] You have access to platform team for technical questions

**Estimated Timeline:** 4-6 weeks for full adoption (spread across sprint capacity, not blocked)

---

## Step 1: Keep Local Clones Active (Week 1)

**Objective:** No disruption to feature delivery.

**Action items:**
1. Do NOT freeze your current implementation
2. Document your current stack:
   - LLM provider (OpenAI, Claude, local model)
   - Orchestration engine (custom, framework-based)
   - Agent count and roles
   - Skills/tools (retrieval, analysis, formatting)
   - Data stores and memory management
3. Create a "baseline adoption" branch (do not merge to main yet)
4. Keep shipping features on your main branch as normal

**Success criteria:**
- Current implementation continues to work
- Feature velocity unchanged
- Adoption branch created and ready for parallel work

**Communication:**
- Notify platform team of adoption intent
- Share your current stack documentation
- Request architecture review (30 min sync with platform team)

---

## Step 2: Connect Unified Telemetry (Week 2)

**Objective:** Instant cost and visibility without rewiring execution logic.

**Action items:**
1. Integrate platform's standardized logging and tracing hooks
2. Add TraceEmitter to your orchestrator:
   ```typescript
   import { TraceEmitter } from '@core/telemetry/TraceEmitter'
   
   const tracer = new TraceEmitter('your-team-service')
   tracer.recordSpan({
     traceId: generateTraceId(),
     spanId: generateSpanId(),
     operationName: 'feature-request-processing',
     duration: executionTime,
     attributes: {
       agentCount: 3,
       tokensUsed: 1200,
       errors: 0
     }
   })
   ```
3. Hook into platform's cost controls (SpendTracker):
   ```typescript
   import { SpendTracker } from '@core/cost-controls/budget'
   
   const budget = new SpendTracker()
   budget.recordUsage('gpt-4', tokensUsed)
   const remaining = budget.getRemainingBudget()
   ```
4. Enable dashboards for your team:
   - Cost per feature request
   - Token usage trends
   - Latency distributions
   - Error rates per stage

**Success criteria:**
- Telemetry flowing to centralized platform dashboards
- Your team can see cost/latency metrics for your implementation
- No code changes to your actual orchestration logic yet

**Documentation:**
- How to read your team's cost dashboard
- How to set cost alerts
- How to interpret latency metrics

---

## Step 3: Offload Foundational Plumbing (Week 3)

**Objective:** Replace duplicate local code with shared platform services.

**What to replace:**

| Your Local Code | Platform Service | Integration |
|-----------------|------------------|-------------|
| Custom PII sanitizer | SecurityScanner | Use `@core/security` |
| Token counting logic | SpendTracker | Use `@core/cost-controls` |
| Custom retry logic | ReliabilityAdapter | Use `@core/reliability` |
| Custom rate limiting | TokenBudget | Use `@core/cost-controls` |
| DIY logging setup | TraceEmitter + Pino | Use `@core/telemetry` |

**Step-by-step:**

1. **Security: PII Masking**
   ```typescript
   import { SecurityScanner } from '@core/security/SecurityScanner'
   
   const scanner = new SecurityScanner()
   const cleanedInput = scanner.maskPII(userInput)
   const isSafe = scanner.detectPromptInjection(prompt)
   ```

2. **Cost Controls: Token Budgeting**
   ```typescript
   import { SpendTracker } from '@core/cost-controls/budget'
   
   const tracker = new SpendTracker()
   tracker.recordUsage('gpt-4', tokensUsed)
   
   if (tracker.isOverBudget()) {
     throw new Error('Monthly token budget exceeded')
   }
   ```

3. **Reliability: Retry & Fallback**
   ```typescript
   import { ReliabilityAdapter } from '@core/reliability/ReliabilityAdapter'
   
   const adapter = new ReliabilityAdapter()
   const result = await adapter.withRetry(
     () => callLLM(prompt),
     { maxAttempts: 3, backoffMs: 1000 }
   )
   ```

**Success criteria:**
- PII masking working on all user inputs
- Token budget tracking accurate
- Retry logic preventing cascading failures
- No more duplicate code for these concerns

**Testing:**
- Verify PII masking on sample data (credit cards, SSNs)
- Test token budget enforcement (create test request > budget, verify rejection)
- Verify retry succeeds on transient failures

---

## Step 4: Swap Out Common Skills (Week 4)

**Objective:** Deprecate redundant local utility code; use shared Inner-Source skills.

**What to replace:**

| Your Local Skill | Platform Skill | Location |
|-----------------|---|---|
| Custom retrieval logic | Semantic retrieval | `@skills/retrieval/` |
| Ad-hoc memory management | Managed memory context | `@skills/memory/` |
| Regex-based search | Vector + BM25 search | `@skills/search/` |
| Manual code review checklist | Code Review SKILL.md | `@skills/code-review/` |
| Template-based documentation | Documentation SKILL.md | `@skills/documentation/` |

**Step-by-step:**

1. **Retrieval: Replace custom vector search**
   ```typescript
   import { SemanticRetrieval } from '@skills/retrieval/tool'
   
   const retriever = new SemanticRetrieval()
   const relevant = await retriever.search('ADR for microservices', topK: 5)
   ```

2. **Memory: Replace ad-hoc context management**
   ```typescript
   import { ContextManager } from '@skills/memory/tool'
   
   const memory = new ContextManager()
   memory.recordDecision('architecture', { pattern: 'CQRS', rationale: '...' })
   const priorDecisions = memory.recall('architecture patterns')
   ```

3. **Search: Replace regex patterns**
   ```typescript
   import { SemanticSearch } from '@skills/search/tool'
   
   const searcher = new SemanticSearch()
   const results = await searcher.find('error handling patterns', { threshold: 0.8 })
   ```

**Success criteria:**
- All team-specific skill code replaced with platform skills
- Test retrieval, memory, and search with your domain data
- Verify search results match or exceed quality of custom implementation

---

## Step 5: Migrate the Core Orchestrator (Week 5)

**Objective:** Hot-swap custom execution loop for official ConvergedAgentOrchestrator.

**What you get from ConvergedAgentOrchestrator:**

```typescript
import { ConvergedAgentOrchestrator, PDLCRequest } from '@core/orchestrator/ConvergedAgentOrchestrator'

const orchestrator = new ConvergedAgentOrchestrator(
  llmProvider,           // Your LLM (Claude, GPT-4, etc.)
  traceEmitter,          // Already connected in Step 2
  hooks,                 // Hook registry (Step 6)
  spendTracker           // Already connected in Step 3
)

// This runs the full PDLC with all cross-cutting concerns:
const output = await orchestrator.runPDLC({
  featureRequest: 'Add authentication to user dashboard'
})

// Output includes all 5 stages:
// - requirementBrief
// - architectureReview
// - implementationPlan
// - testPlan
// - releaseReadinessReport
```

**Built-in (no extra wiring needed):**
- ✅ Security scanning (PII detection, prompt injection checks)
- ✅ Traceability (every stage recorded with timestamps)
- ✅ Cost tracking (all LLM calls accounted)
- ✅ HITL gates (human approval before release)
- ✅ Hook lifecycle events (pre/post execution)
- ✅ Error recovery (retry logic, fallback models)

**Migration steps:**

1. **In your adoption branch, instantiate the orchestrator:**
   ```typescript
   import { ConvergedAgentOrchestrator } from '@core/orchestrator'
   
   const orchestrator = new ConvergedAgentOrchestrator(
     yourLLMProvider,
     traceEmitter,
     hooks,
     spendTracker
   )
   ```

2. **Wire up a simple demo endpoint:**
   ```typescript
   app.post('/api/feature-request', async (req, res) => {
     const { featureRequest } = req.body
     const output = await orchestrator.runPDLC({ featureRequest })
     res.json(output)
   })
   ```

3. **Test the full pipeline:**
   - Send a feature request
   - Verify all 5 stages complete
   - Check traces in your dashboard
   - Verify costs recorded

4. **Compare outputs:**
   - Old orchestrator output
   - New baseline output
   - Look for unexpected differences
   - Adjust hook overrides if needed

**Success criteria:**
- Full PDLC running on baseline orchestrator
- Traces visible in platform dashboard
- Costs tracked accurately
- HITL gates working (manual approval required before stage 5)
- All 5 stages completing without errors

---

## Step 6: Register Unique Overrides (Week 6)

**Objective:** Protect specialized behaviors in the hook registry, keep core stable.

**What are overrides?**

Domain-specific logic that shouldn't go in the baseline:
- Healthcare: HIPAA compliance checks
- Finance: SOX compliance rules
- Tax: Multi-currency validation
- AI Products: Fairness and explainability checks

**How to preserve overrides:**

1. **Identify your domain-specific hooks:**
   ```typescript
   // Example: Finance-specific override
   hooks.register('stage:architecture:post', async (context) => {
     const { output } = context
     const saxCompliance = await checkSOXCompliance(output)
     if (!saxCompliance.approved) {
       context.output.blockers.push({
         id: 'sox-001',
         category: 'compliance',
         description: saxCompliance.issues.join('; '),
       })
     }
   })
   ```

2. **Preserve in hook registry (not hardcoded):**
   - All domain logic flows through registered hooks
   - Hooks execute at well-defined lifecycle points
   - Easy to enable/disable per environment
   - Survives baseline upgrades

3. **Test hook execution:**
   - Verify hooks fire at correct stages
   - Verify hook output reflected in final report
   - Verify bypass doesn't break orchestration

**Success criteria:**
- All team-specific domain logic registered as hooks
- Hooks execute at correct lifecycle points
- No hardcoded domain logic in orchestrator
- Hooks survive baseline updates

**Hook Lifecycle Points:**

```
REQUEST → VALIDATION → STAGE 1 → STAGE 2 → STAGE 3 → GATE → STAGE 4 → STAGE 5 → RESPONSE
           ↓ pre         ↓ post  ↓ post  ↓ post  ↓ pre    ↓ post  ↓ post  ↓ pre
        [your hook] [your hook] ... [your hook] [your hook] ...
```

---

## Validation: Testing Your Adoption

After all 6 steps, run this validation suite:

**Functional Testing:**
- [ ] Full PDLC executes end-to-end
- [ ] All 5 stages produce expected output types
- [ ] HITL gate blocks release until approved
- [ ] Domain-specific hooks execute correctly

**Integration Testing:**
- [ ] Traces appear in platform dashboard (Step 2)
- [ ] Costs tracked accurately (Step 3)
- [ ] Skills produce expected results (Step 4)
- [ ] Orchestrator errors handled gracefully

**Performance Testing:**
- [ ] End-to-end latency acceptable (<15 seconds)
- [ ] Token usage within budget (Step 3)
- [ ] No regression vs. old implementation
- [ ] Scalable to your expected request volume

**Compliance Testing:**
- [ ] PII masking working on all inputs (Step 3)
- [ ] Audit logs immutable and complete (Step 2)
- [ ] Compliance hooks enforced (Step 6)
- [ ] HITL approvals recorded with timestamps

**Feature Parity:**
- [ ] Old implementation feature X → baseline equivalent
- [ ] Output quality same or better
- [ ] New features enabled by baseline (e.g., cost controls)
- [ ] No regressions in existing behavior

---

## Rollback Plan

If adoption encounters critical issues:

1. **Fast rollback:** Keep old implementation in parallel
   - Route new requests to old orchestrator
   - Run baseline in shadow mode (no impact on users)
   - Compare outputs until stable

2. **Gradual rollback:**
   - Disable problematic hook
   - Revert latest step (e.g., keep Step 5, revert Step 6)
   - Fix issue in platform team
   - Re-enable step

3. **Checkpoint recovery:**
   - Each step creates safe checkpoint
   - Can rollback to Step N if Step N+1 fails
   - No permanent damage to feature delivery

---

## Success Metrics

After adoption, measure:

| Metric | Target | How to Track |
|--------|--------|--------------|
| **Reduced Code Duplication** | 40%+ fewer lines of platform code | Git diff: old vs. new implementation |
| **Faster Feature Development** | 20%+ less time on plumbing | Sprint velocity before/after |
| **Improved Cost Visibility** | 100% of LLM calls tracked | Dashboard: cost per feature |
| **Lower Operational Burden** | 50%+ less on-call work | Incident count before/after |
| **Better Governance Compliance** | 100% of auditable events recorded | Audit log completeness |
| **Reusable Artifacts** | All domain logic as hooks or overrides | Code review: hardcoded domain logic count |

---

## Troubleshooting

**Problem:** "Orchestrator latency increased after migration"
- **Cause:** Hooks adding overhead, tracing overhead
- **Fix:** Profile hooks individually, disable non-critical hooks, optimize hot paths
- **Reference:** See Common Failure Modes

**Problem:** "Domain-specific behavior missing from baseline output"
- **Cause:** Hook not registered or firing at wrong stage
- **Fix:** Debug hook registration, check lifecycle stage, add logging to hook
- **Reference:** Hook Lifecycle Points section

**Problem:** "Cost tracking shows unrealistic token usage"
- **Cause:** Duplicate counting (hook + orchestrator), or inefficient prompts
- **Fix:** Trace token flow, identify duplicate recording, optimize prompt structure
- **Reference:** Step 3: Cost Controls

**Problem:** "HITL gate blocking legitimate releases"
- **Cause:** Compliance rules too strict or misaligned with business intent
- **Fix:** Work with platform + compliance team to refine rules
- **Reference:** Override & Extension Layer

**For additional help:** Contact platform team with traces and logs

---

## Next Steps

After successful adoption:

1. **Promote domain-specific overrides to shared hooks** (if broadly applicable)
   - See [Override → Baseline Promotion](../promotion-lifecycle/README.md)

2. **Contribute improvements back to platform**
   - Performance optimizations
   - Bug fixes
   - New hooks for common patterns

3. **Onboard other teams** using this runbook
   - Help them navigate the 6 steps
   - Share lessons learned
   - Contribute to inner-source skills pool

4. **Monitor baseline updates**
   - Platform team releases improvements regularly
   - Your hooks automatically benefit from core optimizations
   - No rework needed (baselines are backward-compatible)

---

## Related Documentation

- [Platform Design: Wave-by-Wave Architecture](../DESIGN.md) — Understand why each step exists (Wave 2 core runtime, Wave 3 governance, etc.)
- [Architecture Principles](../architecture/README.md) — Core concepts and design thinking
- [Override → Baseline Promotion](../promotion-lifecycle/README.md) — How overrides graduate after adoption
- [New Team Onboarding](../onboarding/README.md) — First week quick start
- [Common Failure Modes](../common-failure-modes.md) — What to watch out for
