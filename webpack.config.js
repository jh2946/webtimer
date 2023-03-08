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
    `export const env = ${map[settings.browser]};\n// set by settings.json upon npm run build\n`
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

/*
The ./firefox and ./chrome folders will be zipped into
firefox.zip and chrome.zip, the extensions as a final
product.

All files in ./src/firefox or ./src/chrome will be copied
into ./firefox or ./chrome respectively, except for .ts
which will be compiled into .js. Files in ./src/shared will
be copied into both ./firefox and ./chrome. The value of
"browser" in ./src/settings.json is set to either "firefox"
or "chrome" to control which folder (./firefox or ./chrome)
is built.
*/