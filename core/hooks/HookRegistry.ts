export interface HookContext {
  stage: string
  traceId: string
  spanId: string
  input?: unknown
  output?: unknown
  metadata?: Record<string, unknown>
}

export type HookHandler = (context: HookContext) => Promise<void> | void

export type HookEvent = 'stage:before' | 'stage:after' | 'stage:error' | 'lifecycle:start' | 'lifecycle:end'

export class HookRegistry {
  private hooks: Map<HookEvent, HookHandler[]> = new Map()

  registerHook(event: HookEvent, handler: HookHandler): void {
    if (!this.hooks.has(event)) {
      this.hooks.set(event, [])
    }
    this.hooks.get(event)!.push(handler)
  }

  async executeHooks(event: HookEvent, context: HookContext): Promise<void> {
    const handlers = this.hooks.get(event) || []
    for (const handler of handlers) {
      await Promise.resolve(handler(context))
    }
  }

  getHooks(event: HookEvent): HookHandler[] {
    return this.hooks.get(event) || []
  }

  clearHooks(): void {
    this.hooks.clear()
  }

  clearEvent(event: HookEvent): void {
    this.hooks.delete(event)
  }
}
