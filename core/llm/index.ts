import { LLMProvider } from './LLMProvider'
import { MockLLMProvider } from './MockLLMProvider'
import { ClaudeLLMProvider } from './ClaudeLLMProvider'

export { LLMProvider, MockLLMProvider, ClaudeLLMProvider }

export function getLLMProvider(): LLMProvider {
  const provider = process.env.LLM_PROVIDER?.toLowerCase() || 'mock'

  if (provider === 'claude') {
    return new ClaudeLLMProvider()
  }

  if (provider === 'mock') {
    return new MockLLMProvider()
  }

  throw new Error(
    `Unknown LLM_PROVIDER: ${provider}. Supported: mock, claude. Set LLM_PROVIDER environment variable.`,
  )
}
