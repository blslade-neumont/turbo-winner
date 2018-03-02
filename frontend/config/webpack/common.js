var path = require('path');

// Our Webpack Defaults
var defaultConfig = {
    devtool: 'cheap-module-source-map',
    cache: true,
    
    output: {
        filename: '[name].bundle.js',
        sourceMapFilename: '[name].map',
        chunkFilename: '[id].chunk.js'
    },
    
    resolve: {
        modules: [
            path.join(__dirname, '../../node_modules'),
            path.join(__dirname, '../../src'),
            path.join(__dirname, '../../public/assets')
        ],
        alias: {
            "engine$": path.join(__dirname, '../../../engine/src'),
            "game-client$": path.join(__dirname, '../../../game-client/src'),
            "dbs$": path.join(__dirname, '../../../dbs')
        },
        extensions: ['.ts', '.js']
    },
    
    node: {
        global: true,
        crypto: 'empty',
        __dirname: true,
        __filename: true,
        process: true,
        module: false,
        Buffer: false,
        clearImmediate: false,
        setImmediate: false
    }
};
module.exports = defaultConfig;
