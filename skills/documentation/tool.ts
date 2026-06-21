import { ReleaseReadinessReport } from '@contracts/artifacts/ReleaseReadinessReport'

export class DocumentationTool {
  formatAsMarkdown(report: ReleaseReadinessReport): string {
    let markdown = ''

    markdown += `# Release Readiness Report\n\n`
    markdown += `**Status:** ${report.overallStatus}\n\n`
    markdown += `## Executive Summary\n${report.executiveSummary}\n\n`

    // Readiness checklist
    markdown += `## Readiness Checklist\n`
    markdown += `- Code Complete: ${this.checkmark(report.readiness.codeComplete)}\n`
    markdown += `- Tests Pass: ${this.checkmark(report.readiness.testsPass)}\n`
    markdown += `- Documentation Complete: ${this.checkmark(report.readiness.documentationComplete)}\n`
    markdown += `- Performance Acceptable: ${this.checkmark(report.readiness.performanceAcceptable)}\n`
    markdown += `- Security Review: ${report.readiness.securityReview}\n\n`

    // Quality Metrics
    if (report.qualityMetrics) {
      markdown += `## Quality Metrics\n`

      if (report.qualityMetrics.codeQuality) {
        markdown += `### Code Quality\nScore: ${report.qualityMetrics.codeQuality.score}/100\n`
        if (report.qualityMetrics.codeQuality.issues) {
          markdown += `Issues:\n`
          for (const issue of report.qualityMetrics.codeQuality.issues) {
            markdown += `- ${issue.category}: ${issue.count} (${issue.severity})\n`
          }
        }
        markdown += '\n'
      }

      if (report.qualityMetrics.testCoverage) {
        markdown += `### Test Coverage\n`
        markdown += `- Unit: ${report.qualityMetrics.testCoverage.unit}%\n`
        markdown += `- Integration: ${report.qualityMetrics.testCoverage.integration}%\n`
        markdown += `- E2E: ${report.qualityMetrics.testCoverage.e2e}%\n\n`
      }

      if (report.qualityMetrics.documentation) {
        markdown += `### Documentation\n`
        const docs = report.qualityMetrics.documentation
        markdown += `- README: ${this.checkmark(docs.readme)}\n`
        markdown += `- API Docs: ${this.checkmark(docs.apiDocs)}\n`
        markdown += `- Setup Guide: ${this.checkmark(docs.setupGuide)}\n`
        markdown += `- Troubleshooting: ${this.checkmark(docs.troubleshooting)}\n\n`
      }
    }

    // Blockers
    if (report.blockers && report.blockers.length > 0) {
      markdown += `## Blockers\n`
      for (const blocker of report.blockers) {
        markdown += `### ${blocker.category}: ${blocker.description}\n`
        markdown += `**Mitigation:** ${blocker.mitigation}\n\n`
      }
    }

    // Recommendations
    if (report.recommendations && report.recommendations.length > 0) {
      markdown += `## Recommendations\n`
      for (const rec of report.recommendations) {
        markdown += `- ${rec}\n`
      }
      markdown += '\n'
    }

    // Post-release checklist
    if (report.postReleaseChecklist && report.postReleaseChecklist.length > 0) {
      markdown += `## Post-Release Checklist\n`
      for (const item of report.postReleaseChecklist) {
        markdown += `- [ ] ${item.item}`
        if (item.responsible) markdown += ` (${item.responsible})`
        if (item.dueDate) markdown += ` - Due: ${item.dueDate}`
        markdown += '\n'
      }
      markdown += '\n'
    }

    // Approvals
    if (report.approvals && report.approvals.length > 0) {
      markdown += `## Approvals\n`
      for (const approval of report.approvals) {
        markdown += `- **${approval.role}** (${approval.approver}): ${approval.status}`
        if (approval.comment) markdown += ` - ${approval.comment}`
        markdown += '\n'
      }
    }

    return markdown
  }

  private checkmark(value: boolean): string {
    return value ? '✓' : '✗'
  }

  summarizeBlockers(report: ReleaseReadinessReport): string[] {
    if (!report.blockers || report.blockers.length === 0) {
      return []
    }
    return report.blockers.map((b) => `[${b.category}] ${b.description}`)
  }

  isReadyForRelease(report: ReleaseReadinessReport): boolean {
    return (
      report.overallStatus === 'APPROVED' &&
      report.readiness.codeComplete &&
      report.readiness.testsPass &&
      report.readiness.documentationComplete &&
      report.readiness.securityReview === 'APPROVED' &&
      (!report.blockers || report.blockers.length === 0)
    )
  }

  getRiskLevel(report: ReleaseReadinessReport): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (report.blockers && report.blockers.some((b) => b.category === 'Security')) {
      return 'HIGH'
    }

    if (!report.readiness.securityReview || report.readiness.securityReview !== 'APPROVED') {
      return 'HIGH'
    }

    if (!report.qualityMetrics?.codeQuality?.score || report.qualityMetrics.codeQuality.score < 80) {
      return 'MEDIUM'
    }

    if (report.qualityMetrics?.testCoverage) {
      const avgCoverage =
        (report.qualityMetrics.testCoverage.unit +
          report.qualityMetrics.testCoverage.integration +
          report.qualityMetrics.testCoverage.e2e) /
        3
      if (avgCoverage < 80) {
        return 'MEDIUM'
      }
    }

    return 'LOW'
  }
}
