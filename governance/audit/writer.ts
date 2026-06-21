import { writeFileSync, appendFileSync, existsSync } from 'fs'
import { dirname } from 'path'
import { mkdirSync } from 'fs'

export interface AuditEntry {
  timestamp: number
  traceId: string
  event: string
  stage?: string
  actor?: string
  action: string
  result: 'SUCCESS' | 'FAILURE' | 'BLOCKED'
  details: Record<string, unknown>
}

export class AuditWriter {
  private logPath: string

  constructor(logPath: string = './audit_log.jsonl') {
    this.logPath = logPath
    this.ensureLogFile()
  }

  private ensureLogFile(): void {
    const dir = dirname(this.logPath)
    if (dir !== '.' && !existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    if (!existsSync(this.logPath)) {
      writeFileSync(this.logPath, '', 'utf-8')
    }
  }

  record(entry: AuditEntry): void {
    const line = JSON.stringify(entry) + '\n'
    appendFileSync(this.logPath, line, 'utf-8')
  }

  recordDecision(
    traceId: string,
    stage: string,
    decision: string,
    approved: boolean,
    details?: Record<string, unknown>,
  ): void {
    this.record({
      timestamp: Date.now(),
      traceId,
      event: 'DECISION_GATE',
      stage,
      action: decision,
      result: approved ? 'SUCCESS' : 'BLOCKED',
      details: details || {},
    })
  }

  recordPolicyViolation(
    traceId: string,
    stage: string,
    policyId: string,
    violations: string[],
  ): void {
    this.record({
      timestamp: Date.now(),
      traceId,
      event: 'POLICY_VIOLATION',
      stage,
      action: `Policy ${policyId} violated`,
      result: 'BLOCKED',
      details: {
        policyId,
        violations,
      },
    })
  }

  recordComplianceCheck(
    traceId: string,
    stage: string,
    isCompliant: boolean,
    violations?: string[],
  ): void {
    this.record({
      timestamp: Date.now(),
      traceId,
      event: 'COMPLIANCE_CHECK',
      stage,
      action: `Compliance check ${isCompliant ? 'passed' : 'failed'}`,
      result: isCompliant ? 'SUCCESS' : 'BLOCKED',
      details: {
        violations: violations || [],
      },
    })
  }

  recordSecurityEvent(
    traceId: string,
    stage: string,
    threatType: string,
    severity: string,
    details?: Record<string, unknown>,
  ): void {
    this.record({
      timestamp: Date.now(),
      traceId,
      event: 'SECURITY_EVENT',
      stage,
      action: `Security threat detected: ${threatType}`,
      result: severity === 'HIGH' ? 'BLOCKED' : 'SUCCESS',
      details: details || {},
    })
  }

  recordLLMCall(traceId: string, stage: string, model: string, tokens: number): void {
    this.record({
      timestamp: Date.now(),
      traceId,
      event: 'LLM_CALL',
      stage,
      action: `LLM call to ${model}`,
      result: 'SUCCESS',
      details: {
        model,
        tokens,
      },
    })
  }

  getLogPath(): string {
    return this.logPath
  }
}
