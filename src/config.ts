import type { ResearchMode } from "./contracts/schemas.js";

export interface OllamaOptions {
  temperature?: number;
  top_p?: number;
  num_predict?: number;
}

export interface OllamaConfig {
  baseUrl: string;
  model: string;
  options: OllamaOptions;
}

export interface AppConfig {
  ollama: OllamaConfig;
  research: {
    maxSubtopics: number;
    summaryLength: string;
    includeFollowUps: boolean;
    includeSourceSuggestions: boolean;
  };
  ui: {
    colors: Record<string, string>;
    animations: boolean;
    boxStyle: string;
  };
}

export interface ModeConfig {
  name: string;
  description: string;
  subtopics: number;
  depth: "low" | "medium" | "high";
}

// Configuration for the Smart Research Assistant
export const config: AppConfig = {
  // Ollama settings
  ollama: {
    baseUrl: "http://localhost:11434",
    model: "qwen2.5-coder:0.5b", // Default model, can be changed
    options: {
      temperature: 0.7,
      top_p: 0.9,
      num_predict: 2048,
    },
  },

  // Research settings
  research: {
    maxSubtopics: 5,
    summaryLength: "comprehensive", // 'brief', 'moderate', 'comprehensive'
    includeFollowUps: true,
    includeSourceSuggestions: true,
  },

  // UI settings
  ui: {
    colors: {
      primary: "#00D2FF",
      secondary: "#3A7BD5",
      success: "#00C851",
      warning: "#FF8800",
      error: "#FF4444",
      info: "#33B5E5",
    },
    animations: true,
    boxStyle: "round",
  },
};

// Available research modes
export const researchModes: Record<ResearchMode, ModeConfig> = {
  COMPREHENSIVE: {
    name: "Comprehensive Research",
    description: "Deep dive into all aspects of the topic",
    subtopics: 5,
    depth: "high",
  },
  QUICK: {
    name: "Quick Overview",
    description: "Fast summary of key points",
    subtopics: 3,
    depth: "medium",
  },
  TECHNICAL: {
    name: "Technical Analysis",
    description: "Focus on technical details and specifications",
    subtopics: 4,
    depth: "high",
  },
  COMPARATIVE: {
    name: "Comparative Study",
    description: "Compare multiple related aspects",
    subtopics: 4,
    depth: "medium",
  },
  HISTORICAL: {
    name: "Historical Context",
    description: "Explore historical development",
    subtopics: 4,
    depth: "medium",
  },
};
