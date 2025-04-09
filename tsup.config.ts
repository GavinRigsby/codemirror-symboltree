import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'], // or just ['esm']
  dts: true,
  outDir: 'dist',
  clean: true,
  minify: false,
  sourcemap: true,
});
