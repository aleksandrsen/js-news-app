const merger = require('webpack-merge');
const baseWebpackConfig = require('./webpack.config.base');

const buildWebPackConfig = merger(baseWebpackConfig, {
    mode: 'production',
    plugins: []
});

module.exports = new Promise(((resolve, reject) => {
    resolve(buildWebPackConfig)
}));