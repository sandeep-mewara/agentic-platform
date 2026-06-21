# Agentic Platform Starter Kits

Three production-grade starter kits for different team contexts and use cases.

---

## Quick Decision Guide

| Kit | Time to Run | Complexity | Use When |
|-----|-------------|-----------|----------|
| **TypeScript Basic** | 5 min | Minimal | First time learning the platform |
| **TypeScript Full** | 15 min | Medium | Building production service with hooks |
| **Python Extension** | 10 min | Low-Medium | Integrating Python service into platform |

---

## 1. TypeScript Basic

**Minimal 5-minute quickstart.**

- **Lines of code:** ~100 (index.ts) + config
- **Learning curve:** Gentle
- **Features:** MockLLMProvider, single PDLC run, cost tracking
- **When to use:** Learning the platform, first demo

### Quick Start

```bash
cd starter-kits/typescript-basic
npm install
npm run demo
```

### What You'll Learn

- How to initialize LLM provider
- How to create and wire orchestrator
- What the 5-stage PDLC pipeline produces
- How to inspect results

### Next Steps

- Modify `src/index.ts` with different feature requests
- Read the architecture guide
- Move to **TypeScript Full** for production setup

---

## 2. TypeScript Full

**Production-ready setup with hooks and customization.**

- **Lines of code:** ~250-300
- **Learning curve:** Moderate
- **Features:** Full orchestrator, platform hooks, domain hooks, error handling
- **When to use:** Building production service, need customization

### Quick Start

```bash
cd starter-kits/typescript-full
npm install
npm run demo
```

### What You'll Learn

- How to wire all platform services (tracer, budget, hooks)
- How to register platform-wide hooks (observability, cost, errors)
- How to register domain-specific hooks (compliance, security, business logic)
- How to handle errors and graceful degradation
- Production patterns (cost control, monitoring, etc.)

### Next Steps

- Customize domain hooks in `src/hooks.ts`
- Add error handling for your use case
- Integrate with your product
- Monitor metrics and iterate

---

## 3. Python Extension

**Integrate Python agents into the TypeScript platform.**

- **Lines of code:** ~150 (Python) + integration
- **Learning curve:** Low
- **Features:** JSON contract, retry logic, hook integration
- **When to use:** Existing Python services, ML/data teams

### Quick Start

```bash
cd starter-kits/python-extension

# Set up Python environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Test agent
echo '{"id": "test", "skillId": "code-analysis", "input": {"code": "def test(): pass"}, "metadata": {}}' | python agent.py
```

### What You'll Learn

- How to write a Python agent with JSON contract
- How to integrate Python into TypeScript orchestrator
- How to use Python agents as hooks
- Error handling and retry logic
- Chaining multiple agents

### Next Steps

- Modify `agent.py` with your domain logic
- Use `integration.ts` patterns in your TypeScript code
- Test with real data
- Scale to production

---

## Kit Comparison

### Feature Matrix

| Feature | Basic | Full | Python |
|---------|-------|------|--------|
| **Entry point** | Single demo | Full orchestrator | Python script |
| **LLM provider** | Mock or Claude | Mock or Claude | N/A (you choose in TS) |
| **Platform hooks** | ✓ | ✓ + ✓ Platform | ✓ (via integration) |
| **Domain hooks** | ✗ | ✓ | ✓ (in integration.ts) |
| **Error handling** | Minimal | Full try-catch | Retry logic |
| **Cost tracking** | ✓ | ✓ | ✓ (via orchestrator) |
| **Observability** | ✓ | ✓✓ (TraceEmitter) | ✓ (via integration) |
| **Configuration** | .env.example | .env.example | .env + venv |
| **Dependencies** | Minimal (zod, pino) | Full (+ dotenv) | Minimal (pydantic) |

### Path Through Kits

```
New to platform?
    ↓
Start: TypeScript Basic (understand PDLC)
    ↓
Ready for production?
    ├─→ TypeScript service? → Use TypeScript Full
    └─→ Python service? → Use Python Extension
    
Building advanced?
    ↓
Combine: Full + Python (chain agents, hooks)
```

---

## Directory Structure

```
starter-kits/
├── typescript-basic/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── src/
│   │   ├── index.ts          (100 lines)
│   │   └── README.md
│
├── typescript-full/
│   ├── package.json
│   ├── src/
│   │   ├── main.ts           (80 lines, entry point)
│   │   ├── orchestrator.ts    (150 lines, service wiring)
│   │   ├── hooks.ts           (80 lines, domain logic)
│   │   └── README.md
│
├── python-extension/
│   ├── requirements.txt
│   ├── agent.py              (150 lines, Python agent)
│   ├── integration.ts         (140 lines, TS integration)
│   └── README.md
│
└── README.md (this file)
```

---

## Common Workflows

### Workflow 1: Learn the Platform

```
1. Start: TypeScript Basic
2. Run demo, explore output
3. Read docs/architecture/README.md
4. Modify src/index.ts with custom feature requests
5. Move to TypeScript Full
```

### Workflow 2: Production Service

```
1. Start: TypeScript Full (if TypeScript service)
2. Customize hooks in src/hooks.ts
3. Add error handling and monitoring
4. Integrate into your product
5. Deploy with domain hooks
```

### Workflow 3: Python Integration

