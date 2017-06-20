const path = require('path');

module.exports = {
    entry: "./src/index.ts",
    output: {
        path: path.resolve(__dirname, `dist`),
        filename: `kxing.js`,
        library: 'KXing',
        libraryTarget: "umd",
    },
    resolve: {
        extensions: ['.js', '.ts', '.json']
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader'
                    }
                ]
            }
        ]
    }
};
