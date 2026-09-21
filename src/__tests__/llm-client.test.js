import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { FakeLLMAdapter, OllamaAdapter } from '../adapters/llm-client.js';

describe('LLMClient Adapter Seam', () => {
  describe('FakeLLMAdapter', () => {
    it('returns default canned response when called without custom handlers', async () => {
      const fake = new FakeLLMAdapter({ defaultResponse: 'Default fake response' });
      const result = await fake.generate({
        model: 'test-model',
        prompt: 'Hello world'
      });

      assert.equal(result.response, 'Default fake response');
      assert.equal(fake.calls.length, 1);
      assert.equal(fake.calls[0].prompt, 'Hello world');
      assert.equal(fake.calls[0].model, 'test-model');
    });

    it('supports response queue for sequential responses', async () => {
      const fake = new FakeLLMAdapter({
        responses: ['First response', 'Second response']
      });

      const res1 = await fake.generate({ prompt: 'Call 1' });
      const res2 = await fake.generate({ prompt: 'Call 2' });

      assert.equal(res1.response, 'First response');
      assert.equal(res2.response, 'Second response');
      assert.equal(fake.calls.length, 2);
    });

    it('supports custom handler function for dynamic responses', async () => {
      const fake = new FakeLLMAdapter({
        handler: ({ prompt }) => `Echo: ${prompt}`
      });

      const result = await fake.generate({ prompt: 'Topic Analysis' });
      assert.equal(result.response, 'Echo: Topic Analysis');
    });

    it('returns configured models on listModels', async () => {
      const fake = new FakeLLMAdapter({
        models: [{ name: 'test-model:latest', size: 1000 }]
      });

      const result = await fake.listModels();
      assert.ok(Array.isArray(result.models));
      assert.equal(result.models.length, 1);
      assert.equal(result.models[0].name, 'test-model:latest');
    });
  });

  describe('OllamaAdapter', () => {
    it('instantiates with custom baseUrl and options', () => {
      const adapter = new OllamaAdapter({ baseUrl: 'http://localhost:11434' });
      assert.ok(adapter);
      assert.equal(typeof adapter.generate, 'function');
      assert.equal(typeof adapter.listModels, 'function');
    });

    it('delegates to underlying ollama client when client is injected', async () => {
      let generateCalled = false;
      let listCalled = false;

      const mockOllama = {
        generate: async (params) => {
          generateCalled = true;
          return { response: `Generated from ${params.model}` };
        },
        list: async () => {
          listCalled = true;
          return { models: [{ name: 'qwen2.5-coder:0.5b' }] };
        }
      };

      const adapter = new OllamaAdapter({ client: mockOllama });

      const genResult = await adapter.generate({ model: 'qwen2.5-coder:0.5b', prompt: 'test' });
      assert.ok(generateCalled);
      assert.equal(genResult.response, 'Generated from qwen2.5-coder:0.5b');

      const listResult = await adapter.listModels();
      assert.ok(listCalled);
      assert.equal(listResult.models[0].name, 'qwen2.5-coder:0.5b');
    });
  });
});
