# Platform Architecture: Principles & Design Thinking

The philosophy and design thinking behind the agentic platform. For Wave-by-Wave implementation details, see [docs/DESIGN.md](../DESIGN.md).

Maps to the article "Agentic Development: From Divergence to a Self-Evolving Platform."

## Quick Links

- [Core Principle: Converge Capabilities](#core-principle)
- [8-Layer Reference Architecture](#reference-architecture)
- [Component Classification Model](#component-model)
- [Ownership & Governance](#ownership)
- [Wave-by-Wave Implementation Details](../DESIGN.md) ← Start here if you want to understand *why* each component was built

## Core Principle: Converge Capabilities {#core-principle}

The platform converges *capabilities*, not implementations.

**Key distinction:**
- **Standard:** Everyone must use this (control-focused)
- **Baseline:** Everyone starts here unless they have a compelling reason not to (adoption-focused)

### Convergence Readiness Signals

| Signal | Meaning |
|--------|---------|
| Multiple teams solving the same problem | Candidate for convergence |
| Repeated primitives emerging | Baseline opportunity |
| New adopters unsure where to start | Discovery problem |
| Maintenance burden increasing | Consolidation opportunity |
| Overrides becoming common | Promote capability evaluation |

### Harvested Capabilities (Platform Baseline)

The following capabilities have consistently delivered production value and form the baseline:

1. **Requirements Analysis & Guardrailing**
   - Converts feature requests → structured requirements
   - Enforces constraints, risks, success criteria
   - Agent: RequirementsAgent

2. **Automated Architecture Review Loops**
   - Evaluates requirements for architectural concerns
   - Proposes design patterns, identifies scalability issues
   - Agent: ArchitectureReviewAgent, FinanceComplianceAgent (extension)

3. **Distributed Traceability & Prompt Diagnostics**
   - Records all agent decisions, inputs, outputs
   - Enables root-cause analysis of failures
   - Component: TraceEmitter, telemetry layer

4. **Human-in-the-Loop Approval Gates**
   - Mandatory decision checkpoints before release
   - Immutable approval record with timestamps
   - Component: HITL schemas, audit trail

5. **Context Management & Core Memory Primitives**
   - Retrieval of existing architecture decisions (ADRs)
   - Prevention of semantic drift in agent decisions
   - Layer: Knowledge & Context (organizational truths)

## Target Reference Architecture {#reference-architecture}

The platform is structured in 8 core layers + 2 cross-cutting verticals:

```
Layer 8: EXPERIENCE & ADOPTION
(Docs • Templates • Starter Kits)

Layer 7: REGISTRY & DISCOVERY
(Agents • Skills • Workflows • Patterns)

Layer 6: OVERRIDE & EXTENSION
(Product Logic • Domain Agents)

Layer 5: BASELINE ORCHESTRATION
(Requirements → Plan → Review → Build)

Layer 4: REUSABLE AGENT CAPABILITIES
(PM • XD • Architect • QA • Developer)

Layer 3: REUSABLE SKILLS & TOOLS
(Search • Retrieval • Memory • Analysis)

Layer 2: PLATFORM CONTRACTS INTERFACE
(IO Schema • Trace Schema • HITL Schema • Tool Contract • Agent Contract)

Layer 1: KNOWLEDGE & CONTEXT
(ADRs • APIs • Standards • Design Systems)

CROSS-CUTTING:
├─ Governance & Control Plane (Security, Traceability, Observability, Cost Controls, Audit, HITL, Compliance)
└─ Evaluation Plane (Benchmarks, Golden Datasets, Regression Testing, Quality/Cost/Latency Metrics)
```

### Layer Descriptions

**Layer 1: Knowledge & Context**
- Single source of truth for organizational decisions
- Prevents agents from experiencing semantic drift
- Examples: ADRs, API catalogs, approved design systems, compliance rules

**Layer 2: Platform Contracts Interface**
- Standardized schemas between governance and execution
- Enables convergence while staying implementation-agnostic
- Examples: IO schemas (RequirementBrief, ArchitectureReview), trace schema, HITL payload schema

**Layer 3: Reusable Skills & Tools**
- Shared, stateless action utilities agents ingest natively
- Agents consume skills; agents do not rebuild skills
- Examples: semantic search, document retrieval, memory management, analysis tools

**Layer 4: Reusable Agent Capabilities**
- Standardized virtual organizational personas
- Common roles: Requirements Agent, Architecture Agent, QA Agent, Developer Agent, PM Agent
- All validated with Zod schemas at boundaries

**Layer 5: Baseline Orchestration**
- Default, customizable multi-stage lifecycle flow
- Standard sequence: Requirements → Architecture → Planning → Testing → Release
- Mandatory: Traceability, HITL gates, security checks
- Overrideable: Sequence, domain reviews

**Layer 6: Override & Extension**
- Rapid innovation at product edge without destabilizing core
- Squads inject custom business logic (e.g., Healthcare Compliance, Tax Validation)
- Preserved as clean hooks in the hook registry

**Layer 7: Registry & Discovery**
- Real-time indexing and exposure of:
  - All active agents (with ownership, quality metrics)
  - All active skills (with reusability, dependencies)
  - All active workflows (with stage definitions)
  - All active patterns (with execution modes)
- Enables discoverability without hard-coded dependencies

**Layer 8: Experience & Adoption**
- Starter kits for new teams
- Documentation templates
- Migration guides (clone → baseline)
- Onboarding runbooks

**Governance & Control Plane (Cross-Cutting Vertical)**
- Runs beneath all execution steps
- Enforces non-negotiable enterprise requirements:
  - Real-time PII data masking
  - Automated token rate-limiting
  - Immutable audit logs
  - Security scanning
  - Compliance enforcement

**Evaluation Plane (Cross-Cutting Vertical)**
- Objective, metrics-driven testing environment
- Standard benchmarks and golden datasets
- Regression runners for output validation
- Quality/cost/latency metrics
- Determines whether overrides should be promoted to baseline

## Component Classification Model {#component-model}

Every discovered capability is classified into one of 5 structural types:

| Type | Example | Target Layer |
|------|---------|--------------|
| **Contract** | Trace Schema, HITL Payloads, IO Boundaries | Layer 2: Contracts Interface |
| **Platform Service** | OpenTelemetry Engine, Token Cost Budgeting, PII Sanitizers | Control Plane |
| **Skill** | Semantic Vector Search, Document Extraction, Memory Retrieval | Layer 3: Reusable Skills |
| **Agent** | Architecture Reviewer, Compliance Validator, Testing Agent | Layer 4: Agent Capabilities |
| **Workflow** | Full PDLC, Architecture-Focused, Finance Compliance | Layer 5: Baseline Orchestration |

This mapping creates a direct path from experimentation (divergence) → reuse (convergence) → promotion (baseline evolution).

## Two-Track Convergence Model

Convergence happens through two coordinated, pipelined tracks:

**Track A: Knowledge Convergence**
1. Clone Inventory — Catalog what teams built
2. Capability Extraction — Identify shared patterns
3. Primitive Discovery — Find core emerging primitives
4. Pattern Distillation — Evaluate quality, cost, latency

**Track B: Technical Convergence**
1. Baseline Assembly — Design platform contracts, schemas, lifecycle hooks
2. Platform Construction — Build core orchestration, security, observability
3. Progressive Adoption — Onboard teams using outside-in sequence

At the organizational level, tracks run in parallel. At the component level, they operate sequentially: Track A discovers, Track B engineers, Track A moves ahead to discover more.

## Ownership & Governance {#ownership}

Clear ownership eliminates ambiguity:

| Artifact | Owner |
|----------|-------|
| Common Core Platform & Registry | Platform Team |
| Governance & Control Plane | Platform Team |
| Evaluation Plane | Platform Team + Architecture Council |
| Shared Skills Pool | Platform Team + Distributed Contributors (Inner-Source) |
| Shared Agent Personas | Dedicated Capability Owners (Specialized Feature Squads) |
| Product Overrides & Domain Logic | Individual Product Teams |
| Baseline Core Release Sign-Off | Architecture Council |

## Architecture Evolution Loop

The platform is designed to continuously absorb innovation:

1. **Enable Divergence** — Teams explore, duplicate, experiment
2. **Harvest Learning** — Catalog shared tasks and emerging patterns
3. **Build Baseline** — Engineer reusable components from learned patterns
4. **Preserve Flexibility** — Allow overrides at extension layer
5. **Evolve Continuously** — Promote successful overrides back into baseline

This creates a permanent, virtuous evolution loop where the platform learns from divergence rather than treating it as technical debt.

## Key Design Principles

1. **Contracts over implementations** — Define data interfaces, allow execution freedom
2. **Baselines over standards** — Adopt progressively, don't mandate
3. **Capabilities over monoliths** — Converge functional components, not entire codebases
4. **Evaluation over opinion** — Make architectural decisions based on metrics (quality, cost, latency), not subjective judgment
5. **Flexibility over control** — Preserve product-specific innovation through extension hooks

## Related Documentation

- [Progressive Adoption Runbook](../runbooks/progressive-adoption.md)
- [Override → Baseline Promotion](../promotion-lifecycle/README.md)
- [New Team Onboarding](../onboarding/README.md)
- [Common Failure Modes](../common-failure-modes.md)

## References

- Article: "Agentic Development: From Divergence to a Self-Evolving Platform" by Sandeep Mewara
- Repository: https://github.com/sandeep-mewara/agentic-platform
- PLAN.md: Implementation waves and technical blueprint
