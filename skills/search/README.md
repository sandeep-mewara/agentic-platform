# Search Skill

Combined keyword and semantic search for finding patterns, code, and documentation across the codebase.

## Purpose

Enable agents to:
- **Find code patterns** — "Where is the error handling pattern?"
- **Search documentation** — "What's the API for cost controls?"
- **Locate examples** — "Show me how to register a hook"

## Pattern

```typescript
import { SemanticSearch } from '@skills/search/tool'

const searcher = new SemanticSearch()

// Search with similarity threshold
const results = await searcher.find(
  'error handling with circuit breaker',
  { threshold: 0.8, topK: 3 }
)
// Returns: Array<{ path: string, content: string, relevance: number }>
```

## Search Strategy

**Keyword-focused approach:**
- **Primary:** Keyword matching (terminology precision)
- **Secondary:** Semantic similarity (capture related concepts)

**When to use:** When specific terminology matters (e.g., "CircuitBreaker", "HookRegistry") or when searching across code

## Differentiation

| Skill | Algorithm | Best For |
|-------|-----------|----------|
| **Retrieval** | Vector + BM25 balanced | Mixed documents + code |
| **Search** | Keyword-focused | Specific terminology, code search |
| **Memory** | Structured queries | Decision recall |

## Status

**Status:** Inner-source skill (not yet implemented)  
**Wave:** 4 (Skills Layer)  
**Contributed by:** (Open for team contributions)  
**Target:** Wave 13 or later

## API Specification (Expected)

```typescript
interface SemanticSearch {
  find(query: string, options?: SearchOptions): Promise<SearchResult[]>
  indexFile(path: string, content: string): Promise<void>
  indexDirectory(dirPath: string): Promise<void>
  rebuild(): Promise<void>
}

interface SearchOptions {
  threshold?: number     // Minimum relevance (0-1), default 0.7
  topK?: number          // Max results, default 10
  fileTypes?: string[]   // Filter by extension (.ts, .md, etc.)
}

interface SearchResult {
  path: string
  content: string        // Excerpt around match
  relevance: number      // Score 0-1
  lineNumber?: number
  highlight?: string     // Highlighted match
}
```

## How to Contribute

1. **Implement** the SemanticSearch class in `tool.ts`
2. **Index** TypeScript, Markdown, and JSON files
3. **Create tests** searching for known patterns in repo
4. **Measure** precision/recall on common queries
5. **Optimize** for code search performance

## Related

- [Wave 4: Skills Layer](../../docs/DESIGN.md#wave-4-skills--reusable-utilities)
- [Retrieval Skill](retrieval/README.md) — Hybrid search (vs. search keyword-focused)
- [Memory Skill](memory/README.md) — Decision recall (vs. search for documents)
