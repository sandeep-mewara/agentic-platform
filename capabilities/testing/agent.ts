import { readFileSync } from 'fs'
import { join } from 'path'
import { LLMProvider } from '@core/llm'
import { TestPlanSchema, type TestPlan } from '@contracts/artifacts/TestPlan'
import { type ImplementationPlan } from '@contracts/artifacts/ImplementationPlan'

export class TestingAgent {
  constructor(private llm: LLMProvider) {}

  async run(implementationPlan: ImplementationPlan): Promise<TestPlan> {
    const skillPath = join(__dirname, '..', '..', 'skills', 'code-review', 'SKILL.md')
    const skillContent = readFileSync(skillPath, 'utf-8')

    const prompt = `${skillContent}\n\nContext: Use this skill to analyze the implementation plan and produce comprehensive test coverage.\n\n## Input Implementation Plan\n${JSON.stringify(implementationPlan, null, 2)}`

    const output = await this.llm.complete(prompt)
    const parsed = JSON.parse(output)

    return TestPlanSchema.parse(parsed)
  }
}
