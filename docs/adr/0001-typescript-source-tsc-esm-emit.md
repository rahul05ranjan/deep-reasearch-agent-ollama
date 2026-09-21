# TypeScript source with tsc ESM emit

The Node production path is authored in TypeScript. `tsc` emits ESM JavaScript (plus source maps) that Node 20 runs from `dist/`. The package stays `"type": "module"` with `NodeNext` module resolution. Production start is `node` on the emitted HTTP and CLI entries. Dev may load TypeScript through `tsx`. This keeps the existing Node 20 Docker/CI baseline. Runtime type-stripping would require bumping Node; a TypeScript loader in production would make that loader a runtime dependency.
