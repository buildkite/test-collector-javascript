# Buildkite Analytics for JavaScript

## Jest

1) Add 'buildkite-analytics' to your npm packages
2) Configure Jest to use the buildkite test analytics reporter

```.js
  // jest.config.js
  reporters: [
    'default',
    'buildkite-analytics/jest-reporter'
  ]
```

3) set the environment variable for your test analytics
```sh
  export BUILDKITE_ANALYTICS_KEY=key-found-on-website
```

4) Run your tests
