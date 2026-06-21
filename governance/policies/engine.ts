export interface GuardrailPolicy {
  id: string
  name: string
  description: string
  enabled: boolean
  rules: PolicyRule[]
  severity: 'INFO' | 'WARN' | 'ERROR'
}

export interface PolicyRule {
  name: string
  condition: (context: PolicyContext) => boolean
  message: string
}

export interface PolicyContext {
  stage: string
  input?: unknown
  output?: unknown
  metadata?: Record<string, unknown>
}

export interface PolicyResult {
  policyId: string
  passed: boolean
  violations: PolicyViolation[]
}

export interface PolicyViolation {
  rule: string
  message: string
  severity: 'INFO' | 'WARN' | 'ERROR'
}

export class PolicyEngine {
  private policies: Map<string, GuardrailPolicy> = new Map()

  registerPolicy(policy: GuardrailPolicy): void {
    this.policies.set(policy.id, policy)
  }

  registerPolicies(policies: GuardrailPolicy[]): void {
    for (const policy of policies) {
      this.registerPolicy(policy)
    }
  }

  evaluate(context: PolicyContext): PolicyResult[] {
    const results: PolicyResult[] = []

    for (const [policyId, policy] of this.policies) {
      if (!policy.enabled) continue

      const violations: PolicyViolation[] = []

      for (const rule of policy.rules) {
        try {
          const passed = rule.condition(context)
          if (!passed) {
            violations.push({
              rule: rule.name,
              message: rule.message,
              severity: policy.severity,
            })
          }
        } catch (err) {
          violations.push({
            rule: rule.name,
            message: `Rule evaluation failed: ${err}`,
            severity: 'ERROR',
          })
        }
      }

      results.push({
        policyId,
        passed: violations.length === 0,
        violations,
      })
    }

    return results
  }

  getPolicy(policyId: string): GuardrailPolicy | undefined {
    return this.policies.get(policyId)
  }

  listPolicies(): GuardrailPolicy[] {
    return Array.from(this.policies.values())
  }

  disablePolicy(policyId: string): void {
    const policy = this.policies.get(policyId)
    if (policy) {
      policy.enabled = false
    }
  }

  enablePolicy(policyId: string): void {
    const policy = this.policies.get(policyId)
    if (policy) {
      policy.enabled = true
    }
  }
}
