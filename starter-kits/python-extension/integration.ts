import { PythonAgentAdapter } from '@core/hooks/PythonAgentAdapter'
import pino from 'pino'

const logger = pino()

/**
 * Example: Integrate Python agent into TypeScript orchestrator.
 *
 * The PythonAgentAdapter handles:
 * 1. Converting TypeScript request to JSON
 * 2. Spawning Python process
 * 3. Sending JSON to stdin
 * 4. Reading JSON from stdout
 * 5. Validating response against Zod schema
 * 6. Returning typed result
 */

export async function integrateCodeAnalysisAgent() {
  logger.info('Setting up Python Code Analysis Agent')

  // 1. Create adapter pointing to Python agent script
  const pythonAgentPath = './starter-kits/python-extension/agent.py'
  const adapter = new PythonAgentAdapter(pythonAgentPath)

  // 2. Prepare request following JSON contract (Python agent signature)
  const request = {
    id: 'analysis-001',
    skillId: 'code-analysis',
    input: {
      code: `
        def hello_world():
          """Say hello."""
          print("Hello, World!")

        class MyClass:
          pass
      `
    },
    metadata: {
      team: 'Python Integration Team',
      timestamp: new Date().toISOString()
    }
  }

  logger.info('Calling Python agent', { skillId: request.skillId })

  // 3. Call Python agent and get response
  const response = await adapter.call(request)

  logger.info('Python agent response received', {
    status: response.status,
    outputKeys: response.output ? Object.keys(response.output) : []
  })

  return response
}

/**
 * Example: Use Python agent within a hook.
 *
 * This shows how to integrate Python agents into the platform's hook system,
 * allowing Python extensions to participate in the PDLC pipeline.
 */
export async function createPythonAgentHook(agentPath: string, skillId: string) {
  const adapter = new PythonAgentAdapter(agentPath)

  return async (context: any) => {
    const { input, output } = context

    logger.info('Hook: Calling Python agent', { skillId })

    // Prepare request from context
    const request = {
      id: `hook-${Date.now()}`,
      skillId,
      input: output || input,
      metadata: {
        hook: true,
        timestamp: new Date().toISOString()
      }
    }

    try {
      // Call Python agent
      const response = await adapter.call(request)

      if (response.status === 'success') {
        // Merge Python agent output back into context
        if (output) {
          output.pythonAgentOutput = response.output
        }
        logger.info('✓ Python agent hook executed successfully')
      } else {
        logger.error('✗ Python agent hook failed', {
          error: response.error
        })
      }
    } catch (error) {
      logger.error('✗ Python agent hook error', {
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }
}

/**
 * Example: Register Python agent hook in orchestrator.
 *
 * This integrates the Python agent into the full PDLC pipeline.
 */
export async function registerPythonAgentHook(hooks: any) {
  const pythonAgentPath = './starter-kits/python-extension/agent.py'
  const pythonHook = await createPythonAgentHook(pythonAgentPath, 'custom-logic')

  // Register hook to run after requirements stage
  hooks.register('stage:requirements:post', pythonHook)

  logger.info('✓ Python agent hook registered at stage:requirements:post')
}

/**
 * Example: Error handling when calling Python agent.
 *
 * Python agents can fail for various reasons:
 * - Script not found
 * - Python not installed
 * - Agent process timeout
 * - Invalid JSON response
 */
export async function callPythonAgentWithRetry(
  adapter: PythonAgentAdapter,
  request: any,
  maxRetries: number = 3
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`Calling Python agent (attempt ${attempt}/${maxRetries})`)

      const response = await adapter.call(request)

      if (response.status === 'success') {
        logger.info('✓ Python agent succeeded')
        return response
      }

      if (attempt < maxRetries) {
        logger.warn('Python agent returned error, retrying', {
          error: response.error,
          attempt,
          maxRetries
        })
        // Wait before retry (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
      }
    } catch (error) {
      logger.error('Python agent call failed', {
        error: error instanceof Error ? error.message : String(error),
        attempt,
        maxRetries
      })

      if (attempt < maxRetries) {
        // Retry on transient errors
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
      }
    }
  }

  throw new Error(`Python agent failed after ${maxRetries} retries`)
}

/**
 * Example: Multiple Python agents in sequence.
 *
 * Demonstrates how to chain multiple Python agents together.
 */
export async function chainPythonAgents() {
  const adapter1 = new PythonAgentAdapter('./starter-kits/python-extension/agent.py')
  const adapter2 = new PythonAgentAdapter('./starter-kits/python-extension/agent.py')

  logger.info('Chaining Python agents in sequence')

  // First agent: code analysis
  const request1 = {
    id: 'chain-1',
    skillId: 'code-analysis',
    input: { code: 'def test(): pass' },
    metadata: {}
  }

  const response1 = await adapter1.call(request1)

  logger.info('First agent complete', { status: response1.status })

  // Second agent: validation
  const request2 = {
    id: 'chain-2',
    skillId: 'data-validation',
    input: response1.output,
    metadata: {}
  }

  const response2 = await adapter2.call(request2)

  logger.info('Second agent complete', { status: response2.status })

  return {
    step1: response1,
    step2: response2
  }
}
