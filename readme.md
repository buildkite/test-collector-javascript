# Buildkite Test Analytics Collector for Javascript

## Jest

1) Setup a project on [Buildkite Test Analtics](https://buildkite.com/test-analytics) and note the key
2) Add 'buildkite-analytics' to your npm packages
3) Configure Jest to use the reporter and enable `testLocationInResults`

```js
  // jest.config.js
  reporters: [
    'default',
    'buildkite-analytics/jest-reporter'
  ],
  testLocationInResults: true
```

4) set the environment variable for your test analytics
```sh
  export BUILDKITE_ANALYTICS_KEY=key-found-on-website
```

5) Run your tests
