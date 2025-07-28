import { AgentConfig } from '../types/agent';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface DeploymentConfig {
  agentId: string;
  name: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  apiEndpoint?: string;
  webhookUrl?: string;
  allowedOrigins?: string[];
}

interface DeploymentResult {
  success: boolean;
  deploymentId: string;
  endpoint?: string;
  error?: string;
  files: string[];
}

export class AgentDeployment {
  private outputDir: string;

  constructor(outputDir: string = './deployments') {
    this.outputDir = outputDir;
  }

  async deployAgent(
    agent: AgentConfig,
    config: DeploymentConfig
  ): Promise<DeploymentResult> {
    try {
      const deploymentId = this.generateDeploymentId();
      const deploymentPath = join(this.outputDir, deploymentId);

      // Create deployment directory
      mkdirSync(deploymentPath, { recursive: true });

      // Generate deployment files
      const files = await this.generateDeploymentFiles(agent, config, deploymentPath);

      return {
        success: true,
        deploymentId,
        endpoint: config.apiEndpoint || `http://localhost:3000/agents/${deploymentId}`,
        files
      };
    } catch (error) {
      return {
        success: false,
        deploymentId: '',
        error: error instanceof Error ? error.message : 'Deployment failed',
        files: []
      };
    }
  }

  private async generateDeploymentFiles(
    agent: AgentConfig,
    config: DeploymentConfig,
    deploymentPath: string
  ): Promise<string[]> {
    const files: string[] = [];

    // 1. Generate agent configuration file
    const configFile = join(deploymentPath, 'agent-config.json');
    writeFileSync(configFile, JSON.stringify(agent, null, 2));
    files.push('agent-config.json');

    // 2. Generate deployment manifest
    const manifest = {
      ...config,
      agent: {
        id: agent.id,
        name: agent.name,
        version: config.version,
        capabilities: agent.capabilities,
        tools: agent.tools.map(t => t.name)
      },
      createdAt: new Date().toISOString()
    };
    
    const manifestFile = join(deploymentPath, 'deployment.json');
    writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
    files.push('deployment.json');

    // 3. Generate standalone agent server
    const serverCode = this.generateServerCode(agent, config);
    const serverFile = join(deploymentPath, 'server.js');
    writeFileSync(serverFile, serverCode);
    files.push('server.js');

    // 4. Generate package.json for deployment
    const packageJson = this.generatePackageJson(agent, config);
    const packageFile = join(deploymentPath, 'package.json');
    writeFileSync(packageFile, JSON.stringify(packageJson, null, 2));
    files.push('package.json');

    // 5. Generate Docker configuration
    const dockerfile = this.generateDockerfile(agent, config);
    const dockerFile = join(deploymentPath, 'Dockerfile');
    writeFileSync(dockerFile, dockerfile);
    files.push('Dockerfile');

    // 6. Generate environment configuration
    const envConfig = this.generateEnvConfig(config);
    const envFile = join(deploymentPath, '.env.example');
    writeFileSync(envFile, envConfig);
    files.push('.env.example');

    // 7. Generate deployment README
    const readme = this.generateDeploymentReadme(agent, config);
    const readmeFile = join(deploymentPath, 'README.md');
    writeFileSync(readmeFile, readme);
    files.push('README.md');

    return files;
  }

  private generateServerCode(agent: AgentConfig, config: DeploymentConfig): string {
    return `const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Claude
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Agent configuration
const agentConfig = ${JSON.stringify(agent, null, 2)};

// Middleware
app.use(cors({
  origin: ${JSON.stringify(config.allowedOrigins || ['*'])}
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    agent: agentConfig.name,
    version: '${config.version}',
    timestamp: new Date().toISOString()
  });
});

// Agent endpoint
app.post('/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Execute agent
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      system: agentConfig.systemPrompt,
      messages: [{
        role: 'user',
        content: message
      }]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    res.json({
      response: content.text,
      agent: agentConfig.name,
      sessionId: sessionId || 'default',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Agent execution error:', error);
    res.status(500).json({
      error: 'Agent execution failed',
      message: error.message
    });
  }
});

// Agent info
app.get('/info', (req, res) => {
  res.json({
    name: agentConfig.name,
    description: agentConfig.description,
    capabilities: agentConfig.capabilities,
    tools: agentConfig.tools.map(t => ({
      name: t.name,
      description: t.description
    })),
    version: '${config.version}',
    environment: '${config.environment}'
  });
});

app.listen(PORT, () => {
  console.log(\`🤖 \${agentConfig.name} running on port \${PORT}\`);
  console.log(\`📊 Health check: http://localhost:\${PORT}/health\`);
  console.log(\`💬 Chat endpoint: http://localhost:\${PORT}/chat\`);
  console.log(\`ℹ️  Agent info: http://localhost:\${PORT}/info\`);
});`;
  }

