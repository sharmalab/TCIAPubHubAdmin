var webpack = require("webpack");

var uglify = new webpack.optimize.UglifyJsPlugin({});



module.exports = {
    entry: {
        index: "./public/javascripts/src/Index.jsx",
        create: "./public/javascripts/src/Create.jsx",
        one: "./public/javascripts/src/One.jsx",
        version: "./public/javascripts/src/Version.jsx",
        one: "./public/javascripts/src/One.jsx"
    },
    output: {
        filename: "./public/javascripts/browserify/[name].entry.js"
    },
    module: {
        loaders:[
            {
                test: /\.js[x]?$/,
                exclude: /node_modules/,
                loader: "babel-loader?presets[]=react&presets=es2015"
            }
        ]
    },
    plugins: [uglify]
};
