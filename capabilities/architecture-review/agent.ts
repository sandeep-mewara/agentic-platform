import { readFileSync } from 'fs'
import { join } from 'path'
import { LLMProvider } from '@core/llm'
import { ArchitectureReviewSchema, type ArchitectureReview } from '@contracts/artifacts/ArchitectureReview'
import { type RequirementBrief } from '@contracts/artifacts/RequirementBrief'

export class ArchitectureReviewAgent {
  constructor(private llm: LLMProvider) {}

  async run(requirementBrief: RequirementBrief): Promise<ArchitectureReview> {
    const skillPath = join(__dirname, '..', '..', 'skills', 'architecture-review', 'SKILL.md')
    const skillContent = readFileSync(skillPath, 'utf-8')

    const prompt = `${skillContent}\n\n## Input Requirements\n${JSON.stringify(requirementBrief, null, 2)}`

    const output = await this.llm.complete(prompt)
    const parsed = JSON.parse(output)

    return ArchitectureReviewSchema.parse(parsed)
  }
}
