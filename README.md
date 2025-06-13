# Smart Research Assistant 🤖📚

A powerful AI research assistant built with Ollama.js that helps you conduct comprehensive research on any topic.

## Features

- 🌐 **Beautiful Web Interface**: Modern, responsive UI with real-time progress tracking
- 🔍 **Intelligent Topic Analysis**: Breaks down complex topics into manageable subtopics
- 📊 **Structured Research**: Generates well-organized research summaries
- 🎯 **Smart Follow-ups**: Suggests relevant follow-up questions
- 💡 **Multiple Research Modes**: Choose from different research approaches
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
- 💾 **Export Results**: Download research data as JSON
- 🎨 **Clean CLI Interface**: Alternative command-line interface available

## Prerequisites

- Node.js (v18 or higher)
- Ollama installed and running locally
- A compatible LLM model (recommended: llama3.1, mistral, or phi3)

## Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```
3. Make sure Ollama is running:
   ```bash
   ollama serve
   ```
4. Pull a model if you haven't already:
   ```bash
   ollama pull llama3.1
   ```

## Usage

### Web Interface (Recommended)
```bash
npm run web
```
Then open http://localhost:3000 in your browser

### Interactive CLI Mode
```bash
npm start
```

### Direct Research Mode
```bash
npm run research "Your Research Topic"
```

### Demo Mode
```bash
npm run demo
```

## Research Modes

1. **Comprehensive Research**: Deep dive into all aspects of a topic
2. **Quick Overview**: Fast summary of key points
3. **Technical Analysis**: Focus on technical details and specifications
4. **Comparative Study**: Compare multiple related topics
5. **Historical Context**: Explore the historical development of a topic

## Example Topics

- "Quantum Computing Applications in Cryptography"
- "Impact of AI on Healthcare"
- "Sustainable Energy Technologies"
- "Blockchain in Supply Chain Management"
- "Space Exploration Technologies"

## Architecture

The agent uses a multi-step approach:
1. **Topic Analysis**: Ollama analyzes and structures the research topic
2. **Research Planning**: Creates a research plan with subtopics
3. **Information Gathering**: Uses Ollama to generate comprehensive content
4. **Synthesis**: Combines findings into a structured report
5. **Follow-up Generation**: Suggests next steps and related questions

## Configuration

Edit `src/config.js` to customize:
- Ollama model selection
- Research depth
- Output format preferences
- API endpoints