  private generatePackageJson(agent: AgentConfig, config: DeploymentConfig): any {
    return {
      name: `agent-${agent.id}`,
      version: config.version,
      description: `Deployed agent: ${agent.description}`,
      main: 'server.js',
      scripts: {
        start: 'node server.js',
        dev: 'nodemon server.js',
        test: 'echo "No tests specified"'
      },
      dependencies: {
        '@anthropic-ai/sdk': '^0.30.0',
        express: '^4.19.2',
        cors: '^2.8.5',
        dotenv: '^16.4.5'
      },
      devDependencies: {
        nodemon: '^3.1.0'
      },
      keywords: ['ai', 'agent', 'claude', 'deployment'],
      author: '',
      license: 'MIT'
    };
  }

  private generateDockerfile(agent: AgentConfig, config: DeploymentConfig): string {
    return `FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "start"]`;
  }

  private generateEnvConfig(config: DeploymentConfig): string {
    return `# ${config.name} Environment Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key_here
PORT=3000
NODE_ENV=${config.environment}

# Optional: Webhook URL for notifications
WEBHOOK_URL=${config.webhookUrl || ''}

# Optional: API endpoint override
API_ENDPOINT=${config.apiEndpoint || ''}`;
  }

  private generateDeploymentReadme(agent: AgentConfig, config: DeploymentConfig): string {
    return `# ${agent.name} - Deployment

${agent.description}

## Quick Start

1. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Configure Environment**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your API keys
   \`\`\`

3. **Start the Agent**
   \`\`\`bash
   npm start
   \`\`\`

## API Endpoints

### \`POST /chat\`
Send a message to the agent.

**Request:**
\`\`\`json
{
  "message": "Hello, how can you help me?",
  "sessionId": "user-123"
}
\`\`\`

**Response:**
\`\`\`json
{
  "response": "Hello! I'm ${agent.name}. I can help you with...",
  "agent": "${agent.name}",
  "sessionId": "user-123",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
\`\`\`

### \`GET /info\`
Get agent information and capabilities.

### \`GET /health\`
Health check endpoint.

## Agent Capabilities

${agent.capabilities.map(cap => `- ${cap}`).join('\n')}

## Available Tools

${agent.tools.map(tool => `- **${tool.name}**: ${tool.description}`).join('\n')}

## Docker Deployment

1. **Build Image**
   \`\`\`bash
   docker build -t ${agent.id} .
   \`\`\`

2. **Run Container**
   \`\`\`bash
   docker run -p 3000:3000 -e ANTHROPIC_API_KEY=your_key ${agent.id}
   \`\`\`

## Configuration

- **Version**: ${config.version}
- **Environment**: ${config.environment}
- **Agent ID**: ${agent.id}

## Support

For issues or questions about this deployment, please refer to the main AI Agent Builder documentation.`;
  }

  async shareAgent(agent: AgentConfig, options: {
    public: boolean;
    description?: string;
    tags?: string[];
  }): Promise<{ shareId: string; shareUrl: string }> {
    const shareId = this.generateShareId();
    
    // In a real implementation, this would save to a database
    // and create a public endpoint for the shared agent
    
    return {
      shareId,
      shareUrl: `https://agent-builder.dev/shared/${shareId}`
    };
  }

  private generateDeploymentId(): string {
    return `deploy_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  private generateShareId(): string {
    return `share_${Math.random().toString(36).substr(2, 12)}`;
  }
}