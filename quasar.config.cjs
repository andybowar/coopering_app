/* eslint-env node */

const { configure } = require('quasar/wrappers');

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
    },

    devServer: {
      open: true
    },

    framework: {
      config: {},
      plugins: ['Notify']
    },

    animations: [],

    pwa: {
      workboxMode: 'generateSW',
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
        json.background_color = '#ffffff';
        json.theme_color = '#027BE3';
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
