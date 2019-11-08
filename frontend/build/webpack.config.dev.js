const webpack = require('webpack');
const merger = require('webpack-merge');
const baseWebpackConfig = require('./webpack.config.base');

const devWebPackConfig = merger(baseWebpackConfig, {
    mode: 'development',
    devtool: 'cheap-module-eval-source-map',
    devServer: {
        contentBase: baseWebpackConfig.externals.paths.dist,
        port: 8081,
        overlay: {
            warnings: true,
            errors: true
        }
    },
    plugins: [
        new webpack.SourceMapDevToolPlugin({
            filename: '[file].map'
        })
    ]
});

module.exports = new Promise(((resolve, reject) => {
    resolve(devWebPackConfig)
}));


