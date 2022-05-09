# Buildkite Test Analytics Collector for JavaScript


This package collects data about your test suite's performance and reliability, and allows you to see trends and insights about your test suite over time ✨

So far, it supports **Jest**. We hope to add more JavaScript test frameworks soon.

## Usage - Jest

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

### Jest Collector Roadmap

#### DONE

- [x] Baseline metric collection, such as test duration and pass/fail states
- [x] Error messaging

#### TODO

- [ ] Support for deep-dives into spans via records of time spent in HTTP requests or running SQL queries
- [ ] Support for annotations
- [ ] Web socket support

_Pull requests welcome!_

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/buildkite/js-buildkite-analytics.

## License

The package is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).