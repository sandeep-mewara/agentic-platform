import { describe, it, expect } from 'vitest'
import { HookRegistry, HookContext, HookEvent } from '@core/hooks/HookRegistry'

describe('HookRegistry', () => {
  it('should register a hook', () => {
    const registry = new HookRegistry()
    const mockFn = async () => {}

    expect(() => {
      registry.registerHook('stage:before', mockFn)
    }).not.toThrow()
  })

  it('should execute registered hooks with correct context', async () => {
    const registry = new HookRegistry()
    let contextReceived: HookContext | null = null

    registry.registerHook('stage:before', async (context) => {
      contextReceived = context
    })

    const testContext: HookContext = {
      stage: 'architecture-review',
      traceId: 'trace-123',
      spanId: 'span-456',
      metadata: { test: 'data' },
    }

    await registry.executeHooks('stage:before', testContext)

    expect(contextReceived).toEqual(testContext)
  })

  it('should execute multiple hooks for same event', async () => {
    const registry = new HookRegistry()
    let hook1Called = false
    let hook2Called = false

    registry.registerHook('stage:after', async () => {
      hook1Called = true
    })

    registry.registerHook('stage:after', async () => {
      hook2Called = true
    })

    const context: HookContext = {
      stage: 'planning',
      traceId: 'trace-1',
      spanId: 'span-1',
    }

    await registry.executeHooks('stage:after', context)

    expect(hook1Called).toBe(true)
    expect(hook2Called).toBe(true)
  })

  it('should not execute hooks for different events', async () => {
    const registry = new HookRegistry()
    let hookCalled = false

    registry.registerHook('stage:before', async () => {
      hookCalled = true
    })

    const context: HookContext = {
      stage: 'architecture-review',
      traceId: 'trace-1',
      spanId: 'span-1',
    }

    await registry.executeHooks('stage:after', context)

    expect(hookCalled).toBe(false)
  })

  it('should execute hooks in sequence', async () => {
    const registry = new HookRegistry()
    const callOrder: string[] = []

    registry.registerHook('stage:error', async () => {
      callOrder.push('first')
    })

    registry.registerHook('stage:error', async () => {
      callOrder.push('second')
    })

    const context: HookContext = {
      stage: 'code-review',
      traceId: 'trace-1',
      spanId: 'span-1',
    }

    await registry.executeHooks('stage:error', context)

    // Both hooks should execute in order
    expect(callOrder).toEqual(['first', 'second'])
  })

  it('should support lifecycle hooks', async () => {
    const registry = new HookRegistry()
    let startCalled = false
    let endCalled = false

    registry.registerHook('lifecycle:start', async () => {
      startCalled = true
    })

    registry.registerHook('lifecycle:end', async () => {
      endCalled = true
    })

    const context: HookContext = {
      stage: 'pdlc',
      traceId: 'trace-1',
      spanId: 'span-1',
    }

    await registry.executeHooks('lifecycle:start', context)
    await registry.executeHooks('lifecycle:end', context)

    expect(startCalled).toBe(true)
    expect(endCalled).toBe(true)
  })

  it('should support before and after stage hooks', async () => {
    const registry = new HookRegistry()
    const callOrder: string[] = []

    registry.registerHook('stage:before', async () => {
      callOrder.push('before')
    })

    registry.registerHook('stage:after', async () => {
      callOrder.push('after')
    })

    const context: HookContext = {
      stage: 'architecture-review',
      traceId: 'trace-1',
      spanId: 'span-1',
    }

    await registry.executeHooks('stage:before', context)
    await registry.executeHooks('stage:after', context)

    expect(callOrder).toEqual(['before', 'after'])
  })

  it('should retrieve registered hooks for an event', () => {
    const registry = new HookRegistry()
    const handler1 = async () => {}
    const handler2 = async () => {}

    registry.registerHook('stage:before', handler1)
    registry.registerHook('stage:before', handler2)

    const hooks = registry.getHooks('stage:before')
    expect(hooks.length).toBe(2)
  })

  it('should return empty array for unregistered events', () => {
    const registry = new HookRegistry()

    const hooks = registry.getHooks('stage:before')
    expect(hooks.length).toBe(0)
  })

  it('should clear all hooks', async () => {
    const registry = new HookRegistry()
    registry.registerHook('stage:before', async () => {})
    registry.registerHook('lifecycle:start', async () => {})

    registry.clearHooks()

    expect(registry.getHooks('stage:before').length).toBe(0)
    expect(registry.getHooks('lifecycle:start').length).toBe(0)
  })

  it('should clear hooks for specific event', async () => {
    const registry = new HookRegistry()
    registry.registerHook('stage:before', async () => {})
    registry.registerHook('lifecycle:start', async () => {})

    registry.clearEvent('stage:before')

    expect(registry.getHooks('stage:before').length).toBe(0)
    expect(registry.getHooks('lifecycle:start').length).toBe(1)
  })
})
