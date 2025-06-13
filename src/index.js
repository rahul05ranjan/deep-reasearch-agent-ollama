#!/usr/bin/env node

import inquirer from 'inquirer';
import { ResearchAgent } from './agents/research-agent.js';
import { Logger, Formatter, Spinner } from './utils/helpers.js';
import { config, researchModes } from './config.js';

class SmartResearchAssistant {
  constructor() {
    this.agent = new ResearchAgent();
  }

  async initialize() {
    this.showWelcome();
    
    const spinner = new Spinner('Connecting to Ollama...').start();
    const connected = await this.agent.checkConnection();
    
    if (!connected) {
      spinner.fail('Connection failed');
      Logger.error('Please ensure Ollama is running and you have the required model installed.');
      Logger.info('To install a model, run: ollama pull llama3.1');
      process.exit(1);
    }
    
    spinner.succeed('Connected to Ollama successfully');
    return true;
  }

  showWelcome() {
    const welcome = `
🤖 Smart Research Assistant
Powered by Ollama.js + LangChain.js

Your AI-powered research companion for comprehensive topic analysis.
    `;
    
    console.log(Formatter.box(welcome.trim(), '🚀 Welcome'));
  }

  async getResearchInput() {
    const questions = [
      {
        type: 'input',
        name: 'topic',
        message: 'What topic would you like to research?',
        validate: (input) => input.trim().length > 0 || 'Please enter a research topic'
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

    return await inquirer.prompt(questions);
  }

  async performResearch(options) {
    const { topic, mode, includeFollowups, includeSynthesis } = options;
    
    Logger.title(`📊 Research Report: ${Formatter.highlight(topic)}`);
    
    try {
      // Step 1: Analyze the topic
      Logger.subtitle('Step 1: Analyzing Research Topic');
      const analysis = await this.agent.analyzeResearchTopic(topic, mode);
      
      this.displayTopicAnalysis(analysis);
      
      // Step 2: Conduct detailed research
      Logger.subtitle('Step 2: Conducting Detailed Research');
      const researchResults = await this.agent.conductResearch(
        topic, 
        analysis.subtopics, 
        mode
      );
      
      this.displayResearchResults(researchResults);
      
      // Step 3: Generate synthesis (if requested)
      let synthesis = null;
      if (includeSynthesis) {
        Logger.subtitle('Step 3: Synthesizing Findings');
        synthesis = await this.agent.synthesizeFindings(topic, researchResults);
        this.displaySynthesis(synthesis);
      }
      
      // Step 4: Generate follow-up questions (if requested)
      if (includeFollowups) {
        Logger.subtitle('Step 4: Generating Follow-up Questions');
        const followUps = await this.agent.generateFollowUpQuestions(
          topic, 
          synthesis || Object.values(researchResults).map(r => r.content).join('\n')
        );
        this.displayFollowUpQuestions(followUps);
      }
      
      // Step 5: Create executive summary
      Logger.subtitle('Step 5: Creating Executive Summary');
      const fullResearch = Object.entries(researchResults)
        .map(([title, data]) => `${title}: ${data.content}`)
        .join('\n\n');
      
      const executiveSummary = await this.agent.createExecutiveSummary(topic, fullResearch);
      this.displayExecutiveSummary(executiveSummary);
      
      // Performance stats
      this.displayPerformanceStats();
      
    } catch (error) {
      Logger.error(`Research failed: ${error.message}`);
      throw error;
    }
  }

  displayTopicAnalysis(analysis) {
    console.log(Formatter.section('📋 Topic Analysis', analysis.overview));
    
    console.log(Formatter.highlight('🎯 Research Subtopics:', 'cyan'));
    analysis.subtopics.forEach((subtopic, index) => {
      console.log(`\n${index + 1}. ${Formatter.highlight(subtopic.title, 'white')}`);
      console.log(`   ${Formatter.dim(subtopic.description)}`);
      console.log(`   ${Formatter.dim('Questions: ' + subtopic.questions.join(', '))}`);
    });
    
    console.log(`\n${Formatter.highlight('🔍 Key Research Questions:', 'cyan')}`);
    console.log(Formatter.list(analysis.mainQuestions));
  }

  displayResearchResults(results) {
    console.log(Formatter.section('📖 Research Findings', ''));
    
    Object.entries(results).forEach(([title, data]) => {
      console.log(Formatter.highlight(`\n━━━ ${title} ━━━`, 'blue'));
      console.log(data.content);
    });
  }

  displaySynthesis(synthesis) {
    console.log(Formatter.section('🧠 Research Synthesis', synthesis));
  }

  displayFollowUpQuestions(questions) {
    console.log(Formatter.section(
      '❓ Follow-up Questions', 
      Formatter.list(questions, true)
    ));
  }

  displayExecutiveSummary(summary) {
    console.log(Formatter.box(summary, '📋 Executive Summary'));
  }

  displayPerformanceStats() {
    const stats = this.agent.getPerformanceStats();
    const statsText = `
Model: ${stats.model}
Total Time: ${stats.totalTime}
Completed: ${stats.timestamp}
    `.trim();
    
    console.log(Formatter.box(statsText, '⚡ Performance Stats'));
  }

  async askForAnotherResearch() {
    const { another } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'another',
        message: 'Would you like to research another topic?',
        default: false
      }
    ]);
    
    return another;
  }

  async run() {
    try {
      await this.initialize();
      
      let continueResearch = true;
      
      while (continueResearch) {
        const options = await this.getResearchInput();
        await this.performResearch(options);
        
        continueResearch = await this.askForAnotherResearch();
      }
      
      Logger.success('Thank you for using Smart Research Assistant! 🎉');
      
    } catch (error) {
      Logger.error(`Application error: ${error.message}`);
      process.exit(1);
    }
  }
}

// Run the application
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = new SmartResearchAssistant();
  app.run().catch(console.error);
}
