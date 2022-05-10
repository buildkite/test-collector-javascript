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

## JavaScript Collector Roadmap

### DONE

- [x] Send test pass/fail status on test completion
- [x] Send failure reason

### TODO

- [ ] Tests
- [ ] Sending through `failure_expanded`
- [ ] HTTP tracing
- [ ] SQL tracing
- [ ] Annotations
- [ ] Live stream results via web sockets
- [ ] Additional test framework support (Cypress , Jasmine, AVA, Mocha, etc)

_Pull requests welcome!_

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/buildkite/js-buildkite-analytics.

## License

The package is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
