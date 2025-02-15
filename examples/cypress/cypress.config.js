const { defineConfig } = require("cypress");

module.exports = defineConfig({
  reporter: "../../cypress/reporter",
  reporterOptions: {
    token_name: "BUILDKITE_ANALYTICS_TOKEN",
    tags: { "hello": "cypress" },
  },
  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
    },
  },
  screenshotOnRunFailure: false,
  video: false,
});
