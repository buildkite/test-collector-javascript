# Buildkite Test Analytics Collector for JavaScript

## Jest

1) Setup a project on [Buildkite Test Analytics](https://buildkite.com/test-analytics) and note the key
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
  export BUILDKITE_ANALYTICS_API_TOKEN=xyz
```

5) Run your tests

To enable debugging, set `BUILDKITE_ANALYTICS_DEBUG_ENABLED=true`

## Jest Collector Roadmap

### DONE

- [x] Baseline metric collection, such as test duration and pass/fail states
- [x] Error messaging

### TODO

- [ ] Support for deep-dives into spans via records of time spent in HTTP requests or running SQL queries
- [ ] Support for annotations
- [ ] Web socket support

_Pull requests welcome!_
