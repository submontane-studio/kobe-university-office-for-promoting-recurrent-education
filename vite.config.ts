// vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import preact from '@preact/preset-vite';
import devManifest from 'vite-plugin-dev-manifest';
import sassGlobImports from 'vite-plugin-sass-glob-import';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { globSync } from 'glob';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = mode === 'development';

  // ← ここを“唯一の真実”にする
  const PORT = 3000;
  const ORIGIN = `http://localhost:${PORT}`;

  // …（ts/js/scss/css/html の input 構築はそのまま）

  return {
    root: __dirname,

    // dev は絶対URL。これが CSS の url() 書き換え元になる
    base: isDev ? `${ORIGIN}/` : '',

    build: {
      manifest: true,
      outDir: `./${env.DIST}`,
      cssMinify: false,
      emptyOutDir: false,
      rollupOptions: {
        input: {
          // ← dev でもここ経由で SCSS を読ませる（JSで import すること）
          'index': path.resolve(__dirname, `${env.SRC}/js/index.ts`),
          'style': path.resolve(__dirname, `${env.SRC}/style.scss`),
        },
        output: {
          entryFileNames: 'js/[name].js',
          chunkFileNames: 'js/[name].js',
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name ?? '';
            // CSSはルート直下に固定で style.css
            if (name.endsWith('.css')) return 'style.css';
            // 画像は assets/images/ に
            if (/\.(png|jpe?g|gif|svg|webp|avif)$/.test(name)) {
              return 'assets/images/[name][extname]';
            }
            // フォント等その他アセット
            return 'assets/[name][extname]';
          },
        },
      },
    },

    plugins: [
      preact(),
      sassGlobImports(),
      devManifest(),
      viteStaticCopy({
        targets: [
          {
            src: path.resolve(__dirname, `${env.SRC}/**/*.php`),
            dest: path.resolve(__dirname, `${env.DIST}`)
          },
          {
            src: path.resolve(__dirname, `${env.SRC}/acf-json`),
            dest: path.resolve(__dirname, `${env.DIST}`)
          },
          {
            src: path.resolve(__dirname, `${env.SRC}/js/admin.js`),
            dest: path.resolve(__dirname, `${env.DIST}/js`)
          },
        ],
      }),
    ],

    css: {
      preprocessorOptions: { 
        scss: {} 
      },
    },

    server: {
      // ぜんぶ 3000 に合わせる（env.HMR_PORT は使わない）
      host: true,
      port: PORT,
      origin: ORIGIN,
      hmr: { host: 'localhost', port: PORT }, // ← ここも
      cors: true,
      proxy: {
        '^/\\.html/': {
          target: 'http://localhost:8888',
          changeOrigin: true,
          rewrite: p => p.replace(/\.html/, '.php'),
        },
      },
      watch: { usePolling: true },
    },
  };
});