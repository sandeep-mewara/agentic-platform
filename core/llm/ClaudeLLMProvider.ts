import { LLMProvider } from './LLMProvider'

export class ClaudeLLMProvider implements LLMProvider {
  private client: any
  private model: string

  constructor(apiKey?: string, model: string = 'claude-3-5-sonnet-20241022') {
    const key = apiKey || process.env.ANTHROPIC_API_KEY
    if (!key) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required')
    }

    try {
      const Anthropic = require('@anthropic-ai/sdk').default
      this.client = new Anthropic({ apiKey: key })
      this.model = model
    } catch (err) {
      throw new Error(
        '@anthropic-ai/sdk not installed. Install with: npm install @anthropic-ai/sdk',
      )
    }
  }

  async complete(prompt: string): Promise<string> {
    const message = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = message.content[0]
    if (content.type === 'text') {
      return content.text
    }

    throw new Error(`Unexpected response type: ${content.type}`)
  }

  getModel(): string {
    return this.model
  }
}
