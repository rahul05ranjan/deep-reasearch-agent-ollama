import { ResearchAgent } from '../agents/research-agent.js';

describe('ResearchAgent', () => {
  let agent;
  beforeAll(() => {
    agent = new ResearchAgent();
  });

  test('should instantiate', () => {
    expect(agent).toBeDefined();
  });

  test('should have checkConnection method', () => {
    expect(typeof agent.checkConnection).toBe('function');
  });

  test('should have analyzeResearchTopic method', () => {
    expect(typeof agent.analyzeResearchTopic).toBe('function');
  });

  test('should have conductResearch method', () => {
    expect(typeof agent.conductResearch).toBe('function');
  });
});
