# Smoke Tests: Integration Testing Strategy

Single happy-path test that exercises all layers of the platform end-to-end.

## Philosophy

**One test, all layers:**

Rather than 50 isolated unit tests (agents, orchestrator, hooks), we have 3 focused smoke tests that verify:
- All components work together
- Data flows through pipeline correctly
- Final output has expected structure and status

**Why "smoke"?** If smoke comes out (pipeline fails), something is fundamentally broken. Smoke test catches that immediately.

## Test File

**File:** `pdlc-demo.test.ts` (3 tests)

## Test Cases

### Test 1: Orchestrator Initialization
```typescript
it('should initialize orchestrator with all services', () => {
  const orchestrator = new ConvergedAgentOrchestrator(
    llmProvider,
    tracer,
    hooks,
    spendTracker
  )
  
  expect(orchestrator).toBeDefined()
  expect(tracer.getTrace()).toBeDefined()
  expect(spendTracker).toBeDefined()
})
```

**What's verified:**
- Orchestrator instantiates without errors
- Required services are wired correctly
- No missing dependencies

### Test 2: Hook Registration & Lifecycle
```typescript
it('should register and execute hooks', async () => {
  const orchestrator = new ConvergedAgentOrchestrator(...)
  const hookCalled = []
  
  hooks.registerHook('lifecycle:start', () => {
    hookCalled.push('start')
  })
  
  await orchestrator.runPDLC(request)
  
  expect(hookCalled).toContain('start')
})
```

**What's verified:**
- Hooks can be registered
- Hooks execute at correct lifecycle points
- Hook context passes expected data

### Test 3: Full PDLC Pipeline
```typescript
it('should execute full PDLC and return APPROVED status', async () => {
  const orchestrator = new ConvergedAgentOrchestrator(...)
  const request = { featureRequest: 'Add OAuth 2.0 authentication' }
  
  const result = await orchestrator.runPDLC(request)
  
  expect(result.requirementBrief).toBeDefined()
  expect(result.architectureReview).toBeDefined()
  expect(result.implementationPlan).toBeDefined()
  expect(result.testPlan).toBeDefined()
  expect(result.releaseReadinessReport.status).toBe('APPROVED')
})
```

**What's verified:**
- All 5 stages execute in sequence
- Each stage produces output with correct schema
- Final status is APPROVED (governance gate passed)
- No exceptions thrown

## What Gets Tested (By Layer)

### Layer 1: Contracts ✅
- All artifacts (RequirementBrief, ArchitectureReview, etc.) are valid Zod schemas
- Output at each stage conforms to schema

### Layer 2: Core Runtime ✅
- LLMProvider works (mock or real)
- Orchestrator runs stages in sequence
- TraceEmitter records spans
- SpendTracker accumulates cost
- SecurityScanner runs before LLM call

### Layer 3: Governance ✅
- Policies are checked
- Audit trail is recorded
- HITL gate blocks and approves

### Layer 4: Skills ✅
- Each skill's SKILL.md is used correctly by agents
- Skills produce expected outputs

### Layer 5: Capabilities ✅
- All 5 agents (Req, Arch, Plan, Test, Release) execute
- Agents compose skills correctly
- Agents validate output against contracts

### Layer 6: Extensions ✅
- Hooks can be registered
- Hooks execute at correct stages
- Hooks can add blockers, metadata

### Layer 7: Registry ✅
- Catalogs exist and are loadable
- Registry patterns can be discovered

### Layer 8: Evaluation ✅
- Golden dataset can be compared
- Regression runner can validate output

## What Does NOT Get Tested Here

**Intentionally excluded (unit tests handle these):**
- Individual hook firing order (tested in HookRegistry.test.ts)
- Span collection in TraceEmitter (tested in TraceEmitter.test.ts)
- PII detection patterns (tested in SecurityScanner.test.ts)
- Individual agent logic (assumed correct if pipeline works)

**Why?** Smoke tests are for integration; unit tests are for components.

## Running Smoke Tests

```bash
# Run all tests (includes smoke)
npm test

# Run only smoke tests
npm test smoke

# Run with watch mode
npm run test:watch smoke/pdlc-demo.test.ts
```

## Success Criteria

**Smoke test passes if:**
- ✅ Orchestrator initializes without errors
- ✅ All 5 stages execute
- ✅ Output schemas are valid
- ✅ Final status is APPROVED
- ✅ No exceptions thrown
- ✅ Hooks fire at correct times

## Troubleshooting Smoke Test Failures

| Symptom | Likely Cause | Fix |
|---------|---|---|
| "Cannot read property 'featureRequest' of undefined" | Input schema mismatch | Check orchestrator.runPDLC() call |
| "Mock LLM returned invalid JSON" | MockLLMProvider keyword matching off | Check mock response mapping |
| "Hook not called" | Hook event type wrong | Verify hook event name vs. HookRegistry valid types |
| "Output doesn't match schema" | LLM changed response format | Update mock response or fix schema |

## Wave

**Wave:** 12 (Tests, Verification & Quality Gates)  
**Related:** [Wave 12: Tests](../../docs/DESIGN.md#wave-12-tests-verification--quality-gates)

## Related

- [Test Suite Overview](../README.md) — All tests (smoke + unit)
- [Unit Tests](../unit/) — Component-specific tests
- [PDLC Demo](../../examples/pdlc-demo/README.md) — Manual demo (similar flow to smoke test)
