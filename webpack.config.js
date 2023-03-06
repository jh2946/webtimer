const path = require("path");
const fs = require("fs");
const CopyPlugin = require("copy-webpack-plugin")

const map = {
    chrome: "chrome",
    firefox: "browser"
};

const settings = JSON.parse(fs.readFileSync("./src/settings.json"));

fs.writeFileSync(
    "./compile-args.ts",
    `export const env = ${map[settings.browser]};\n`
);

function test(name) {
    return !name.match(/\.ts$/);
}

module.exports = {
    mode: settings.mode,
    devtool: "cheap-module-source-map",
    entry: {
        "background": `./src/${settings.browser}/background.ts`,
        "stats": "./src/shared/stats.ts",
        "popup": "./src/shared/popup.ts"
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
        path: path.resolve(__dirname, settings.browser)
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: "./src/shared/",
                    to: "./",
                    filter: test
                },
                {
                    from: `./src/${settings.browser}`,
                    to: "./",
                    filter: test
                }
            ]
        })
    ]
};
