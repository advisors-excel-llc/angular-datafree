/**
 * Created by alex.boyce on 4/6/17.
 */
var webpack = require('webpack');

module.exports = {
    entry: './src/angular-datafree.ts',
    target: 'web',
    devtool: "source-map",
    externals: [{
        'angular': 'angular'
    }],
    output: {
        filename: "angular-datafree.min.js",
        path: __dirname + "/dist",
        chunkFilename: "[id].angular-datafree.js",
        sourceMapFilename: "[file].map",
        devtoolLineToLine: true,
        libraryTarget: 'var'
    },
    resolve: {
        extensions: ['', '.ts', '.tsx', '.js']
    },
    module: {
        loaders: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/
            }
        ],
        rules: [
            {
                test: /\.tsx?$/,
                use: [{
                    loader: 'ts-loader'
                }],
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: { warnings: false },
            minimize: true,
            sourceMap: true
        })
    ]
};