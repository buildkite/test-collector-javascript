# Buildkite Collectors for JavaScript

Official JavaScript-based [Buildkite Test Analytics](https://buildkite.com/test-analytics) collectors ✨

**Supported test frameworks:** Jest, and more [coming soon](#roadmap).

**Supported CI systems:** Buildkite, GitHub Actions, CircleCI, Jenkins, and others via the `BUILDKITE_ANALYTICS_*` environment variables.

## Installing

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
    env BUILDKITE_ANALYTICS_API_TOKEN=xyz npm test
    ```

4) Add the `BUILDKITE_ANALYTICS_API_TOKEN` secret to your CI, push your changes to a branch, and open a pull request 🎉

    ```bash
    git checkout -b add-bk-test-analytics
    git commit -am "Added Test Analytics"
    git push origin add-bk-test-analytics
    ```

## Debugging

To enable debugging output, set `BUILDKITE_ANALYTICS_DEBUG_ENABLED=true`

## Roadmap

- [ ] Sending through `failure_expanded`
- [ ] HTTP tracing
- [ ] SQL tracing
- [ ] Annotations
- [ ] Live stream results via web sockets
- [ ] Additional test framework support (Cypress , Jasmine, AVA, Mocha, etc)

_Pull requests welcome!_

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/buildkite/js-buildkite-analytics.

### Developing

After cloning the repository, install the dependencies using npm:

```sh
npm install
```

You can run the tests for this library by executing:

```sh
npm test
```

## License

The package is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
