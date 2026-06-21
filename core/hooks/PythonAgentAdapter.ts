import { spawn } from 'child_process'
import { AgentRequest, AgentResponse } from '@contracts/agent/schema'
import { AgentResponseSchema } from '@contracts/agent/schema'

export class PythonAgentAdapter {
  static async spawnPythonAgent(scriptPath: string, request: AgentRequest): Promise<AgentResponse> {
    return new Promise((resolve, reject) => {
      const python = spawn('python3', [scriptPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
      })

      let stdout = ''
      let stderr = ''

      python.stdout?.on('data', (data) => {
        stdout += data.toString()
      })

      python.stderr?.on('data', (data) => {
        stderr += data.toString()
      })

      python.on('error', (error: any) => {
        if (error.code === 'ENOENT') {
          console.log('[POLYGLOT] Python not found — using mock response')
          resolve(this.mockResponse(request))
        } else {
          reject(error)
        }
      })

      python.on('close', (code) => {
        if (code !== 0) {
          if (stderr.includes('No such file or directory')) {
            console.log('[POLYGLOT] Python interpreter not available — using mock response')
            resolve(this.mockResponse(request))
          } else {
            reject(new Error(`Python script exited with code ${code}: ${stderr}`))
          }
          return
        }

        try {
          const response = JSON.parse(stdout)
          const validated = AgentResponseSchema.parse(response)
          resolve(validated)
        } catch (err) {
          reject(new Error(`Failed to parse Python agent response: ${err}`))
        }
      })

      python.stdin?.write(JSON.stringify(request))
      python.stdin?.end()
    })
  }

  private static mockResponse(request: AgentRequest): AgentResponse {
    return {
      id: request.id,
      agentId: request.agentMetadata.agentId,
      output: {
        message: '[POLYGLOT] Mock response: Python agent unavailable',
      },
      status: 'SUCCESS',
      metadata: { fallback: true },
      timestamp: Date.now(),
    }
  }
}
