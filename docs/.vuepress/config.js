var path = require("path");

module.exports = {
  title: "G40N's blog",
  description: "G40N's blog",
  chainWebpack: (config, isServer) => {
    config.resolveLoader.modules.add(path.resolve(__dirname, "./node_modules"));
  }
};
