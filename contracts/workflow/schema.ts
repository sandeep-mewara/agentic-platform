import { z } from 'zod'

export enum LifecycleState {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  BLOCKED = 'BLOCKED',
}

export const WorkflowStageSchema = z.object({
  name: z.string().describe('Stage identifier, e.g., "requirements-analysis"'),
  order: z.number().describe('Execution order in PDLC pipeline'),
  description: z.string().describe('Human-readable stage description'),
  capability: z.string().describe('Capability this stage exercises'),
  requiredInputs: z.array(z.string()).describe('Required input artifact types'),
  producedOutputs: z.array(z.string()).describe('Output artifact types produced'),
})

export type WorkflowStage = z.infer<typeof WorkflowStageSchema>

export const StageTransitionSchema = z.object({
  fromStage: z.string(),
  toStage: z.string(),
  condition: z.string().optional().describe('Predicate for transition, e.g., "approval_granted"'),
  requiredApprovals: z.number().optional().default(0),
})

export type StageTransition = z.infer<typeof StageTransitionSchema>

export const WorkflowDefinitionSchema = z.object({
  name: z.string().describe('Workflow identifier'),
  version: z.string().describe('Semantic version'),
  stages: z.array(WorkflowStageSchema),
  transitions: z.array(StageTransitionSchema),
  metadata: z.object({
    createdAt: z.number(),
    updatedAt: z.number(),
  }).optional(),
})

export type WorkflowDefinition = z.infer<typeof WorkflowDefinitionSchema>

export const StageExecutionSchema = z.object({
  stageId: z.string(),
  state: z.nativeEnum(LifecycleState),
  startedAt: z.number().optional(),
  completedAt: z.number().optional(),
  result: z.unknown().optional().describe('Actual output artifact'),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }).optional(),
  metadata: z.record(z.unknown()).optional(),
})

export type StageExecution = z.infer<typeof StageExecutionSchema>
