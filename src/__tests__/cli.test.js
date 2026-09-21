import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SmartResearchAssistant } from '../index.js';
import { FakeLLMAdapter } from '../adapters/llm-client.js';
import { ResearchEngine } from '../engine/research-engine.js';

describe('CLI SmartResearchAssistant Seam', () => {
  const sampleTopicAnalysis = JSON.stringify({
    overview: 'Quantum computing uses quantum mechanics.',
    subtopics: [
      {
        title: 'Qubits and Superposition',
        description: 'Basic computational units',
        questions: ['What is superposition?']
      }
    ],
    mainQuestions: ['How will quantum computers impact cryptography?']
  });

  function createTestEngine() {
    const fakeLLM = new FakeLLMAdapter({
      responses: [
        sampleTopicAnalysis,
        'Qubits can exist in multiple states simultaneously.',
        'Synthesis: Quantum computing promises exponential speedup.',
        '1. When will fault-tolerant quantum computers arrive?',
        'Executive Summary: Quantum computing leverages quantum principles.'
      ],
      models: [{ name: 'qwen2.5-coder:0.5b' }]
    });

    return new ResearchEngine({
      llmClient: fakeLLM,
      model: 'qwen2.5-coder:0.5b'
    });
  }

  it('runs one-shot research directly from command line arguments', async () => {
    const engine = createTestEngine();
    let executedTopic = null;
    let executedOptions = null;

    const originalExecute = engine.executeResearch.bind(engine);
    engine.executeResearch = async (topic, options) => {
      executedTopic = topic;
      executedOptions = options;
      return await originalExecute(topic, options);
    };

    const app = new SmartResearchAssistant({ engine, silent: true });
    await app.run(['Quantum Computing']);

    assert.equal(executedTopic, 'Quantum Computing');
    assert.ok(executedOptions);
    assert.equal(executedOptions.mode, 'QUICK');
  });

  it('runs demo research when --demo argument is passed', async () => {
    const engine = createTestEngine();
    let executedTopic = null;
    let executedMode = null;

    const originalExecute = engine.executeResearch.bind(engine);
    engine.executeResearch = async (topic, options) => {
      executedTopic = topic;
      executedMode = options?.mode;
      return await originalExecute(topic, options);
    };

    const app = new SmartResearchAssistant({ engine, silent: true });
    await app.run(['--demo']);

    assert.equal(executedTopic, 'Artificial Intelligence in Healthcare');
    assert.equal(executedMode, 'QUICK');
  });

  it('hooks progress events to terminal spinner without error', async () => {
    const engine = createTestEngine();
    const app = new SmartResearchAssistant({ engine, silent: true });

    // Verify progress handler works across all lifecycle stages
    const handler = app.createProgressHandler();
    assert.equal(typeof handler, 'function');

    assert.doesNotThrow(() => {
      handler({ stage: 'topic-analysis:start', message: 'Analyzing...' });
      handler({ stage: 'topic-analysis:done', message: 'Done' });
      handler({ stage: 'subtopics:start', totalSteps: 2 });
      handler({ stage: 'subtopic:start', step: 1, totalSteps: 2, title: 'Qubits' });
      handler({ stage: 'subtopic:done', step: 1, totalSteps: 2, title: 'Qubits' });
      handler({ stage: 'synthesis:start' });
      handler({ stage: 'synthesis:done' });
      handler({ stage: 'followups:start' });
      handler({ stage: 'followups:done' });
      handler({ stage: 'executive-summary:start' });
      handler({ stage: 'executive-summary:done' });
      handler({ stage: 'complete' });
    });
  });
});
