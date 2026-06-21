# Common Failure Modes to Monitor

Architectural roadblocks when executing the convergence strategy. Most failures are cultural and operational, not purely technical.

---

## 1. Converging Implementations Instead of Capabilities

**Symptom:** "Let's force everyone to use Team A's codebase as the standard"

**Why it fails:**
- Team A's implementation is optimized for Team A's use case
- Team B's requirements are different (different scale, different domains, different constraints)
- Forcing convergence breaks Team B's ability to ship
- Loss of innovation (Teams C, D, E stop experimenting)
- Resentment ("they're imposing their solution on us")

**How to recognize it:**
- Pushback from multiple teams: "This doesn't work for us"
- Low adoption rate despite mandate
- Workarounds and bypasses appearing

**Prevention:**
- Never converge the *implementation*, converge the *capabilities*
- Extract shared capabilities (requirements analysis, architecture review, cost control)
- Let teams keep their custom orchestrators if needed
- Teams adopt baseline capabilities incrementally, not all-at-once

**Recovery:**
- Stop mandating the implementation
- Ask teams: "What capabilities do you all need?"
- Refactor baseline to expose capabilities, not full orchestrator
- Teams adopt progressively, optional features first

**Reference:** [Architecture Overview → Core Principle](docs/architecture/README.md)

---

## 2. Selecting Architectural Winners Too Early

**Symptom:** Enforce standardization before running an audit track, destroying valuable edge-case engineering.