```
1. Start: Python Extension
2. Customize agent.py with your ML/analytics logic
3. Use integration.ts patterns in your orchestrator
4. Register Python agent hooks
5. Chain with TypeScript agents if needed
```

### Workflow 4: Combined Setup

```
1. TypeScript Full for main orchestrator
2. Python Extension for ML/analytics
3. Chain agents: TypeScript → Python → TypeScript
4. Use hooks to integrate seamlessly
```

---

## Configuration Across Kits

All kits respect environment variables:

```env
# LLM Provider (TypeScript kits)
ANTHROPIC_API_KEY=sk-ant-...
LLM_PROVIDER=claude  # or "mock"

# Platform Configuration
COST_BUDGET_USD=100
LOG_LEVEL=info
NODE_ENV=production
```

**Basic kit:** .env is optional (uses defaults)
**Full kit:** .env is recommended (configures services)
**Python:** .env for Python agent (if needed)

---

## Running All Three Kits

If you want to see all three in action:

```bash
# Terminal 1: Basic kit
cd starter-kits/typescript-basic
npm install
npm run demo

# Terminal 2: Full kit
cd starter-kits/typescript-full
npm install
npm run demo

# Terminal 3: Python agent
cd starter-kits/python-extension
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
echo '{}' | python agent.py
```

---

## Performance Baseline

Expected output from each kit:

| Metric | Basic | Full | Python |
|--------|-------|------|--------|
| **Time to first output** | <2s | <2s | 0.5-1s |
| **PDLC pipeline** | ~2-5s | ~2-5s | N/A (custom) |
| **Cost (mock)** | $0 | $0 | $0 |
| **Cost (real Claude)** | ~$0.01 | ~$0.01 | ~$0.002 |
| **Memory usage** | 100MB | 120MB | 50MB (Python) |

---

## Troubleshooting

### "Module not found" errors

All kits use TypeScript path aliases (`@contracts/*`, `@core/*`).

**Solution:** Run from project root, not kit directory.

```bash
# ✓ Correct
npm run demo                                    # From kit dir, uses root tsconfig

# ✗ Wrong
cd starter-kits/typescript-basic && npm run demo  # Won't work
```

### Python agent errors

**"ModuleNotFoundError"** — Missing Python dependencies:

```bash
pip install -r requirements.txt
```

**"Python not found"** — Python not in PATH:

```bash
which python3
# Use full path if needed
```

### Cost budget exceeded

**SpendTracker stops pipeline** if budget exceeded.

```env
COST_BUDGET_USD=10  # Increase limit
```

Or debug:

```typescript
logger.info('Budget status', {
  spent: budget.spent(),
  remaining: budget.remaining()
})
```

---

## Next Steps After Starter Kits

1. **Read full architecture** — `docs/architecture/README.md`
2. **Adopt progressively** — `docs/runbooks/progressive-adoption.md`
3. **Onboarding guide** — `docs/onboarding/README.md`
4. **Common pitfalls** — `docs/common-failure-modes.md`
5. **Promotion lifecycle** — `docs/promotion-lifecycle/README.md`

---

## Verify Your Kit (Quality Metrics)

After customizing your kit, validate quality and correctness:

**Regression Testing:** Use `evaluation/` to verify outputs match expected schemas
```bash
# Loads golden dataset, runs your kit, compares outputs
npm test
```

**Quality Metrics:** Monitor quality, cost, and latency
- Quality score: 0-100 (based on output completeness)
- Cost: Track via SpendTracker (tokens × rate)
- Latency: Time per stage (check logs)

See [Evaluation Layer](../evaluation/README.md) for regression testing and scorecard metrics.

---

## Contributing to Starter Kits

If you improve a kit, share back!

Examples of improvements:
- Better error handling patterns
- Additional hook examples
- Performance optimizations
- New use-case demonstrations

See the platform's [Promotion Lifecycle](../docs/promotion-lifecycle/README.md) for how domain innovations graduate to baseline.

---

## FAQ

**Q: Which kit should I start with?**
A: TypeScript Basic. It's the gentlest introduction.

**Q: Can I combine kits?**
A: Yes. Full + Python is common (TypeScript orchestrator + Python agents).

**Q: How do I move from Basic to Full?**
A: Full includes everything from Basic plus hooks. Just migrate your custom logic.

**Q: Can I use these kits in production?**
A: Basic is for learning. Full and Python are production-ready.

**Q: How do I add my own skills?**
A: See `skills/` directory in the platform. Kits demonstrate *using* skills, not implementing them.

**Q: What if I need a different workflow?**
A: Use hooks to customize. They're flexible enough for most use cases.

**Q: Can I integrate other languages?**
A: Yes, like Python. Follow the JSON contract pattern in Python Extension.

---

## Related Documentation

- [Main Platform README](../README.md)
- [Platform Architecture](../docs/architecture/README.md)
- [Progressive Adoption Runbook](../docs/runbooks/progressive-adoption.md)
- [New Team Onboarding](../docs/onboarding/README.md)

---

## Support

If you hit issues:

1. Check the relevant kit's README
2. Review [Common Failure Modes](../docs/common-failure-modes.md)
3. Look at examples in `extensions/`
4. Ask in async channels or platform team sync

---

**Ready to start?** Pick a kit above and run the demo! 🚀
