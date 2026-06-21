# Reliability Patterns

Exponential backoff retry and circuit breaker for resilience.

## Modules

### RetryPolicy
Exponential backoff retry for transient failures.

```typescript
const policy = new RetryPolicy({
  maxRetries: 3,
  initialDelayMs: 100,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
})

try {
  const result = await policy.execute(async () => {
    return await llm.complete(prompt)
  })
} catch (err) {
  // Retried 3 times with backoff: 100ms, 200ms, 400ms
  console.error('Final failure after retries:', err)
}
```

**Delay sequence:**
- Attempt 0: immediate
- Attempt 1: 100ms
- Attempt 2: 200ms
- Attempt 3: 400ms
- (capped at maxDelayMs)

**Use case:** Transient network errors, rate limiting.

### CircuitBreaker
Prevents cascading failures by failing fast once error threshold reached.

States:
- `CLOSED` — Normal operation; requests go through
- `OPEN` — Failure threshold exceeded; requests fail immediately
- `HALF_OPEN` — Timeout passed; testing if service recovered

```typescript
const breaker = new CircuitBreaker({
  failureThreshold: 5,
  successThreshold: 2,
  timeoutMs: 60000,
})

try {
  const result = await breaker.execute(async () => {
    return await llm.complete(prompt)
  })
} catch (err) {
  if (breaker.getState() === CircuitBreakerState.OPEN) {
    console.log('Circuit is OPEN; skipping LLM calls')
  }
}
```

**State transitions:**
1. CLOSED → OPEN: failureCount >= failureThreshold
2. OPEN → HALF_OPEN: timeoutMs elapsed
3. HALF_OPEN → CLOSED: successCount >= successThreshold
4. HALF_OPEN → OPEN: any failure

## Article Section

Maps to **Reliability & Observability** section. The patterns implement:

- **Transient error handling:** Retry with backoff prevents cascading through temporary network glitches
- **Fail fast on persistent outages:** Circuit breaker prevents wasting tokens/time on a broken LLM service
- **Graceful degradation:** Product teams can switch to cached responses or fallback agents when circuit opens

## Usage

```typescript
import { RetryPolicy, CircuitBreaker } from '@core/reliability/retry'

// Combined: retry with backoff, circuit break on repeated failures
const policy = new RetryPolicy({ maxRetries: 3 })
const breaker = new CircuitBreaker({ failureThreshold: 5 })

async function robustComplete(prompt: string): Promise<string> {
  return await breaker.execute(() => policy.execute(() => llm.complete(prompt)))
}
```

## Future Enhancements

- Jitter to backoff delays (prevent thundering herd)
- Metrics export (failures, state transitions)
- Adaptive circuit thresholds based on error type
