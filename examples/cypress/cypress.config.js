const { defineConfig } = require("cypress");

module.exports = defineConfig({
  // reporter: "buildkite-test-collector/cypress/reporter",

  // reporterOptions: {
  //   token_name: "BUILDKITE_ANALYTICS_CYPRESS_TOKEN",
  // },

  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
    },
  },
  screenshotOnRunFailure: false,
  video: false,
});
