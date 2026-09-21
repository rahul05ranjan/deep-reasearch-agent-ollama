import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ResearchEngine } from '../engine/research-engine.js';
import { FakeLLMAdapter } from '../adapters/llm-client.js';

describe('ResearchEngine Seam', () => {
  const sampleTopicAnalysis = JSON.stringify({
    overview: 'AI in healthcare is transforming medicine.',
    subtopics: [
      {
        title: 'Diagnostic Imaging',
        description: 'Using deep learning for radiology.',
        questions: ['How accurate is AI imaging?']
      },
      {
        title: 'Drug Discovery',
        description: 'Accelerating molecular screening.',
        questions: ['Can AI shorten discovery timelines?']
      }
    ],
    mainQuestions: ['What are the key benefits of AI in health?']
  });

  it('executes complete research workflow end-to-end and returns structured results', async () => {
    const fakeLLM = new FakeLLMAdapter({
      responses: [
        sampleTopicAnalysis, // Topic analysis
        'Diagnostic imaging uses CNNs to identify tumors.', // Subtopic 1
        'Drug discovery utilizes generative models for molecules.', // Subtopic 2
        'Synthesis: AI significantly enhances healthcare diagnostic and discovery speed.', // Synthesis
        '1. What are FDA regulations?\n2. What are ethical concerns in AI medicine?', // Follow-up questions
        'Executive Summary: AI in healthcare improves both diagnostics and pharmaceuticals.' // Executive summary
      ]
    });

    const engine = new ResearchEngine({
      llmClient: fakeLLM,
      model: 'test-model'
    });

    const result = await engine.executeResearch('AI in Healthcare', {
      mode: 'QUICK'
    });

    assert.equal(result.topic, 'AI in Healthcare');
    assert.equal(result.mode, 'QUICK');
    assert.equal(result.analysis.overview, 'AI in healthcare is transforming medicine.');
    assert.equal(result.analysis.subtopics.length, 2);
    assert.ok(result.researchResults['Diagnostic Imaging']);
    assert.ok(result.researchResults['Drug Discovery']);
    assert.ok(result.synthesis.includes('Synthesis:'));
    assert.ok(Array.isArray(result.followupQuestions));
    assert.ok(result.followupQuestions.length > 0);
    assert.ok(result.executiveSummary.includes('Executive Summary'));
    assert.ok(result.performanceStats);
    assert.equal(result.performanceStats.model, 'test-model');
  });

  it('emits lifecycle progress events through onProgress callback', async () => {
    const fakeLLM = new FakeLLMAdapter({
      responses: [
        sampleTopicAnalysis,
        'Content 1',
        'Content 2',
        'Synthesis content',
        '1. Question 1?\n2. Question 2?',
        'Executive Summary content'
      ]
    });

    const events = [];
    const engine = new ResearchEngine({ llmClient: fakeLLM });

    await engine.executeResearch('AI in Healthcare', {
      mode: 'QUICK',
      onProgress: (event) => events.push(event)
    });

    const stages = events.map((e) => e.stage);
    assert.ok(stages.includes('topic-analysis:start'));
    assert.ok(stages.includes('topic-analysis:done'));
    assert.ok(stages.includes('subtopics:start'));
    assert.ok(stages.includes('subtopic:done'));
    assert.ok(stages.includes('synthesis:done'));
    assert.ok(stages.includes('followups:done'));
    assert.ok(stages.includes('executive-summary:done'));
    assert.ok(stages.includes('complete'));
  });

  it('falls back gracefully when topic analysis is plain text instead of JSON', async () => {
    const fakeLLM = new FakeLLMAdapter({
      responses: [
        'Here is some unstructured text that is not valid JSON at all.',
        'Subtopic content',
        'Subtopic content 2',
        'Subtopic content 3',
        'Subtopic content 4',
        'Synthesis',
        '1. Followup question?',
        'Executive summary'
      ]
    });

    const engine = new ResearchEngine({ llmClient: fakeLLM });
    const result = await engine.executeResearch('Quantum Computing');

    assert.ok(result.analysis.overview.includes('Quantum Computing'));
    assert.ok(result.analysis.subtopics.length > 0);
    assert.ok(result.analysis.mainQuestions.length > 0);
  });

  it('respects includeFollowups: false and includeSynthesis: false options', async () => {
    const fakeLLM = new FakeLLMAdapter({
      responses: [
        sampleTopicAnalysis,
        'Subtopic content 1',
        'Subtopic content 2',
        'Executive summary content'
      ]
    });

    const engine = new ResearchEngine({ llmClient: fakeLLM });
    const result = await engine.executeResearch('AI in Healthcare', {
      includeFollowups: false,
      includeSynthesis: false
    });

    assert.equal(result.synthesis, null);
    assert.equal(result.followupQuestions, null);
    assert.ok(result.executiveSummary);
  });

  it('handles subtopic query failure gracefully without failing the entire research', async () => {
    let callCount = 0;
    const fakeLLM = new FakeLLMAdapter({
      handler: async () => {
        callCount++;
        if (callCount === 1) return sampleTopicAnalysis;
        if (callCount === 2) throw new Error('Subtopic connection dropped');
        return 'Healthy content';
      }
    });

    const engine = new ResearchEngine({ llmClient: fakeLLM });
    const result = await engine.executeResearch('AI in Healthcare', {
      mode: 'QUICK'
    });

    assert.ok(result.researchResults['Diagnostic Imaging'].content.includes('failed for this subtopic'));
    assert.equal(result.researchResults['Drug Discovery'].content, 'Healthy content');
  });

  it('verifies connection status with checkConnection', async () => {
    const connectedLLM = new FakeLLMAdapter({
      models: [{ name: 'qwen2.5-coder:0.5b' }]
    });
    const disconnectedLLM = new FakeLLMAdapter({
      models: [{ name: 'unrelated-model:latest' }]
    });

    const engine1 = new ResearchEngine({
      llmClient: connectedLLM,
      model: 'qwen2.5-coder:0.5b'
    });
    const engine2 = new ResearchEngine({
      llmClient: disconnectedLLM,
      model: 'qwen2.5-coder:0.5b'
    });

    assert.equal(await engine1.checkConnection(), true);
    assert.equal(await engine2.checkConnection(), false);
  });

  it('strips extra keys from topic-analysis JSON', async () => {
    const jsonWithExtra = JSON.stringify({
      overview: 'Overview text',
      extraField: 'unexpected',
      subtopics: [
        {
          title: 'Diagnostic Imaging',
          description: 'Using deep learning for radiology.',
          questions: ['How accurate is AI imaging?'],
          rogueKey: 'should be stripped'
        }
      ],
      mainQuestions: ['What are the key benefits?']
    });

    const fakeLLM = new FakeLLMAdapter({
      responses: [
        jsonWithExtra,
        'Imaging content',
        'Synthesis',
        '1. Followup?',
        'Summary'
      ]
    });

    const engine = new ResearchEngine({ llmClient: fakeLLM });
    const result = await engine.executeResearch('AI in Healthcare', { mode: 'QUICK' });

    assert.equal(result.analysis.overview, 'Overview text');
    assert.equal('extraField' in result.analysis, false);
    assert.equal('rogueKey' in result.analysis.subtopics[0], false);
  });

  it('falls back when topic-analysis JSON is missing subtopics', async () => {
    const jsonWithoutSubtopics = JSON.stringify({
      overview: 'Missing subtopics',
      mainQuestions: ['Where are subtopics?']
    });

    const fakeLLM = new FakeLLMAdapter({
      responses: [
        jsonWithoutSubtopics,
        'Content 1',
        'Content 2',
        'Content 3',
        'Content 4',
        'Synthesis',
        '1. Followup?',
        'Summary'
      ]
    });

    const engine = new ResearchEngine({ llmClient: fakeLLM });
    const result = await engine.executeResearch('Fallback Topic');

    assert.equal(result.analysis.subtopics.length, 4);
    assert.deepEqual(
      result.analysis.subtopics.map((s) => s.title),
      ['Core Concepts', 'Current State', 'Applications & Impact', 'Future Outlook']
    );
  });

  it('falls back when a subtopic title is empty', async () => {
    const jsonWithEmptyTitle = JSON.stringify({
      overview: 'Empty title test',
      subtopics: [
        {
          title: '   ',
          description: 'Empty title description',
          questions: ['Question?']
        }
      ],
      mainQuestions: ['Main question?']
    });

    const fakeLLM = new FakeLLMAdapter({
      responses: [
        jsonWithEmptyTitle,
        'Content 1',
        'Content 2',
        'Content 3',
        'Content 4',
        'Synthesis',
        '1. Followup?',
        'Summary'
      ]
    });

    const engine = new ResearchEngine({ llmClient: fakeLLM });
    const result = await engine.executeResearch('Empty Title Topic');

    assert.equal(result.analysis.subtopics.length, 4);
    assert.deepEqual(
      result.analysis.subtopics.map((s) => s.title),
      ['Core Concepts', 'Current State', 'Applications & Impact', 'Future Outlook']
    );
  });
});