**Why it fails:**
- Early decisions are based on limited data (1 team's success)
- Teams that solve the problem differently get labeled as "non-standard"
- Innovation gets suppressed before its value is understood
- Later discover: "Team X's approach was better for Y use case"

**How to recognize it:**
- Teams say: "That's not how we do it, but we're forced to anyway"
- Edge cases break under baseline (problems not caught during requirements phase)
- Velocity drops because teams fight the standard

**Prevention:**
- Run Track A (Knowledge Convergence) *before* selecting winners
- Let multiple teams solve the problem their way
- Evaluate solutions on metrics (cost, quality, latency), not opinion
- Baseline emerges from patterns, not early favorites

**Recovery:**
- Revert to permitting divergence
- Run formal audit (Track A) to understand all approaches
- Evaluate fairly (metrics-based)
- Acknowledge winning approaches publicly
- Re-baseline if needed

**Reference:** [Architecture Overview → Two-Track Model](docs/architecture/README.md)

---

## 3. Creating Rigid Standards Instead of Flexible Baselines

**Symptom:** Build rigid mandates that force teams to bypass the platform to ship specialized capabilities on time.

**Why it fails:**
- "Everyone must use this" sounds simple but breaks for edge cases
- Teams with special requirements (healthcare, finance, international) can't meet compliance + meet mandate simultaneously
- Workarounds appear (secret implementations, shadow systems)
- Security & audit breaks ("what code are they actually running?")

**How to recognize it:**
- Teams using workarounds or alternative systems
- Audit findings: code you don't know about
- Teams saying: "We'd use the platform, but we can't because of X requirement"

**Prevention:**
- Build baselines, not standards
- **Baseline:** "Everyone starts here unless they have a compelling reason not to"
- **Standard:** "Everyone must use this" (rarely right)
- Support overrides via hooks (domains inject logic without changing core)
- Baseline is stable; overrides are fluid

**Recovery:**
- Rename "standard" to "baseline"
- Document allowed reasons for divergence
- Support exceptions explicitly (override hooks, extensions)
- Audit what exceptions exist, why
- Promote successful exceptions back to baseline

**Reference:** [Architecture Overview → Standard vs. Baseline](docs/architecture/README.md)

---

## 4. Omitting Critical Extension Hooks

**Symptom:** Design a centralized orchestration engine lacking an open, extensible Lifecycle Hook Registry.

**Why it fails:**
- Teams need to customize behavior (domain-specific compliance, product-specific logic)
- No hooks = teams fork baseline or rebuild
- Forked implementations diverge forever
- You lose ability to harvest innovation

**How to recognize it:**
- Teams asking: "Where do we plug in our custom logic?"
- Seeing team-specific forks of baseline orchestrator
- Code review finds hardcoded domain logic

**Prevention:**
- Design hooks-first
- Every cross-cutting concern is a hook point
- Teams register hooks, baseline calls them
- No hardcoding of team-specific logic in core orchestrator
- Document hook lifecycle explicitly

**Example hook points:**
```
SYSTEM_REQUEST_INPUT
  ↓ [your hook: validate input format]
BEFORE_EXECUTION
  ↓ [your hook: security checks]
PRE_STAGE_N
  ↓ [your hook: prepare for stage]
POST_STAGE_N
  ↓ [your hook: inspect output, add metadata]
PRE_RESPONSE
  ↓ [your hook: final checks before returning]
POST_RESPONSE
  ↓ [your hook: log, cleanup]
```

**Recovery:**
- Add hook points retroactively (can be done without breaking changes)
- Refactor hardcoded domain logic into hooks
- Let teams register hooks
- Document all hook lifecycle points

**Reference:** [Core Hooks Registry](core/hooks/README.md)

---

## 5. Operating Without an Evaluation Mechanism

**Symptom:** Make architectural decisions based on subjective opinion rather than objective benchmarks and golden datasets.

**Why it fails:**
- "I think this is better" has no data backing
- Decisions can't be revisited objectively later
- Teams don't know if baseline is actually improving
- Quality drift undetected

**How to recognize it:**
- No metrics on agent quality, cost, latency
- Decisions are debated (opinion) not demonstrated (data)
- Can't answer: "Is the baseline better than custom implementations?"

**Prevention:**
- Build evaluation layer from day 1
- Golden datasets (expected outputs for common scenarios)
- Regression runners (validate outputs haven't changed)
- Scorecards (measure quality, cost, latency)
- Continuous monitoring (metrics visible to all teams)
- Decision framework (if metric X > threshold Y, promote to baseline)

**Measurement examples:**
```
Baseline vs. Custom Implementation

Metric        Custom    Baseline    Winner
─────────────────────────────────────────
Quality       88%       92%         Baseline ✓
Cost          $1.50     $1.20       Baseline ✓
Latency       2.3s      1.8s        Baseline ✓
Reliability   97%       99.1%       Baseline ✓

Recommendation: Adopt baseline
```

**Recovery:**
- Add evaluation layer now
- Baseline existing implementations
- Compare all decisions to baselines going forward
- Make all decisions objectively measurable

**Reference:** [Evaluation Layer](evaluation/README.md)

---

## 6. Treating Convergence as a Forced Migration Exercise

**Symptom:** Frame the entire platform shift as a compliance checkbox for engineering teams.

**Why it fails:**
- Teams see it as overhead, not benefit
- They do minimal adoption (check box, move on)
- They don't buy into the vision
- Adoption is resented, not embraced
- People are hard to change without motivation

**How to recognize it:**
- Language: "You must migrate by Q3"
- No visible benefits to teams (costs hidden, metrics invisible)
- Adoption slower than planned
- Teams finding workarounds

**Prevention:**
- Frame as benefit, not burden
- Show metrics first (cost visibility is valuable)
- Progressive adoption (optional features first, mandatory last)
- Celebrate contributions (teams promoting overrides to baseline)
- Recognize teams helping others adopt
- Share success stories

**Communication examples:**

❌ **Bad:** "Everyone must adopt the baseline by end of Q3. Platform team will enforce compliance."

✅ **Good:** "We're investing in shared capabilities to reduce duplicate work. Start with telemetry (see your cost/quality instantly), then optional skills (search, retrieval), then governance orchestrator (cost control + audit). Choose the pace that works for your roadmap."

**Recovery:**
- Change narrative from "forced migration" to "progressive adoption"
- Make benefits visible (dashboards, metrics)
- Celebrate adoption wins
- Highlight teams that promoted overrides
- Invite teams to help shape baseline evolution

**Reference:** [Progressive Adoption Runbook](docs/runbooks/progressive-adoption.md)

---

## 7. Failing to Incentivize Knowledge Sharing

**Symptom:** Teams solve problems locally, never share, every solution gets reinvented.

**Why it fails:**
- Duplication of effort (N teams, N solutions to same problem)
- No learning flywheel (good ideas stay local)
- Platform doesn't evolve
- Teams waste time reimplementing wheels

**How to recognize it:**
- You see the same capability implemented 3+ times
- Teams unaware of each other's solutions
- Registry is empty or out-of-date
- No mechanism to discover what others built

**Prevention:**
- Make registry visible and accessible
- Celebrate contributions (public acknowledgment)
- Lightweight contribution process (easy for teams to share)
- Regular showcase (architecture council demo: new shared capabilities)
- Incentives (teams that contribute get more autonomy)

**Example incentive model:**
- Team promotes 3 capabilities to baseline → Architecture Council seat
- Team contributes to inner-source → Recognition in release notes
- Team discovers emerging pattern → Featured in quarterly newsletter

**Recovery:**
- Audit what teams built locally (in parallel, not centralized)
- Catalog in registry (even if not promoted)
- Invite teams to showcase at office hours
- Create inner-source program (easy contribution)
- Establish recognition program

---

## 8. Losing Track of Overrides (Technical Debt Blind Spot)

**Symptom:** Teams register hooks, override orchestrator, extend agents. Over time, tracking is lost. Audits reveal undocumented customizations.

**Why it fails:**
- Overrides accumulate without visibility
- One override works great for one team, breaks for others
- Security review misses unknown custom code
- Compliance audit fails ("what's actually running?")
- Becoming impossible to upgrade baseline

**How to recognize it:**
- Audit reveals unexpected hooks/extensions
- Production failures from undocumented customizations
- Git shows custom agent implementations in multiple places
- Can't answer: "Who owns this override?"

**Prevention:**
- Registry is source of truth for all customizations
- Teams register hooks explicitly (not in code, in registry)
- Each override has owner, risk level, documentation
- Registry visible to security and compliance
- Versioning: baseline X.Y.Z supports overrides registered before Z

**Example registry entry:**
```json
{
  "id": "override-finance-sox-validation",
  "name": "SOX Compliance Validation Hook",
  "team": "FinanceCompliance",
  "stage": "release-readiness",
  "riskLevel": "medium",
  "owner": "alice@company.com",
  "status": "active",
  "promotionStatus": "candidate",
  "description": "Validates SOX compliance for release readiness report",
  "createdAt": "2024-01-15",
  "lastAuditedAt": "2024-06-01"
}
```

**Recovery:**
- Audit all customizations (grep hooks, extensions, agent overrides)
- Register every override in registry (even undocumented ones)
- Assign ownership
- Review for security/audit/compliance
- Create promotion track for valuable overrides
- Deprecate abandoned ones

---

## 9. Promoting Too Many Capabilities to Baseline (Bloat)

**Symptom:** Every team's override gets promoted to baseline. Baseline becomes unmaintainable collection of everything.

**Why it fails:**
- Baseline maintenance burden explodes
- Core gets slower, more complex
- Harder to add features (compatibility concerns)
- Harder to debug (too many paths)
- Platform loses coherence

**How to recognize it:**
- Baseline growing fast (files, code, complexity)
- Support burden on platform team high
- New team asks: "Do I need all these features?" Answer: "Most, except..."
- Core orchestrator became 10K+ lines

**Prevention:**
- High bar for promotion (must solve >1 team problem clearly)
- Generality requirement (not just "team A + team B use this")
- Maintenance responsibility clear (who owns it?)
- Annual baseline audit (what's not being used?)
- Deprecation policy (unused features removed after X time)

**Promotion decision framework:**
```
Override Candidate for Baseline Promotion?

✓ Solves problem for 3+ teams
✓ Generalizable (works for team A, B, C without modification)
✓ Metrics strong (quality >85%, cost positive, reliability >98%)
✓ Owner willing to maintain (not "team X built it, now baseline owns it")
✓ Security/audit/compliance approved
✗ Domain-specific (only works for one team) → Keep as override
✗ Experimental (unproven, might change) → Wait for stability
✗ No owner (team left company) → Don't promote, retire override instead
```

**Recovery:**
- Review current baseline (what's actually used?)
- Assess each component:
  - Is it used by 2+ teams? (If no: deprecate)
  - Is it maintained? (If no: deprecate)
  - Does it solve a cross-cutting problem? (If no: move to extension)
- Deprecation policy: 6-month notice, then remove

---

## 10. Losing Governance & Audit Trail

**Symptom:** In focus on speed, lose immutable audit logs, compliance tracking, PII protection.

**Why it fails:**
- Regulatory audit fails ("prove compliance")
- Security incident response blocked ("what happened?")
- PII exposure goes undetected
- Teams can't explain decisions ("why was this released?")

**How to recognize it:**
- Audit logs missing or incomplete
- Can't trace: "What input led to this output?"
- PII found in logs
- Compliance audit findings

**Prevention:**
- Immutable audit trail from day 1
- Every decision recorded: who, what, when, why
- All inputs/outputs logged (with PII masking)
- Security scanning (prompt injection, PII leakage) on every call
- Compliance checks (approval gates, policy enforcement)
- Regular audit reviews (not just incident response)

**Checklist:**
- [ ] AuditWriter records all decisions immutably
- [ ] PII masking active on all user inputs
- [ ] SecurityScanner detects prompt injection
- [ ] HITL gates mandatory before release
- [ ] Compliance checks enforced
- [ ] Traces visible (who can query them? retention?)
- [ ] Regular audit reviews (quarterly minimum)

**Recovery:**
- Add immutable audit layer (if missing)
- PII masking retrofitted to all systems
- Security scanning enabled on all stages
- Compliance gates enforced
- Audit trail retained (legal holds)
- Regular reviews scheduled

---

## Decision Framework

When unsure if a failure mode applies to your situation:

**Ask:**
1. Are we converging implementations or capabilities? (→ failure 1)
2. Are our architectural decisions data-driven or opinion-driven? (→ failure 5)
3. Can teams customize behavior without forking core? (→ failure 4)
4. Is adoption perceived as benefit or burden? (→ failure 6)
5. Can we account for all customizations? (→ failure 8)
6. Is governance visible (not invisible) in audit logs? (→ failure 10)

If you answered "no" to any, address that failure mode.

---

## Related Documentation

- [Platform Design: Wave-by-Wave Architecture](DESIGN.md) — Understand how the platform prevents these failure modes by design
- [Architecture Principles](architecture/README.md) — Core concepts and design thinking
- [Progressive Adoption Runbook](runbooks/progressive-adoption.md) — Adoption path that prevents many of these modes
- [Override → Baseline Promotion](promotion-lifecycle/README.md) — Governance that prevents premature promotion
- [New Team Onboarding](onboarding/README.md) — Getting started safely
