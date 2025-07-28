import Anthropic from '@anthropic-ai/sdk';
import { AgentConfig, Tool } from '../types/agent';
import { EventEmitter } from 'events';

interface ExecutionContext {
  sessionId: string;
  userId: string;
  variables: Record<string, any>;
  toolResults: Record<string, any>;
}

interface ExecutionResult {
  success: boolean;
  response?: string;
  error?: string;
  toolsUsed: string[];
  executionTime: number;
}

export class AgentExecutor extends EventEmitter {
  private anthropic: Anthropic;
  private toolRegistry: Map<string, Tool>;

  constructor(anthropicApiKey: string) {
    super();
    this.anthropic = new Anthropic({ apiKey: anthropicApiKey });
    this.toolRegistry = new Map();
  }

  registerTool(tool: Tool): void {
    this.toolRegistry.set(tool.name, tool);
  }

  registerTools(tools: Tool[]): void {
    tools.forEach(tool => this.registerTool(tool));
  }

  async executeAgent(
    agent: AgentConfig,
    userMessage: string,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    const toolsUsed: string[] = [];

    try {
      this.emit('execution:start', { agent: agent.name, sessionId: context.sessionId });

      // Prepare tools for Claude
      const claudeTools = this.prepareClaudeTools(agent.tools);

      // Execute agent
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        system: agent.systemPrompt,
        tools: claudeTools,
        messages: [{
          role: 'user',
          content: userMessage
        }]
      });

      let finalResponse = '';
      
      for (const content of response.content) {
        if (content.type === 'text') {
          finalResponse += content.text;
        } else if (content.type === 'tool_use') {
          // Execute tool
          const toolResult = await this.executeTool(
            content.name,
            content.input,
            context
          );
          
          toolsUsed.push(content.name);
          context.toolResults[content.id] = toolResult;
          
          this.emit('tool:executed', {
            toolName: content.name,
            input: content.input,
            result: toolResult,
            sessionId: context.sessionId
          });
        }
      }

      const executionTime = Date.now() - startTime;

      this.emit('execution:complete', {
        agent: agent.name,
        sessionId: context.sessionId,
        executionTime,
        toolsUsed
      });

      return {
        success: true,
        response: finalResponse,
        toolsUsed,
        executionTime
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      this.emit('execution:error', {
        agent: agent.name,
        sessionId: context.sessionId,
        error: errorMessage,
        executionTime
      });

      return {
        success: false,
        error: errorMessage,
        toolsUsed,
        executionTime
      };
    }
  }

  private prepareClaudeTools(tools: Tool[]): any[] {
    return tools
      .filter(tool => this.toolRegistry.has(tool.name))
      .map(tool => ({
        name: tool.name,
        description: tool.description,
        input_schema: {
          type: 'object',
          properties: tool.parameters,
          required: Object.keys(tool.parameters)
        }
      }));
  }

  private async executeTool(
    toolName: string,
    input: any,
    context: ExecutionContext
  ): Promise<any> {
    const tool = this.toolRegistry.get(toolName);
    if (!tool) {
      throw new Error(`Tool '${toolName}' not found in registry`);
    }

    try {
      // If tool has implementation code, execute it
      if (tool.implementation) {
        return await this.executeToolImplementation(tool, input, context);
      }
      
      // If tool has API endpoint, call it
      if (tool.apiEndpoint) {
        return await this.callToolAPI(tool, input, context);
      }

      // Fallback: return mock result
      return this.createMockToolResult(tool, input);

    } catch (error) {
      console.error(`Tool execution failed for ${toolName}:`, error);
      throw error;
    }
  }

  private async executeToolImplementation(
    tool: Tool,
    input: any,
    context: ExecutionContext
  ): Promise<any> {
    try {
      // Create a sandboxed execution environment
      const toolFunction = new Function(
        'input',
        'context',
        'require',
        tool.implementation || 'return { error: "No implementation provided" };'
      );

      // Limited require function for security
      const limitedRequire = (module: string) => {
        const allowedModules = ['axios', 'crypto', 'util'];
        if (allowedModules.includes(module)) {
          return require(module);
        }
        throw new Error(`Module '${module}' is not allowed`);
      };

      return await toolFunction(input, context, limitedRequire);
    } catch (error) {
      console.error('Tool implementation execution failed:', error);
      return { error: 'Tool execution failed' };
    }
  }

  private async callToolAPI(
    tool: Tool,
    input: any,
    context: ExecutionContext
  ): Promise<any> {
    const axios = require('axios');
    
    try {
      const response = await axios.post(tool.apiEndpoint, input, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AgentBuilder/1.0'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Tool API call failed:', error);
      return { error: 'API call failed' };
    }
  }

  private createMockToolResult(tool: Tool, input: any): any {
    return {
      tool: tool.name,
      input,
      result: `Mock result for ${tool.name}`,
      timestamp: new Date().toISOString()
    };
  }

  async validateAgent(agent: AgentConfig): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validate system prompt
    if (!agent.systemPrompt || agent.systemPrompt.length < 10) {
      errors.push('System prompt is required and must be at least 10 characters');
    }

    // Validate tools
    for (const tool of agent.tools) {
      if (!this.toolRegistry.has(tool.name)) {
        errors.push(`Tool '${tool.name}' is not registered`);
      }

      if (!tool.description) {
        errors.push(`Tool '${tool.name}' missing description`);
      }
    }

    // Validate capabilities
    if (agent.capabilities.length === 0) {
      errors.push('Agent must have at least one capability defined');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  createExecutionContext(sessionId: string, userId: string): ExecutionContext {
    return {
      sessionId,
      userId,
      variables: {},
      toolResults: {}
    };
  }
}