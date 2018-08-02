module.exports = function(config) {
  config.set({
    frameworks: ["jasmine"],
    files: ["../dist/index.js", "./test/**/*.spec.js", "./images/*"],
    proxies: {
      "/images": "/base/images"
    },
    browsers: ["ChromeHeadless"],
    port: 9876
  });
};
