module.exports = function (options) {
  return {
    ...options,
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000,
      ignored: /node_modules\/(?!@repo)/,
    },
  };
};
