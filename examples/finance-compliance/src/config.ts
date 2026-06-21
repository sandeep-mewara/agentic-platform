/**
 * Finance domain configuration.
 */

export const financeConfig = {
  // Compliance settings
  compliance: {
    enableSOXValidation: process.env.ENABLE_SOX_VALIDATION !== 'false',
    enableTaxValidation: process.env.ENABLE_TAX_VALIDATION !== 'false',
    enableCostTracking: true
  },

  // Supported currencies
  currencies: {
    supported: (process.env.SUPPORTED_CURRENCIES || 'USD,EUR,GBP,JPY').split(','),
    default: 'USD',
    exchangeRateRefresh: 'hourly'
  },

  // Financial limits
  limits: {
    budgetUSD: Number(process.env.COST_BUDGET_USD || '200'),
    costWarningThreshold: 0.05, // Warn if feature > 5% of budget
    maxTransactionSize: 1000000, // $1M per transaction
    dailyLimit: 10000000 // $10M per day
  },

  // Audit settings
  audit: {
    enabled: true,
    retentionDays: 2555, // ~7 years for SOX compliance
    encryptionRequired: true,
    immutableLog: true
  },

  // Risk assessment
  risk: {
    highRiskThreshold: 0.7,
    requiresApprovalAbove: 100000 // Require approval for >$100K changes
  }
}

export type FinanceConfig = typeof financeConfig
