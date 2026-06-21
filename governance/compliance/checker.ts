import { SecurityScanner } from '@core/security/SecurityScanner'

export interface ComplianceResult {
  isCompliant: boolean
  violations: ComplianceViolation[]
}

export interface ComplianceViolation {
  type: 'MISSING_FIELD' | 'PII_DETECTED' | 'INVALID_FORMAT'
  field: string
  message: string
}

export interface ComplianceConfig {
  mandatoryFields?: string[]
  checkPII?: boolean
  allowedPIIPatterns?: RegExp[]
}

export class ComplianceChecker {
  private requiredFields: Set<string>
  private checkPII: boolean
  private scanner: SecurityScanner

  constructor(config: ComplianceConfig = {}) {
    this.requiredFields = new Set(config.mandatoryFields || [])
    this.checkPII = config.checkPII !== false
    this.scanner = new SecurityScanner()
  }

  addMandatoryField(field: string): void {
    this.requiredFields.add(field)
  }

  addMandatoryFields(fields: string[]): void {
    for (const field of fields) {
      this.requiredFields.add(field)
    }
  }

  check(data: Record<string, unknown>): ComplianceResult {
    const violations: ComplianceViolation[] = []

    // Check mandatory fields
    violations.push(...this.checkMandatoryFields(data))

    // Check PII
    if (this.checkPII) {
      violations.push(...this.checkForPII(data))
    }

    return {
      isCompliant: violations.length === 0,
      violations,
    }
  }

  private checkMandatoryFields(data: Record<string, unknown>): ComplianceViolation[] {
    const violations: ComplianceViolation[] = []

    for (const field of this.requiredFields) {
      if (!(field in data) || data[field] === null || data[field] === undefined) {
        violations.push({
          type: 'MISSING_FIELD',
          field,
          message: `Mandatory field missing: ${field}`,
        })
      } else {
        const value = data[field]
        if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
          if (!Array.isArray(value) && typeof value !== 'object') {
            violations.push({
              type: 'INVALID_FORMAT',
              field,
              message: `Field ${field} has invalid type: ${typeof value}`,
            })
          }
        }
      }
    }

    return violations
  }

  private checkForPII(data: Record<string, unknown>): ComplianceViolation[] {
    const violations: ComplianceViolation[] = []

    for (const [key, value] of Object.entries(data)) {
      if (value === null || value === undefined) continue

      let stringValue: string
      if (typeof value === 'string') {
        stringValue = value
      } else if (typeof value === 'object') {
        stringValue = JSON.stringify(value)
      } else {
        stringValue = String(value)
      }

      const scanResult = this.scanner.scanInput(stringValue)
      if (!scanResult.isClean) {
        for (const threat of scanResult.threats) {
          if (threat.severity === 'HIGH') {
            violations.push({
              type: 'PII_DETECTED',
              field: key,
              message: `PII detected in field ${key}: ${threat.type} (${threat.matched})`,
            })
          }
        }
      }
    }

    return violations
  }
}
