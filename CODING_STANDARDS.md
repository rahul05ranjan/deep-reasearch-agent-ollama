# CODING_STANDARDS.md

This document defines architecture rules, conventions, and judgement calls for AI agents and human contributors working in this repository.

---

## 1. TypeScript & NodeNext Module Conventions

- **NodeNext Import Specifiers**: The repository uses `"moduleResolution": "NodeNext"` with `"type": "module"`. All relative imports in TypeScript source files must use `.js` specifiers (e.g. `import { config } from '../config.js';`), never omit extensions, and never use `.ts` in import paths.
- **Production Emit Target**: Production runs emitted JavaScript from `dist/` via `tsc`. `tsx` is strictly a `devDependency` for local development and running unit tests. Production entry points are `node dist/src/index.js` and `node dist/server.js`.
- **Zero Any Policy**: Code and test files must use explicit interfaces, type aliases, or `unknown` with runtime guards instead of `any`.

---

## 2. Browser Asset Isolation

- **Vanilla Frontend**: Client-side code in `public/js/app.js` is untranspiled vanilla browser JavaScript. It must remain excluded from `tsconfig.json` and must not rely on Node modules or CommonJS/ESM bundlers.
- **Static Assets Directory**: Static files in `public/` are served by `server.ts`. When resolving `public/`, account for running both from root (`server.ts` via tsx) and from `dist/server.js` via `getPublicDir()`.

---

## 3. Runtime Contracts at Untrusted Edges

- **Untrusted Boundaries**: All external and non-deterministic boundaries must be validated at runtime using Zod contracts in `src/contracts/schemas.ts`:
  1. _LLM Outputs_: Model JSON responses from Ollama must be validated using `TopicAnalysisSchema.safeParse()`.
  2. _HTTP Requests_: Inbound POST payloads to `/api/research` must be validated using `ResearchRequestSchema.safeParse()`.
- **Dependency Tiering**: Schema validation libraries (`zod`) must remain in `dependencies` (not `devDependencies`) so they are available in production environments and multi-stage Docker builds after `npm prune --omit=dev`.
- **Zod 4.x Conventions**: Access validation issues via `error.issues` (not deprecated `error.errors`). Custom string validation errors use object arguments (e.g. `z.string({ error: 'Topic is required' })`).

---

## 4. Test Fixtures & Server Hygiene

- **Native Test Runner**: Tests run under `tsx --test` using Node's built-in `node:test` and `node:assert/strict`.
- **HTTP Server Lifecycle & Keep-Alive Sockets**: In Node 20+, calling native `fetch()` against ephemeral test servers pools TCP keep-alive sockets. To prevent test suite teardown from hanging, avoid creating nested listening servers inside individual test cases, or ensure `server.closeAllConnections()` is invoked during teardown.
