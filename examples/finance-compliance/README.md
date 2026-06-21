# Finance Compliance Example

Real-world example: Finance team validates architectural decisions against SOX compliance and tax rules before release.

**Base:** TypeScript Full starter kit + domain-specific compliance hooks

**Target:** Finance teams, FinOps, accounting, financial services

---

## Quick Start

```bash
npm install
npm run demo
```

Expected output: PDLC pipeline with SOX/tax compliance validation hooks executing at key stages.

---

## What This Example Shows

### 1. SOX Compliance Validation

Hook fires after architecture stage to verify:
- Financial controls mentioned in design
- Access control/authorization specified
- Audit trail and immutability addressed

If violations found → **blocks release** with specific required fixes.

### 2. Tax Compliance Validation

Hook fires after planning stage to verify:
- Multi-currency handling designed
- Rounding and precision rules specified
- Multiple country support planned

If violations found → **adds blocker** to release readiness report.

### 3. Cost Tracking

Hook fires after requirements stage to:
- Estimate feature cost
- Check if cost is >5% of annual budget
- Log warning if exceeds threshold

---

## How It Works

```
Feature Request: "Add international payment support"
    ↓
[Requirements Stage] → Objectives extracted
    ↓ [Cost Tracking Hook] → Estimate cost, warn if >5% budget
    ↓
[Architecture Stage] → Architecture review
    ↓ [SOX Compliance Hook] → Check controls, audit trail
    ↓ If SOX fails: BLOCKED ⚠️
    ↓
[Planning Stage] → Implementation plan
    ↓ [Tax Compliance Hook] → Check currency, rounding, countries
    ↓ If tax fails: Add blocker ⚠️
    ↓
[Testing Stage] → Test strategy
    ↓
[Release Readiness] → Check if blockers
    ↓ If blockers exist: REJECTED
    ↓ Otherwise: APPROVED ✓
```

---

## File Structure

```
├── package.json          # Dependencies
├── tsconfig.json        # TypeScript config
├── .env.example        # Template for .env
└── src/
    ├── hooks.ts        # SOX/tax validation logic
    ├── config.ts       # Finance configuration
    └── main.ts         # Demo entry point
```

---

## Domain Hooks Explained

### Hook 1: SOX Compliance Validation

**Fires:** After architecture stage
**Checks:**
- Financial controls in design
- Authorization/access control specified
- Audit trail/immutability addressed

**Blocks:** Release if critical controls missing

```typescript
hooks.register('stage:architecture:post', validateSOXCompliance)
```

### Hook 2: Tax Compliance Validation

**Fires:** After planning stage
**Checks:**
- Multi-currency support designed
- Rounding/precision rules specified
- Multiple countries supported

**Adds blocker:** If tax requirements not met

```typescript
hooks.register('stage:planning:post', validateTaxCompliance)
```

### Hook 3: Cost Tracking

**Fires:** After requirements stage
**Tracks:**
- Estimated feature cost
- Cost as % of annual budget
- Warning if >5% budget

**Logs warning:** If cost excessive

```typescript
hooks.register('stage:requirements:post', validateCostTracking)
```

---

## Configuration

Edit `.env`:

```env
# LLM Provider
ANTHROPIC_API_KEY=your-key
LLM_PROVIDER=claude

# Finance Config
COST_BUDGET_USD=200
ENABLE_SOX_VALIDATION=true
ENABLE_TAX_VALIDATION=true
SUPPORTED_CURRENCIES=USD,EUR,GBP,JPY
```

---

## Real-World Patterns

### Pattern 1: Compliance Blocking

If architecture lacks financial controls:

```typescript
output.blockers = output.blockers || []
output.blockers.push({
  id: 'sox-compliance-failed',
  category: 'compliance',
  severity: 'high',
  description: 'Financial controls not addressed in architecture'
})
```

Release is **rejected** until issue resolved.

### Pattern 2: Conditional Validation

Enable/disable compliance checks by feature flag:

```typescript
registerConditionalFinanceHooks(hooks, {
  sox: process.env.ENABLE_SOX_VALIDATION !== 'false',
  tax: process.env.ENABLE_TAX_VALIDATION !== 'false',
  cost: true
})
```

### Pattern 3: Cost Metadata

Add cost info to output for downstream use:

```typescript
output.metadata = output.metadata || {}
output.metadata.costWarning = `Feature cost $${estimatedCost}`
```

---

## Customization

### Add a Compliance Rule

Edit `src/hooks.ts`:

