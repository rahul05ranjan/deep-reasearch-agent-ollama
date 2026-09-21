# Runtime schemas at the HTTP and topic-analysis edges

A research request and the topic analysis JSON extracted from language-model text are untrusted. They are parsed with a runtime schema (Zod) before the research engine treats them as typed values. Interior TypeScript types describe the parsed result. When topic analysis fails the schema, the engine uses the existing fallback topic analysis. When a research request fails the schema, the HTTP API returns 400. Compile-time types alone are erased at runtime and cannot protect those two edges.
