import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { ResearchAgent } from './src/agents/research-agent.js';
import { Logger } from './src/utils/helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ResearchServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.agent = new ResearchAgent();
    
    this.setupMiddleware();
    this.setupRoutes();
  }
  setupMiddleware() {
    // Enable CORS manually
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });
    
    // Parse JSON bodies
    this.app.use(express.json());
    
    // Serve static files from public directory
    this.app.use(express.static(path.join(__dirname, 'public')));
    
    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/api/health', async (req, res) => {
      try {
        const connected = await this.agent.checkConnection();
        res.json({
          status: 'ok',
          ollamaConnected: connected,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          status: 'error',
          error: error.message,
          ollamaConnected: false
        });
      }
    });

    // Research endpoint
    this.app.post('/api/research', async (req, res) => {
      try {
        const { topic, mode = 'COMPREHENSIVE', includeFollowups = true, includeSynthesis = true } = req.body;

        if (!topic || !topic.trim()) {
          return res.status(400).json({
            error: 'Research topic is required'
          });
        }

        Logger.info(`🔍 Starting research: ${topic} (${mode})`);

        // Check connection first
        const connected = await this.agent.checkConnection();
        if (!connected) {
          return res.status(503).json({
            error: 'Cannot connect to Ollama. Please ensure Ollama is running and the model is available.'
          });
        }

        // Analyze topic
        const analysis = await this.agent.analyzeResearchTopic(topic, mode);

        // Conduct research
        const researchResults = await this.agent.conductResearch(topic, analysis.subtopics, mode);

        // Generate synthesis if requested
        let synthesis = null;
        if (includeSynthesis) {
          synthesis = await this.agent.synthesizeFindings(topic, researchResults);
        }

        // Generate follow-up questions if requested
        let followupQuestions = null;
        if (includeFollowups) {
          const researchSummary = Object.values(researchResults).map(r => r.content).join('\n\n');
          followupQuestions = await this.agent.generateFollowUpQuestions(topic, researchSummary);
        }

        // Create executive summary
        const fullResearch = Object.entries(researchResults)
          .map(([title, data]) => `${title}: ${data.content}`)
          .join('\n\n');
        const executiveSummary = await this.agent.createExecutiveSummary(topic, fullResearch);

        // Prepare response
        const results = {
          topic,
          mode,
          analysis,
          researchResults,
          synthesis,
          followupQuestions,
          executiveSummary,
          performanceStats: this.agent.getPerformanceStats()
        };

        Logger.success(`✅ Research completed: ${topic}`);
        res.json(results);

      } catch (error) {
        Logger.error(`❌ Research failed: ${error.message}`);
        res.status(500).json({
          error: 'Research failed',
          details: error.message
        });
      }
    });

    // Models endpoint - list available Ollama models
    this.app.get('/api/models', async (req, res) => {
      try {
        const response = await this.agent.ollama.list();
        res.json({
          models: response.models.map(model => ({
            name: model.name,
            size: model.size,
            modified: model.modified_at
          }))
        });
      } catch (error) {
        res.status(500).json({
          error: 'Failed to fetch models',
          details: error.message
        });
      }
    });

    // Serve the main page
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        error: 'Not found',
        path: req.path
      });
    });

    // Error handler
    this.app.use((error, req, res, next) => {
      console.error('Server error:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: error.message
      });
    });
  }

  async start() {
    try {
      // Check Ollama connection on startup
      Logger.info('🔧 Checking Ollama connection...');
      const connected = await this.agent.checkConnection();
      
      if (connected) {
        Logger.success('✅ Connected to Ollama successfully');
      } else {
        Logger.warning('⚠️  Could not connect to Ollama - API will return errors');
        Logger.info('💡 Make sure Ollama is running: ollama serve');
      }

      this.app.listen(this.port, () => {
        Logger.success(`🚀 Smart Research Assistant UI running on http://localhost:${this.port}`);
        Logger.info('📖 Open your browser and start researching!');
      });

    } catch (error) {
      Logger.error(`❌ Failed to start server: ${error.message}`);
      process.exit(1);
    }
  }
}

// Start the server
const server = new ResearchServer();
server.start();
