const path = require("path");
const Dotenv = require("dotenv-webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const dotEnvConfig = {
    path: process.env.NODE_ENV === "production" ? "./.env.production" : "./.env.development",
};
require("dotenv").config(dotEnvConfig);

module.exports = {
    entry: {
        app: ["./src/app.tsx", "./src/app.scss"],
    },
    mode: process.env.NODE_ENV === "production" ? "production" : "development",
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist"),
        clean: true,
        publicPath: "/",
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: [".ts", ".tsx", ".js"],
        // Add support for TypeScripts fully qualified ESM imports.
        extensionAlias: {
            ".js": [".js", ".ts"],
            ".cjs": [".cjs", ".cts"],
            ".mjs": [".mjs", ".mts"],
        },
        fallback: {
            querystring: require.resolve("querystring-es3"),
        },
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "API Example – React",
            template: path.resolve(__dirname, "src/index.html"),
        }),
        new Dotenv(dotEnvConfig),
    ],
    module: {
        rules: [
            // all files with a `.ts`, `.cts`, `.mts` or `.tsx` extension will be handled by `ts-loader`
            { test: /\.([cm]?ts|tsx)$/, loader: "ts-loader" },
            // handle .scss or .sass files with sass-loader
            {
                test: /\.s[ac]ss$/i,
                use: [
                    "style-loader",
                    "css-loader",
                    {
                        loader: "sass-loader",
                        options: {
                            // Prefer `dart-sass`
                            implementation: require("sass"),
                        },
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                plugins: [["autoprefixer", {}]],
                            },
                        },
                    },
                ],
            },
            {
                test: /\.js$/,
                enforce: "pre",
                use: ["source-map-loader"],
            },
            {
                test: /\.(?:js|mjs|cjs)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [["@babel/preset-env", { targets: "defaults" }]],
                    },
                },
            },
        ],
    },
    devServer: {
        devMiddleware: {
            index: path.resolve(__dirname, "src/index.html"),
        },
        static: {
            directory: path.join(__dirname, "src/public"),
        },
        compress: true,
        historyApiFallback: true,
        port: 8080,
    },
};
