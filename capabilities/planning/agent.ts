import { readFileSync } from 'fs'
import { join } from 'path'
import { LLMProvider } from '@core/llm'
import { ImplementationPlanSchema, type ImplementationPlan } from '@contracts/artifacts/ImplementationPlan'
import { type RequirementBrief } from '@contracts/artifacts/RequirementBrief'
import { type ArchitectureReview } from '@contracts/artifacts/ArchitectureReview'

export class PlanningAgent {
  constructor(private llm: LLMProvider) {}

  async run(input: { brief: RequirementBrief; architecture: ArchitectureReview }): Promise<ImplementationPlan> {
    const skillPath = join(__dirname, '..', '..', 'skills', 'planning', 'SKILL.md')
    const skillContent = readFileSync(skillPath, 'utf-8')

    const prompt = `${skillContent}\n\n## Input Artifacts\n${JSON.stringify(input, null, 2)}`

    const output = await this.llm.complete(prompt)
    const parsed = JSON.parse(output)

    return ImplementationPlanSchema.parse(parsed)
  }
}
