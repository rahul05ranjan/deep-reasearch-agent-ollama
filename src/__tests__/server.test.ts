import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { ResearchServer } from "../../server.js";
import { ResearchEngine } from "../engine/research-engine.js";
import { FakeLLMAdapter } from "../adapters/llm-client.js";

describe("ResearchServer HTTP API Seam", () => {
  let serverInstance: ResearchServer;
  let httpServer: Server;
  let baseUrl: string;

  const sampleTopicAnalysis = JSON.stringify({
    overview: "Renewable energy overview",
    subtopics: [
      {
        title: "Solar Power",
        description: "Photovoltaics and solar thermal",
        questions: ["What is the efficiency?"],
      },
    ],
    mainQuestions: ["What are future trends?"],
  });

  before(async () => {
    const fakeLLM = new FakeLLMAdapter({
      defaultResponse: "Executive Summary: Clean energy is scalable.",
      handler: async (params) => {
        if (params.prompt?.includes("expert research analyst")) {
          return sampleTopicAnalysis;
        }
        if (params.prompt?.includes("comprehensive synthesis")) {
          return "Synthesis: Solar power is expanding rapidly.";
        }
        if (params.prompt?.includes("follow-up questions")) {
          return "1. What are battery storage options?\n2. What about grid reliability?";
        }
        if (params.prompt?.includes("executive summary")) {
          return "Executive Summary: Solar power provides clean, scalable energy.";
        }
        return "Solar cells convert photons into electricity.";
      },
      models: [{ name: "qwen2.5-coder:0.5b" }],
    });

    const engine = new ResearchEngine({
      llmClient: fakeLLM,
      model: "qwen2.5-coder:0.5b",
    });

    serverInstance = new ResearchServer({ engine, port: 0 });

    await new Promise<void>((resolve) => {
      httpServer = serverInstance.app.listen(0, () => {
        const addr = httpServer.address() as AddressInfo;
        baseUrl = `http://localhost:${addr.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (httpServer) {
      await new Promise((resolve) => httpServer.close(resolve));
    }
  });

  it("GET /api/health returns ok and ollamaConnected: true", async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    assert.equal(response.status, 200);

    const data = await response.json();
    assert.equal(data.status, "ok");
    assert.equal(data.ollamaConnected, true);
  });

  it("POST /api/research returns 400 when topic is missing", async () => {
    const response = await fetch(`${baseUrl}/api/research`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    assert.equal(response.status, 400);
    const data = await response.json();
    assert.equal(data.error, "Research topic is required");
  });

  it("POST /api/research delegates to ResearchEngine and returns full research payload", async () => {
    const response = await fetch(`${baseUrl}/api/research`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: "Renewable Energy",
        mode: "QUICK",
      }),
    });

    assert.equal(response.status, 200);
    const data = await response.json();

    assert.equal(data.topic, "Renewable Energy");
    assert.equal(data.mode, "QUICK");
    assert.ok(data.analysis);
    assert.ok(data.researchResults["Solar Power"]);
    assert.ok(data.synthesis.includes("Synthesis:"));
    assert.ok(Array.isArray(data.followupQuestions));
    assert.ok(data.executiveSummary);
    assert.ok(data.performanceStats);
  });

  it("POST /api/research returns 503 when LLM connection is unavailable", async () => {
    const disconnectedEngine = new ResearchEngine({
      llmClient: new FakeLLMAdapter({ models: [] }),
      model: "qwen2.5-coder:0.5b",
    });

    const disconnectedServer = new ResearchServer({
      engine: disconnectedEngine,
    });

    await new Promise((resolve) => {
      const s = disconnectedServer.app.listen(0, async () => {
        const addr = s.address() as AddressInfo;
        const res = await fetch(`http://localhost:${addr.port}/api/research`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: "Some Topic" }),
        });

        assert.equal(res.status, 503);
        const json = await res.json();
        assert.ok(json.error.includes("Cannot connect to Ollama"));

        s.close(resolve);
      });
    });
  });

  it("POST /api/research returns 400 when mode is unknown", async () => {
    const response = await fetch(`${baseUrl}/api/research`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: "Solar Power",
        mode: "UNKNOWN_MODE",
      }),
    });

    assert.equal(response.status, 400);
    const data = await response.json();
    assert.ok(typeof data.error === "string");
  });

  it("POST /api/research returns 400 when topic is empty or whitespace", async () => {
    const response = await fetch(`${baseUrl}/api/research`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: "   ",
      }),
    });

    assert.equal(response.status, 400);
    const data = await response.json();
    assert.equal(data.error, "Research topic is required");
  });

  it("POST /api/research returns 400 on non-JSON body", async () => {
    const response = await fetch(`${baseUrl}/api/research`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "this is not json { [ bad",
    });

    assert.equal(response.status, 400);
    const data = await response.json();
    assert.ok(typeof data.error === "string");
  });

  it("POST /api/research with explicit false flags omits synthesis and followups", async () => {
    const response = await fetch(`${baseUrl}/api/research`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: "Renewable Energy",
        mode: "QUICK",
        includeFollowups: false,
        includeSynthesis: false,
      }),
    });

    assert.equal(response.status, 200);
    const data = await response.json();
    assert.equal(data.topic, "Renewable Energy");
    assert.equal(data.synthesis, null);
    assert.equal(data.followupQuestions, null);
    assert.ok(data.executiveSummary);
  });
});
