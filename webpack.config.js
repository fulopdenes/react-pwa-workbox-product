// Inside of webpack.config.js:
const {InjectManifest} = require('workbox-webpack-plugin');
const copyPlugin = require('copy-webpack-plugin');

module.exports = {
    // Other webpack config...
    plugins: [
        new copyPlugin({
            patterns: [
                {from: "./public/tabIcon.ico", to: ""},
                {from: "./public/icons/icon-192x192.png", to: ""},
                {from: "./public/icons/icon-256x256.png", to: ""},
                {from: "./public/icons/icon-384x384.png", to: ""},
                {from: "./public/icons/icon-512x512.png", to: ""},
                {from: "./public/tabIcon.ico", to: ""},
                {from: "./public/manifest.json", to: ""},
            ]
        }),
        // Other plugins...
        new InjectManifest({
            // These are some common options, and not all are required.
            // Consult the docs for more info.
            // exclude: [/.../, '...'],
            // maximumFileSizeToCacheInBytes: ...,
            swSrc: './src/service-worker.js',
            swDest: 'service-worker.js',
        }),
    ],
};