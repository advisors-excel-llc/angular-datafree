/**
 * Created by alex.boyce on 4/6/17.
 */
var nodeExternals = require('webpack-node-externals');
var webpack = require('webpack');

module.exports = {
    entry: './src/angular-datafree.ts',
    target: 'node',
    devtool: "source-map",
    externals: [nodeExternals()],
    output: {
        filename: "angular-datafree.build.min.js",
        chunkFilename: "[id].angular-datafree.js",
        sourceMapFilename: "[file].map",
        devtoolLineToLine: true
    },
    module: {
        loaders: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: { warnings: false },
            minimize: true
        })
    ]
};