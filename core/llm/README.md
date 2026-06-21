# LLM Providers

Abstraction layer for language model completion. Allows swapping between mock (for testing) and real Claude (for production).

## Modules

### LLMProvider (interface)
```typescript
export interface LLMProvider {
  complete(prompt: string): Promise<string>
  getModel?(): string
}
```

Core contract: accept prompt, return completion.

### MockLLMProvider
Deterministic mock implementation with canned responses keyed on prompt keywords.
- **Purpose:** Local testing without API calls
- **Responses:** Pre-scripted RequirementBrief, ArchitectureReview, ImplementationPlan, TestPlan, ReleaseReadinessReport samples
- **Routing:** Inspects prompt for keywords (requirements-analysis, architecture-review, planning, code-review, release) and returns corresponding response

### ClaudeLLMProvider
Real Claude API implementation via @anthropic-ai/sdk.
- **Requires:** `ANTHROPIC_API_KEY` environment variable
- **Model:** claude-3-5-sonnet-20241022 (configurable)
- **Max tokens:** 4096 per request

### Factory: getLLMProvider()
```typescript
function getLLMProvider(): LLMProvider {
  const provider = process.env.LLM_PROVIDER?.toLowerCase() || 'mock'
  if (provider === 'claude') return new ClaudeLLMProvider()
  if (provider === 'mock') return new MockLLMProvider()
  throw new Error(...)
}
```

Reads `LLM_PROVIDER` env variable; defaults to 'mock'.

## Article Section

Maps to **LLM Abstraction & Swappability** section. The interface enables:
- Same orchestrator code runs with mock (for demos) or real Claude (for production)
- No agent code depends on concrete provider
- Easy to add new providers (Gemini, Llama, etc.) by implementing LLMProvider

## Usage

```typescript
import { getLLMProvider } from '@core/llm'

// Reads LLM_PROVIDER env; defaults to 'mock'
const llm = getLLMProvider()

// Both return Promise<string>, identical interface
const output = await llm.complete('Analyze this requirement...')
```
