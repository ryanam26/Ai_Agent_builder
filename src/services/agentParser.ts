import Anthropic from '@anthropic-ai/sdk';
import { AgentDescription, AgentConfig } from '../types/agent';

export class AgentParser {
  private anthropic: Anthropic;

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({
      apiKey,
    });
  }

  async parseDescription(description: string): Promise<AgentDescription> {
    console.log('🔍 Parsing agent description:', description);
    
    const prompt = `
Analyze this AI agent description and extract ONLY what the user explicitly mentioned.

User Input: "${description}"

You must respond with ONLY a valid JSON object (no markdown, no explanation, no backticks).

Required JSON structure:
{
  "description": "Clean, concise agent description",
  "requirements": ["requirement1", "requirement2"],
  "constraints": ["constraint1", "constraint2"],
  "mentionedTools": ["Slack", "Jira", "Confluence"],
  "impliedCapabilities": ["capability1", "capability2"]
}

CRITICAL RULES for mentionedTools:
- Look for ANY brand names, product names, or service names in the user input
- Include tools like: Slack, Jira, Confluence, Zendesk, GitHub, Trello, Asana, Salesforce, HubSpot, etc.
- Include phrases like "integrates with [TOOL]", "using [TOOL]", "connects to [TOOL]"
- Be VERY LIBERAL in detecting tool names - if it looks like a product name, include it
- Do NOT suggest tools that weren't mentioned - only extract what's there
- impliedCapabilities: General capabilities WITHOUT suggesting specific tools

EXAMPLES:
- "integrates with Slack" → mentionedTools: ["Slack"]  
- "uses Jira for tickets" → mentionedTools: ["Jira"]
- "searches Confluence" → mentionedTools: ["Confluence"]
- "connects to our CRM system" → mentionedTools: [] (too generic)

Respond with valid JSON only:
    `;

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
      throw new Error('Unexpected response type from Claude');
    }

    try {
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

      console.log('🔍 Attempting to parse agent description JSON:', cleanText.substring(0, 200) + '...');

      const parsed = JSON.parse(cleanText);
      return {
        description: parsed.description || 'AI Agent',
        requirements: parsed.requirements || [],
        constraints: parsed.constraints || [],
        mentionedTools: parsed.mentionedTools || [],
        impliedCapabilities: parsed.impliedCapabilities || []
      };
    } catch (error) {
      console.error('🚨 JSON parsing failed for agent description:', error);
      console.error('🚨 Raw response was:', content.text);
      throw new Error('Failed to parse agent description response');
    }
  }

  async generateSystemPrompt(parsedDescription: AgentDescription): Promise<string> {
    const prompt = `
Create a system prompt for an AI agent with these specifications:

Description: ${parsedDescription.description}
Requirements: ${parsedDescription.requirements.join(', ')}
Constraints: ${parsedDescription.constraints?.join(', ') || 'None'}
Mentioned Tools: ${parsedDescription.mentionedTools?.join(', ') || 'None specified'}
Capabilities Needed: ${parsedDescription.impliedCapabilities?.join(', ') || 'None specified'}

Generate a clear, specific system prompt that:
1. Defines the agent's role and purpose
2. Lists capabilities and limitations
3. Provides guidelines for tool usage
4. Sets behavioral expectations

Return only the system prompt text.
    `;

    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    return content.text.trim();
  }
}