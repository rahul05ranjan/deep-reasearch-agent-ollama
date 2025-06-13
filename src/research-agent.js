#!/usr/bin/env node

import { ResearchAgent } from './agents/research-agent.js';
import { Logger, Formatter } from './utils/helpers.js';

// Quick research script for direct topic research
class QuickResearch {
  constructor() {
    this.agent = new ResearchAgent();
  }

  async quickResearch(topic, mode = 'QUICK') {
    Logger.title(`🚀 Quick Research: ${topic}`);
    
    try {
      // Check connection
      const connected = await this.agent.checkConnection();
      if (!connected) {
        Logger.error('Cannot connect to Ollama');
        return;
      }

      // Analyze topic
      const analysis = await this.agent.analyzeResearchTopic(topic, mode);
      
      // Conduct research
      const results = await this.agent.conductResearch(topic, analysis.subtopics, mode);
      
      // Generate summary
      const synthesis = await this.agent.synthesizeFindings(topic, results);
      
      // Display results
      console.log(Formatter.box(analysis.overview, '📋 Overview'));
      console.log(Formatter.section('🔍 Research Summary', synthesis));
      
      // Show key findings
      const keyFindings = Object.entries(results).map(([title, data]) => {
        const firstParagraph = data.content.split('\n\n')[0];
        return `${title}: ${firstParagraph.substring(0, 150)}...`;
      });
      
      console.log(Formatter.section('🎯 Key Findings', Formatter.list(keyFindings)));
      
      Logger.success(`Research completed in ${this.agent.getPerformanceStats().totalTime}`);
      
    } catch (error) {
      Logger.error(`Research failed: ${error.message}`);
    }
  }
}

// Command line usage
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log(`
Usage: npm run research "Your Research Topic"

Examples:
  npm run research "Artificial Intelligence in Healthcare"
  npm run research "Quantum Computing Applications"
  npm run research "Climate Change Solutions"
  `);
  process.exit(1);
}

const topic = args.join(' ');
const researcher = new QuickResearch();
researcher.quickResearch(topic).catch(console.error);
