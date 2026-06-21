export interface ReviewFinding {
  type: 'gap' | 'risk' | 'quality' | 'testing' | 'security'
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
  title: string
  description: string
  recommendation: string
}

export interface ReviewMetrics {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  qualityScore: number
  testCoverageTarget?: number
}

export interface ParsedReview {
  summary: string
  findings: ReviewFinding[]
  testFocus: string[]
  metrics: ReviewMetrics
}

export class CodeReviewTool {
  parse(llmOutput: string): ParsedReview {
    try {
      const parsed = JSON.parse(llmOutput)

      // Validate required fields
      if (!parsed.summary || !Array.isArray(parsed.findings) || !Array.isArray(parsed.testFocus)) {
        throw new Error('Missing required fields: summary, findings, testFocus')
      }

      // Validate findings structure
      for (const finding of parsed.findings) {
        this.validateFinding(finding)
      }

      // Validate metrics
      this.validateMetrics(parsed.metrics)

      return {
        summary: parsed.summary,
        findings: parsed.findings,
        testFocus: parsed.testFocus,
        metrics: parsed.metrics,
      }
    } catch (err) {
      throw new Error(`Failed to parse code review output: ${err}`)
    }
  }

  private validateFinding(finding: unknown): void {
    if (typeof finding !== 'object' || finding === null) {
      throw new Error('Finding must be an object')
    }

    const f = finding as Record<string, unknown>

    if (!['gap', 'risk', 'quality', 'testing', 'security'].includes(f.type as string)) {
      throw new Error(`Invalid finding type: ${f.type}`)
    }

    if (!['LOW', 'MEDIUM', 'HIGH'].includes(f.severity as string)) {
      throw new Error(`Invalid severity: ${f.severity}`)
    }

    if (typeof f.title !== 'string' || typeof f.description !== 'string' || typeof f.recommendation !== 'string') {
      throw new Error('Finding must have title, description, and recommendation (strings)')
    }
  }

  private validateMetrics(metrics: unknown): void {
    if (typeof metrics !== 'object' || metrics === null) {
      throw new Error('Metrics must be an object')
    }

    const m = metrics as Record<string, unknown>

    if (!['LOW', 'MEDIUM', 'HIGH'].includes(m.riskLevel as string)) {
      throw new Error(`Invalid risk level: ${m.riskLevel}`)
    }

    if (typeof m.qualityScore !== 'number' || m.qualityScore < 1 || m.qualityScore > 10) {
      throw new Error('Quality score must be between 1 and 10')
    }
  }

  filterByType(review: ParsedReview, type: ReviewFinding['type']): ReviewFinding[] {
    return review.findings.filter((f) => f.type === type)
  }

  filterBySeverity(review: ParsedReview, severity: ReviewFinding['severity']): ReviewFinding[] {
    return review.findings.filter((f) => f.severity === severity)
  }

  countBySeverity(review: ParsedReview): Record<string, number> {
    const counts = { LOW: 0, MEDIUM: 0, HIGH: 0 }
    for (const finding of review.findings) {
      counts[finding.severity]++
    }
    return counts
  }

  hasCriticalIssues(review: ParsedReview): boolean {
    return review.findings.some((f) => f.severity === 'HIGH') || review.metrics.riskLevel === 'HIGH'
  }
}
