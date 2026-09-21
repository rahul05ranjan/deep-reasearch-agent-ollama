import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ResearchEngine } from './src/engine/research-engine.js';
import { Logger } from './src/utils/helpers.js';
import { ResearchRequestSchema } from './src/contracts/schemas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getPublicDir = (): string => {
  const directPublic = path.join(__dirname, 'public');
  if (fs.existsSync(directPublic)) return directPublic;
  const parentPublic = path.join(__dirname, '..', 'public');
  if (fs.existsSync(parentPublic)) return parentPublic;
  return directPublic;
};

export interface ResearchServerOptions {
  port?: number | string;
  engine?: ResearchEngine;
}

export class ResearchServer {
  app: Express;
  port: number | string;
  engine: ResearchEngine;

  constructor(options: ResearchServerOptions = {}) {
    this.app = express();
    this.port = options.port ?? (process.env.PORT || 3000);
    this.engine = options.engine || new ResearchEngine();

    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware(): void {
    // Enable CORS manually
    this.app.use((_req: Request, res: Response, next: NextFunction) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      if (_req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    // Parse JSON bodies
    this.app.use(express.json());

    // Serve static files from public directory
    this.app.use(express.static(getPublicDir()));

    // Request logging
    this.app.use((req: Request, _res: Response, next: NextFunction) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  setupRoutes(): void {
    // Health check endpoint
    this.app.get('/api/health', async (_req: Request, res: Response) => {
      try {
        const connected = await this.engine.checkConnection();
        res.json({
          status: 'ok',
          ollamaConnected: connected,
          timestamp: new Date().toISOString()
        });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({
          status: 'error',
          error: message,
          ollamaConnected: false
        });
      }
    });

    // Research endpoint
    this.app.post('/api/research', async (req: Request, res: Response) => {
      try {
        const parseResult = ResearchRequestSchema.safeParse(req.body);
        if (!parseResult.success) {
          const firstError = parseResult.error.issues?.[0]?.message || 'Invalid research request';
          return res.status(400).json({
            error: firstError
          });
        }

        const { topic, mode, includeFollowups, includeSynthesis } = parseResult.data;

        Logger.info(`🔍 Starting research: ${topic} (${mode})`);

        // Check connection first
        const connected = await this.engine.checkConnection();
        if (!connected) {
          return res.status(503).json({
            error: 'Cannot connect to Ollama. Please ensure Ollama is running and the model is available.'
          });
        }

        // Delegate entire research workflow to the deep ResearchEngine
        const results = await this.engine.executeResearch(topic, {
          mode,
          includeFollowups,
          includeSynthesis
        });

        Logger.success(`✅ Research completed: ${topic}`);
        return res.json(results);

      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        Logger.error(`❌ Research failed: ${message}`);
        return res.status(500).json({
          error: 'Research failed',
          details: message
        });
      }
    });

    // Models endpoint - list available Ollama models
    this.app.get('/api/models', async (_req: Request, res: Response) => {
      try {
        const response = await this.engine.llm.listModels();
        const models = (response.models || []).map((model) => ({
          name: model.name,
          size: model.size,
          modified: model.modified_at || model.modified
        }));
        res.json({ models });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({
          error: 'Failed to fetch models',
          details: message
        });
      }
    });

    // Serve the main page
    this.app.get('/', (_req: Request, res: Response) => {
      res.sendFile(path.join(getPublicDir(), 'index.html'));
    });

    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        error: 'Not found',
        path: req.path
      });
    });

    // Error handler
    this.app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
      if (error?.status === 400 || error instanceof SyntaxError || error?.type === 'entity.parse.failed') {
        return res.status(400).json({
          error: 'Invalid JSON body'
        });
      }
      console.error('Server error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        details: error?.message || String(error)
      });
    });
  }

  async start(): Promise<void> {
    try {
      // Check Ollama connection on startup
      Logger.info('🔧 Checking Ollama connection...');
      const connected = await this.engine.checkConnection();

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

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      Logger.error(`❌ Failed to start server: ${message}`);
      process.exit(1);
    }
  }
}

// Start the server only when executed directly
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const server = new ResearchServer();
  server.start();
}
