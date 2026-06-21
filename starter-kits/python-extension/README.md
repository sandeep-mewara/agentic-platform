# Agentic Platform Starter Kit: Python Extension

Integrate Python agents into the TypeScript agentic platform via JSON contract.

**Target:** Teams with existing Python services (ML, data science, analytics) that want to integrate with the platform.

---

## What's Included

- Python agent skeleton with JSON stdin/stdout contract
- Integration layer (PythonAgentAdapter) for calling Python from TypeScript
- Error handling and retry logic
- Hook integration patterns
- Full type safety with Zod validation

---

## Quick Start

### 1. Set Up Python Environment

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Test the Python Agent

Run the agent directly:

```bash
echo '{"id": "test-1", "skillId": "code-analysis", "input": {"code": "def test(): pass"}, "metadata": {}}' | python agent.py
```

Expected output:

```json
{
  "id": "test-1",
  "skillId": "code-analysis",
  "timestamp": "2024-06-21T10:30:00.123456",
  "status": "success",
  "output": {
    "codeLength": 16,
    "lineCount": 1,
    "functionCount": 1,
    "classCount": 0,
    "hasDocstring": false
  },
  "error": null
}
```

### 3. Integrate with TypeScript

In your TypeScript code:

```typescript
import { integrateCodeAnalysisAgent } from './integration'

const response = await integrateCodeAnalysisAgent()
console.log(response.output)
```

---

## Architecture

### Contract

Python agent communicates via JSON contract:

**Request (stdin):**
```json
{
  "id": "req-001",
  "skillId": "code-analysis",
  "input": {
    "code": "def hello(): pass"
  },
  "metadata": {
    "team": "Python Team",
    "timestamp": "2024-06-21T10:30:00Z"
  }
}
```

**Response (stdout):**
```json
{
  "id": "req-001",
  "skillId": "code-analysis",
  "timestamp": "2024-06-21T10:30:01Z",
  "status": "success",
  "output": {
    "functionCount": 1,
    "lineCount": 1
  },
  "error": null
}
```

### Data Flow

```
TypeScript Orchestrator
    ↓
PythonAgentAdapter (convert request to JSON)
    ↓
Python Process (agent.py)
    ↓
stdin: AgentRequest (JSON)
    ↓
Python agent processes
    ↓
stdout: AgentResponse (JSON)
    ↓
PythonAgentAdapter (parse & validate)
    ↓
TypeScript Handler
```

---

## Key Files

### agent.py

The Python agent script. Implements:

1. **AgentRequest** — Parse incoming JSON
2. **process_request()** — Your business logic
3. **AgentResponse** — Format response JSON

Entry point: `main()` reads stdin, calls `process_request()`, writes stdout.

### integration.ts

TypeScript integration layer. Shows:

1. **integrateCodeAnalysisAgent()** — Simple example
2. **createPythonAgentHook()** — Use in PDLC hooks
3. **registerPythonAgentHook()** — Register with orchestrator
4. **callPythonAgentWithRetry()** — Error handling
5. **chainPythonAgents()** — Multiple agents

---

## Customization

### Add a New Skill

In `agent.py`, add to `process_request()`:

```python
def process_request(request: AgentRequest) -> AgentResponse:
    if request.skillId == "my-custom-skill":
        output = my_custom_logic(request.input)
    return AgentResponse(request, status="success", output=output)

def my_custom_logic(input_data: Dict[str, Any]) -> Dict[str, Any]:
    # Your logic here
    return {"result": "..."}
```

Then call from TypeScript:

```typescript
const request = agentRequestSchema.parse({
  skillId: "my-custom-skill",
  input: { ... },
  ...
})
const response = await adapter.call(request)
```

### Use External Libraries

Add to `requirements.txt`:

```
numpy==1.24.0
pandas==2.0.0
scikit-learn==1.3.0
```

Then in `agent.py`:

```python
import numpy as np
import pandas as pd

def my_ml_logic(data):
    df = pd.DataFrame(data)
    result = np.mean(df['values'])
    return {"mean": result}
```