```typescript
export async function validateFinanceCompliance(context: HookContext): Promise<void> {
  const { output } = context

  // Your validation logic
  const violations = checkYourRule(output)

  if (violations.length > 0) {
    output.blockers = output.blockers || []
    output.blockers.push({
      id: 'your-rule-failed',
      category: 'finance',
      description: violations.join('; ')
    })
  }
}

// Register
hooks.register('stage:your-stage:post', validateFinanceCompliance)
```

### Add a Supported Currency

Edit `src/config.ts`:

```typescript
currencies: {
  supported: [..., 'CHF', 'CAD'], // Add your currencies
  default: 'USD'
}
```

### Change Budget or Warning Threshold

Edit `src/config.ts`:

```typescript
limits: {
  budgetUSD: 500,                    // Your annual budget
  costWarningThreshold: 0.1          // Warn at 10% instead of 5%
}
```

---

## Testing the Example

### Test SOX Compliance

Change the feature request to something without security focus:

```typescript
const featureRequest = {
  featureRequest: 'Add user profile page'
}
```

Expected: SOX compliance check fails because no security/control discussion.

### Test Tax Compliance

Change feature to currency-related:

```typescript
const featureRequest = {
  featureRequest: 'Add invoice generation'
}
```

Expected: Tax validation triggers, checks multi-currency handling.

### Test Cost Tracking

Change budget to low number:

```typescript
// In .env
COST_BUDGET_USD=50
```

Expected: Cost tracking warns when estimated cost > 5% of $50 = $2.50.

---

## Production Checklist

Before deploying to production:

- [ ] Compliance rules match your actual policies
- [ ] Budget limits correct for your organization
- [ ] Currencies match your payment processors
- [ ] Audit retention meets compliance requirements
- [ ] Error handling covers all failure cases
- [ ] Logging configured for audit trail
- [ ] Cost estimates verified with finance team
- [ ] No hardcoded secrets in hooks

---

## Common Issues

### Compliance check too strict

**Problem:** Legitimate features blocked by overzealous validation

**Solution:** Refine validation logic or add exceptions

```typescript
// Only block if BOTH controls missing
if (!hasAccessControl && !hasAuditTrail) {
  // Add blocker
}
```

### Cost estimates wrong

**Problem:** Feature cost estimates don't match reality

**Solution:** Improve estimation logic or add ML-based cost prediction

```typescript
const estimatedCost = useMLCostPredictor(feature)
```

### Blockers not clearing

**Problem:** Release blocked even after fixing issue

**Solution:** Check that hook removes blocker when issue fixed

```typescript
if (violations.length === 0) {
  // Don't add blocker
}
```

---

## Next Steps

### Integrate into Your PDLC

1. Copy this example to your project
2. Customize `src/hooks.ts` for your policies
3. Update `src/config.ts` with your limits
4. Wire into your orchestrator
5. Monitor metrics and refine rules

### Promote to Baseline

If your compliance hooks prove broadly useful:

1. Submit metrics to Architecture Council
2. Propose promotion to baseline
3. Follow [Promotion Lifecycle](../../docs/promotion-lifecycle/README.md)
4. Other teams adopt your compliance patterns

### Related Examples

- [Healthcare HIPAA](../healthcare-hipaa/) — PII protection patterns
- [Python ML Agent](../python-ml-agent/) — Risk assessment patterns

---

## Key Concepts

**Compliance Blocking:** Hooks can add "blockers" to output, which prevent release unless resolved.

**Conditional Validation:** Hooks can be enabled/disabled by feature flag.

**Cost Tracking:** Hooks have access to full PDLC context and can annotate output with domain metadata.

**Progressive Enforcement:** Start with warnings, graduate to blockers as policies harden.

---

## FAQ

**Q: Can I disable SOX validation for some features?**
A: Yes, use conditional registration or feature flags in env config.

**Q: What if a feature legitimately can't meet compliance?**
A: Add an exception process: require architecture review + override approval.

**Q: How do I track compliance violations over time?**
A: Hooks write to audit log; query traces for compliance metrics.

**Q: Can I add more compliance rules?**
A: Yes, add functions to `hooks.ts` and register them with hooks registry.

---

## Support

For questions:
1. See [docs/architecture/](../../docs/architecture/) for patterns
2. Check [docs/promotion-lifecycle/](../../docs/promotion-lifecycle/) for compliance governance
3. Review starter-kits for base patterns
4. Contact platform team

---

**This example shows how to add domain-specific compliance validation without modifying platform core. Use hooks to enforce your policies. 🔐**
