import { readFileSync } from 'fs'
import { join } from 'path'
import { LLMProvider } from '@core/llm'
import { ReleaseReadinessReportSchema, type ReleaseReadinessReport } from '@contracts/artifacts/ReleaseReadinessReport'
import { type RequirementBrief } from '@contracts/artifacts/RequirementBrief'
import { type ArchitectureReview } from '@contracts/artifacts/ArchitectureReview'
import { type ImplementationPlan } from '@contracts/artifacts/ImplementationPlan'
import { type TestPlan } from '@contracts/artifacts/TestPlan'
import { DocumentationTool } from '@skills/documentation/tool'

export class ReleaseReadinessAgent {
  private tool: DocumentationTool

  constructor(private llm: LLMProvider) {
    this.tool = new DocumentationTool()
  }

  async run(input: {
    brief: RequirementBrief
    architecture: ArchitectureReview
    plan: ImplementationPlan
    testPlan: TestPlan
  }): Promise<ReleaseReadinessReport> {
    const skillPath = join(__dirname, '..', '..', 'skills', 'documentation', 'SKILL.md')
    const skillContent = readFileSync(skillPath, 'utf-8')

    const prompt = `${skillContent}\n\n## Input Artifacts\n${JSON.stringify(input, null, 2)}`

    const output = await this.llm.complete(prompt)
    const parsed = JSON.parse(output)

    return ReleaseReadinessReportSchema.parse(parsed)
  }
}
