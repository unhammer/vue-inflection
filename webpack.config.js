const webpack = require('webpack');
const path = require('path');
const { VueLoaderPlugin } = require('vue-loader')


module.exports = {
    entry: path.resolve(__dirname,"./src/index.js"),
    output: {
        path: path.resolve(__dirname, './dist/'),
        filename: "inflection-table.min.js"
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: "vue-loader",
                options: {
                    loaders: {
                        loader: "css-loader",
                        options: {
                            sourceMap: true
                    }
                },
                cssSourceMap: true,
                transformToRequire: {
                    video: ["src", "poster"],
                    source: "src",
                    img: "src",
                    image: "xlink:href"
                }
            }
        },
        {
            test: /\.js$/,
            loader: "vue-loader"
        }
    ]
  },
  plugins: [
 // make sure to include the plugin!
    new VueLoaderPlugin()
  ]
};
