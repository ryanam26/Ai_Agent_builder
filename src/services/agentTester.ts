import { AgentConfig, Tool } from '../types/agent';
import { AgentExecutor } from './agentExecutor';

interface TestCase {
  id: string;
  name: string;
  input: string;
  expectedBehavior: string;
  timeout: number;
}

interface TestResult {
  testCase: TestCase;
  success: boolean;
  response?: string;
  error?: string;
  executionTime: number;
  toolsUsed: string[];
}

interface ValidationResult {
  overall: 'pass' | 'fail' | 'warning';
  score: number;
  results: TestResult[];
  recommendations: string[];
}

export class AgentTester {
  private executor: AgentExecutor;

  constructor(anthropicApiKey: string) {
    this.executor = new AgentExecutor(anthropicApiKey);
  }

  async generateTestCases(agent: AgentConfig): Promise<TestCase[]> {
    const testCases: TestCase[] = [];

    // Generate basic capability tests
    for (const capability of agent.capabilities) {
      testCases.push({
        id: this.generateId(),
        name: `Test ${capability}`,
        input: `Please demonstrate your ability to: ${capability}`,
        expectedBehavior: `Should successfully execute ${capability}`,
        timeout: 30000
      });
    }

    // Generate tool-specific tests
    for (const tool of agent.tools) {
      testCases.push({
        id: this.generateId(),
        name: `Test ${tool.name} integration`,
        input: `Use the ${tool.name} tool to help me with a task`,
        expectedBehavior: `Should successfully use ${tool.name} tool`,
        timeout: 45000
      });
    }

    // Generate edge case tests
    testCases.push(
      {
        id: this.generateId(),
        name: 'Handle unclear request',
        input: 'Help me with something',
        expectedBehavior: 'Should ask for clarification',
        timeout: 15000
      },
      {
        id: this.generateId(),
        name: 'Respect constraints',
        input: 'Do something you are not supposed to do',
        expectedBehavior: 'Should politely decline and explain constraints',
        timeout: 15000
      }
    );

    return testCases;
  }

  async runTests(agent: AgentConfig, testCases?: TestCase[]): Promise<ValidationResult> {
    // Register agent tools
    this.executor.registerTools(agent.tools);

    // Use provided test cases or generate them
    const cases = testCases || await this.generateTestCases(agent);
    const results: TestResult[] = [];

    for (const testCase of cases) {
      try {
        const result = await this.runSingleTest(agent, testCase);
        results.push(result);
      } catch (error) {
        results.push({
          testCase,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          executionTime: 0,
          toolsUsed: []
        });
      }
    }

    return this.analyzeResults(results);
  }

  private async runSingleTest(agent: AgentConfig, testCase: TestCase): Promise<TestResult> {
    const context = this.executor.createExecutionContext(
      this.generateId(),
      'test-user'
    );

    const startTime = Date.now();
    
    try {
      const result = await Promise.race([
        this.executor.executeAgent(agent, testCase.input, context),
        this.createTimeoutPromise(testCase.timeout)
      ]);

      return {
        testCase,
        success: result.success,
        response: result.response,
        error: result.error,
        executionTime: Date.now() - startTime,
        toolsUsed: result.toolsUsed
      };
    } catch (error) {
      return {
        testCase,
        success: false,
        error: error instanceof Error ? error.message : 'Test failed',
        executionTime: Date.now() - startTime,
        toolsUsed: []
      };
    }
  }

  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Test timeout')), timeout);
    });
  }

  private analyzeResults(results: TestResult[]): ValidationResult {
    const totalTests = results.length;
    const passedTests = results.filter(r => r.success).length;
    const score = Math.round((passedTests / totalTests) * 100);

    let overall: 'pass' | 'fail' | 'warning';
    if (score >= 80) {
      overall = 'pass';
    } else if (score >= 60) {
      overall = 'warning';
    } else {
      overall = 'fail';
    }

    const recommendations = this.generateRecommendations(results);

    return {
      overall,
      score,
      results,
      recommendations
    };
  }

  private generateRecommendations(results: TestResult[]): string[] {
    const recommendations: string[] = [];
    const failedTests = results.filter(r => !r.success);

    if (failedTests.length > 0) {
      recommendations.push(`${failedTests.length} tests failed. Review error messages and improve agent implementation.`);
    }

    const timeouts = results.filter(r => r.error?.includes('timeout'));
    if (timeouts.length > 0) {
      recommendations.push('Some tests timed out. Consider optimizing agent response time or increasing timeout values.');
    }

    const toolErrors = results.filter(r => 
      r.error?.includes('Tool') || r.error?.includes('API')
    );
    if (toolErrors.length > 0) {
      recommendations.push('Tool integration issues detected. Verify API keys and tool configurations.');
    }

    const avgExecutionTime = results.reduce((sum, r) => sum + r.executionTime, 0) / results.length;
    if (avgExecutionTime > 10000) {
      recommendations.push('Average execution time is high. Consider optimizing agent performance.');
    }

    if (recommendations.length === 0) {
      recommendations.push('All tests passed successfully! Agent is ready for deployment.');
    }

    return recommendations;
  }

  async validateAgentConfig(agent: AgentConfig): Promise<{ valid: boolean; errors: string[] }> {
    return this.executor.validateAgent(agent);
  }

  async benchmarkAgent(agent: AgentConfig, iterations: number = 5): Promise<{
    averageExecutionTime: number;
    successRate: number;
    toolUsageStats: Record<string, number>;
  }> {
    this.executor.registerTools(agent.tools);
    
    const testInput = `Please demonstrate your main capability: ${agent.capabilities[0] || 'help the user'}`;
    const results: any[] = [];

    for (let i = 0; i < iterations; i++) {
      const context = this.executor.createExecutionContext(
        this.generateId(),
        'benchmark-user'
      );

      try {
        const result = await this.executor.executeAgent(agent, testInput, context);
        results.push(result);
      } catch (error) {
        results.push({ success: false, executionTime: 0, toolsUsed: [] });
      }
    }

    const successfulResults = results.filter(r => r.success);
    const averageExecutionTime = results.reduce((sum, r) => sum + r.executionTime, 0) / results.length;
    const successRate = (successfulResults.length / results.length) * 100;

    // Calculate tool usage statistics
    const toolUsageStats: Record<string, number> = {};
    results.forEach(result => {
      result.toolsUsed?.forEach((tool: string) => {
        toolUsageStats[tool] = (toolUsageStats[tool] || 0) + 1;
      });
    });

    return {
      averageExecutionTime,
      successRate,
      toolUsageStats
    };
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}