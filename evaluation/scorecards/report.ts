import { z } from 'zod'

const ScoreRecordSchema = z.object({
  stage: z.string(),
  duration: z.number().describe('Execution time in milliseconds'),
  tokens: z.number().describe('Token usage count'),
  quality: z.number().min(0).max(100).describe('Quality score 0-100'),
})

const ScorecardSchema = z.object({
  records: z.array(ScoreRecordSchema),
  qualityScore: z.number().min(0).max(100).optional(),
  costScore: z.number().min(0).max(100).optional(),
  latencyScore: z.number().min(0).max(100).optional(),
})

export type ScoreRecord = z.infer<typeof ScoreRecordSchema>
export type ScorecardData = z.infer<typeof ScorecardSchema>

export class Scorecard {
  private records: ScoreRecord[] = []

  recordStage(stage: string, duration: number, tokens: number, quality: number): void {
    if (quality < 0 || quality > 100) {
      throw new Error('Quality score must be between 0 and 100')
    }
    this.records.push({
      stage,
      duration,
      tokens,
      quality,
    })
  }

  computeScores(): { qualityScore: number; costScore: number; latencyScore: number } {
    if (this.records.length === 0) {
      return { qualityScore: 0, costScore: 0, latencyScore: 0 }
    }

    // Quality score: average quality across all stages
    const qualityScore = Math.round(
      this.records.reduce((sum, r) => sum + r.quality, 0) / this.records.length,
    )

    // Cost score: based on total token usage
    const totalTokens = this.records.reduce((sum, r) => sum + r.tokens, 0)
    const costScore = this.computeCostScore(totalTokens)

    // Latency score: based on total execution time
    const totalDuration = this.records.reduce((sum, r) => sum + r.duration, 0)
    const latencyScore = this.computeLatencyScore(totalDuration)

    return { qualityScore, costScore, latencyScore }
  }

  private computeCostScore(tokens: number): number {
    // Token efficiency scoring
    if (tokens < 1000) return 100 // Very efficient
    if (tokens < 2000) return 80 // Efficient
    if (tokens < 3000) return 60 // Acceptable
    if (tokens < 5000) return 40 // Expensive
    return 20 // Very expensive
  }

  private computeLatencyScore(duration: number): number {
    // Duration in milliseconds → latency scoring
    if (duration < 1000) return 100 // < 1s: Excellent
    if (duration < 5000) return 80 // < 5s: Good
    if (duration < 10000) return 60 // < 10s: Acceptable
    if (duration < 30000) return 40 // < 30s: Slow
    return 20 // > 30s: Very slow
  }

  renderTable(): string {
    if (this.records.length === 0) {
      return 'No stage records to display'
    }

    const { qualityScore, costScore, latencyScore } = this.computeScores()

    let table = '| Stage | Duration (ms) | Tokens | Quality |\n'
    table += '|-------|---------------|--------|----------|\n'

    for (const record of this.records) {
      table += `| ${record.stage} | ${record.duration} | ${record.tokens} | ${record.quality} |\n`
    }

    table += '\n### Summary Scores\n'
    table += `| Metric | Score |\n`
    table += '|--------|-------|\n'
    table += `| Quality | ${qualityScore} |\n`
    table += `| Cost Efficiency | ${costScore} |\n`
    table += `| Latency | ${latencyScore} |\n`

    return table
  }

  getSummary(): string {
    const { qualityScore, costScore, latencyScore } = this.computeScores()

    const qualityStatus = this.scoreToStatus(qualityScore, [80, 60, 40])
    const costStatus = this.scoreToStatus(costScore, [80, 60, 40])
    const latencyStatus = this.scoreToStatus(latencyScore, [80, 60, 40])

    return `Quality: ${qualityStatus}, Cost: ${costStatus}, Latency: ${latencyStatus}`
  }

  private scoreToStatus(score: number, thresholds: [number, number, number]): string {
    const [pass, warn, fail] = thresholds
    if (score >= pass) return '✓ PASS'
    if (score >= warn) return '⚠ WARN'
    if (score >= fail) return '✗ FAIL'
    return '✗ FAIL'
  }

  toJSON(): ScorecardData {
    const { qualityScore, costScore, latencyScore } = this.computeScores()
    return {
      records: this.records,
      qualityScore,
      costScore,
      latencyScore,
    }
  }
}
