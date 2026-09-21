import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ResearchAgent } from '../agents/research-agent.js';

describe('ResearchAgent Compatibility', () => {
  const agent = new ResearchAgent();

  it('should instantiate', () => {
    assert.ok(agent);
  });

  it('should have checkConnection method', () => {
    assert.equal(typeof agent.checkConnection, 'function');
  });

  it('should have analyzeResearchTopic method', () => {
    assert.equal(typeof agent.analyzeResearchTopic, 'function');
  });

  it('should have conductResearch method', () => {
    assert.equal(typeof agent.conductResearch, 'function');
  });
});
