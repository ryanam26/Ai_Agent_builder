# AI Agent Builder Platform - Claude Documentation

This document explains how the AI Agent Builder platform works, its architecture, and key components.

## 🎯 Overview

The AI Agent Builder is a platform similar to Lovable but specifically for creating AI agents. Users describe their desired agent in natural language, and the system researches tools, generates implementation plans, and creates working agents automatically.

## 🏗️ System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Input    │───▶│  Agent Parser    │───▶│  Tool Research  │
│   (Natural      │    │  (Claude SDK)    │    │  (Exa.ai +      │
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

## 🔄 User Flow

### Phase 1: Input
- User describes their agent in natural language
- Example: "A customer support agent that integrates with Slack, Jira, and Confluence"

### Phase 2: Clarification
- System parses the description using Claude AI
- Extracts mentioned tools, requirements, and capabilities
- Shows interactive tool selection interface
- User can add/remove tools or request suggestions

### Phase 3: Building
- Animated progress through 5 steps:
  1. Understanding your agent
  2. Researching tools  
  3. Creating implementation plan
  4. Validating agent design
  5. Preparing deployment

### Phase 4: Complete
- Shows finished agent with:
  - Agent details and capabilities
  - Tools integrated
  - Step-by-step implementation plan
  - Estimated development time

## 🧠 Core Services

### 1. AgentParser (`src/services/agentParser.ts`)

**Purpose**: Converts natural language descriptions into structured agent specifications.

**Key Functions**:
- `parseDescription()` - Extracts requirements, constraints, mentioned tools, and capabilities
- `generateSystemPrompt()` - Creates Claude-compatible system prompts for the agent

**AI Prompt Strategy**:
```typescript
const prompt = `
Analyze this AI agent description and extract ONLY what the user explicitly mentioned.

User Input: "${description}"

CRITICAL RULES for mentionedTools:
- Look for ANY brand names, product names, or service names
- Include tools like: Slack, Jira, Confluence, Zendesk, GitHub, etc.
- Be VERY LIBERAL in detecting tool names
- Do NOT suggest tools that weren't mentioned

Respond with valid JSON only:
{
  "description": "Clean agent description",
  "requirements": ["requirement1", "requirement2"],
  "constraints": ["constraint1"],
  "mentionedTools": ["Slack", "Jira", "Confluence"],
  "impliedCapabilities": ["capability1", "capability2"]
}
`
```

### 2. ToolResearcher (`src/services/toolResearcher.ts`)

**Purpose**: Discovers and analyzes tools using web search and AI.

**Key Functions**:
- `researchTools()` - Researches a list of tool names
- `researchSingleTool()` - Deep-dives into a specific tool
- `analyzeToolDocumentation()` - Uses AI to create tool definitions

**Search Strategy**:
- Uses Exa.ai for intelligent web search
- Targets developer documentation sites
- Extracts full page content instead of scraping
- AI analyzes content to create Claude-compatible tool definitions

**Tool Definition Structure**:
```typescript
interface Tool {
  name: string              // camelCase tool name
  description: string       // What the tool does
  parameters: object        // JSON schema for parameters
  implementation?: string   // Basic implementation code
  apiEndpoint?: string     // API endpoint if available
  documentationUrl: string // Source documentation
}
```

### 3. PlanGenerator (`src/services/planGenerator.ts`)

**Purpose**: Creates detailed, context-aware implementation plans.

**Key Functions**:
- `generatePlan()` - Creates complete implementation roadmap
- `researchBestPractices()` - Searches for implementation patterns
- `createImplementationPlan()` - AI-generates specific steps

**Plan Generation Process**:
1. **Research Phase**: Search for "[agent type] implementation best practices"
2. **Context Assembly**: Combine user description, tools, requirements, constraints
3. **AI Analysis**: Generate specific steps with realistic time estimates
4. **Validation**: Ensure plan references actual user requirements, not generic tools

**Plan Structure**:
```typescript
interface PlanStep {
  id: string
  title: string                    // Step title specific to agent
  description: string              // Detailed implementation guidance
  requiredTools: string[]          // Tools needed for this step
  estimatedTime: string           // Realistic time estimate
  dependencies?: string[]         // Previous steps required
  status: 'pending' | 'in_progress' | 'completed'
}
```

### 4. WebSearchService (`src/services/webSearch.ts`)

**Purpose**: Intelligent web search using Exa.ai for tool discovery.

**Key Features**:
- **Neural Search**: Exa.ai's embeddings-based search for better relevance
- **Content Extraction**: Gets full page text, not just snippets
- **Domain Targeting**: Focuses on developer documentation sites
- **Relevance Scoring**: Ranks results by API/tool relevance

**Domain Strategy**:
```typescript
// Tool research targets
include_domains: [
  "github.com",
  "docs.anthropic.com", 
  "openai.com",
  "api.slack.com",
  "developers.google.com",
  "docs.microsoft.com"
]

// Best practices targets
include_domains: [
  "stackoverflow.com",
  "dev.to", 
  "medium.com"
]
```

### 5. AgentExecutor (`src/services/agentExecutor.ts`)

**Purpose**: Executes agents using Claude SDK with integrated tools.

**Key Features**:
- Tool registry management
- Sandboxed tool execution
- Claude SDK integration
- Error handling and validation

## 🛠️ Tool Integration System

### Tool Discovery Pipeline

1. **User Mentions Tools** → Extract from description
2. **User Adds Tools** → Manual tool selection interface  
3. **AI Suggests Tools** → Based on capabilities and use case
4. **Web Search** → Find documentation and APIs
5. **AI Analysis** → Create Claude-compatible tool definitions
6. **Registration** → Add to agent's tool registry

### Tool Execution Environment

- **Sandboxed Execution**: Limited require() function for security
- **API Integration**: Direct HTTP calls to tool endpoints
- **Fallback Behavior**: Mock responses if tools unavailable
- **Error Handling**: Graceful degradation and logging

## 🎨 Frontend Architecture

### Technology Stack
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **Lucide React** icons

### Key Components

#### AgentBuilder (`frontend/src/components/agent-builder.tsx`)
Main orchestrator component handling all phases:

**State Management**:
```typescript
const [phase, setPhase] = useState<Phase>('input')
const [parsedAgent, setParsedAgent] = useState<ParsedAgent | null>(null)
const [userTools, setUserTools] = useState<string[]>([])
const [availableTools, setAvailableTools] = useState<Tool[]>([])
```

**Phase Flow**:
- `input` → User describes agent
- `clarification` → Tool selection and refinement
- `building` → Animated progress with real API calls
- `complete` → Show finished agent and plan
- `error` → Handle failures gracefully

#### Tool Selection Interface
Interactive tool management with:
- **Green pills**: Tools mentioned in description (with checkmark)
- **Blue pills**: User-added tools (with X to remove)
- **Input field**: Type and press Enter to add
- **Suggestions**: AI-generated tool recommendations

## 🔄 API Endpoints

### Core Routes (`src/api/routes.ts`)

#### `POST /api/agent/parse`
Parses natural language description into structured format.

**Request**:
```json
{
  "description": "A customer support agent that uses Slack and Jira"
}
```

**Response**:
```json
{
  "description": "Customer support agent with messaging and ticketing",
  "requirements": ["Handle support requests", "Manage tickets"],
  "constraints": ["Respect API rate limits"],
  "mentionedTools": ["Slack", "Jira"],
  "impliedCapabilities": ["messaging", "ticket management"]
}
```

#### `POST /api/agent/research-tools`
Researches specific tools and creates definitions.

#### `POST /api/agent/create`
End-to-end agent creation with full pipeline.

**Enhanced Request**:
```json
{
  "description": "Customer support agent description",
  "mentionedTools": ["Slack", "Jira", "Confluence"]  // Combined from UI
}
```

## 🧪 Development Guidelines

### Running the System

1. **Backend** (Terminal 1):
```bash
cd /Users/ryanmorrison/Desktop/Development/Agent-Builder
npm run dev  # Runs on port 3000
```

2. **Frontend** (Terminal 2):
```bash
cd /Users/ryanmorrison/Desktop/Development/Agent-Builder/frontend  
npm run dev  # Runs on port 3001
```

### Environment Variables

```bash
ANTHROPIC_API_KEY=sk-ant-api03-your_key_here
EXA_API_KEY=your_exa_key_here
DATABASE_URL=postgresql://user:pass@localhost:5432/agent_builder
REDIS_URL=redis://localhost:6379
PORT=3000
```

### Testing Strategy

**Manual Testing Flow**:
1. Describe agent with specific tools: "A social media manager that uses Facebook API and Twitter API"
2. Verify tool extraction in clarification phase
3. Add/remove tools using the interface
4. Check that implementation plan references actual tools mentioned
5. Confirm tools appear in final agent details

**Debug Outputs**:
- `🔍 Parsing agent description:` - Shows input text
- `🔍 Tools to research:` - Shows combined tool list
- `🔍 Researched tools count:` - Confirms tool research success
- `📄 Using Exa search result text for [tool]` - Confirms search success

### Common Issues & Solutions

#### "No tools integrated" 
- **Cause**: Tool extraction failing or empty tool list
- **Debug**: Check `🔍 Tools to research:` log
- **Fix**: Improve tool extraction prompt or manual tool addition

#### Generic implementation plans
- **Cause**: Plan generator using fallback instead of AI-generated plan
- **Debug**: Check plan generation JSON parsing logs
- **Fix**: Improve JSON parsing or prompt clarity

#### Tool research failures
- **Cause**: Exa.ai search returning no results or API errors
- **Debug**: Check `📄 Using Exa search result text` logs
- **Fix**: Verify Exa.ai API key or adjust search domains

## 🚀 Deployment Architecture

### Generated Agent Structure
When deployed, each agent generates:
- `agent-config.json` - Agent configuration
- `server.js` - Standalone Express server
- `package.json` - Dependencies
- `Dockerfile` - Container configuration
- `README.md` - Usage instructions

### Agent Server Features
- REST API endpoints for agent interaction
- Health checks and monitoring
- Docker containerization
- Environment-based configuration

## 🔮 Future Enhancements

### Planned Features
- **Database Integration**: Persistent agent storage with PostgreSQL
- **Real-time Updates**: WebSocket support for live building progress
- **Agent Marketplace**: Share and discover community agents
- **Advanced Testing**: Automated test generation and execution
- **Team Collaboration**: Multi-user agent development

### Architectural Improvements
- **Caching Layer**: Redis for search results and AI responses
- **Microservices**: Split services for better scalability
- **Queue System**: Background processing for long-running tasks
- **Monitoring**: OpenTelemetry integration for observability

## 📚 Key Learnings

### AI Integration Patterns
- **Specific Prompts**: Be very explicit about JSON format and requirements
- **Robust Parsing**: Always handle markdown formatting and extract JSON
- **Fallback Strategies**: Provide sensible defaults when AI calls fail
- **Context Preservation**: Pass user intent through the entire pipeline

### Tool Research Strategy
- **Use Exa.ai Content**: Don't scrape websites, use extracted content
- **Domain Targeting**: Focus searches on developer documentation
- **AI Analysis**: Let Claude analyze documentation and create definitions
- **Progressive Enhancement**: Start with basics, add complexity

### User Experience Design
- **Progressive Disclosure**: Show complexity gradually through phases
- **Interactive Feedback**: Let users refine and customize at each step
- **Visual Progress**: Animated building process creates engagement
- **Error Recovery**: Always provide ways to go back and fix issues

This platform demonstrates how to combine multiple AI services (Claude, Exa.ai) with traditional web development to create intelligent, user-friendly automation tools.