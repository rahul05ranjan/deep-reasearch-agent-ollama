import { config, researchModes } from '../config.js';
import { OllamaAdapter } from '../adapters/llm-client.js';
import { getPrompt } from '../prompts/templates.js';
import { Timer } from '../utils/helpers.js';
import { TopicAnalysisSchema } from '../contracts/schemas.js';

/**
 * Deep, headless research engine consolidating research pipeline execution.
 */
export class ResearchEngine {
  constructor(options = {}) {
    this.llm = options.llmClient || new OllamaAdapter({
      baseUrl: options.baseUrl || config.ollama?.baseUrl,
      options: options.options || config.ollama?.options
    });
    this.model = options.model || config.ollama?.model || 'qwen2.5-coder:0.5b';
    this.timer = new Timer();
  }

  /**
   * Check connection to the LLM backend.
   * @returns {Promise<boolean>}
   */
  async checkConnection() {
    try {
      const response = await Promise.race([
        this.llm.listModels(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ]);

      const models = response.models || [];
      const modelPrefix = this.model.split(':')[0];
      return models.some((m) => m.name && m.name.includes(modelPrefix));
    } catch {
      return false;
    }
  }

  /**
   * Execute complete research workflow across the topic.
   * @param {string} topic
   * @param {Object} [options]
   * @param {string} [options.mode='COMPREHENSIVE']
   * @param {boolean} [options.includeFollowups=true]
   * @param {boolean} [options.includeSynthesis=true]
   * @param {boolean} [options.includeExecutiveSummary=true]
   * @param {Function} [options.onProgress]
   * @returns {Promise<Object>}
   */
  async executeResearch(topic, options = {}) {
    const mode = options.mode || 'COMPREHENSIVE';
    const modeConfig = researchModes[mode] || researchModes.COMPREHENSIVE;
    const includeFollowups = options.includeFollowups !== false;
    const includeSynthesis = options.includeSynthesis !== false;
    const includeExecutiveSummary = options.includeExecutiveSummary !== false;
    const onProgress = typeof options.onProgress === 'function' ? options.onProgress : () => {};

    // 1. Topic Analysis
    onProgress({ stage: 'topic-analysis:start', message: 'Analyzing research topic...' });
    const analysis = await this.analyzeTopic(topic, modeConfig);
    onProgress({ stage: 'topic-analysis:done', message: 'Topic analysis complete', data: analysis });

    // 2. Subtopic Queries
    onProgress({
      stage: 'subtopics:start',
      totalSteps: analysis.subtopics.length,
      message: `Researching ${analysis.subtopics.length} subtopics...`
    });
    const researchResults = await this.researchSubtopics(topic, analysis.subtopics, modeConfig, onProgress);

    // 3. Synthesis
    let synthesis = null;
    if (includeSynthesis) {
      onProgress({ stage: 'synthesis:start', message: 'Synthesizing research findings...' });
      synthesis = await this.synthesizeFindings(topic, researchResults);
      onProgress({ stage: 'synthesis:done', message: 'Research synthesis complete' });
    }

    // 4. Follow-up Questions
    let followupQuestions = null;
    if (includeFollowups) {
      onProgress({ stage: 'followups:start', message: 'Generating follow-up questions...' });
      const summaryContext = synthesis || Object.values(researchResults).map((r) => r.content).join('\n\n');
      followupQuestions = await this.generateFollowUpQuestions(topic, summaryContext);
      onProgress({ stage: 'followups:done', message: 'Follow-up questions generated' });
    }

    // 5. Executive Summary
    let executiveSummary = null;
    if (includeExecutiveSummary) {
      onProgress({ stage: 'executive-summary:start', message: 'Creating executive summary...' });
      const fullResearch = Object.entries(researchResults)
        .map(([title, data]) => `${title}: ${data.content}`)
        .join('\n\n');
      executiveSummary = await this.createExecutiveSummary(topic, fullResearch);
      onProgress({ stage: 'executive-summary:done', message: 'Executive summary complete' });
    }

    onProgress({ stage: 'complete', message: 'Research workflow complete' });

    return {
      topic,
      mode,
      analysis,
      researchResults,
      synthesis,
      followupQuestions,
      executiveSummary,
      performanceStats: this.getPerformanceStats()
    };
  }

  async analyzeTopic(topic, modeConfig) {
    const prompt = getPrompt('topicAnalysis', {
      topic,
      mode: modeConfig?.description || 'Deep dive into all aspects'
    });

    const response = await this.llm.generate({
      model: this.model,
      prompt,
      options: config.ollama?.options,
      stream: false
    });

    try {
      const jsonMatch = response.response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const rawJson = JSON.parse(jsonMatch[0]);
        const parseResult = TopicAnalysisSchema.safeParse(rawJson);
        if (parseResult.success) {
          return parseResult.data;
        }
      }
    } catch {
      // Fall through to fallback parsing
    }

    return this.parseTopicAnalysisFallback(response.response, topic);
  }

