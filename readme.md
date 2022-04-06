# Buildkite Analytics for JavaScript

## Jest

1) Setup a project on buildkite analtics and note the key
2) Add 'buildkite-analytics' to your npm packages
3) Configure Jest to use the buildkite test analytics reporter

```.js
  // jest.config.js
  reporters: [
    'default',
    'buildkite-analytics/jest-reporter'
  ]
```

4) set the environment variable for your test analytics
```sh
  export BUILDKITE_ANALYTICS_KEY=key-found-on-website
```

5) Run your tests
