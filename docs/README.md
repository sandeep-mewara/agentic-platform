# Documentation Hub

Complete guides for understanding, adopting, and extending the agentic platform.

## Start Here

**New to the platform?** Start with the main [README.md](../README.md) — it has a navigation table to find your path.

---

## Documentation by Goal

### Understand the Architecture

| Document | When | Duration |
|----------|------|----------|
| [Platform Design: Wave-by-Wave](DESIGN.md) | You want to understand *why* each component was built | 20 min |
| [Architecture Principles](architecture/README.md) | You want to understand the philosophy + design thinking | 15 min |
| [Common Failure Modes](common-failure-modes.md) | You want to avoid common mistakes | 15 min |

### Adopt the Platform (4-6 Weeks)

| Document | When |
|----------|------|
| [New Team Onboarding](onboarding/README.md) | You're new, getting started (first week) |
| [Progressive Adoption Runbook](runbooks/progressive-adoption.md) | You're adopting step-by-step (6 weeks) |
| [Override → Baseline Promotion](promotion-lifecycle/README.md) | Your override is valuable; consider promoting it |

---

## Documentation Structure

```
docs/
├── README.md (this file)          — Navigation hub
├── DESIGN.md                       — Wave-by-Wave architecture + rationale
├── architecture/README.md          — Principles + design thinking
├── common-failure-modes.md         — Anti-patterns + recovery
├── onboarding/README.md            — First week hands-on
├── runbooks/
│   └── progressive-adoption.md    — 6-step adoption path
└── promotion-lifecycle/README.md   — Governance: overrides → baseline
```

## Documentation Standards

Each document should:
- [ ] Start with purpose (why this doc exists)
- [ ] Link to related docs (no dead ends)
- [ ] Reference Wave(s) it belongs to
- [ ] Include practical examples or code
- [ ] Have a "what's next" section

## Contributing Documentation

To add a doc:
1. Create in appropriate subfolder (or root if major guide)
2. Add to this hub with brief "when to read" guidance
3. Link from [main README.md](../README.md) if major guide
4. Link from related docs (both directions)

## Related

- [Main README](../README.md) — Quick start and navigation
- [Code organization](../README.md#folder-structure-at-a-glance) — Where things live
