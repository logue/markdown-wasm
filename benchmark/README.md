# Markdown-wasm benchmarks

This directory contains the benchmark suite used to generate the comparison graphs in the root README.
Install dependencies from the repository root.

1. `pnpm install`
2. `pnpm benchmark`
3. `pnpm benchmark:graph`

Running the benchmarks takes a while since in order to be accurate each parse-and-render
operation is performed synchronously on a single CPU thread.

Results are written to the `results` directory; `bench.csv` along with SVG graphs.
