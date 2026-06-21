# Runbooks: Operational Guides

Step-by-step guides for common operational scenarios: adopting the baseline, migrating systems, troubleshooting.

## Available Runbooks

### Progressive Adoption Runbook
**When:** Your team is new to the platform and wants to adopt progressively  
**Duration:** 4-6 weeks, spread across sprints (no feature freeze)  
**Outcome:** Your team uses baseline orchestrator with domain-specific hooks  

See: [progressive-adoption.md](progressive-adoption.md)

---

## Runbook Template

If you're creating a new runbook, follow this template:

```markdown
# [Runbook Name]

**When:** Situation in which this applies  
**Duration:** Estimated time to complete  
**Outcome:** What you'll have accomplished  

## Pre-requisites
- [ ] Requirement 1
- [ ] Requirement 2

## Step 1: [First action]
**Objective:** What this step achieves  
**Action items:**
1. Do this
2. Then this
3. Verify result

**Success criteria:**
- [ ] Condition 1
- [ ] Condition 2

---

## Step 2: [Next action]
...

---

## Troubleshooting
Problem → Cause → Fix
```

## Contributing Runbooks

To add a runbook:
1. Create `[topic]-runbook.md` in this directory
2. Follow the template above
3. Add link to this README.md
4. Update main docs/README.md if it's a major guide

## Related

- [Documentation Hub](../README.md) — Overview of all docs
- [Platform Design](../DESIGN.md) — Understanding Wave-by-Wave architecture
- [New Team Onboarding](../onboarding/README.md) — First week (shorter guide)
