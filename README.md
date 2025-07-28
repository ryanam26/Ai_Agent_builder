# AI Agent Builder Platform

A platform for building AI agents through natural language descriptions, similar to Lovable but specifically for AI agents. Users describe their desired agent, and the platform researches tools, generates implementation plans, and creates working agents.

## Features

- **Natural Language Agent Creation** - Describe your agent in plain English
- **AI-Powered Tool Research** - Automatically discovers and integrates required tools
- **Web Search Integration** - Researches APIs, libraries, and best practices
- **Step-by-Step Planning** - Generates detailed implementation roadmaps
- **Claude SDK Integration** - Leverages Claude's capabilities for agent execution
- **Real-time Execution** - Test and iterate on your agents

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Create Your First Agent**
   ```bash
   curl -X POST http://localhost:3000/api/agent/create \
     -H "Content-Type: application/json" \
     -d '{"description": "A customer support agent that can search our knowledge base and create support tickets"}'
   ```

## API Endpoints

### Core Agent Operations

#### `POST /api/agent/parse`
Parse a natural language agent description into structured requirements.

**Request:**
```json
{
  "description": "A social media manager that can post to Twitter and analyze engagement metrics"
}
```

**Response:**
```json
{
  "description": "Social media management agent with posting and analytics capabilities",
  "requirements": ["Post content to Twitter", "Analyze engagement metrics", "Schedule posts"],
  "constraints": ["Respect API rate limits", "Follow platform guidelines"],
  "expectedTools": ["Twitter API", "Analytics API", "Scheduling service"]
}
```

#### `POST /api/agent/research-tools`
Research and analyze tools needed for the agent.

**Request:**
```json
{
  "toolNames": ["Twitter API", "Analytics API"],
  "useCase": "Social media management"
}
```

#### `POST /api/agent/generate-plan`
Generate a step-by-step implementation plan.

**Request:**
```json
{
  "description": {
    "description": "Social media manager agent",
    "requirements": ["Post to Twitter", "Analyze metrics"],
    "expectedTools": ["Twitter API"]
  },
  "tools": [...]
}
```

#### `POST /api/agent/create`
End-to-end agent creation from description to implementation plan.

**Request:**
```json
{
  "description": "A customer support agent that can search knowledge base and create tickets"
}
```

**Response:**
```json
{
  "agent": {
    "id": "agent_123",
    "name": "Customer Support Agent",
    "description": "...",
    "systemPrompt": "You are a helpful customer support agent...",
    "tools": [...],
    "capabilities": [...]
  },
  "plan": {
    "steps": [...],
    "totalEstimatedTime": "2 hours"
  }
}
```

### Tool Operations

#### `POST /api/tools/alternatives`
Find alternative tools for a given requirement.

#### `POST /api/plan/:planId/step/:stepId/enhance`
Enhance a plan step with additional research and details.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Input    │───▶│  Agent Parser    │───▶│  Tool Research  │
│   (Natural      │    │  (Claude SDK)    │    │  (Web Search +  │
│   Language)     │    │                  │    │   AI Analysis)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Agent Executor │◀───│  Plan Generator  │◀───│  Tool Registry  │
│  (Claude SDK +  │    │  (AI + Research) │    │  (Integration)  │
│  Tools)         │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Core Services

- **AgentParser** - Converts natural language to structured agent specifications
- **ToolResearcher** - Discovers and analyzes tools using web search and AI
- **PlanGenerator** - Creates detailed implementation roadmaps with research
- **AgentExecutor** - Runs agents with Claude SDK and integrated tools
- **WebSearchService** - Handles tool discovery and best practices research

## Example Workflows

### 1. E-commerce Assistant
```bash
# Create an e-commerce support agent
curl -X POST http://localhost:3000/api/agent/create \
  -H "Content-Type: application/json" \
  -d '{
    "description": "An e-commerce assistant that can track orders, handle returns, and recommend products based on customer history"
  }'
```

### 2. Content Creator
```bash
# Create a content creation agent
curl -X POST http://localhost:3000/api/agent/create \
  -H "Content-Type: application/json" \
  -d '{
    "description": "A content creator that can write blog posts, generate social media content, and optimize for SEO"
  }'
```

### 3. Data Analyst
```bash
# Create a data analysis agent
curl -X POST http://localhost:3000/api/agent/create \
  -H "Content-Type: application/json" \
  -d '{
    "description": "A data analyst that can query databases, create visualizations, and generate insights reports"
  }'
```

## Environment Variables

```bash
ANTHROPIC_API_KEY=your_anthropic_api_key
BING_SEARCH_API_KEY=your_bing_search_key
DATABASE_URL=postgresql://user:pass@localhost:5432/agent_builder
REDIS_URL=redis://localhost:6379
PORT=3000
```

## Development

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test
```

## Technology Stack

- **Backend:** Node.js, TypeScript, Express
- **AI:** Claude SDK (Anthropic)
- **Search:** Bing Search API
- **Database:** PostgreSQL (planned)
- **Cache:** Redis (planned)
- **Validation:** Zod

## Roadmap

- [ ] Database integration for agent persistence
- [ ] WebSocket support for real-time updates
- [ ] Frontend web interface
- [ ] Agent marketplace and sharing
- [ ] Advanced tool integrations
- [ ] Team collaboration features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.# Ai_Agent_builder
