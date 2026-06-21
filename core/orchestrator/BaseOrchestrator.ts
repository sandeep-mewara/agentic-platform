import { LLMProvider } from '../llm/LLMProvider'
import { TraceEmitter } from '../telemetry/TraceEmitter'
import { SecurityScanner } from '../security/SecurityScanner'
import { HookRegistry, HookContext } from '../hooks/HookRegistry'
import { SpendTracker } from '../cost-controls/budget'
import { SpanKind } from '@contracts/trace/schema'
import crypto from 'crypto'

export interface StageInput {
  stage: string
  prompt: string
  metadata?: Record<string, unknown>
}

export interface StageOutput {
  stage: string
  result: string
  metadata?: Record<string, unknown>
}

export class BaseOrchestrator {
  constructor(
    protected llm: LLMProvider,
    protected traceEmitter: TraceEmitter,
    protected hooks: HookRegistry,
    protected spendTracker: SpendTracker,
  ) {}

  async runStage(input: StageInput): Promise<StageOutput> {
    const spanId = crypto.randomUUID()
    const spanContext = this.traceEmitter.createSpanContext(spanId)

    try {
      // Pre-stage hook
      await this.hooks.executeHooks('stage:before', {
        stage: input.stage,
        traceId: this.traceEmitter.getTraceId(),
        spanId,
        input,
      } as HookContext)

      // Security scan
      const security = new SecurityScanner()
      const scanResult = security.scanInput(input.prompt)

      if (!scanResult.isClean) {
        const threats = scanResult.threats
          .filter((t) => t.severity === 'HIGH')
          .map((t) => `${t.type}(${t.matched})`)
          .join(', ')

        throw new Error(`Security scan failed: high-severity threats detected: ${threats}`)
      }

      this.traceEmitter.recordSpan(
        input.stage,
        SpanKind.SECURITY_SCAN,
        'SUCCESS',
        spanContext,
        'Security scan passed',
      )

      // Run LLM
      const spanId2 = crypto.randomUUID()
      const spanContext2 = this.traceEmitter.createSpanContext(spanId2, spanId)
      const result = await this.llm.complete(input.prompt)

      this.traceEmitter.recordSpan(
        input.stage,
        SpanKind.LLM_CALL,
        'SUCCESS',
        spanContext2,
        'LLM call completed',
        {
          model: this.llm.getModel?.() || 'unknown',
          inputLength: input.prompt.length,
          outputLength: result.length,
        },
      )

      // Track spend (mock: estimate 1 token per character)
      const estimatedTokens = Math.ceil(input.prompt.length / 4) + Math.ceil(result.length / 4)
      this.spendTracker.recordSpend(estimatedTokens, input.stage)

      // Post-stage hook
      await this.hooks.executeHooks('stage:after', {
        stage: input.stage,
        traceId: this.traceEmitter.getTraceId(),
        spanId,
        input,
        output: result,
      } as HookContext)

      this.traceEmitter.recordSpan(
        input.stage,
        SpanKind.INTERNAL,
        'SUCCESS',
        spanContext,
        `Stage completed: ${input.stage}`,
      )

      return {
        stage: input.stage,
        result,
        metadata: input.metadata,
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))

      this.traceEmitter.recordSpan(
        input.stage,
        SpanKind.INTERNAL,
        'FAILURE',
        spanContext,
        `Stage failed: ${input.stage}`,
        undefined,
        {
          code: 'STAGE_FAILED',
          message: err.message,
        },
      )

      await this.hooks.executeHooks('stage:error', {
        stage: input.stage,
        traceId: this.traceEmitter.getTraceId(),
        spanId,
        input,
        metadata: { error: err.message },
      } as HookContext)

      throw err
    }
  }

  getTrace() {
    return this.traceEmitter.getTrace()
  }

  getSpendSummary() {
    return this.spendTracker.getBreakdown()
  }
}
