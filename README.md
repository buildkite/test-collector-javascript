# Buildkite Collectors for JavaScript

Official [Buildkite Test Engine](https://buildkite.com/platform/test-engine) collectors for JavaScript test frameworks ✨

⚒ **Supported test frameworks:** Jest, Jasmine, Mocha, Cypress, Playwright, Vitest, and [more coming soon](https://github.com/buildkite/test-collector-javascript/issues?q=is%3Aissue+is%3Aopen+label%3A%22test+frameworks%22).

📦 **Supported CI systems:** Buildkite, GitHub Actions, CircleCI, and others via the `BUILDKITE_ANALYTICS_*` environment variables.

## 👉 Installing

1. [Create a test suite](https://buildkite.com/docs/test-engine), and copy the API token that it gives you.

2. Add the [`buildkite-test-collector` package](https://www.npmjs.com/package/buildkite-test-collector):

    ```bash
    # If you use npm:
    npm install --save-dev buildkite-test-collector

    # or, if you use yarn:
    yarn add --dev buildkite-test-collector
    ```

3. Add the Buildkite test collector to your testing framework:

    ### Jest

    Update your [Jest configuration](https://jestjs.io/docs/configuration):<br>

    ```js
    // jest.config.js

    // Send results to Test Engine
    reporters: [
      'default',
      'buildkite-test-collector/jest/reporter'
    ],

    // Enable column + line capture for Test Engine
    testLocationInResults: true
    ```

    If you would like to pass in the API token using a custom environment variable, you can do so using the report options.

    ```js
    // jest.config.js

    // Send results to Test Engine
    reporters: [
      "default",
      [
        "buildkite-test-collector/jest/reporter",
        { token: process.env.CUSTOM_ENV_VAR },
      ],
    ];
    ```

    ### Vitest

    Update your [Vitest configuration](https://vitest.dev/config/):<br>

    ```js
    // vitest.config.js OR vite.config.js


    test: {
    // Send results to Test Engine
      reporters: [
        'default',
        'buildkite-test-collector/vitest/reporter'
      ],

      // Enable column + line capture for Test Engine
      includeTaskLocation: true,
    }
    ```

    If you would like to pass in the API token using a custom environment variable, you can do so using the report options.

    ```js
    // vitest.config.js OR vite.config.js


    test: {
    // Send results to Test Engine
      reporters: [
        'default',
        [
          "buildkite-test-collector/vitest/reporter",
          { token: process.env.CUSTOM_ENV_VAR },
        ],
      ],
    }
    ```

    ### Jasmine

    [Add the Buildkite reporter to Jasmine](https://jasmine.github.io/setup/nodejs.html#reporters):<br>

    ```js
    // SpecHelper.js
    var BuildkiteReporter = require("buildkite-test-collector/jasmine/reporter");
    var buildkiteReporter = new BuildkiteReporter();

    jasmine.getEnv().addReporter(buildkiteReporter);
    ```

    If you would like to pass in the API token using a custom environment variable, you can do so using the report options.

    ```js
    // SpecHelper.js
    var buildkiteReporter = new BuildkiteReporter(undefined, {
      token: process.env.CUSTOM_ENV_VAR,
    });
    ```

    ### Mocha

    [Install mocha-multi-reporters](https://github.com/stanleyhlng/mocha-multi-reporters) in your project:<br>

    ```
    npm install mocha-multi-reporters --save-dev
    ```

    and configure it to run your desired reporter and the Buildkite reporter

    ```js
    // config.json
    {
      "reporterEnabled": "spec, buildkite-test-collector/mocha/reporter"
    }
    ```

    Now update your test script to use the buildkite reporter via mocha-multi-reporters:

    ```js
      // package.json
      "scripts": {
        "test": "mocha --reporter mocha-multi-reporters --reporter-options configFile=config.json"
      },
    ```

    If you would like to pass in the API token using a custom environment variable, you can do so using the report options.

    Since the reporter options are passed in as a json file, we ask you to put the environment variable name as a string value in the `config.json`, which will be retrieved using [dotenv](https://github.com/motdotla/dotenv) in the mocha reporter.

    ```js
    // config.json
    {
      "reporterEnabled": "spec, buildkite-test-collector/mocha/reporter",
      "buildkiteTestCollectorMochaReporterReporterOptions": {
        "token_name": "CUSTOM_ENV_VAR_NAME"
      }
    }
    ```

    ### Playwright

    Update your [Playwright configuration](https://playwright.dev/docs/test-configuration):<br>

    ```js
    // playwright.config.js

    // Send results to Test Engine
    reporter: [
      ['line'],
      ['buildkite-test-collector/playwright/reporter']
    ],
    ```

    If you would like to pass in the API token using a custom environment variable, you can do so using the report options.

    ```js
    // jest.config.js

    // Send results to Test Engine
    reporter: [
      ['line'],
      ['buildkite-test-collector/playwright/reporter', { token: process.env.CUSTOM_ENV_VAR },]
    ],
    ```

    If you would like to pass execution tags through to Test Engine, then you can use Playwright's tagging syntax as follows:

    ```
    test('has tags', { tag: ['@type:feature'] }, ...)
    ```

    This will be threaded through to Test Engine as an execution tag with key set to `type` and value set to `feature`.

   ### Cypress

   Update your [Cypress configuration](https://docs.cypress.io/guides/references/configuration):<br>

   ```js
    // cypress.config.js

    // Send results to Test Engine
   reporter: "buildkite-test-collector/cypress/reporter",
   ```

   If you would like to pass in the API token using a custom environment variable, you can do so using the reporterOptions.

   ```js
   // cypress.config.js

   // Send results to Test Engine
   reporterOptions: {
    token_name: "CUSTOM_ENV_VAR_NAME"
   }
   ```

4. Run your tests locally:<br>

    ```js
    env BUILDKITE_ANALYTICS_TOKEN=xyz npm test
    ```

5. Add the `BUILDKITE_ANALYTICS_TOKEN` secret to your CI, push your changes to a branch, and open a pull request 🎉

    ```bash
    git checkout -b add-bk-test-engine
    git commit -am "Add Buildkite Test Engine"
    git push origin add-bk-test-engine
    ```

## 📓 Notes

This jest collector uses the [`onRunComplete`](https://jestjs.io/docs/configuration#custom-reporters) hook to report test results to the Buildkite API. This interferes with the [`--forceExit`](https://jestjs.io/docs/cli#--forceexit) CLI option and interrupts the request that sends tests results, meaning that no data will be available for your test suite. It's recommended to use [`--detectOpenHandles`](https://jestjs.io/docs/cli#--detectopenhandles) to find any hanging process and clean them up and remove the use of `--forceExit`.

## 🔍 Debugging

To enable debugging output, set the `BUILDKITE_ANALYTICS_DEBUG_ENABLED` environment variable to `true`.

## 🔜 Roadmap

See the [GitHub 'enhancement' issues](https://github.com/buildkite/test-collector-javascript/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement) for planned features. Pull requests are always welcome, and we’ll give you feedback and guidance if you choose to contribute 💚

## ⚒ Developing

After cloning the repository, install the dependencies:

```
npm install
```

And run the tests:

```
npm test
```

Useful resources for developing collectors include the [Buildkite Test Engine docs](https://buildkite.com/docs/test-engine) and the [RSpec and Minitest collectors](https://github.com/buildkite/rspec-buildkite-analytics).

## 👩‍💻 Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/buildkite/test-collector-javascript

## 🚀 Releasing

```sh
# Version bump the code, tag and push
git switch --create prepare-v1-2-3
npm version --no-git-tag-version v1.2.3
git push

# Open a pull request, get it merged
git switch main
git tag v1.2.3
git push --tags

# Publish to the NPM registry
npm publish

# Create a new GitHub release
open "https://github.com/buildkite/test-collector-javascript/releases"
```

## 📜 License

The package is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