  parseTopicAnalysisFallback(text, topic) {
    return {
      overview: `Research analysis for: ${topic}`,
      subtopics: [
        {
          title: 'Core Concepts',
          description: 'Fundamental principles and definitions',
          questions: ['What are the key concepts?', 'How is this defined?']
        },
        {
          title: 'Current State',
          description: 'Present situation and recent developments',
          questions: ['What is the current state?', 'What are recent developments?']
        },
        {
          title: 'Applications & Impact',
          description: 'Practical applications and real-world impact',
          questions: ['How is this applied?', 'What is the impact?']
        },
        {
          title: 'Future Outlook',
          description: 'Trends, predictions, and future directions',
          questions: ['What are the trends?', 'What does the future hold?']
        }
      ],
      mainQuestions: [
        `What are the key aspects of ${topic}?`,
        `Why is ${topic} important?`,
        `What are the main challenges?`
      ]
    };
  }

  async researchSubtopics(topic, subtopics, modeConfig, onProgress = () => {}) {
    const results = {};
    const total = subtopics.length;

    for (let i = 0; i < subtopics.length; i++) {
      const subtopic = subtopics[i];
      onProgress({
        stage: 'subtopic:start',
        step: i + 1,
        totalSteps: total,
        title: subtopic.title,
        message: `Researching ${subtopic.title} (${i + 1}/${total})...`
      });

      try {
        const prompt = getPrompt('researchContent', {
          mainTopic: topic,
          subtopic: subtopic.title,
          description: subtopic.description,
          questions: (subtopic.questions || []).join(', ')
        });

        const response = await this.llm.generate({
          model: this.model,
          prompt,
          options: {
            ...config.ollama?.options,
            num_predict: modeConfig?.depth === 'high' ? 3000 : 2000
          },
          stream: false
        });

        results[subtopic.title] = {
          content: response.response,
          description: subtopic.description,
          questions: subtopic.questions
        };

        onProgress({
          stage: 'subtopic:done',
          step: i + 1,
          totalSteps: total,
          title: subtopic.title,
          message: `Completed: ${subtopic.title}`
        });
      } catch (error) {
        results[subtopic.title] = {
          content: `Research failed for this subtopic: ${error.message}`,
          description: subtopic.description,
          questions: subtopic.questions
        };

        onProgress({
          stage: 'subtopic:error',
          step: i + 1,
          totalSteps: total,
          title: subtopic.title,
          error: error.message
        });
      }
    }

    return results;
  }

  async synthesizeFindings(topic, researchResults) {
    const sections = Object.entries(researchResults)
      .map(([title, data]) => `## ${title}\n${data.content}`)
      .join('\n\n');

    const prompt = getPrompt('synthesisPrompt', { topic, sections });
    const response = await this.llm.generate({
      model: this.model,
      prompt,
      options: {
        ...config.ollama?.options,
        num_predict: 2500
      },
      stream: false
    });

    return response.response;
  }

  async generateFollowUpQuestions(topic, researchSummary) {
    try {
      const prompt = getPrompt('followUpQuestions', {
        topic,
        summary: researchSummary
      });

      const response = await this.llm.generate({
        model: this.model,
        prompt,
        options: config.ollama?.options,
        stream: false
      });

      const questions = response.response
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.includes('?'))
        .map((l) => l.replace(/^\d+\.?\s*/, '').trim())
        .slice(0, 7);

      return questions.length > 0 ? questions : [
        `What are the practical implications of ${topic}?`,
        `How might ${topic} evolve in the next 5 years?`
      ];
    } catch {
      return [`Further research needed on ${topic}`];
    }
  }

  async createExecutiveSummary(topic, fullResearch) {
    try {
      const prompt = getPrompt('executiveSummary', { topic, fullResearch });
      const response = await this.llm.generate({
        model: this.model,
        prompt,
        options: {
          ...config.ollama?.options,
          num_predict: 1500
        },
        stream: false
      });
      return response.response;
    } catch {
      return `Executive Summary for ${topic}\n\nDetailed research findings are available in the full report.`;
    }
  }

  getPerformanceStats() {
    return {
      totalTime: this.timer.elapsedFormatted(),
      model: this.model,
      timestamp: new Date().toISOString()
    };
  }
}
