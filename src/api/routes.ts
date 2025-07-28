// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { AgentParser } from '../services/agentParser';
import { ToolResearcher } from '../services/toolResearcher';
import { PlanGenerator } from '../services/planGenerator';
import { AgentExecutor } from '../services/agentExecutor';
import { AgentDescriptionSchema } from '../types/agent';

const router = express.Router();

// Initialize services with debugging
console.log('🔍 Initializing services...');
console.log('🔍 ANTHROPIC_API_KEY available:', !!process.env.ANTHROPIC_API_KEY);
console.log('🔍 EXA_API_KEY available:', !!process.env.EXA_API_KEY);

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable is required');
}

if (!process.env.EXA_API_KEY) {
  throw new Error('EXA_API_KEY environment variable is required');
}

const agentParser = new AgentParser(process.env.ANTHROPIC_API_KEY);
const toolResearcher = new ToolResearcher(
  process.env.ANTHROPIC_API_KEY,
  process.env.EXA_API_KEY
);
const planGenerator = new PlanGenerator(
  process.env.ANTHROPIC_API_KEY,
  process.env.EXA_API_KEY
);
const agentExecutor = new AgentExecutor(process.env.ANTHROPIC_API_KEY);

console.log('✅ Services initialized successfully');

// Parse agent description
router.post('/agent/parse', async (req, res) => {
  try {
    console.log('🔍 API Key check in route:', !!process.env.ANTHROPIC_API_KEY);
    
    const { description } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const parsedDescription = await agentParser.parseDescription(description);
    res.json(parsedDescription);
  } catch (error) {
    console.error('Failed to parse description:', error);
    res.status(500).json({ error: 'Failed to parse agent description' });
  }
});

// Research tools for agent
router.post('/agent/research-tools', async (req, res) => {
  try {
    const { toolNames, useCase } = req.body;
    
    if (!toolNames || !Array.isArray(toolNames)) {
      return res.status(400).json({ error: 'toolNames array is required' });
    }

    const tools = await toolResearcher.researchTools(toolNames, useCase || '');
    res.json({ tools });
  } catch (error) {
    console.error('Failed to research tools:', error);
    res.status(500).json({ error: 'Failed to research tools' });
  }
});

// Generate implementation plan
router.post('/agent/generate-plan', async (req, res) => {
  try {
    const { description, tools } = req.body;
    
    const validatedDescription = AgentDescriptionSchema.parse(description);
    const plan = await planGenerator.generatePlan(validatedDescription, tools || []);
    
    res.json(plan);
  } catch (error) {
    console.error('Failed to generate plan:', error);
    res.status(500).json({ error: 'Failed to generate implementation plan' });
  }
});

// Create complete agent (end-to-end)
router.post('/agent/create', async (req, res) => {
  try {
    const { description, mentionedTools } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    // Step 1: Parse description
    const parsedDescription = await agentParser.parseDescription(description);
    
    // Step 2: Use frontend-provided tools if available, otherwise use parsed tools
    const toolsToResearch = mentionedTools || parsedDescription.mentionedTools || [];
    console.log('🔍 Tools to research:', toolsToResearch);
    
    const tools = await toolResearcher.researchTools(
      toolsToResearch,
      parsedDescription.description
    );
    console.log('🔍 Researched tools count:', tools.length);
    console.log('🔍 Researched tools:', tools.map(t => t.name));
    
    // Step 3: Generate system prompt
    const systemPrompt = await agentParser.generateSystemPrompt(parsedDescription);
    
    // Step 4: Generate implementation plan
    const plan = await planGenerator.generatePlan(parsedDescription, tools);
    
    // Step 5: Create agent config
    const agentConfig = {
      id: generateId(),
      name: extractAgentName(parsedDescription.description),
      description: parsedDescription.description,
      systemPrompt,
      tools,
      capabilities: parsedDescription.requirements,
      constraints: parsedDescription.constraints,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.json({
      agent: agentConfig,
      plan,
      parsedDescription
    });
  } catch (error) {
    console.error('Failed to create agent:', error);
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

// Execute agent
router.post('/agent/:id/execute', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const agentId = req.params.id;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // In a real implementation, you'd fetch the agent config from database
    // For now, return a placeholder response
    res.json({
      message: 'Agent execution endpoint - implementation needed with database integration'
    });
  } catch (error) {
    console.error('Failed to execute agent:', error);
    res.status(500).json({ error: 'Failed to execute agent' });
  }
});

// Get alternative tools
router.post('/tools/alternatives', async (req, res) => {
  try {
    const { toolName, useCase } = req.body;
    
    if (!toolName) {
      return res.status(400).json({ error: 'toolName is required' });
    }

    const alternatives = await toolResearcher.findAlternativeTools(
      toolName,
      useCase || ''
    );
    
    res.json({ alternatives });
  } catch (error) {
    console.error('Failed to find alternatives:', error);
    res.status(500).json({ error: 'Failed to find alternative tools' });
  }
});

// Enhance plan step with research
router.post('/plan/:planId/step/:stepId/enhance', async (req, res) => {
  try {
    const { planId, stepId } = req.params;
    const { plan } = req.body;
    
    if (!plan) {
      return res.status(400).json({ error: 'Plan data is required' });
    }

    const enhancedStep = await planGenerator.updatePlanWithResearch(plan, stepId);
    res.json({ step: enhancedStep });
  } catch (error) {
    console.error('Failed to enhance plan step:', error);
    res.status(500).json({ error: 'Failed to enhance plan step' });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    services: {
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      exaSearch: !!process.env.EXA_API_KEY
    }
  });
});

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function extractAgentName(description: string): string {
  // Simple name extraction - could be enhanced with AI
  const words = description.split(' ').slice(0, 3);
  return words.map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ') + ' Agent';
}

export default router;