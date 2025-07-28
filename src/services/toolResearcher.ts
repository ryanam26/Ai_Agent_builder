import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { WebSearchService } from './webSearch';
import { Tool } from '../types/agent';

export class ToolResearcher {
  private anthropic: Anthropic;
  private webSearch: WebSearchService;

  constructor(anthropicApiKey: string, exaApiKey: string) {
    this.anthropic = new Anthropic({ apiKey: anthropicApiKey });
    this.webSearch = new WebSearchService(exaApiKey);
  }

  async researchTools(toolNames: string[], useCase: string): Promise<Tool[]> {
    const tools: Tool[] = [];
    
    for (const toolName of toolNames) {
      try {
        const tool = await this.researchSingleTool(toolName, useCase);
        if (tool) {
          tools.push(tool);
        }
      } catch (error) {
        console.error(`Failed to research tool ${toolName}:`, error);
      }
    }
    
    return tools;
  }

  private async researchSingleTool(toolName: string, useCase: string): Promise<Tool | null> {
    // Search for the tool
    const searchResults = await this.webSearch.searchTools(toolName, 5);
    
    if (searchResults.length === 0) {
      return null;
    }

    // Get documentation from the most relevant result
    const bestResult = searchResults[0];
    
    // Use Exa's extracted text instead of trying to scrape websites
    // This avoids 403 errors and is more reliable
    console.log(`📄 Using Exa search result text for ${toolName}`);
    const documentation = bestResult.text || bestResult.snippet || `${toolName} tool documentation`;
    
    console.log(`📊 Documentation length: ${documentation.length} chars for ${toolName}`);
    
    // Use AI to analyze and create tool definition
    const toolDefinition = await this.analyzeToolDocumentation(
      toolName,
      useCase,
      documentation,
      bestResult
    );

    return toolDefinition;
  }

  private async fetchDocumentation(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AgentBuilder/1.0)'
        }
      });
      
      const $ = cheerio.load(response.data);
      
      // Remove script and style elements
      $('script, style, nav, footer, aside').remove();
      
      // Extract main content
      const content = $('main, .content, .documentation, .docs, article, .markdown-body')
        .first()
        .text() || $('body').text();
      
      // Limit content length
      return content.slice(0, 8000).trim();
    } catch (error) {
      console.error('Failed to fetch documentation:', error);
      return '';
    }
  }

  private async analyzeToolDocumentation(
    toolName: string,
    useCase: string,
    documentation: string,
    searchResult: any
  ): Promise<Tool> {
    const prompt = `
Analyze this tool documentation and create a Claude-compatible tool definition.

Tool Name: ${toolName}
Use Case: ${useCase}
Source URL: ${searchResult.url}
Documentation Snippet: ${documentation.slice(0, 3000)}

You must respond with ONLY a valid JSON object (no markdown, no backticks, no explanation).

The JSON should have this exact structure:
{
  "name": "toolNameInCamelCase",
  "description": "Clear description of what the tool does",
  "parameters": {
    "type": "object",
    "properties": {
      "paramName": {"type": "string", "description": "param description"}
    },
    "required": ["paramName"]
  },
  "implementation": "basic code example or null",
  "apiEndpoint": "API URL or null",
  "documentationUrl": "${searchResult.url}"
}

Focus on the use case: "${useCase}"

Respond with valid JSON only:
    `;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
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

      const toolDefinition = JSON.parse(cleanText);
      
      return {
        name: toolDefinition.name || toolName.replace(/[^a-zA-Z0-9]/g, ''),
        description: toolDefinition.description || `${toolName} integration`,
        parameters: toolDefinition.parameters || {},
        implementation: toolDefinition.implementation === 'null' ? undefined : toolDefinition.implementation,
        apiEndpoint: toolDefinition.apiEndpoint === 'null' ? undefined : toolDefinition.apiEndpoint,
        documentationUrl: searchResult.url
      };
    } catch (error) {
      console.error('Failed to analyze tool documentation:', error);
      
      // Fallback tool definition
      return {
        name: toolName.replace(/[^a-zA-Z0-9]/g, ''),
        description: `${toolName} integration for ${useCase}`,
        parameters: {},
        documentationUrl: searchResult.url
      };
    }
  }

  async findAlternativeTools(originalTool: string, useCase: string): Promise<string[]> {
    const searchResults = await this.webSearch.searchTools(
      `alternative to ${originalTool} ${useCase}`, 
      10
    );
    
    const alternatives = searchResults
      .filter(result => !result.title.toLowerCase().includes(originalTool.toLowerCase()))
      .slice(0, 5)
      .map(result => this.extractToolNameFromResult(result));
    
    return [...new Set(alternatives)].filter(Boolean);
  }

  private extractToolNameFromResult(result: any): string {
    const title = result.title.toLowerCase();
    const snippet = result.snippet.toLowerCase();
    
    // Common patterns for tool names
    const patterns = [
      /(\w+)\s+api/,
      /(\w+)\s+sdk/,
      /(\w+)\s+service/,
      /(\w+)\s+library/
    ];
    
    for (const pattern of patterns) {
      const match = title.match(pattern) || snippet.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return '';
  }
}