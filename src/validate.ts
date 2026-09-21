#!/usr/bin/env node

// Simple validation script
console.log("🧪 Smart Research Assistant - Quick Test\n");

try {
  console.log("✅ Node.js modules working");

  // Test basic functionality
  const fs = await import("fs");

  // Check if key files exist
  const keyFiles = [
    "src/config.ts",
    "src/engine/research-engine.ts",
    "src/adapters/llm-client.ts",
    "src/utils/helpers.ts",
    "src/prompts/templates.ts",
  ];

  let allFilesExist = true;
  for (const file of keyFiles) {
    try {
      await fs.promises.access(file);
      console.log(`✅ ${file} exists`);
    } catch {
      console.log(`❌ ${file} missing`);
      allFilesExist = false;
    }
  }

  if (allFilesExist) {
    console.log("\n🎉 Project structure is valid!");
    console.log("\nNext steps:");
    console.log("1. Install Ollama: https://ollama.com/download");
    console.log("2. Start Ollama: ollama serve");
    console.log("3. Install a model: ollama pull llama3.1");
    console.log("4. Run demo: npm run demo");
  } else {
    console.log("\n❌ Some files are missing");
  }
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error("❌ Test failed:", message);
}
