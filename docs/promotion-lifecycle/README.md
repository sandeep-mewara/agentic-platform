# Override → Baseline Promotion Lifecycle

How specialized domain logic evolves from team-specific overrides into platform-wide baseline capabilities.

**Goal:** Turn localized innovation into organizational reusable assets.

---

## Philosophy

The platform learns from divergence. When a team's domain-specific override proves valuable to multiple teams, it graduates from override → baseline.

This process is **data-driven** (not opinion-driven), **reversible** (no permanent decisions), and **incentive-aligned** (teams get recognition for contributions).

---

## Promotion Readiness Criteria

An override is ready to be evaluated for promotion when:

| Criterion | Details | Evidence |
|-----------|---------|----------|
| **Proven Value** | Solves a real problem, measurably improves outcomes | Metrics: quality ↑, cost ↓, latency ↓ |
| **Reusable Design** | Not specific to one product/domain; generalizable | Code review: decoupled from business logic |
| **Tested Thoroughly** | Hook works reliably in production; low failure rate | Audit logs: consistent success rate >99% |
| **Documented** | Clear purpose, inputs, outputs, failure modes | README for the override with examples |
| **Low Maintenance Burden** | Doesn't require constant tweaking or domain expertise | Support metrics: <2 incidents/month |
| **Aligned with Governance** | Passes security, compliance, audit requirements | Security review: no PII leaks, no injection risks |
| **Requested by Multiple Teams** | 2+ teams independently identified need | Survey or feature request tracking |

---

## Promotion Process

### Phase 1: Discovery (Evaluation Plane)

**Owner:** Platform Team + Architecture Council  
**Timeline:** Ongoing (continuous monitoring)

The Evaluation Plane continuously monitors all team overrides:

```
Monitor all active hooks
    ↓
Measure: quality, cost, latency, reliability
    ↓
Identify patterns: "This hook solves a common problem"
    ↓
Flag for Architecture Council review
```

**Metrics Tracked:**

```typescript
interface OverrideMetrics {
  overrideId: string
  team: string
  stage: string
  successRate: number         // % of executions that succeed
  qualityScore: number        // 0-100, based on output quality
  costDelta: number           // $ saved/spent vs. baseline
  latencyDelta: number        // ms added/removed
  errorCount: number          // failures in monitoring window
  adoptionCount: number       // how many teams use it
}
```

