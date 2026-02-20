const path = require("path");
const webpack = require("webpack");

module.exports = {
    mode: "production",
    devtool: false,
    entry: "./src/conjureTypeScript.ts",
    resolve: {
        extensions: [".js", ".ts", ".json"],
    },
    output: {
        path: path.resolve(__dirname, 'dist/bin'),
        filename: "conjure-typescript"
    },
    target: "node",
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            configFile: "./tsconfig.json",
                        }
                    }
                ],
            }
        ]
    },
    plugins: [
        new webpack.BannerPlugin({ banner: "#!/usr/bin/env node", raw: true })
    ],
};