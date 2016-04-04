module.exports = {
    entry: {
        index: "./public/javascripts/src/Index.jsx",
        create: "./public/javascripts/src/Create.jsx",
        one: "./public/javascripts/src/One.jsx",
        version: "./public/javascripts/src/Version.jsx",
        edit: "./public/javascripts/src/Edit.jsx"
    },
    output: {
        filename: "./public/javascripts/browserify/[name].entry.js"
    },
    module: {
        loaders:[
            {
                test: /\.js[x]?$/,
                exclude: /node_modules/,
                loader: "babel?presets[]=react&presets=es2015"
            }
        ]
    }
};
