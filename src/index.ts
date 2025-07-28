// Load environment variables FIRST, before any other imports
import dotenv from 'dotenv';
import path from 'path';

console.log('🔍 Current working directory:', process.cwd());
console.log('🔍 Looking for .env file at:', path.join(process.cwd(), '.env'));

const dotenvResult = dotenv.config();
console.log('🔍 Dotenv result:', dotenvResult);
console.log('🔍 ANTHROPIC_API_KEY after dotenv:', !!process.env.ANTHROPIC_API_KEY);

import express from 'express';
import cors from 'cors';
import routes from './api/routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'AI Agent Builder API',
    version: '1.0.0',
    description: 'Platform for building AI agents through natural language descriptions',
    endpoints: {
      'POST /api/agent/parse': 'Parse agent description',
      'POST /api/agent/research-tools': 'Research tools for agent',
      'POST /api/agent/generate-plan': 'Generate implementation plan',
      'POST /api/agent/create': 'Create complete agent (end-to-end)',
      'POST /api/agent/:id/execute': 'Execute agent',
      'POST /api/tools/alternatives': 'Find alternative tools',
      'GET /api/health': 'Health check'
    },
    documentation: 'See README.md for detailed API documentation'
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI Agent Builder API running on port ${PORT}`);
  console.log(`📖 API documentation: http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  
  // Validate environment variables
  const requiredEnvVars = ['ANTHROPIC_API_KEY', 'EXA_API_KEY'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  // Debug environment variables
  console.log(`🔍 ANTHROPIC_API_KEY present: ${!!process.env.ANTHROPIC_API_KEY}`);
  console.log(`🔍 EXA_API_KEY present: ${!!process.env.EXA_API_KEY}`);
  if (process.env.ANTHROPIC_API_KEY) {
    console.log(`🔍 ANTHROPIC_API_KEY starts with: ${process.env.ANTHROPIC_API_KEY.substring(0, 15)}...`);
  }
  
  if (missingVars.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missingVars.join(', ')}`);
    console.warn('   Some features may not work properly. Check .env.example');
  } else {
    console.log('✅ All required environment variables are set');
  }
});

export default app;