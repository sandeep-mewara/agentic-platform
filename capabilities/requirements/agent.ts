import { readFileSync } from 'fs'
import { join } from 'path'
import { LLMProvider } from '@core/llm'
import { RequirementBriefSchema, type RequirementBrief } from '@contracts/artifacts/RequirementBrief'

export class RequirementsAgent {
  constructor(private llm: LLMProvider) {}

  async run(featureRequest: string): Promise<RequirementBrief> {
    const skillPath = join(__dirname, '..', '..', 'skills', 'requirements-analysis', 'SKILL.md')
    const skillContent = readFileSync(skillPath, 'utf-8')

    const prompt = `${skillContent}\n\n## Input Feature Request\n${featureRequest}`

    const output = await this.llm.complete(prompt)
    const parsed = JSON.parse(output)

    return RequirementBriefSchema.parse(parsed)
  }
}
