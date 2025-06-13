# Setup Guide

## Quick Start

1. **Install Ollama**
   ```bash
   # Download from https://ollama.com/download
   # Or use winget on Windows:
   winget install Ollama.Ollama
   ```

2. **Start Ollama**
   ```bash
   ollama serve
   ```

3. **Install a Model**
   ```bash
   # Recommended models:
   ollama pull llama3.1        # ~4.7GB - Good all-around model
   ollama pull mistral         # ~4.1GB - Fast and efficient
   ollama pull phi3           # ~2.4GB - Smaller, good for testing
   ollama pull codellama      # ~3.8GB - Good for technical topics
   ```

4. **Install Dependencies**
   ```bash
   cd "c:\PROJECTS\AI\structured output ollama"
   npm install
   ```

5. **Run the Demo**
   ```bash
   npm run demo
   ```

6. **Run the Interactive Assistant**
   ```bash
   npm start
   ```

## Troubleshooting

### Ollama Connection Issues
- Make sure Ollama is running: `ollama serve`
- Check if Ollama is accessible: visit http://localhost:11434
- Verify models are installed: `ollama list`

### Model Not Found
- Install a supported model: `ollama pull llama3.1`
- Update `src/config.js` to match your installed model

### Memory Issues
- Use smaller models like `phi3` for testing
- Adjust temperature and prediction length in config

## Example Usage

```bash
# Quick research on a topic
npm run research "Quantum Computing Applications"

# Interactive mode with full features
npm start

# Demo mode to test functionality
npm run demo
```

## Configuration

Edit `src/config.js` to customize:
- Model selection
- API endpoints
- Research parameters
- UI preferences
