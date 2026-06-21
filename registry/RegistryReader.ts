import { readFileSync } from 'fs'
import { join } from 'path'
import { z } from 'zod'
import { AgentEntrySchema, SkillEntrySchema, WorkflowEntrySchema, PatternEntrySchema, type AgentEntry, type SkillEntry, type WorkflowEntry, type PatternEntry } from './schemas'

export class RegistryReader {
  /**
   * Load and validate a catalog from JSON file
   */
  static loadCatalog<T>(catalogPath: string, schema: z.ZodSchema<T>): T[] {
    try {
      const content = readFileSync(catalogPath, 'utf-8')
      const data = JSON.parse(content)

      // Validate against schema
      const entries = Array.isArray(data) ? data : [data]
      return entries.map((entry) => schema.parse(entry))
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON in ${catalogPath}: ${error.message}`)
      }
      if (error instanceof z.ZodError) {
        throw new Error(`Schema validation error in ${catalogPath}: ${error.message}`)
      }
      throw error
    }
  }

  /**
   * Load agents catalog
   */
  static loadAgents(catalogPath: string): AgentEntry[] {
    return this.loadCatalog(catalogPath, AgentEntrySchema)
  }

  /**
   * Load skills catalog
   */
  static loadSkills(catalogPath: string): SkillEntry[] {
    return this.loadCatalog(catalogPath, SkillEntrySchema)
  }

  /**
   * Load workflows catalog
   */
  static loadWorkflows(catalogPath: string): WorkflowEntry[] {
    return this.loadCatalog(catalogPath, WorkflowEntrySchema)
  }

  /**
   * Load patterns catalog
   */
  static loadPatterns(catalogPath: string): PatternEntry[] {
    return this.loadCatalog(catalogPath, PatternEntrySchema)
  }

  /**
   * Find agents by capability
   */
  static findAgentsByCapability(agents: AgentEntry[], capability: string): AgentEntry[] {
    return agents.filter((agent) => agent.capability === capability)
  }

  /**
   * Find agents by tag
   */
  static findAgentsByTag(agents: AgentEntry[], tag: string): AgentEntry[] {
    return agents.filter((agent) => agent.tags.includes(tag))
  }

  /**
   * Find skills by ID
   */
  static findSkillById(skills: SkillEntry[], id: string): SkillEntry | undefined {
    return skills.find((skill) => skill.id === id)
  }

  /**
   * Find all skills used by an agent
   */
  static findSkillsByAgent(skills: SkillEntry[], agentId: string): SkillEntry[] {
    return skills.filter((skill) => skill.usedBy.includes(agentId))
  }

  /**
   * Find reusable skills
   */
  static findReusableSkills(skills: SkillEntry[]): SkillEntry[] {
    return skills.filter((skill) => skill.reusable)
  }

  /**
   * Find workflow by name
   */
  static findWorkflowByName(workflows: WorkflowEntry[], name: string): WorkflowEntry | undefined {
    return workflows.find((workflow) => workflow.name === name)
  }

  /**
   * Find patterns by type
   */
  static findPatternsByType(patterns: PatternEntry[], type: 'sequential' | 'parallel' | 'critique'): PatternEntry[] {
    return patterns.filter((pattern) => pattern.type === type)
  }
}
