import { HookRegistry, HookContext } from '@core/hooks/HookRegistry'
import pino from 'pino'

const logger = pino()

const PII_PATTERNS = {
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  medicalId: /MRN[:\s]+\d{6,}/gi,
  patientName: /patient[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/gi,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g
}

export async function detectPII(context: HookContext): Promise<void> {
  const { output } = context
  logger.info('🔍 PII Detection Check', { stage: context.stage })

  const text = JSON.stringify(output || {})
  const piiFound = []

  for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
    if (pattern.test(text)) {
      piiFound.push(type)
    }
  }

  if (piiFound.length > 0) {
    logger.warn('⚠️ PII Detected', { types: piiFound })
    output.blockers = output.blockers || []
    output.blockers.push({
      id: 'pii-detected',
      category: 'hipaa',
      severity: 'critical',
      description: `PII detected in output: ${piiFound.join(', ')}`
    })
  } else {
    logger.info('✓ No PII detected')
  }
}

export async function validateHIPAACompliance(context: HookContext): Promise<void> {
  const { output } = context
  logger.info('🏥 HIPAA Compliance Check', { stage: context.stage })

  const text = JSON.stringify(output || {}).toLowerCase()
  const hasEncryption = text.includes('encrypt') || text.includes('tls')
  const hasAccessControl = text.includes('authorization') || text.includes('permission')
  const hasAudit = text.includes('audit') || text.includes('log')

  if (!hasEncryption || !hasAccessControl || !hasAudit) {
    logger.warn('⚠️ HIPAA Gaps Found')
    output.blockers = output.blockers || []
    output.blockers.push({
      id: 'hipaa-compliance-failed',
      category: 'hipaa',
      description: `HIPAA: Missing ${[!hasEncryption && 'encryption', !hasAccessControl && 'access control', !hasAudit && 'audit trail'].filter(Boolean).join(', ')}`
    })
  }
}

export async function maskPII(context: HookContext): Promise<void> {
  const { output } = context
  logger.info('🔐 Redacting PII in audit log')

  if (!output) return

  let text = JSON.stringify(output)
  for (const pattern of Object.values(PII_PATTERNS)) {
    text = text.replace(pattern, '***REDACTED***')
  }

  try {
    const redacted = JSON.parse(text)
    Object.assign(output, redacted)
  } catch {
    logger.warn('Could not parse redacted output')
  }
}

export function registerHealthcareHooks(hooks: HookRegistry): void {
  hooks.register('lifecycle:start', detectPII)
  hooks.register('stage:architecture:post', validateHIPAACompliance)
  hooks.register('lifecycle:end', maskPII)
  logger.info('✓ Healthcare HIPAA hooks registered')
}
