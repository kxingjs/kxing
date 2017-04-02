const path = require('path');

module.exports = {
    entry: "./src/KXing.ts",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "kxing.js",
        libraryTarget: "commonjs"
    },
    resolve: {
        extensions: ['.js', '.ts', '.tsx', '.json']
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: [
                    path.resolve(__dirname, "node_modules")
                ],
                use: [
                    {
                        loader: 'ts-loader'
                    }
                ]
            }
        ]
    }
};
