# Retrieval Skill

Hybrid semantic search (vector + BM25) for finding relevant documents, architecture decisions, and code patterns.

## Purpose

Enable agents to:
- **Find relevant documents** — "What ADRs exist for microservices?"
- **Retrieve prior decisions** — "Have we solved this problem before?"
- **Semantic search** — Search by meaning, not just keywords

## Pattern

```typescript
import { SemanticRetrieval } from '@skills/retrieval/tool'

const retriever = new SemanticRetrieval()

// Search with top-K results
const results = await retriever.search(
  'SOX compliance requirements for financial systems',
  { topK: 5 }
)
// Returns: Array<{ text: string, score: number, source: string }>
```

## Search Strategy

**Hybrid approach:**
- **Vector embedding** — Semantic similarity (captures meaning)
- **BM25** — Keyword matching (captures terminology)
- **Combined score** — Best of both worlds

**When to use:** When you need flexible search across mixed content (architecture docs + code comments + decision records)

## Differentiation

| Skill | Algorithm | Best For |
|-------|-----------|----------|
| **Retrieval** | Vector + BM25 (hybrid) | Semantic + keyword search combined |
| **Search** | Keyword focused | When terminology matters more |
| **Memory** | Structured decision recall | Prior architectural decisions |

## Status

**Status:** Inner-source skill (not yet implemented)  
**Wave:** 4 (Skills Layer)  
**Contributed by:** (Open for team contributions)  
**Target:** Wave 13 or later

## API Specification (Expected)

```typescript
interface SemanticRetrieval {
  search(query: string, options?: SearchOptions): Promise<SearchResult[]>
  addDocument(id: string, text: string, source: string): Promise<void>
  index(): Promise<void>  // Rebuild embeddings if needed
}

interface SearchOptions {
  topK?: number          // Default 5
  threshold?: number     // Minimum score (0-1)
  vectorWeight?: number  // Balance vs. BM25 (0-1)
}

interface SearchResult {
  id: string
  text: string
  score: number
  source: string        // Where the document came from
  highlights?: string[] // Relevant excerpts
}
```

## How to Contribute

1. **Implement** the SemanticRetrieval class in `tool.ts`
2. **Choose embedding model** (OpenAI embeddings, local model, etc.)
3. **Create tests** with sample documents and queries
4. **Benchmark** against keyword search (recall + precision)
5. **Document performance** (latency, memory usage)

## Related

- [Wave 4: Skills Layer](../../docs/DESIGN.md#wave-4-skills--reusable-utilities)
- [Memory Skill](memory/README.md) — Recall decisions (vs. retrieval for documents)
- [Search Skill](search/README.md) — Keyword-focused (vs. retrieval hybrid)
- [Progressive Adoption: Step 4](../../docs/runbooks/progressive-adoption.md#step-4-swap-out-common-skills-week-4)
