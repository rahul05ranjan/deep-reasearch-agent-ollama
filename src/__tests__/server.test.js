import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { ResearchServer } from '../../server.js';
import { ResearchEngine } from '../engine/research-engine.js';
import { FakeLLMAdapter } from '../adapters/llm-client.js';

describe('ResearchServer HTTP API Seam', () => {
  let serverInstance;
  let httpServer;
  let baseUrl;

  const sampleTopicAnalysis = JSON.stringify({
    overview: 'Renewable energy overview',
    subtopics: [
      {
        title: 'Solar Power',
        description: 'Photovoltaics and solar thermal',
        questions: ['What is the efficiency?']
      }
    ],
    mainQuestions: ['What are future trends?']
  });

  before(async () => {
    const fakeLLM = new FakeLLMAdapter({
      responses: [
        sampleTopicAnalysis,
        'Solar cells convert photons into electricity.',
        'Synthesis: Solar power is expanding rapidly.',
        '1. What are battery storage options?',
        'Executive Summary: Solar power provides clean, scalable energy.'
      ],
      models: [{ name: 'qwen2.5-coder:0.5b' }]
    });

    const engine = new ResearchEngine({
      llmClient: fakeLLM,
      model: 'qwen2.5-coder:0.5b'
    });

    serverInstance = new ResearchServer({ engine, port: 0 });

    await new Promise((resolve) => {
      httpServer = serverInstance.app.listen(0, () => {
        const port = httpServer.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (httpServer) {
      await new Promise((resolve) => httpServer.close(resolve));
    }
  });

  it('GET /api/health returns ok and ollamaConnected: true', async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    assert.equal(response.status, 200);

    const data = await response.json();
    assert.equal(data.status, 'ok');
    assert.equal(data.ollamaConnected, true);
  });

  it('POST /api/research returns 400 when topic is missing', async () => {
    const response = await fetch(`${baseUrl}/api/research`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    assert.equal(response.status, 400);
    const data = await response.json();
    assert.equal(data.error, 'Research topic is required');
  });

  it('POST /api/research delegates to ResearchEngine and returns full research payload', async () => {
    const response = await fetch(`${baseUrl}/api/research`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'Renewable Energy',
        mode: 'QUICK'
      })
    });

    assert.equal(response.status, 200);
    const data = await response.json();

    assert.equal(data.topic, 'Renewable Energy');
    assert.equal(data.mode, 'QUICK');
    assert.ok(data.analysis);
    assert.ok(data.researchResults['Solar Power']);
    assert.ok(data.synthesis.includes('Synthesis:'));
    assert.ok(Array.isArray(data.followupQuestions));
    assert.ok(data.executiveSummary);
    assert.ok(data.performanceStats);
  });

  it('POST /api/research returns 503 when LLM connection is unavailable', async () => {
    const disconnectedEngine = new ResearchEngine({
      llmClient: new FakeLLMAdapter({ models: [] }),
      model: 'qwen2.5-coder:0.5b'
    });

    const disconnectedServer = new ResearchServer({ engine: disconnectedEngine });

    await new Promise((resolve) => {
      const s = disconnectedServer.app.listen(0, async () => {
        const port = s.address().port;
        const res = await fetch(`http://localhost:${port}/api/research`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: 'Some Topic' })
        });

        assert.equal(res.status, 503);
        const json = await res.json();
        assert.ok(json.error.includes('Cannot connect to Ollama'));

        s.close(resolve);
      });
    });
  });
});
