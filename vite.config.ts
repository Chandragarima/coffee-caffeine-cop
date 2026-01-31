import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
// On Netlify we deploy at domain root, so use base '/'. For GitHub Pages subpath use '/coffee-caffeine-cop/'.
export default defineConfig(({ mode }) => {
  const base = process.env.NETLIFY ? '/' : (mode === 'production' ? '/coffee-caffeine-cop/' : '/');
  const baseNoTrailing = base.replace(/\/$/, '') || '/';
  return {
  base,
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'PWA/**/*.png', 
        'icons/*.png', 
        'icons/*.svg',
        'lovable-uploads/*.png',
        'manifest.webmanifest'
      ],
      manifest: {
        name: 'CoffeePolice',
        short_name: 'CoffeePolice',
        description: 'Smart coffee recommendations with caffeine guidance',
        start_url: base,
        display: 'standalone',
        background_color: '#fef3c7',
        theme_color: '#f59e0b',
        orientation: 'portrait-primary',
        scope: base,
        lang: 'en',
        categories: ['lifestyle', 'health', 'productivity'],
        icons: [
          {
            src: './PWA/android/android-launchericon-72-72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: './PWA/android/android-launchericon-96-96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: './PWA/ios/128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: './PWA/android/android-launchericon-144-144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: './PWA/ios/152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: './PWA/android/android-launchericon-192-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: './PWA/ios/384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: './PWA/android/android-launchericon-512-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable any'
          }
        ],
        shortcuts: [
          {
            name: 'Get Coffee Recommendations',
            short_name: 'Recommendations',
            description: 'Get personalized coffee picks based on time and preferences',
            url: `${baseNoTrailing}/ask`,
            icons: [
              {
                src: './PWA/android/android-launchericon-96-96.png',
                sizes: '96x96'
              }
            ]
          },
          {
            name: 'Caffeine Calculator',
            short_name: 'Calculator',
            description: 'Calculate caffeine half-life and sleep impact',
            url: `${baseNoTrailing}/calculator`,
            icons: [
              {
                src: './PWA/android/android-launchericon-96-96.png',
                sizes: '96x96'
              }
            ]
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.(js|css|png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: { cacheName: 'assets' },
          },
          {
            urlPattern: /^https:\/\/.*\/api\/.*/,
            handler: 'NetworkFirst',
            options: { cacheName: 'api' },
          },
        ],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: false, // Disable PWA in development to avoid these errors
        type: 'module',
      },
    }),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
};
});
