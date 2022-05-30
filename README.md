# Buildkite Collectors for JavaScript

Official JavaScript-based [Buildkite Test Analytics](https://buildkite.com/test-analytics) collectors ✨

⚒ **Supported test frameworks:** Jest, and [more coming soon](https://github.com/buildkite/collector-javascript/issues?q=is%3Aissue+is%3Aopen+label%3A%22test+frameworks%22).

📦 **Supported CI systems:** Buildkite, GitHub Actions, CircleCI, Jenkins, and others via the `BUILDKITE_ANALYTICS_*` environment variables.

## 👉 Installing

### Jest

1) [Create a test suite](https://buildkite.com/docs/test-analytics), and copy the API token that it gives you.

1) Add the [`buildkite-collector` package](https://www.npmjs.com/package/buildkite-collector):

    ```bash
    # If you use npm:
    npm install --save-dev buildkite-collector

    # or, if you use yarn:
    yarn add --dev buildkite-collector
    ```

2) Update your [Jest configuration](https://jestjs.io/docs/configuration):<br>

    ```js
      // jest.config.js

      // Send results to Test Analytics
      reporters: [
        'default',
        'buildkite-collector/jest/reporter'
      ],

      // Enable column + line capture for Test Analytics
      testLocationInResults: true
    ```

3) Run your tests locally:<br>

    ```js
    env BUILDKITE_ANALYTICS_TOKEN=xyz npm test
    ```

4) Add the `BUILDKITE_ANALYTICS_TOKEN` secret to your CI, push your changes to a branch, and open a pull request 🎉

    ```bash
    git checkout -b add-bk-test-analytics
    git commit -am "Add Buildkite Test Analytics"
    git push origin add-bk-test-analytics
    ```

## 🔍 Debugging

To enable debugging output, set the `BUILDKITE_ANALYTICS_DEBUG_ENABLED` environment variable to `true`.

## 🔜 Roadmap

See the [GitHub 'enhancement' issues](https://github.com/buildkite/collector-javascript/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement) for planned features. Pull requests are always welcome, and we’ll give you feedback and guidance if you choose to contribute 💚

## ⚒ Developing

After cloning the repository, install the dependencies:

```
npm install
```

And run the tests:

```
npm test
```

Useful resources for developing collectors include the [Buildkite Test Analytics docs](https://buildkite.com/docs/test-analytics) and the [RSpec and Minitest collectors](https://github.com/buildkite/rspec-buildkite-analytics).

## 👩‍💻 Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/buildkite/collector-javascript

## 📜 License

The package is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
