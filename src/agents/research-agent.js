import { Ollama } from 'ollama';
import { config, researchModes } from '../config.js';
import { Logger, Spinner, Formatter, TextProcessor, Timer } from '../utils/helpers.js';
import { getPrompt } from '../prompts/templates.js';

export class ResearchAgent {
  constructor(options = {}) {
    this.ollama = new Ollama({ 
      host: options.baseUrl || config.ollama.baseUrl 
    });
    this.model = options.model || config.ollama.model;
    this.timer = new Timer();
  }
  async checkConnection() {
    try {
      const response = await Promise.race([
        this.ollama.list(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        )
      ]);
      
      const hasModel = response.models.some(m => m.name.includes(this.model.split(':')[0]));
      
      if (!hasModel) {
        Logger.warning(`Model ${this.model} not found. Available models:`);
        response.models.forEach(m => console.log(`  • ${m.name}`));
        return false;
      }
      
      return true;
    } catch (error) {
      if (error.message === 'Timeout') {
        Logger.error('Connection to Ollama timed out');
      } else {
        Logger.error('Cannot connect to Ollama. Make sure it\'s running on ' + config.ollama.baseUrl);
      }
      return false;
    }
  }

  async analyzeResearchTopic(topic, mode = 'COMPREHENSIVE') {
    const spinner = new Spinner('Analyzing research topic...').start();
    
    try {
      const modeConfig = researchModes[mode];
      const prompt = getPrompt('topicAnalysis', { 
        topic, 
        mode: modeConfig.description 
      });

      const response = await this.ollama.generate({
        model: this.model,
        prompt,
        options: config.ollama.options,
        stream: false
      });

      spinner.succeed('Topic analysis complete');

      // Try to parse JSON response
      try {
        const jsonMatch = response.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        Logger.warning('Could not parse structured response, using fallback');
      }

      // Fallback parsing
      return this.parseTopicAnalysisFallback(response.response, topic);

    } catch (error) {
      spinner.fail('Failed to analyze topic');
      throw error;
    }
  }

  parseTopicAnalysisFallback(text, topic) {
    const lines = text.split('\n').filter(line => line.trim());
    
    return {
      overview: `Research analysis for: ${topic}`,
      subtopics: [
        {
          title: "Core Concepts",
          description: "Fundamental principles and definitions",
          questions: ["What are the key concepts?", "How is this defined?"]
        },
        {
          title: "Current State",
          description: "Present situation and recent developments",
          questions: ["What is the current state?", "What are recent developments?"]
        },
        {
          title: "Applications & Impact",
          description: "Practical applications and real-world impact",
          questions: ["How is this applied?", "What is the impact?"]
        },
        {
          title: "Future Outlook",
          description: "Trends, predictions, and future directions",
          questions: ["What are the trends?", "What does the future hold?"]
        }
      ],
      mainQuestions: [
        `What are the key aspects of ${topic}?`,
        `Why is ${topic} important?`,
        `What are the main challenges?`
      ]
    };
  }

  async conductResearch(topic, subtopics, mode = 'COMPREHENSIVE') {
    const results = {};
    const total = subtopics.length;

    Logger.title(`🔍 Conducting ${researchModes[mode].name}`);

    for (let i = 0; i < subtopics.length; i++) {
      const subtopic = subtopics[i];
      const spinner = new Spinner(
        `Researching ${subtopic.title} (${i + 1}/${total})...`
      ).start();

      try {
        const prompt = getPrompt('researchContent', {
          mainTopic: topic,
          subtopic: subtopic.title,
          description: subtopic.description,
          questions: subtopic.questions.join(', ')
        });

        const response = await this.ollama.generate({
          model: this.model,
          prompt,
          options: {
            ...config.ollama.options,
            num_predict: researchModes[mode].depth === 'high' ? 3000 : 2000
          },
          stream: false
        });

        results[subtopic.title] = {
          content: response.response,
          description: subtopic.description,
          questions: subtopic.questions
        };

        spinner.succeed(`Completed: ${subtopic.title}`);
        
        // Small delay to prevent overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        spinner.fail(`Failed: ${subtopic.title}`);
        Logger.error(`Error researching ${subtopic.title}: ${error.message}`);
        
        // Continue with other subtopics
        results[subtopic.title] = {
          content: `Research failed for this subtopic: ${error.message}`,
          description: subtopic.description,
          questions: subtopic.questions
        };
      }
    }

    return results;
  }

  async generateFollowUpQuestions(topic, researchSummary) {
    const spinner = new Spinner('Generating follow-up questions...').start();

    try {
      const prompt = getPrompt('followUpQuestions', {
        topic,
        summary: researchSummary
      });

      const response = await this.ollama.generate({
        model: this.model,
        prompt,
        options: config.ollama.options,
        stream: false
      });

      spinner.succeed('Follow-up questions generated');

      // Extract questions from response
      const questions = response.response
        .split('\n')
        .filter(line => line.trim())
        .filter(line => line.includes('?'))
        .map(line => line.replace(/^\d+\.?\s*/, '').trim())
        .slice(0, 7);

      return questions.length > 0 ? questions : [
        `What are the practical implications of ${topic}?`,
        `How might ${topic} evolve in the next 5 years?`,
        `What are the main challenges in ${topic}?`
      ];

    } catch (error) {
      spinner.fail('Failed to generate follow-up questions');
      return [`Further research needed on ${topic}`];
    }
  }

  async synthesizeFindings(topic, researchResults) {
    const spinner = new Spinner('Synthesizing research findings...').start();

    try {
      // Combine all research content
      const sections = Object.entries(researchResults)
        .map(([title, data]) => `## ${title}\n${data.content}`)
        .join('\n\n');

      const prompt = getPrompt('synthesisPrompt', {
        topic,
        sections
      });

      const response = await this.ollama.generate({
        model: this.model,
        prompt,
        options: {
          ...config.ollama.options,
          num_predict: 2500
        },
        stream: false
      });

      spinner.succeed('Research synthesis complete');
      return response.response;

    } catch (error) {
      spinner.fail('Failed to synthesize findings');
      throw error;
    }
  }

  async createExecutiveSummary(topic, fullResearch) {
    const spinner = new Spinner('Creating executive summary...').start();

    try {
      const prompt = getPrompt('executiveSummary', {
        topic,
        fullResearch
      });

      const response = await this.ollama.generate({
        model: this.model,
        prompt,
        options: {
          ...config.ollama.options,
          num_predict: 1500
        },
        stream: false
      });

      spinner.succeed('Executive summary created');
      return response.response;

    } catch (error) {
      spinner.fail('Failed to create executive summary');
      return `Executive Summary for ${topic}\n\nDetailed research findings are available in the full report below.`;
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
