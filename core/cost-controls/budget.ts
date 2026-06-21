export class TokenBudget {
  constructor(private maxTokens: number) {}

  getRemainingTokens(spent: number): number {
    return Math.max(0, this.maxTokens - spent)
  }

  isWithinBudget(spent: number): boolean {
    return spent < this.maxTokens
  }

  getMaxTokens(): number {
    return this.maxTokens
  }
}

export class SpendTracker {
  private totalSpent: number = 0
  private spendByStage: Map<string, number> = new Map()
  private spendByAgent: Map<string, number> = new Map()

  recordSpend(amount: number, stage?: string, agentId?: string): void {
    this.totalSpent += amount

    if (stage) {
      this.spendByStage.set(stage, (this.spendByStage.get(stage) || 0) + amount)
    }

    if (agentId) {
      this.spendByAgent.set(agentId, (this.spendByAgent.get(agentId) || 0) + amount)
    }
  }

  getTotalSpend(): number {
    return this.totalSpent
  }

  getSpendByStage(stage: string): number {
    return this.spendByStage.get(stage) || 0
  }

  getSpendByAgent(agentId: string): number {
    return this.spendByAgent.get(agentId) || 0
  }

  getBreakdown(): {
    total: number
    byStage: Record<string, number>
    byAgent: Record<string, number>
  } {
    const byStage: Record<string, number> = {}
    const byAgent: Record<string, number> = {}

    for (const [stage, spend] of this.spendByStage) {
      byStage[stage] = spend
    }

    for (const [agent, spend] of this.spendByAgent) {
      byAgent[agent] = spend
    }

    return {
      total: this.totalSpent,
      byStage,
      byAgent,
    }
  }

  reset(): void {
    this.totalSpent = 0
    this.spendByStage.clear()
    this.spendByAgent.clear()
  }
}
