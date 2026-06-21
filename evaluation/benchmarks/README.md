# Benchmarks Suite

Performance benchmarking for the agentic platform: latency, throughput, cost, and quality tradeoffs.

## Purpose

Establish objective performance baselines:
- **Latency curves** — How does end-to-end time scale with request complexity?
- **Throughput** — How many requests can the platform handle per second?
- **Cost per request** — What's the LLM cost for a typical feature request?
- **Quality vs. Cost** — Trade-offs between output quality and token usage

## Why Separate Folder?

**Distinct from evaluation/regression:**
- **Regression:** "Did we break something?" (golden dataset comparison)
- **Benchmarks:** "How fast is it?" (latency, throughput, cost curves)

Both inform promotion decisions, but test different dimensions.

## Planned Benchmarks

### Latency Benchmarks
```
Request complexity: simple → moderate → complex
                      ↓
            End-to-end time (all 5 stages)
                      ↓
            Graph: complexity vs. latency
```

Target: <15 seconds for moderate requests

### Throughput Benchmarks
```
Request queue: 1 → 10 → 100 concurrent requests
                      ↓
            Successful completions/sec
                      ↓
            Identify bottlenecks
```

Target: >5 concurrent requests without degradation

### Cost Benchmarks
```
Per-stage token usage:
  Stage 1 (Requirements): X tokens
  Stage 2 (Architecture): Y tokens
  ...
  Stage 5 (Release): Z tokens
                      ↓
            Cost per stage + cumulative
```

Target: Identify expensive stages, optimize

### Quality vs. Cost Tradeoff
```
Configuration A (detailed): High quality, high cost
Configuration B (lean): Lower quality, lower cost
                      ↓
            Quality metric vs. token cost
```

Target: Find sweet spot (quality/cost ratio)

## Status

**Status:** Not yet implemented  
**Wave:** 13 candidate (post-Wave 12)  
**Contributed by:** (Open for team contributions)  
**Dependency:** Evaluation infrastructure (Wave 8)

## How to Contribute

1. **Define benchmarks** — Which metrics matter most?
2. **Create load generators** — Tools to simulate concurrent requests
3. **Measure baselines** — Run benchmarks on current code
4. **Document** — How to run benchmarks, interpret results
5. **Set targets** — Performance SLOs for each metric
6. **Monitor** — Add to CI/CD to catch regressions

## Related

- [Wave 8: Evaluation](../../docs/DESIGN.md#wave-8-evaluation--metrics--regression-testing)
- [Golden Datasets](../golden-datasets/README.md) — Regression testing (vs. benchmarks for performance)
- [Regression Runner](../regression/README.md) — Output quality (vs. benchmarks for latency/cost)
