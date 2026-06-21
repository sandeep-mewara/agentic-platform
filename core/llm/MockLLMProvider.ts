import { LLMProvider } from './LLMProvider'
import { RequirementBriefSchema } from '@contracts/artifacts/RequirementBrief'
import { ArchitectureReviewSchema } from '@contracts/artifacts/ArchitectureReview'
import { ImplementationPlanSchema } from '@contracts/artifacts/ImplementationPlan'
import { TestPlanSchema } from '@contracts/artifacts/TestPlan'
import { ReleaseReadinessReportSchema } from '@contracts/artifacts/ReleaseReadinessReport'

export class MockLLMProvider implements LLMProvider {
  private responses: Record<string, string> = {
    'requirements-analysis': JSON.stringify({
      artifactId: 'brief-001',
      featureRequest: 'Add user authentication to the platform',
      objectives: [
        'Implement OAuth 2.0 authentication',
        'Support role-based access control',
        'Provide session management',
      ],
      constraints: [
        'Must support existing user database',
        'No external dependencies for auth (use stdlib)',
        'Backward compatible with current API',
      ],
      successCriteria: [
        'All users can login securely',
        'Session tokens expire after 24 hours',
        'Audit log captures all auth events',
        'Performance impact < 100ms per request',
      ],
      assumptions: [
        'HTTPS is enforced at infrastructure level',
        'Database supports transactions',
        'User database schema is mutable',
      ],
      risks: [
        {
          category: 'Security',
          description: 'Token compromise if not properly stored',
          severity: 'HIGH',
        },
        {
          category: 'Performance',
          description: 'OAuth roundtrips may add latency',
          severity: 'MEDIUM',
        },
      ],
      estimatedEffort: {
        scope: 'MEDIUM',
        daysEstimate: 10,
      },
    }),
    'architecture-review': JSON.stringify({
      artifactId: 'arch-001',
      requirementBriefId: 'brief-001',
      overallAssessment: 'APPROVED_WITH_CONDITIONS',
      summary:
        'Architecture is sound but requires hardening in token storage and key rotation.',
      layerReview: [
        {
          layer: 'API Layer',
          assessment: 'OAuth 2.0 integration well-designed',
          concerns: ['Token refresh logic must be idempotent'],
        },
        {
          layer: 'Data Layer',
          assessment: 'Session schema supports audit requirements',
        },
        {
          layer: 'Security Layer',
          assessment: 'PII protection in audit logs adequate',
          concerns: ['Key rotation policy not documented'],
        },
      ],
      dependencies: [
        {
          component: 'Database',
          reason: 'Session token storage',
        },
        {
          component: 'Key Management Service',
          reason: 'Token signing keys (if external)',
        },
      ],
      security: [
        {
          category: 'Token Storage',
          description: 'Use encrypted columns for sensitive tokens',
          severity: 'HIGH',
          mitigation: 'Enable column-level encryption at rest',
        },
      ],
      recommendations: [
        'Implement key rotation every 90 days',
        'Add rate limiting to login endpoint',
        'Log all privilege escalations',
      ],
    }),
    'planning': JSON.stringify({
      artifactId: 'plan-001',
      requirementBriefId: 'brief-001',
      architectureReviewId: 'arch-001',
      overview: 'Three-phase implementation: API contracts, backend, frontend integration',
      phases: [
        {
          phaseNumber: 1,
          name: 'API & Token Service',
          description: 'Implement OAuth 2.0 endpoints and token lifecycle management',
          estimatedDuration: { value: 5, unit: 'DAYS' },
          tasks: [
            {
              taskId: 't1',
              title: 'Design OAuth 2.0 endpoints',
              description: 'Define /authorize, /token, /refresh routes',
              estimatedHours: 8,
            },
            {
              taskId: 't2',
              title: 'Implement token signing and validation',
              description: 'Use HS256 for signing, RS256 for verification',
              estimatedHours: 12,
            },
          ],
        },
        {
          phaseNumber: 2,
          name: 'Middleware & Session Management',
          description: 'Wire authentication checks and session lifecycle',
          estimatedDuration: { value: 3, unit: 'DAYS' },
          tasks: [
            {
              taskId: 't3',
              title: 'Build auth middleware',
              description: 'Extract and validate tokens from requests',
              estimatedHours: 6,
            },
          ],
        },
        {
          phaseNumber: 3,
          name: 'Testing & Documentation',
          description: 'Full test coverage and API docs',
          estimatedDuration: { value: 2, unit: 'DAYS' },
          tasks: [
            {
              taskId: 't4',
              title: 'Write integration tests',
              description: 'Test OAuth flows end-to-end',
              estimatedHours: 8,
            },
          ],
        },
      ],
      technicalApproach: {
        architecture: 'Middleware-based token validation with in-memory cache',
        technologies: ['Node.js', 'jsonwebtoken', 'bcryptjs'],
        patterns: ['OAuth 2.0 Authorization Code Flow', 'JWT Bearer tokens'],
      },
      riskMitigation: [
        {
          risk: 'Token compromise',
          likelihood: 'MEDIUM',
          impact: 'HIGH',
          mitigation: 'Use HTTPS, short expiry, refresh token rotation',
        },
      ],
      successMetrics: [
        'Login latency < 500ms',
        'Token validation overhead < 5%',
        'Zero token-related security incidents in production',
      ],
    }),
    'code-review': JSON.stringify({
      artifactId: 'testplan-001',
      implementationPlanId: 'plan-001',
      overview: 'Comprehensive test strategy covering OAuth flows, token lifecycle, and security',
      testStrategy: {
        unitTestCoverage: 85,
        integrationTestScope: [
          'OAuth endpoint to token service',
          'Token validation middleware',
          'Session expiry and refresh',
        ],
        e2eScenarios: [
          'User login and permission acquisition',
          'Token refresh cycle',
          'Session timeout and re-login',
        ],
      },
      testCases: [
        {
          testId: 'auth-001',
          title: 'Valid credentials return valid token',
          description: 'Test successful OAuth authorization code flow',
          type: 'INTEGRATION',
          steps: [
            '1. POST /authorize with valid credentials',
            '2. Receive authorization code',
            '3. Exchange code for access token',
            '4. Verify token contains user ID and scopes',
          ],
          expectedResult: 'Access token issued with 24h expiry',
          priority: 'CRITICAL',
        },
        {
          testId: 'auth-002',
          title: 'Invalid credentials return 401',
          description: 'Reject authentication attempts with bad password',
          type: 'UNIT',
          steps: ['1. POST /authorize with wrong password'],
          expectedResult: 'HTTP 401 Unauthorized',
          priority: 'CRITICAL',
        },
        {
          testId: 'auth-003',
          title: 'Expired token rejected',
          description: 'Validate token expiration enforcement',
          type: 'UNIT',
          preconditions: ['Token created 25 hours ago'],
          steps: ['1. Use expired token in request'],
          expectedResult: 'HTTP 401 Unauthorized, token refreshed or re-login required',
          priority: 'HIGH',
        },
      ],
      performanceTests: [
        {
          metric: 'Token validation latency',
          baseline: 1,
          target: 5,
          unit: 'ms',
        },
        {
          metric: 'OAuth roundtrip latency',
          baseline: 100,
          target: 500,
          unit: 'ms',
        },
      ],
      securityTests: [
        'SQL injection in credential fields',
        'Token tampering (signature verification)',
        'Replay attack prevention',
      ],
      qualityGates: [
        {
          name: 'Unit test coverage',
          criterion: 'Lines covered / total lines >= 85%',
          threshold: '85%',
        },
        {
          name: 'Critical tests passing',
          criterion: 'All CRITICAL priority tests pass',
          threshold: '100%',
        },
      ],
    }),
    'release-readiness': JSON.stringify({
      artifactId: 'report-001',
      testPlanId: 'testplan-001',
      hiltDecisionId: 'hitl-001',
      overallStatus: 'APPROVED',
      executiveSummary:
        'Authentication feature is production-ready. All critical tests pass, documentation complete, security review approved.',
      readiness: {
        codeComplete: true,
        testsPass: true,
        documentationComplete: true,
        performanceAcceptable: true,
        securityReview: 'APPROVED',
      },
      qualityMetrics: {
        codeQuality: {
          score: 92,
          issues: [
            {
              category: 'Code Style',
              count: 3,
              severity: 'LOW',
            },
          ],
        },
        testCoverage: {
          unit: 87,
          integration: 92,
          e2e: 88,
        },
        documentation: {
          readme: true,
          apiDocs: true,
          setupGuide: true,
          troubleshooting: true,
        },
      },
      approvals: [
        {
          approver: 'Security Team',
          role: 'Security Lead',
          status: 'APPROVED',
          comment: 'Token handling and encryption approved',
        },
        {
          approver: 'Architecture Team',
          role: 'Tech Lead',
          status: 'APPROVED',
          comment: 'Design aligns with platform standards',
        },
      ],
    }),
  }

  async complete(prompt: string): Promise<string> {
    // Deterministic routing based on prompt keywords
    // Note: Order matters! Check more specific patterns first
    if (prompt.includes('release readiness') || (prompt.includes('release') && prompt.includes('readiness'))) {
      return this.responses['release-readiness']
    }
    if (prompt.includes('requirements-analysis') || prompt.includes('feature request')) {
      return this.responses['requirements-analysis']
    }
    if (prompt.includes('architecture-review') || prompt.includes('architectural')) {
      return this.responses['architecture-review']
    }
    if (prompt.includes('planning') || prompt.includes('implementation plan')) {
      return this.responses['planning']
    }
    if (prompt.includes('code-review') || prompt.includes('test plan')) {
      return this.responses['code-review']
    }
    // Default fallback
    return this.responses['requirements-analysis']
  }

  getModel(): string {
    return 'mock'
  }
}
