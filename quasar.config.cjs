/* eslint-env node */

const { configure } = require('quasar/wrappers');

// GitHub Pages serves this repo from https://<user>.github.io/coopering_app/,
// so assets need a sub-path prefix. Native (Capacitor) builds must stay at '/'.
const ghPagesBase = process.env.DEPLOY_TARGET === 'gh-pages'
  ? (process.env.GH_PAGES_BASE || '/coopering_app/')
  : undefined;

module.exports = configure(function (/* ctx */) {
  return {
    boot: [],

    css: [
      'app.css'
    ],

    extras: [
      'roboto-font',
      'material-icons',
    ],

    build: {
      target: {
        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
        node: 'node20'
      },

      vueRouterMode: 'hash',

      ...(ghPagesBase ? { publicPath: ghPagesBase } : {})
    },

    devServer: {
      open: true
    },

    framework: {
      config: {
        brand: {
          primary: '#4a5568',
          secondary: '#718096',
          accent: '#9ae6b4',
          dark: '#2d3748',
          'dark-page': '#1a202c',
          positive: '#68d391',
          negative: '#fc8181',
          info: '#63b3ed',
          warning: '#f6ad55'
        }
      },
      plugins: ['Notify', 'Dark']
    },

    animations: [],

    pwa: {
      workboxMode: 'GenerateSW',
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      useCredentialsForManifestTag: false,
      extendManifestJson (json) {
        json.name = 'N-Sided Pyramid Calculator';
        json.short_name = 'Pyramid Calc';
        json.description = 'Calculate woodworking angles for N-sided pyramids';
        json.display = 'standalone';
        json.orientation = 'portrait';
        json.background_color = '#1a202c';
        json.theme_color = '#4a5568';
      },
      workboxOptions: {
        skipWaiting: true,
        clientsClaim: true
      }
    },

    cordova: {},

    capacitor: {
      hideSplashscreen: true
    },

    electron: {
      inspectPort: 5858,
      bundler: 'packager',
      builder: {
        appId: 'coopering-app'
      }
    },

    bex: {
      contentScripts: ['my-content-script']
    }
  }
});
