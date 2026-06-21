# Hooks & Adapters

Lifecycle hooks for extensibility and polyglot agent execution.

## Modules

### HookRegistry
Event-driven hook system for product teams to inject behavior at lifecycle boundaries.

Events:
- `stage:before` — Called before stage execution
- `stage:after` — Called after stage completes (success)
- `stage:error` — Called if stage fails
- `lifecycle:start` — Called when PDLC begins
- `lifecycle:end` — Called when PDLC completes

```typescript
const hooks = new HookRegistry()
hooks.registerHook('stage:before', async (context) => {
  console.log(`Starting stage: ${context.stage}`)
})
await hooks.executeHooks('stage:before', { stage: 'requirements-analysis', ... })
```

**Use cases:**
- Log all stage transitions
- Trigger external systems (e.g., Slack notifications)
- Inject compliance checks (e.g., Finance extensions)
- Emit metrics to monitoring systems

### PythonAgentAdapter
Spawns Python agents via JSON stdin/stdout contract.

```typescript
const request: AgentRequest = { ... }
const response = await PythonAgentAdapter.spawnPythonAgent(
  './extensions/tax/python-agent/tax_validation_agent.py',
  request,
)
```

**Contract:**
1. Write AgentRequest JSON to stdin
2. Read AgentResponse JSON from stdout
3. Validate response against AgentResponseSchema

**Fallback:** If Python is unavailable, returns mock response with `{fallback: true}` metadata.

## Article Section

Maps to **Hook-Driven Extensibility** section. The design implements:

- **Product teams extend without modifying core:** Finance compliance checks hook into `stage:before`, not hardcoded in orchestrator
- **Polyglot capability:** Python agents (tax validator) communicate via validated JSON contracts, no bindings needed
- **Graceful degradation:** Python agent spawning fails gracefully if Python not installed; demo continues with mock fallback

## Usage

```typescript
import { HookRegistry } from '@core/hooks/HookRegistry'
import { PythonAgentAdapter } from '@core/hooks/PythonAgentAdapter'

const hooks = new HookRegistry()

// Register compliance hook
hooks.registerHook('stage:before', async (ctx) => {
  if (ctx.stage === 'planning') {
    console.log('[COMPLIANCE] Checking SOX requirements...')
  }
})

// Spawn Python agent
const response = await PythonAgentAdapter.spawnPythonAgent(
  'path/to/agent.py',
  agentRequest,
)
```
