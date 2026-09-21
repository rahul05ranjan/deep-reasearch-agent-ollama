#!/usr/bin/env node

import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import { ResearchEngine } from './engine/research-engine.js';
import { Logger, Formatter, Spinner } from './utils/helpers.js';
import { researchModes } from './config.js';
import type {
  ResearchReport,
  TopicAnalysis,
  ResearchResults,
  ResearchMode,
  ProgressEvent,
  ResearchPerformanceStats
} from './contracts/schemas.js';

export interface SmartResearchAssistantOptions {
  engine?: ResearchEngine;
  silent?: boolean;
}

export interface InteractiveAnswers {
  topic: string;
  mode: ResearchMode;
  includeFollowups: boolean;
  includeSynthesis: boolean;
}

export class SmartResearchAssistant {
  engine: ResearchEngine;
  silent: boolean;
  spinner: Spinner | null;

  constructor(options: SmartResearchAssistantOptions = {}) {
    this.engine = options.engine || new ResearchEngine();
    this.silent = options.silent || false;
    this.spinner = null;
  }

  async initialize(): Promise<boolean> {
    this.showWelcome();
    Logger.info(`LLM Base URL: ${(this.engine.llm as unknown as { baseUrl?: string })?.baseUrl || 'http://localhost:11434'}`);
    Logger.info('Standard instructions:');
    Logger.info('1. Make sure Ollama is running: ollama serve');
    Logger.info('2. Install a model: ollama pull llama3.1');
    Logger.info('3. Run demo: npm run demo');
    Logger.info('4. Start researching: npm start');

    const spinner = new Spinner('Connecting to Ollama...').start();
    const connected = await this.engine.checkConnection();

    if (!connected) {
      spinner.fail('Connection failed');
      Logger.error('Please ensure Ollama is running and you have the required model installed.');
      Logger.info('To install a model, run: ollama pull llama3.1');
      process.exit(1);
    }

    spinner.succeed('Connected to Ollama successfully');
    return true;
  }

  showWelcome(): void {
    if (this.silent) return;
    const welcome = `
🤖 Smart Research Assistant
Powered by Ollama.js + Deep Architecture

Your AI-powered research companion for comprehensive topic analysis.
    `;
    console.log(Formatter.box(welcome.trim(), '🚀 Welcome'));
  }

  createProgressHandler(): (event: ProgressEvent) => void {
    if (this.silent) {
      return () => {};
    }

    return (event: ProgressEvent) => {
      switch (event.stage) {
        case 'topic-analysis:start':
          this.spinner = new Spinner(event.message || 'Analyzing research topic...').start();
          break;
        case 'topic-analysis:done':
          this.spinner?.succeed(event.message || 'Topic analysis complete');
          break;
        case 'subtopics:start':
          Logger.title(`🔍 Conducting Research`);
          break;
        case 'subtopic:start':
          this.spinner = new Spinner(event.message || `Researching ${event.subtopic || 'subtopic'}...`).start();
          break;
        case 'subtopic:done':
          this.spinner?.succeed(event.message || `Completed: ${event.subtopic || 'subtopic'}`);
          break;
        case 'subtopic:error':
          this.spinner?.fail(`Failed: ${event.subtopic || 'subtopic'}`);
          break;
        case 'synthesis:start':
          this.spinner = new Spinner(event.message || 'Synthesizing research findings...').start();
          break;
        case 'synthesis:done':
          this.spinner?.succeed(event.message || 'Research synthesis complete');
          break;
        case 'followups:start':
          this.spinner = new Spinner(event.message || 'Generating follow-up questions...').start();
          break;
        case 'followups:done':
          this.spinner?.succeed(event.message || 'Follow-up questions generated');
          break;
        case 'executive-summary:start':
          this.spinner = new Spinner(event.message || 'Creating executive summary...').start();
          break;
        case 'executive-summary:done':
          this.spinner?.succeed(event.message || 'Executive summary complete');
          break;
        case 'complete':
          break;
      }
    };
  }

  async getResearchInput(): Promise<InteractiveAnswers> {
    const questions = [
      {
        type: 'input',
        name: 'topic',
        message: 'What topic would you like to research?',
        validate: (input: string) => input.trim().length > 0 || 'Please enter a research topic'
      },
      {
        type: 'list',
        name: 'mode',
        message: 'Select research mode:',
        choices: Object.entries(researchModes).map(([key, mode]) => ({
          name: `${mode.name} - ${mode.description}`,
          value: key
        }))
      },
      {
        type: 'confirm',
        name: 'includeFollowups',
        message: 'Include follow-up questions?',
        default: true
      },
      {
        type: 'confirm',
        name: 'includeSynthesis',
        message: 'Include research synthesis?',
        default: true
      }
    ];

    return await inquirer.prompt(questions) as InteractiveAnswers;
  }

