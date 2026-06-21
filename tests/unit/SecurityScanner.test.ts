import { describe, it, expect } from 'vitest'
import { SecurityScanner } from '@core/security/SecurityScanner'

describe('SecurityScanner', () => {
  const scanner = new SecurityScanner()

  describe('PII Detection', () => {
    it('should detect SSN patterns', () => {
      const input = 'User SSN is 123-45-6789'
      const result = scanner.scanInput(input)

      expect(result.isClean).toBe(false)
      expect(result.threats.some((t) => t.type === 'PII')).toBe(true)
    })

    it('should detect email addresses', () => {
      const input = 'Contact user@example.com for details'
      const result = scanner.scanInput(input)

      expect(result.isClean).toBe(false)
      expect(result.threats.some((t) => t.type === 'PII')).toBe(true)
    })

    it('should detect phone numbers', () => {
      const input = 'Call customer at (555) 123-4567'
      const result = scanner.scanInput(input)

      expect(result.isClean).toBe(false)
      expect(result.threats.some((t) => t.type === 'PII')).toBe(true)
    })

    it('should detect credit card patterns', () => {
      const input = 'Card number 4532-1234-5678-9010'
      const result = scanner.scanInput(input)

      expect(result.isClean).toBe(false)
    })

    it('should handle multiple PII types in single input', () => {
      const input = `
        User: john.doe@company.com
        SSN: 987-65-4321
        Phone: (555) 987-6543
      `
      const result = scanner.scanInput(input)

      expect(result.isClean).toBe(false)
      expect(result.threats.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Injection Detection', () => {
    it('should detect SQL injection patterns', () => {
      const input = "'; DROP TABLE users; --"
      const result = scanner.scanInput(input)

      expect(result.threats.some((t) => t.type === 'INJECTION')).toBe(true)
    })

    it('should detect command injection patterns', () => {
      const input = 'normal text; $(rm -rf /)'
      const result = scanner.scanInput(input)

      expect(result.threats.some((t) => t.type === 'INJECTION')).toBe(true)
    })

    it('should detect template injection patterns', () => {
      const input = 'User input: {{7*7}}'
      const result = scanner.scanInput(input)

      expect(result.threats.some((t) => t.type === 'INJECTION')).toBe(true)
    })
  })

  describe('Malicious Pattern Detection', () => {
    it('should detect eval patterns', () => {
      const input = 'code: eval(userInput)'
      const result = scanner.scanInput(input)

      expect(result.threats.some((t) => t.type === 'MALICIOUS_PATTERN')).toBe(true)
    })

    it('should detect System.exec patterns', () => {
      const input = 'Java code: System.exec(cmd)'
      const result = scanner.scanInput(input)

      expect(result.threats.some((t) => t.type === 'MALICIOUS_PATTERN')).toBe(true)
    })

    it('should detect prototype pollution attempts', () => {
      const input = 'Exploit: __proto__ assignment'
      const result = scanner.scanInput(input)

      expect(result.threats.some((t) => t.type === 'MALICIOUS_PATTERN')).toBe(true)
    })
  })

  describe('Clean Input Handling', () => {
    it('should pass clean technical content', () => {
      const input = 'Implement OAuth 2.0 authentication with JWT tokens for API security'
      const result = scanner.scanInput(input)

      expect(result.isClean).toBe(true)
      expect(result.threats.length).toBe(0)
    })

    it('should pass clean business content', () => {
      const input = 'Add rate limiting to prevent API abuse and DDoS attacks'
      const result = scanner.scanInput(input)

      expect(result.isClean).toBe(true)
    })

    it('should pass URLs without false positives', () => {
      const input = 'See documentation at https://example.com/api/v2/auth'
      const result = scanner.scanInput(input)

      // URLs should not trigger threats
      expect(result.isClean).toBe(true)
    })

    it('should handle normal feature requests', () => {
      const input = 'Add pagination to the user list endpoint'
      const result = scanner.scanInput(input)

      expect(result.isClean).toBe(true)
      expect(result.threats.length).toBe(0)
    })
  })

  describe('Threat Structure', () => {
    it('should return structured threats with type, severity, matched, and description', () => {
      const input = 'Contact me at test@example.com'
      const result = scanner.scanInput(input)

      result.threats.forEach((threat) => {
        expect(threat).toHaveProperty('type')
        expect(threat).toHaveProperty('severity')
        expect(threat).toHaveProperty('matched')
        expect(threat).toHaveProperty('description')
        expect(['PII', 'INJECTION', 'MALICIOUS_PATTERN']).toContain(threat.type)
        expect(['LOW', 'MEDIUM', 'HIGH']).toContain(threat.severity)
        expect(typeof threat.matched).toBe('string')
        expect(typeof threat.description).toBe('string')
      })
    })

    it('should include matched text in threat', () => {
      const email = 'alice@domain.com'
      const input = `Contact: ${email}`
      const result = scanner.scanInput(input)

      const emailThreat = result.threats.find((t) => t.type === 'PII')
      expect(emailThreat?.matched).toBe(email)
    })
  })

  describe('Severity Levels', () => {
    it('should mark PII as HIGH severity', () => {
      const input = 'SSN: 111-22-3333'
      const result = scanner.scanInput(input)

      const piiThreats = result.threats.filter((t) => t.type === 'PII')
      piiThreats.forEach((threat) => {
        expect(threat.severity).toBe('HIGH')
      })
    })

    it('should mark injection as MEDIUM severity', () => {
      const input = "Input: '; DROP TABLE"
      const result = scanner.scanInput(input)

      const injectionThreats = result.threats.filter((t) => t.type === 'INJECTION')
      injectionThreats.forEach((threat) => {
        expect(threat.severity).toBe('MEDIUM')
      })
    })

    it('should mark malicious patterns as HIGH severity', () => {
      const input = 'Code: eval(x)'
      const result = scanner.scanInput(input)

      const maliciousThreats = result.threats.filter((t) => t.type === 'MALICIOUS_PATTERN')
      maliciousThreats.forEach((threat) => {
        expect(threat.severity).toBe('HIGH')
      })
    })
  })
})
