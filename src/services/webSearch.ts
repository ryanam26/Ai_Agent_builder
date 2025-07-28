import axios from 'axios';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  text?: string;
}

interface ToolSearchResult extends SearchResult {
  relevanceScore: number;
  type: 'api' | 'library' | 'service' | 'documentation';
}

export class WebSearchService {
  private exaApiKey: string;
  private baseUrl = 'https://api.exa.ai/search';

  constructor(apiKey: string) {
    this.exaApiKey = apiKey;
  }

  async searchTools(query: string, count: number = 10): Promise<ToolSearchResult[]> {
    const searchQuery = `${query} API documentation SDK integration`;
    
    try {
      const response = await axios.post(this.baseUrl, {
        query: searchQuery,
        num_results: count,
        text: true,
        include_domains: [
          "github.com",
          "docs.anthropic.com",
          "openai.com",
          "api.slack.com",
          "developers.google.com",
          "docs.microsoft.com",
          "developer.twitter.com",
          "api.stripe.com",
          "docs.aws.amazon.com"
        ]
      }, {
        headers: {
          'x-api-key': this.exaApiKey,
          'Content-Type': 'application/json'
        }
      });

      const results = response.data.results || [];
      
      return results.map((result: any) => ({
        title: result.title,
        url: result.url,
        snippet: result.text ? result.text.slice(0, 300) + '...' : '',
        text: result.text,
        relevanceScore: result.score || this.calculateRelevanceScore(result, query),
        type: this.categorizeResult(result)
      })).sort((a: ToolSearchResult, b: ToolSearchResult) => b.relevanceScore - a.relevanceScore);
    } catch (error) {
      console.error('Exa search failed:', error);
      return [];
    }
  }

  async searchBestPractices(toolName: string, useCase: string): Promise<SearchResult[]> {
    const query = `${toolName} best practices ${useCase} tutorial guide`;
    
    try {
      const response = await axios.post(this.baseUrl, {
        query,
        num_results: 5,
        text: true,
        include_domains: [
          "stackoverflow.com",
          "dev.to",
          "medium.com",
          "github.com",
          "docs.python.org",
          "nodejs.org",
          "reactjs.org"
        ]
      }, {
        headers: {
          'x-api-key': this.exaApiKey,
          'Content-Type': 'application/json'
        }
      });

      const results = response.data.results || [];
      
      return results.map((result: any) => ({
        title: result.title,
        url: result.url,
        snippet: result.text ? result.text.slice(0, 300) + '...' : '',
        text: result.text
      }));
    } catch (error) {
      console.error('Best practices search failed:', error);
      return [];
    }
  }

  private calculateRelevanceScore(result: any, originalQuery: string): number {
    let score = 0;
    const queryTerms = originalQuery.toLowerCase().split(' ');
    const content = `${result.name} ${result.snippet}`.toLowerCase();
    
    // Check for API/SDK keywords
    const apiKeywords = ['api', 'sdk', 'rest', 'graphql', 'webhook', 'integration'];
    apiKeywords.forEach(keyword => {
      if (content.includes(keyword)) score += 2;
    });
    
    // Check for documentation indicators
    const docKeywords = ['documentation', 'docs', 'guide', 'tutorial', 'reference'];
    docKeywords.forEach(keyword => {
      if (content.includes(keyword)) score += 1.5;
    });
    
    // Check for query term matches
    queryTerms.forEach(term => {
      if (content.includes(term)) score += 1;
    });
    
    return score;
  }

  private categorizeResult(result: any): 'api' | 'library' | 'service' | 'documentation' {
    const content = `${result.name} ${result.snippet}`.toLowerCase();
    const url = result.url.toLowerCase();
    
    if (url.includes('github.com') || content.includes('library') || content.includes('package')) {
      return 'library';
    }
    
    if (content.includes('documentation') || content.includes('docs') || url.includes('/docs/')) {
      return 'documentation';
    }
    
    if (content.includes('api') || content.includes('endpoint') || content.includes('rest')) {
      return 'api';
    }
    
    return 'service';
  }
}