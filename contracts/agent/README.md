# Agent Contracts

Request/response contracts for agent invocation and polyglot execution.

## Schemas

### AgentMetadata
Identifying information for an agent capability.

- `agentId` — Unique agent identifier
- `agentName` — Human-readable name
- `capability` — Capability exercised (e.g., "requirements-analysis")
- `version` — Agent version
- `owner` — Team or person owning the agent

### AgentRequest
Invocation request sent to an agent.

- `id` — Unique request identifier
- `agentMetadata` — Identity/version info
- `input` — Agent-specific input (a parsed artifact)
- `context` — PDLC stage context (optional)
- `traceId` — For audit linkage
- `spanId` — For telemetry
- `timestamp` — Request timestamp (Unix ms)

### AgentResponse
Response from an agent.

- `id` — References the AgentRequest.id
- `agentId`
- `output` — Agent-produced artifact
- `status` — SUCCESS or FAILURE
- `message` — Optional human-readable summary
- `metadata` — Agent-specific data
- `error` — Optional error details with code, message, stackTrace
- `timestamp` — Response timestamp (Unix ms)

## Article Section

Maps to **Capability composition** section. These contracts define the boundary between the orchestrator and individual agents:

- TypeScript agents in `capabilities/` receive AgentRequest, return AgentResponse
- Python agents in `extensions/tax/python-agent/` via `PythonAgentAdapter.ts` use JSON stdin/stdout marshaling of these schemas
- Validation happens at the boundary; orchestrator can substitute agents with same capability without touching caller code

## Imports

```typescript
import { AgentRequestSchema, AgentResponseSchema, AgentMetadataSchema } from '@contracts/agent/schema'
```
