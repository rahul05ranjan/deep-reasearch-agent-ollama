#!/usr/bin/env node

import { Logger, Formatter } from './utils/helpers.js';
import { config, researchModes } from './config.js';
import { getPrompt } from './prompts/templates.js';

// Simple test to validate project setup
class ProjectTest {
  async runTests() {
    Logger.title('🧪 Smart Research Assistant - Project Test');
    
    let passed = 0;
    let total = 0;
    
    // Test 1: Configuration loading
    total++;
    try {
      Logger.info('Testing configuration...');
      if (config.ollama && config.ollama.baseUrl) {
        Logger.success('✅ Configuration loaded successfully');
        passed++;
      } else {
        Logger.error('❌ Configuration invalid');
      }
    } catch (error) {
      Logger.error(`❌ Configuration error: ${error.message}`);
    }
    
    // Test 2: Research modes
    total++;
    try {
      Logger.info('Testing research modes...');
      const modes = Object.keys(researchModes);
      if (modes.length > 0) {
        Logger.success(`✅ ${modes.length} research modes available: ${modes.join(', ')}`);
        passed++;
      } else {
        Logger.error('❌ No research modes found');
      }
    } catch (error) {
      Logger.error(`❌ Research modes error: ${error.message}`);
    }
    
    // Test 3: Prompt templates
    total++;
    try {
      Logger.info('Testing prompt templates...');
      const testPrompt = getPrompt('topicAnalysis', { topic: 'Test', mode: 'Test' });
      if (testPrompt && testPrompt.includes('Test')) {
        Logger.success('✅ Prompt templates working');
        passed++;
      } else {
        Logger.error('❌ Prompt templates not working');
      }
    } catch (error) {
      Logger.error(`❌ Prompt templates error: ${error.message}`);
    }
    
    // Test 4: Utilities
    total++;
    try {
      Logger.info('Testing utility functions...');
      const testBox = Formatter.box('Test content', 'Test Title');
      if (testBox && testBox.includes('Test content')) {
        Logger.success('✅ Utility functions working');
        passed++;
      } else {
        Logger.error('❌ Utility functions not working');
      }
    } catch (error) {
      Logger.error(`❌ Utility functions error: ${error.message}`);
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    if (passed === total) {
      Logger.success(`🎉 All tests passed! (${passed}/${total})`);
      Logger.info('Your Smart Research Assistant is ready to use!');
      console.log('\nNext steps:');
      console.log('1. Make sure Ollama is running: ollama serve');
      console.log('2. Install a model: ollama pull llama3.1');
      console.log('3. Run the demo: npm run demo');
      console.log('4. Start researching: npm start');
    } else {
      Logger.error(`❌ ${total - passed} test(s) failed (${passed}/${total})`);
      Logger.info('Please check the errors above and fix any issues');
    }
  }
}

const test = new ProjectTest();
test.runTests().catch(console.error);
