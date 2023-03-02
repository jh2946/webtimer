const path = require("path");
module.exports = {
    mode: "production",
    devtool: "cheap-module-source-map",
    entry: {
        "background": "./src/request-handler.ts",
        "stats": "./src/stats.ts",
        "popup": "./src/popup.ts"
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                include: [path.resolve(__dirname, "src")]
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "public")
    }
}