### Add Logging

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("Processing request", {"skillId": request.skillId})
logger.error("Error occurred", {"error": str(e)})
```

Note: Logs go to stderr; JSON response goes to stdout.

---

## Integration Patterns

### Pattern 1: Simple Call

```typescript
const adapter = new PythonAgentAdapter('./agent.py')
const request = agentRequestSchema.parse({...})
const response = await adapter.call(request)
```

### Pattern 2: Hook Integration

Register Python agent as hook:

```typescript
hooks.register('stage:requirements:post', await createPythonAgentHook(
  './agent.py',
  'custom-logic'
))
```

Hook runs after requirements stage and enriches output.

### Pattern 3: Error Handling

```typescript
try {
  const response = await callPythonAgentWithRetry(adapter, request, 3)
} catch (error) {
  logger.error('Python agent failed', { error })
  // Fallback: use default logic
}
```

### Pattern 4: Chain Agents

```typescript
const step1 = await adapter1.call(request1)
const step2 = await adapter2.call({...step1.output})
```

---

## Production Considerations

### Performance

Python agents have startup overhead (~100-300ms). For high-throughput:

1. **Keep Python process alive** — Use background workers
2. **Batch requests** — Process multiple requests per call
3. **Cache results** — Avoid re-running same analysis

### Reliability

Python processes can fail:

1. **Timeout handling** — Set max execution time
2. **Retry logic** — Exponential backoff
3. **Fallbacks** — Default behavior if agent fails

### Security

Python code runs as the orchestrator process:

1. **Validate input** — Never trust agent input
2. **Sandboxing** — Consider running in isolated container
3. **Permissions** — Restrict file system access

### Scaling

For high volume:

1. **Worker pool** — Multiple Python processes
2. **Message queue** — Queue requests, process asynchronously
3. **Monitoring** — Track agent CPU, memory, latency

---

## Troubleshooting

### "Python not found" error

Ensure Python 3.x is in PATH:

```bash
python --version
```

Or use full path:

```typescript
new PythonAgentAdapter('/usr/bin/python3 ./agent.py')
```

### "ModuleNotFoundError" in Python

Install missing package:

```bash
source venv/bin/activate
pip install <package-name>
```

### "Invalid JSON" error

Ensure agent outputs valid JSON to stdout only (no extra prints):

```python
# ✓ Correct
print(json.dumps(response.to_dict()))

# ✗ Wrong (debug output breaks JSON parsing)
print("Debug info...")
print(json.dumps(response.to_dict()))
```

### Agent timeout

If Python agent hangs:

1. Check for infinite loops in Python code
2. Add timeout to adapter call
3. Debug with simple test:

```bash
echo '{}' | python agent.py
```

### Memory issues

Python processes accumulate memory over time:

1. **Restart periodically** — Kill and respawn worker
2. **Profile memory** — Find memory leaks
3. **Limit requests** — Don't spawn unlimited processes

---

## Advanced Examples

### Example 1: ML Model Integration

```python
# agent.py
import pickle

model = pickle.load(open('model.pkl', 'rb'))

def predict(input_data):
    features = input_data.get('features', [])
    prediction = model.predict([features])
    return {"prediction": float(prediction[0])}
```

### Example 2: Data Processing

```python
# agent.py
import pandas as pd

def process_csv(input_data):
    csv_text = input_data.get('csv', '')
    df = pd.read_csv(StringIO(csv_text))
    result = df.describe().to_dict()
    return result
```

### Example 3: External API Call

```python
# agent.py
import requests

def fetch_external_data(input_data):
    api_key = input_data.get('api_key')
    response = requests.get(
        'https://api.example.com/data',
        headers={'Authorization': f'Bearer {api_key}'}
    )
    return response.json()
```

---

## Related Documentation

- [Platform Architecture](../../docs/architecture/README.md)
- [PythonAgentAdapter](../../core/agents/PythonAgentAdapter.ts)
- [AgentRequest/Response Contracts](../../contracts/agent/)
- [Full Starter Kit](../typescript-full/README.md)

---

## Next Steps

1. **Modify agent.py** — Add your domain logic
2. **Test with real data** — Run your agents against actual inputs
3. **Integrate with orchestrator** — Register as hook
4. **Monitor performance** — Track latency and errors
5. **Scale to production** — Use worker pools, caching

---

## FAQ

**Q: Can I use Python 2.7?**
A: No. Python 3.6+ required (for f-strings and typing).

**Q: Can I make network calls from Python agent?**
A: Yes. Be mindful of timeouts and API rate limits.

**Q: What if Python agent crashes?**
A: PythonAgentAdapter catches the error and returns failure response. Use retry logic.

**Q: Can I call TypeScript from Python?**
A: Not directly. Use Python agent to call TypeScript via HTTP API instead.

**Q: How do I debug Python agent?**
A: Add logging to stderr, run agent directly with test input, check logs in orchestrator output.

**Q: What's the max execution time?**
A: No hard limit by default. Set timeout in adapter if needed.
