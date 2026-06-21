import { z } from 'zod'

export const AgentEntrySchema = z.object({
  id: z.string().describe('Unique agent identifier'),
  name: z.string().describe('Human-readable agent name'),
  capability: z.enum(['requirements', 'architecture', 'planning', 'testing', 'release', 'extension']).describe('PDLC stage or extension type'),
  owner: z.string().describe('Team or individual owning the agent'),
  version: z.string().describe('Semantic version (e.g., 1.0.0)'),
  description: z.string().describe('What the agent does'),
  tags: z.array(z.string()).describe('Categorization tags'),
})

export type AgentEntry = z.infer<typeof AgentEntrySchema>

export const SkillEntrySchema = z.object({
  id: z.string().describe('Unique skill identifier'),
  name: z.string().describe('Human-readable skill name'),
  path: z.string().describe('Relative path to SKILL.md'),
  reusable: z.boolean().describe('Whether skill can be used by multiple agents'),
  usedBy: z.array(z.string()).describe('Agent IDs that use this skill'),
})

export type SkillEntry = z.infer<typeof SkillEntrySchema>

export const WorkflowEntrySchema = z.object({
  id: z.string().describe('Unique workflow identifier'),
  name: z.string().describe('Workflow name'),
  stages: z.array(z.string()).describe('Ordered list of PDLC stages'),
  description: z.string().describe('Workflow description'),
})

export type WorkflowEntry = z.infer<typeof WorkflowEntrySchema>

export const PatternEntrySchema = z.object({
  id: z.string().describe('Unique pattern identifier'),
  name: z.string().describe('Pattern name'),
  type: z.enum(['sequential', 'parallel', 'critique']).describe('Pattern execution style'),
  description: z.string().describe('Pattern description and use case'),
})

export type PatternEntry = z.infer<typeof PatternEntrySchema>
