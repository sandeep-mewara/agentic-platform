# Test Suite: Strategy & Organization

Comprehensive testing across integration and unit levels using Vitest.

## Test Philosophy

**Integration first, then units:**
- **Smoke tests** (integration) — Full PDLC pipeline end-to-end
- **Unit tests** (components) — HookRegistry, TraceEmitter, SecurityScanner in isolation

This strategy catches:
- **Integration issues** via smoke tests (e.g., "agent outputs wrong schema")
- **Component bugs** via unit tests (e.g., "hook doesn't fire correctly")

## Test Organization

```
tests/
├── smoke/
│   └── pdlc-demo.test.ts       ← Full pipeline (3 tests)
└── unit/
    ├── HookRegistry.test.ts     ← Hook behavior (11 tests)
    ├── TraceEmitter.test.ts     ← Telemetry (10 tests)
    └── SecurityScanner.test.ts  ← Security (20 tests)
```

## Running Tests

```bash
# Run all tests (44 total)
npm test

# Watch mode (rerun on file change)
npm run test:watch

# Run specific file
npm test HookRegistry.test.ts

# Run with coverage (if configured)
npm test -- --coverage
```

## Test Inventory

### Smoke Tests (3 tests)
**File:** `smoke/pdlc-demo.test.ts`  
**Purpose:** Full pipeline end-to-end  
**What's tested:** All 5 stages complete, final status is APPROVED

See: [smoke/README.md](smoke/README.md)

### Unit Tests (41 tests)

#### HookRegistry (11 tests)
**File:** `unit/HookRegistry.test.ts`  
**What's tested:**
- Hook registration (`registerHook()`)
- Hook execution at correct stages
- Multiple hooks per event
- Lifecycle hooks (start, end)
- Hook state management (clear, getHooks)

#### TraceEmitter (10 tests)
**File:** `unit/TraceEmitter.test.ts`  
**What's tested:**
- Trace creation with unique IDs
- Span recording (recordSpan)
- Span context (traceId, spanId)
- Span collection order
- Trace summary generation

#### SecurityScanner (20 tests)
**File:** `unit/SecurityScanner.test.ts`  
**What's tested:**
- PII detection (SSN, email, phone, credit card)
- Prompt injection patterns (SQL, command, template)
- Malicious patterns (eval, exec, prototype pollution)
- Severity levels (LOW, MEDIUM, HIGH)
- Clean input handling

## Test Coverage

| Component | Tests | Status |
|-----------|-------|--------|
| Core orchestrator | Smoke tests | ✅ Integration tested |
| HookRegistry | 11 unit | ✅ All edge cases covered |
| TraceEmitter | 10 unit | ✅ All lifecycle stages covered |
| SecurityScanner | 20 unit | ✅ All threat types covered |
| Agents (Req, Arch, Plan, Test, Release) | Smoke tests | ✅ Verified via pipeline |
| Governance (policies, audit) | Implicitly via smoke | ✅ No explicit tests, covered in integration |
| Extensions | Examples runnable | ✅ Verified manually |

**Gap:** Individual agents not unit-tested (assumed correct if smoke test passes). Governance layer tested implicitly through smoke.

## What's NOT Tested

**Intentionally excluded from Wave 12 tests:**
1. **Individual agents** — Covered by smoke test (if pipeline works, agents work)
2. **Example domains** — Verified by running examples (finance, healthcare, ML)
3. **Python extension** — Verified by `npm run demo:polyglot`
4. **Performance** — Covered by benchmarks (future, Wave 13 candidate)
5. **Visual output** — Human verification (run demo and inspect)

## Test Frameworks & Tools

- **Runner:** Vitest (npm test)
- **Assertions:** Vitest's expect() API
- **Mocking:** Built-in mock functions
- **Coverage:** Via Vitest (optional, not currently enabled)

## Adding New Tests

To add a test:
1. Create `[component].test.ts` in `unit/` or integration test in `smoke/`
2. Follow existing test structure
3. Run `npm test` to verify
4. Update this README if adding major new test suite

## Test Quality Goals

- [ ] All tests pass (44/44) ✅
- [ ] Tests are deterministic (no flakiness) ✅
- [ ] Tests are fast (<300ms total) ✅
- [ ] Tests are clear (intent obvious) ✅
- [ ] Tests are independent (no ordering) ✅

## Wave

**Wave:** 12 (Tests, Verification & Quality Gates)  
**Related:** [Wave 12: Tests](../../docs/DESIGN.md#wave-12-tests-verification--quality-gates)

## Related

- [Smoke Tests](smoke/README.md) — Integration testing strategy
- [Evaluation: Golden Datasets](../evaluation/golden-datasets/README.md) — Regression testing
- [Evaluation: Benchmarks](../evaluation/benchmarks/README.md) — Performance testing (future)
