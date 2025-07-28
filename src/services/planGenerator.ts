import Anthropic from '@anthropic-ai/sdk';
import { AgentDescription, AgentPlan, PlanStep, Tool } from '../types/agent';
import { WebSearchService } from './webSearch';

export class PlanGenerator {
  private anthropic: Anthropic;
  private webSearch: WebSearchService;

  constructor(anthropicApiKey: string, exaApiKey: string) {
    this.anthropic = new Anthropic({ apiKey: anthropicApiKey });
    this.webSearch = new WebSearchService(exaApiKey);
  }

  async generatePlan(
    description: AgentDescription,
    tools: Tool[]
  ): Promise<AgentPlan> {
    // Research best practices for the agent type
    const bestPractices = await this.researchBestPractices(description);
    
    // Generate implementation plan
    const plan = await this.createImplementationPlan(description, tools, bestPractices);
    
    return {
      id: this.generateId(),
      agentId: this.generateId(),
      steps: plan.steps,
      totalEstimatedTime: plan.totalEstimatedTime,
      createdAt: new Date()
    };
  }

  private async researchBestPractices(description: AgentDescription): Promise<string> {
    const searchQuery = `AI agent ${description.description} best practices implementation patterns`;
    const results = await this.webSearch.searchBestPractices(
      description.description,
      'implementation'
    );

    const bestPracticesContext = results
      .slice(0, 3)
      .map(result => `${result.title}: ${result.snippet}`)
      .join('\n\n');

    return bestPracticesContext;
  }

  private async createImplementationPlan(
    description: AgentDescription,
    tools: Tool[],
    bestPractices: string
  ): Promise<{ steps: PlanStep[]; totalEstimatedTime: string }> {
    
    const toolsInfo = tools.length > 0 
      ? tools.map(t => `${t.name}: ${t.description}`).join(', ')
      : 'No specific tools mentioned - will use general implementation';

    const mentionedTools = description.mentionedTools && description.mentionedTools.length > 0
      ? `User specifically mentioned: ${description.mentionedTools.join(', ')}`
      : 'No specific tools mentioned by user';

    const prompt = `
Create a detailed step-by-step implementation plan for this SPECIFIC AI agent based on what the user described:

User Description: "${description.description}"
User Requirements: ${description.requirements.join(', ')}
User Constraints: ${description.constraints?.join(', ') || 'None specified'}
${mentionedTools}
Researched Tools: ${toolsInfo}
User Capabilities Needed: ${description.impliedCapabilities?.join(', ') || 'Not specified'}

Best Practices Context:
${bestPractices}

IMPORTANT: Create a plan that SPECIFICALLY addresses this user's request. Do NOT use generic tools like "langchain" or "Pinecone" unless they mentioned them. Focus on the actual tools and requirements they specified.

Generate a JSON plan with:
{
  "steps": [
    {
      "id": "unique_id",  
      "title": "Step title specific to this agent",
      "description": "Detailed description referencing user's specific tools and requirements",
      "requiredTools": ["specific_tools_mentioned"],
      "estimatedTime": "30 minutes",
      "dependencies": ["previous_step_id"],
      "status": "pending"
    }
  ],
  "totalEstimatedTime": "X hours"
}

Plan should include:
1. Environment setup (mention specific tools they want to integrate)
2. Integration with their mentioned tools (${description.mentionedTools?.join(', ') || 'general integrations'})
3. Core agent logic for their specific use case
4. Testing with their specific requirements
5. Deployment considerations

Be SPECIFIC to their request, not generic.
    `;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 3000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      // Clean the response text to remove any markdown formatting
      let cleanText = content.text.trim();
      
      // Remove markdown code blocks if present
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/```\s*$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/```\s*$/, '');
      }
      
      // Try to find JSON content if it's wrapped in text
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanText = jsonMatch[0];
      }

      console.log('🔍 Plan generation - attempting to parse JSON:', cleanText.substring(0, 200) + '...');

      const planData = JSON.parse(cleanText);
      
      const steps: PlanStep[] = planData.steps.map((step: any) => ({
        id: step.id || this.generateId(),
        title: step.title,
        description: step.description,
        requiredTools: step.requiredTools || [],
        estimatedTime: step.estimatedTime,
        dependencies: step.dependencies || [],
        status: 'pending' as const
      }));

      return {
        steps,
        totalEstimatedTime: planData.totalEstimatedTime
      };
    } catch (error) {
      console.error('Failed to generate implementation plan:', error);
      
      // Fallback basic plan
      return this.createFallbackPlan(description, tools);
    }
  }

  private createFallbackPlan(description: AgentDescription, tools: Tool[]): { steps: PlanStep[]; totalEstimatedTime: string } {
    const steps: PlanStep[] = [
      {
        id: this.generateId(),
        title: 'Setup Development Environment',
        description: 'Initialize project structure and install dependencies',
        requiredTools: [],
        estimatedTime: '15 minutes',
        status: 'pending'
      },
      {
        id: this.generateId(),
        title: 'Integrate Required Tools',
        description: `Implement and test integration with: ${tools.map(t => t.name).join(', ')}`,
        requiredTools: tools.map(t => t.name),
        estimatedTime: '45 minutes',
        status: 'pending'
      },
      {
        id: this.generateId(),
        title: 'Implement Agent Logic',
        description: `Build core agent functionality: ${description.description}`,
        requiredTools: tools.map(t => t.name),
        estimatedTime: '60 minutes',
        status: 'pending'
      },
      {
        id: this.generateId(),
        title: 'Add Error Handling',
        description: 'Implement robust error handling and validation',
        requiredTools: [],
        estimatedTime: '20 minutes',
        status: 'pending'
      },
      {
        id: this.generateId(),
        title: 'Test and Validate',
        description: 'Run comprehensive tests and validate agent behavior',
        requiredTools: tools.map(t => t.name),
        estimatedTime: '30 minutes',
        status: 'pending'
      }
    ];

    return {
      steps,
      totalEstimatedTime: '2.5 hours'
    };
  }

  async updatePlanWithResearch(plan: AgentPlan, stepId: string): Promise<PlanStep> {
    const step = plan.steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error('Step not found');
    }

    // Research specific implementation details for this step
    const researchResults = await this.webSearch.searchBestPractices(
      step.title,
      'implementation tutorial'
    );

    const enhancedDescription = await this.enhanceStepDescription(step, researchResults);
    
    return {
      ...step,
      description: enhancedDescription
    };
  }

  private async enhanceStepDescription(step: PlanStep, researchResults: any[]): Promise<string> {
    const context = researchResults
      .slice(0, 2)
      .map(result => `${result.title}: ${result.snippet}`)
      .join('\n');

    const prompt = `
Enhance this implementation step with specific technical details:

Current Step: ${step.title}
Description: ${step.description}
Required Tools: ${step.requiredTools.join(', ')}

Research Context:
${context}

Provide an enhanced description with:
1. Specific implementation steps
2. Code examples or patterns to use
3. Common pitfalls to avoid
4. Success criteria

Keep it concise but actionable.
    `;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        return step.description;
      }

      return content.text.trim();
    } catch (error) {
      console.error('Failed to enhance step description:', error);
      return step.description;
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}