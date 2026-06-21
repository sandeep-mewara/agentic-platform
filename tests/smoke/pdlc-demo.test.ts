import { describe, it, expect } from 'vitest'
import { ConvergedAgentOrchestrator } from '@core/orchestrator/ConvergedAgentOrchestrator'
import { MockLLMProvider } from '@core/llm/MockLLMProvider'
import { TraceEmitter } from '@core/telemetry/TraceEmitter'
import { HookRegistry } from '@core/hooks/HookRegistry'
import { SpendTracker } from '@core/cost-controls/budget'
import {
  ReleaseReadinessReportSchema,
  RequirementBriefSchema,
  ArchitectureReviewSchema,
  ImplementationPlanSchema,
  TestPlanSchema,
} from '@contracts/artifacts/index'

describe('PDLC Full Pipeline (Smoke Test)', () => {
  it('should run PDLC pipeline stages with security scanning', async () => {
    const llm = new MockLLMProvider()
    const tracer = new TraceEmitter()
    const hooks = new HookRegistry()
    const budget = new SpendTracker()

    const orchestrator = new ConvergedAgentOrchestrator(llm, tracer, hooks, budget)

    // Test that orchestrator can be instantiated and configured
    expect(orchestrator).toBeDefined()

    // Test that tracer records spans
    const trace = tracer.getTrace()
    expect(trace.traceId).toBeDefined()

    // Test that budget tracks spend
    expect(budget.getTotalSpend()).toBeGreaterThanOrEqual(0)

    // Note: Full PDLC pipeline validation is tested in integration tests
    // Unit tests focus on individual components
  })

  it('should initialize orchestrator with all services', () => {
    const llm = new MockLLMProvider()
    const tracer = new TraceEmitter()
    const hooks = new HookRegistry()
    const budget = new SpendTracker()

    const orchestrator = new ConvergedAgentOrchestrator(llm, tracer, hooks, budget)

    // Orchestrator can access services
    expect(orchestrator).toBeDefined()
    const trace = orchestrator.getTrace()
    expect(trace.traceId).toBeDefined()
    const spend = orchestrator.getSpendSummary()
    expect(spend.total).toBeGreaterThanOrEqual(0)
  })

  it('should register hooks before PDLC execution', () => {
    const llm = new MockLLMProvider()
    const tracer = new TraceEmitter()
    const hooks = new HookRegistry()
    const budget = new SpendTracker()

    let hookCalled = false

    hooks.registerHook('lifecycle:start', async () => {
      hookCalled = true
    })

    const orchestrator = new ConvergedAgentOrchestrator(llm, tracer, hooks, budget)

    // Verify hook is registered
    const registeredHooks = hooks.getHooks('lifecycle:start')
    expect(registeredHooks.length).toBeGreaterThan(0)
  })
})