**Monthly Review Process:**
1. Pull all override metrics for the past month
2. Identify overrides crossing promotion thresholds:
   - Quality: 85%+ (consistently good results)
   - Cost: net positive (saves or doesn't hurt budget)
   - Latency: <50ms overhead (minimal slowdown)
   - Reliability: 98%+ success rate
3. Flag candidates for Phase 2

### Phase 2: Impact Analysis (Architecture Council)

**Owner:** Architecture Council (cross-functional)  
**Timeline:** 1-2 weeks

Architecture Council evaluates if override is broadly applicable:

**Questions to Answer:**

1. **Is this truly a cross-cutting pattern, or domain-specific?**
   - If domain-specific: keep as override, not baseline
   - If cross-cutting: proceed to Phase 3

2. **What teams would benefit from this?**
   - Survey other teams: "Would you use this?"
   - Impact: 2+ teams → good candidate, 5+ teams → high priority

3. **What's the implementation cost?**
   - Code complexity: review override implementation
   - Maintenance burden: ongoing support, updates
   - Risk: any security/compliance concerns?

4. **Would this improve the baseline for everyone?**
   - Baseline philosophy: solve common problems once
   - Does it align with platform vision?
   - Does it create new cross-cutting concerns?

**Output:** Promotion scorecard
```
Override: "Multi-Currency Tax Validation Hook"
Team: TaxCompliance
Stage: release-readiness
Metrics:
  - Quality: 92%
  - Cost: -$50/month (saves money)
  - Reliability: 99.2%
Adoption Potential: 4 teams (confirmed interest)
Implementation Risk: Low (self-contained hook)
Maintenance Burden: Medium (regulatory changes)
Recommendation: ✓ PROMOTE (high value, low risk)
```

### Phase 3: Refactoring (Platform Team)

**Owner:** Platform Team  
**Timeline:** 2-4 weeks

Extract override from domain-specific implementation → reusable baseline component:

**Steps:**

1. **Generalize the logic**
   - Remove domain-specific hardcoding
   - Replace magic strings with config parameters
   - Make reusable for multiple use cases

   **Before (domain-specific):**
   ```typescript
   hooks.register('stage:release:post', async (context) => {
     const { output } = context
     // Hardcoded: only for tax
     if (!output.blockers) output.blockers = []
     if (output.metadata.releaseVersion.includes('Tax')) {
       const validated = await validateTaxCompliance(output)
       if (!validated.passed) {
         output.blockers.push({
           id: 'tax-validation-failed',
           description: validated.errors.join('; ')
         })
       }
     }
   })
   ```

   **After (reusable):**
   ```typescript
   // Generic compliance validation hook
   type ComplianceValidator = (report: ReleaseReadinessReport) => Promise<ValidationResult>
   
   export function registerComplianceValidation(
     name: string,
     validator: ComplianceValidator
   ) {
     hooks.register(`compliance:${name}`, async (context) => {
       const { output } = context
       if (!output.blockers) output.blockers = []
       const result = await validator(output)
       if (!result.passed) {
         output.blockers.push({
           id: `${name}-validation-failed`,
           category: 'compliance',
           description: result.errors.join('; ')
         })
       }
     })
   }
   ```

2. **Write comprehensive tests**
   - Unit tests: individual validator functions
   - Integration tests: hook fires at correct stage
   - Regression tests: all known use cases pass
   - Edge cases: boundary conditions, error handling

3. **Document the capability**
   - Purpose and use cases
   - Configuration options
   - Failure modes and recovery
   - Example: how other teams use it

   **Example: Multi-Currency Validation Hook**
   ```markdown
   # Multi-Currency Validation Hook
   
   **Purpose:** Validates architectural decisions for systems handling multiple currencies.
   
   **Use cases:**
   - Payment systems (multiple country support)
   - Marketplace platforms (buyer/seller currencies)
   - International SaaS (billing in local currency)
   
   **Configuration:**
   ```
   registerCurrencyValidation({
     supportedCurrencies: ['USD', 'EUR', 'GBP'],
     exchangeRateRefresh: 'hourly',
     riskTolerance: 'medium'
   })
   ```
   
   **Known Risks:**
   - Exchange rate stale data (mitigated by hourly refresh)
   - Rounding errors in micro-payments (mitigated by banker's rounding)
   
   **Examples:**
   - Finance team: validating payment architecture
   - Marketplace team: validating international expansion
   ```

4. **Get security review**
   - No PII exposure
   - No injection vulnerabilities
   - Proper input validation
   - Audit trail complete

### Phase 4: Beta Release (Progressive Rollout)

**Owner:** Platform Team  
**Timeline:** 2 weeks

Release to non-critical teams first; monitor carefully:

1. **Flag as "beta" in baseline**
   - Documentation clearly marked BETA
   - API might change based on feedback
   - Support SLA is best-effort (not guaranteed)

2. **Invite 2-3 teams to test**
   - Original team + 1-2 others
   - Gather feedback: usability, edge cases, performance
   - Fix critical issues before GA

3. **Monitor metrics closely**
   - Is the reusable version as reliable as original?
   - Are there unexpected edge cases?
   - Are teams adopting it?

4. **Collect feedback and iterate**
   - What works well?
   - What needs improvement?
   - Any undocumented use cases?

### Phase 5: General Availability (Baseline Graduation)

**Owner:** Platform Team + Architecture Council  
**Timeline:** Ongoing

Once beta feedback is incorporated:

1. **Update documentation**
   - Remove BETA label
   - Consolidate feedback into refined docs
   - Add to Baseline Orchestration Layer

2. **Announce to all teams**
   - Newsletter: "New baseline capability available"
   - Office hours: Q&A on using the new feature
   - Examples: how different teams can leverage it

3. **Maintain as baseline component**
   - SLA: 99.9% uptime (baseline reliability)
   - Support: on-call support for issues
   - Versioning: backward-compatible improvements only
   - Deprecation: 6-month notice before removing

4. **Remove duplicate work**
   - Teams can retire their local override
   - Migrate to baseline version progressively
   - Retire old hook in promotion-lifecycle (see Decommissioning)

---

## Decommissioning Old Overrides

When a team's override is promoted to baseline, retire the old override:

1. **Deprecation Period (1 month)**
   - Old override still works
   - Emit deprecation warning in logs
   - Point teams to baseline equivalent

2. **Migration Period (2 months)**
   - Teams migrate to baseline version
   - Platform team helps with technical questions
   - Both versions run in parallel (old + new)

3. **Removal (after 3 months)**
   - Remove old override from hook registry
   - Remove supporting code
   - Audit logs still accessible

**Example:**
```typescript
// Old override in Tax team's code
hooks.register('tax:validation', async (context) => {
  // DEPRECATED: Use registerComplianceValidation instead
  // Baseline now provides this capability
  console.warn('[DEPRECATED] tax:validation hook. Use baseline compliance validation.')
  // ... old implementation ...
})

// New baseline version
import { registerComplianceValidation } from '@core/hooks/compliance'
registerComplianceValidation('tax', taxValidator)
```

---

## Recognition & Incentives

Teams that contribute promoted capabilities get:

1. **Public Recognition**
   - Changelog entry: "Multi-Currency Validation by TaxCompliance Team"
   - Architecture Council meeting: presentation of the capability
   - Internal blog post: how the capability works, lessons learned

2. **Reduced Maintenance Burden**
   - Original team is primary owner (receives support)
   - But platform team helps maintain baseline version
   - Shared responsibility

3. **Influence on Platform Evolution**
   - Demonstrated ability to innovate within platform
   - Voice in Architecture Council discussions
   - More overrides from this team will be considered

4. **Tooling Support**
   - Platform team helps refactor/generalize code
   - Access to testing infrastructure
   - Direct line to platform team for questions

---

## Failure Modes & Prevention

**Mistake 1: Promoting domain-specific logic as generic**
- Example: "Tax validation hook" → doesn't apply to Finance teams
- Prevention: Architecture Council explicitly reviews generalizability
- Fix: Keep as domain-specific hook, not baseline

**Mistake 2: Promoting prematurely (before sufficient adoption)**
- Example: Hook works great for 1 team, but corner cases break for others
- Prevention: Require 2+ teams requesting promotion
- Fix: Beta period allows for edge-case discovery

**Mistake 3: Promoting without addressing maintenance**
- Example: Original author leaves, baseline component breaks
- Prevention: Platform team takes ownership during refactoring
- Fix: Establish SLA and on-call coverage before GA

**Mistake 4: Creating too many baseline capabilities (bloat)**
- Example: Every team's override gets promoted
- Prevention: High bar for promotion (must solve >1 team's problem)
- Fix: Keep most specialized logic as domain-specific overrides

---

## Real-World Example: From Override to Baseline

**Timeline:**

**Month 1 (Discovery):**
- Tax team implements "multi-currency tax validation hook"
- Hook fires at release-readiness stage
- Metrics: quality 92%, cost -$50/month, reliability 99%

**Month 2 (Evaluation):**
- Architecture Council reviews: "Multi-currency validation is cross-cutting"
- Survey shows Finance, Marketplace, International teams interested
- Decision: ✓ Promote to baseline

**Month 2-3 (Refactoring):**
- Platform team generalizes hook → `registerComplianceValidation()`
- Write tests, documentation, security review
- Tax team helps validate generalized version

**Month 3-4 (Beta):**
- Release as BETA in baseline
- Finance team tests, provides feedback
- Small fixes based on edge cases

**Month 4+ (General Availability):**
- Remove BETA label
- Announce to all teams
- Finance, Marketplace adopt new baseline feature
- Tax team retires old override
- Maintenance shared: Tax team + Platform team

---

## Governance Decision Framework

**Should this override be promoted to baseline?**

```
Does it solve a problem
for multiple teams?
  ├─ NO → Keep as domain-specific override ✓
  └─ YES → Is it generalizable?
       ├─ NO → Keep as domain-specific override ✓
       └─ YES → Is it reliable? (>98% success)
            ├─ NO → Improve reliability, then revisit
            └─ YES → Architecture Council approval required
                 ├─ REJECTED → Keep as override
                 └─ APPROVED → Proceed to refactoring & beta
```

---

## Related Documentation

- [Platform Architecture](../architecture/README.md)
- [Progressive Adoption Runbook](../runbooks/progressive-adoption.md)
- [Evaluation Plane & Metrics](../../evaluation/README.md)
- [New Team Onboarding](../onboarding/README.md)

---

## Key Takeaway

The promotion lifecycle formalizes how the platform evolves. Specialized innovations don't stay specialized forever — the best ideas graduate to baseline, benefiting everyone. This creates a continuous feedback loop:

**Divergence → Evaluation → Convergence → Evolution → Continued Divergence**

Each cycle raises the baseline bar while preserving space for new innovation.