  displayAllResults(results: ResearchReport): void {
    if (this.silent) return;

    if (results.analysis) {
      this.displayTopicAnalysis(results.analysis);
    }
    if (results.researchResults) {
      this.displayResearchResults(results.researchResults);
    }
    if (results.synthesis) {
      this.displaySynthesis(results.synthesis);
    }
    if (results.followupQuestions) {
      this.displayFollowUpQuestions(results.followupQuestions);
    }
    if (results.executiveSummary) {
      this.displayExecutiveSummary(results.executiveSummary);
    }
    if (results.performanceStats) {
      this.displayPerformanceStats(results.performanceStats);
    }
  }

  displayTopicAnalysis(analysis: TopicAnalysis): void {
    console.log(Formatter.section('📋 Topic Analysis', analysis.overview));
    console.log(Formatter.highlight('🎯 Research Subtopics:', 'cyan'));
    (analysis.subtopics || []).forEach((subtopic, index) => {
      console.log(`\n${index + 1}. ${Formatter.highlight(subtopic.title, 'white' as any)}`);
      console.log(`   ${Formatter.dim(subtopic.description)}`);
      console.log(`   ${Formatter.dim('Questions: ' + (subtopic.questions || []).join(', '))}`);
    });
    console.log(`\n${Formatter.highlight('🔍 Key Research Questions:', 'cyan')}`);
    console.log(Formatter.list(analysis.mainQuestions || []));
  }

  displayResearchResults(results: ResearchResults): void {
    console.log(Formatter.section('📖 Research Findings', ''));
    Object.entries(results).forEach(([title, data]) => {
      console.log(Formatter.highlight(`\n━━━ ${title} ━━━`, 'blue'));
      console.log(data.content);
    });
  }

  displaySynthesis(synthesis: string): void {
    console.log(Formatter.section('🧠 Research Synthesis', synthesis));
  }

  displayFollowUpQuestions(questions: string[]): void {
    console.log(Formatter.section('❓ Follow-up Questions', Formatter.list(questions, true)));
  }

  displayExecutiveSummary(summary: string): void {
    console.log(Formatter.box(summary, '📋 Executive Summary'));
  }

  displayPerformanceStats(stats: ResearchPerformanceStats): void {
    const statsText = `
Model: ${stats.model}
Total Time: ${stats.totalTime}
Completed: ${stats.timestamp}
    `.trim();
    console.log(Formatter.box(statsText, '⚡ Performance Stats'));
  }

  async askForAnotherResearch(): Promise<boolean> {
    const { another } = await inquirer.prompt<{ another: boolean }>([
      {
        type: 'confirm',
        name: 'another',
        message: 'Would you like to research another topic?',
        default: false
      }
    ]);
    return Boolean(another);
  }

  async run(args: string[] = process.argv.slice(2)): Promise<ResearchReport | undefined> {
    try {
      // 1. Demo Mode (--demo flag)
      if (args.includes('--demo')) {
        this.showWelcome();
        const topic = 'Artificial Intelligence in Healthcare';
        if (!this.silent) {
          Logger.title('🚀 Smart Research Assistant Demo');
          Logger.info(`📋 Demo Topic: ${Formatter.highlight(topic)}`);
        }
        const results = await this.engine.executeResearch(topic, {
          mode: 'QUICK',
          onProgress: this.createProgressHandler()
        });
        this.displayAllResults(results);
        if (!this.silent) {
          Logger.success(`⚡ Demo completed in ${results.performanceStats.totalTime}`);
        }
        return results;
      }

      // 2. One-shot Quick Research via Command Line Arguments
      const filteredArgs = args.filter((a) => !a.startsWith('--'));
      if (filteredArgs.length > 0) {
        const topic = filteredArgs.join(' ');
        this.showWelcome();
        if (!this.silent) {
          Logger.title(`🚀 Quick Research: ${Formatter.highlight(topic)}`);
        }
        const results = await this.engine.executeResearch(topic, {
          mode: 'QUICK',
          onProgress: this.createProgressHandler()
        });
        this.displayAllResults(results);
        if (!this.silent) {
          Logger.success(`Research completed in ${results.performanceStats.totalTime}`);
        }
        return results;
      }

      // 3. Interactive Wizard (No Arguments)
      await this.initialize();
      let continueResearch = true;

      while (continueResearch) {
        const options = await this.getResearchInput();
        if (!this.silent) {
          Logger.title(`📊 Research Report: ${Formatter.highlight(options.topic)}`);
        }

        const results = await this.engine.executeResearch(options.topic, {
          mode: options.mode,
          includeFollowups: options.includeFollowups,
          includeSynthesis: options.includeSynthesis,
          onProgress: this.createProgressHandler()
        });

        this.displayAllResults(results);
        continueResearch = await this.askForAnotherResearch();
      }

      Logger.success('Thank you for using Smart Research Assistant! 🎉');
      return undefined;

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      Logger.error(`Application error: ${message}`);
      if (!this.silent) {
        process.exit(1);
      }
      throw error;
    }
  }
}

// Run the application directly when executed as a script
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const app = new SmartResearchAssistant();
  app.run().catch(console.error);
}
