const path = require('path');

module.exports = {
    entry: "./src/Index.ts",
    output: {
        path: path.resolve(__dirname, `dist`),
        filename: `kxing.js`,
        libraryTarget: "umd",
    },
    resolve: {
        extensions: ['.js', '.ts', '.json']
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'ts-loader'
                    }
                ]
            }
        ]
    }
};
