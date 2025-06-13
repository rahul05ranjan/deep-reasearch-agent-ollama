#!/usr/bin/env node

import { ResearchAgent } from './agents/research-agent.js';
import { Logger, Formatter } from './utils/helpers.js';

// Demo script to test the research agent
class DemoResearch {
  constructor() {
    this.agent = new ResearchAgent();
  }

  async runDemo() {
    try {
      Logger.title('🚀 Smart Research Assistant Demo');
      
      // Test connection
      Logger.info('Testing connection to Ollama...');
      const connected = await this.agent.checkConnection();
      
      if (!connected) {
        Logger.error('❌ Cannot connect to Ollama');
        Logger.info('Make sure Ollama is running: ollama serve');
        Logger.info('And you have a model installed: ollama pull llama3.1');
        return;
      }
      
      Logger.success('✅ Connected to Ollama successfully!');
      
      // Demo topic
      const topic = "Artificial Intelligence in Healthcare";
      Logger.info(`📋 Demo Topic: ${Formatter.highlight(topic)}`);
      
      // Analyze topic
      Logger.info('🔍 Analyzing research topic...');
      const analysis = await this.agent.analyzeResearchTopic(topic, 'QUICK');
      
      console.log(Formatter.section('📊 Topic Analysis', analysis.overview));
      
      Logger.info('📚 Identified Subtopics:');
      analysis.subtopics.forEach((subtopic, index) => {
        console.log(`  ${index + 1}. ${Formatter.highlight(subtopic.title)}`);
        console.log(`     ${Formatter.dim(subtopic.description)}`);
      });
      
      // Quick research on first subtopic only (for demo)
      if (analysis.subtopics.length > 0) {
        const firstSubtopic = analysis.subtopics[0];
        Logger.info(`🔬 Conducting quick research on: ${firstSubtopic.title}`);
        
        const results = await this.agent.conductResearch(
          topic, 
          [firstSubtopic], // Only research first subtopic for demo
          'QUICK'
        );
        
        console.log(Formatter.section(
          `📖 Research Results: ${firstSubtopic.title}`, 
          results[firstSubtopic.title].content
        ));
      }
      
      // Performance stats
      const stats = this.agent.getPerformanceStats();
      Logger.success(`⚡ Demo completed in ${stats.totalTime}`);
      
    } catch (error) {
      Logger.error(`Demo failed: ${error.message}`);
      console.error(error);
    }
  }
}

// Run demo
const demo = new DemoResearch();
demo.runDemo().catch(console.error);
