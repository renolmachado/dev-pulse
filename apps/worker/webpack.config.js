const nodeExternals = require('webpack-node-externals');

module.exports = function (options) {
  return {
    ...options,
    externals: [
      nodeExternals({
        allowlist: [/^\@repo/],
      }),
    ],
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000,
      ignored: /node_modules\/(?!@repo)/,
    },
  };
};
