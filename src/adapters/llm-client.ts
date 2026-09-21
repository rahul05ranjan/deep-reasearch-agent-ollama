import { Ollama } from 'ollama';
import { config } from '../config.js';

export interface GenerateParams {
  model?: string;
  prompt: string;
  options?: Record<string, unknown>;
  stream?: boolean;
}

export interface GenerateResult {
  response: string;
}

export interface ModelInfo {
  name: string;
  size?: number;
  modified_at?: string;
  modified?: string;
}

export interface ListModelsResult {
  models: ModelInfo[];
}

/**
 * Base abstract adapter class defining the LLM Client Seam interface.
 */
export abstract class LLMClientAdapter {
  abstract generate(params: GenerateParams): Promise<GenerateResult>;
  abstract listModels(): Promise<ListModelsResult>;
}

export interface FakeLLMAdapterOptions {
  defaultResponse?: string;
  responses?: string[];
  handler?: ((params: GenerateParams) => Promise<string | GenerateResult> | string | GenerateResult) | null;
  models?: ModelInfo[];
}

/**
 * In-memory fake LLM client adapter for deterministic testing.
 */
export class FakeLLMAdapter extends LLMClientAdapter {
  defaultResponse: string;
  responses: string[];
  handler: ((params: GenerateParams) => Promise<string | GenerateResult> | string | GenerateResult) | null;
  models: ModelInfo[];
  calls: GenerateParams[];

  constructor(options: FakeLLMAdapterOptions = {}) {
    super();
    this.defaultResponse = options.defaultResponse ?? '';
    this.responses = options.responses ? [...options.responses] : [];
    this.handler = options.handler || null;
    this.models = options.models || [{ name: 'fake-model:latest', size: 1000 }];
    this.calls = [];
  }

  async generate(params: GenerateParams): Promise<GenerateResult> {
    this.calls.push(params);

    if (this.handler) {
      const handled = await this.handler(params);
      return typeof handled === 'string' ? { response: handled } : handled;
    }

    if (this.responses.length > 0) {
      const next = this.responses.shift()!;
      return typeof next === 'string' ? { response: next } : next;
    }

    return { response: this.defaultResponse };
  }

  async listModels(): Promise<ListModelsResult> {
    return { models: this.models };
  }
}

export interface OllamaAdapterOptions {
  baseUrl?: string;
  options?: Record<string, unknown>;
  client?: Ollama | any;
}

/**
 * Production Ollama client adapter wrapping the official Ollama SDK.
 */
export class OllamaAdapter extends LLMClientAdapter {
  baseUrl: string;
  defaultOptions: Record<string, unknown>;
  client: Ollama;

  constructor(options: OllamaAdapterOptions = {}) {
    super();
    this.baseUrl = options.baseUrl || config.ollama?.baseUrl || 'http://localhost:11434';
    this.defaultOptions = options.options || (config.ollama?.options as Record<string, unknown>) || {};
    this.client = options.client || new Ollama({ host: this.baseUrl });
  }

  async generate({ model, prompt, options = {}, stream = false }: GenerateParams): Promise<GenerateResult> {
    const res = await this.client.generate({
      model: model || config.ollama?.model || 'qwen2.5-coder:0.5b',
      prompt,
      options: { ...this.defaultOptions, ...options },
      stream: stream as false
    });
    return { response: res.response };
  }

  async listModels(): Promise<ListModelsResult> {
    const res = await this.client.list();
    return {
      models: (res.models || []).map((m) => ({
        name: m.name,
        size: m.size,
        modified_at: m.modified_at instanceof Date ? m.modified_at.toISOString() : String(m.modified_at || '')
      }))
    };
  }
}
