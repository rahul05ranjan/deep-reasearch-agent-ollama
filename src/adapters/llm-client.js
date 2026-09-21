import { Ollama } from 'ollama';
import { config } from '../config.js';

/**
 * Base abstract adapter class defining the LLM Client Seam interface.
 */
export class LLMClientAdapter {
  /**
   * Generate completion text for a prompt.
   * @param {Object} params
   * @param {string} params.model
   * @param {string} params.prompt
   * @param {Object} [params.options]
   * @param {boolean} [params.stream]
   * @returns {Promise<{ response: string }>}
   */
  async generate(_params) {
    throw new Error('generate() must be implemented by adapter');
  }

  /**
   * List available models.
   * @returns {Promise<{ models: Array<{ name: string, size?: number }> }>}
   */
  async listModels() {
    throw new Error('listModels() must be implemented by adapter');
  }
}

/**
 * In-memory fake LLM client adapter for deterministic testing.
 */
export class FakeLLMAdapter extends LLMClientAdapter {
  constructor(options = {}) {
    super();
    this.defaultResponse = options.defaultResponse ?? '';
    this.responses = options.responses ? [...options.responses] : [];
    this.handler = options.handler || null;
    this.models = options.models || [{ name: 'fake-model:latest', size: 1000 }];
    this.calls = [];
  }

  async generate(params) {
    this.calls.push(params);

    if (this.handler) {
      const handled = await this.handler(params);
      return typeof handled === 'string' ? { response: handled } : handled;
    }

    if (this.responses.length > 0) {
      const next = this.responses.shift();
      return typeof next === 'string' ? { response: next } : next;
    }

    return { response: this.defaultResponse };
  }

  async listModels() {
    return { models: this.models };
  }
}

/**
 * Production Ollama client adapter wrapping the official Ollama SDK.
 */
export class OllamaAdapter extends LLMClientAdapter {
  constructor(options = {}) {
    super();
    this.baseUrl = options.baseUrl || config.ollama?.baseUrl || 'http://localhost:11434';
    this.defaultOptions = options.options || config.ollama?.options || {};
    this.client = options.client || new Ollama({ host: this.baseUrl });
  }

  async generate({ model, prompt, options = {}, stream = false }) {
    return await this.client.generate({
      model,
      prompt,
      options: { ...this.defaultOptions, ...options },
      stream
    });
  }

  async listModels() {
    return await this.client.list();
  }
}
