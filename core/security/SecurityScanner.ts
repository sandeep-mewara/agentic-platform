export interface ScanResult {
  isClean: boolean
  threats: Threat[]
}

export interface Threat {
  type: 'PII' | 'INJECTION' | 'MALICIOUS_PATTERN'
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
  matched: string
  description: string
}

export class SecurityScanner {
  private emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  private phoneRegex = /(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g
  private ssnRegex = /\d{3}-\d{2}-\d{4}/g
  private creditCardRegex = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g

  private injectionPatterns = [
    /\{\{.*?\}\}/g, // Template injection
    /<%.*?%>/g, // JSP/ASP injection
    /`\$\{.*?\}`/g, // Template literal injection
    /\$\(.*?\)/g, // Command substitution
    /`.*?`/g, // Command substitution
    /;\s*DROP\s+TABLE/gi, // SQL injection
    /;\s*DELETE\s+FROM/gi, // SQL injection
    /union\s+select/gi, // SQL injection
    /exec\s*\(/gi, // Code execution
  ]

  private maliciousPatterns = [
    /eval\s*\(/gi,
    /System\.exec/gi,
    /__proto__/gi,
    /constructor\.prototype/gi,
  ]

  scanInput(input: string): ScanResult {
    const threats: Threat[] = []

    // Scan for PII
    threats.push(...this.scanPII(input))

    // Scan for injection attacks
    threats.push(...this.scanInjection(input))

    // Scan for malicious patterns
    threats.push(...this.scanMalicious(input))

    return {
      isClean: threats.length === 0,
      threats,
    }
  }

  private scanPII(input: string): Threat[] {
    const threats: Threat[] = []

    // Email detection
    const emails = input.match(this.emailRegex)
    if (emails) {
      for (const email of emails) {
        threats.push({
          type: 'PII',
          severity: 'HIGH',
          matched: email,
          description: 'Email address detected',
        })
      }
    }

    // Phone number detection
    const phones = input.match(this.phoneRegex)
    if (phones) {
      for (const phone of phones) {
        threats.push({
          type: 'PII',
          severity: 'HIGH',
          matched: phone,
          description: 'Phone number detected',
        })
      }
    }

    // SSN detection
    const ssns = input.match(this.ssnRegex)
    if (ssns) {
      for (const ssn of ssns) {
        threats.push({
          type: 'PII',
          severity: 'HIGH',
          matched: ssn,
          description: 'Social Security Number detected',
        })
      }
    }

    // Credit card detection
    const cards = input.match(this.creditCardRegex)
    if (cards) {
      for (const card of cards) {
        threats.push({
          type: 'PII',
          severity: 'HIGH',
          matched: card,
          description: 'Credit card number detected',
        })
      }
    }

    return threats
  }

  private scanInjection(input: string): Threat[] {
    const threats: Threat[] = []

    for (const pattern of this.injectionPatterns) {
      const matches = input.match(pattern)
      if (matches) {
        for (const match of matches) {
          threats.push({
            type: 'INJECTION',
            severity: 'MEDIUM',
            matched: match,
            description: 'Potential injection pattern detected',
          })
        }
      }
    }

    return threats
  }

  private scanMalicious(input: string): Threat[] {
    const threats: Threat[] = []

    for (const pattern of this.maliciousPatterns) {
      const matches = input.match(pattern)
      if (matches) {
        for (const match of matches) {
          threats.push({
            type: 'MALICIOUS_PATTERN',
            severity: 'HIGH',
            matched: match,
            description: 'Malicious pattern detected',
          })
        }
      }
    }

    return threats
  }
}
