import { ResearchAgent } from '../agents/research-agent.js';
import { researchModes } from '../config.js';

describe('SmartResearchAssistant', () => {
  let agent;
  beforeAll(() => {
    agent = new ResearchAgent();
  });

  test('should instantiate ResearchAgent', () => {
    expect(agent).toBeDefined();
  });

  test('should have all research modes', () => {
    expect(Object.keys(researchModes)).toEqual(
      expect.arrayContaining(['COMPREHENSIVE', 'QUICK', 'TECHNICAL', 'COMPARATIVE', 'HISTORICAL'])
    );
  });
});
