import baseConfig from './vitest.config';

const config = {
  // Send results to Test Engine
  ...baseConfig,
  test: {
    ...baseConfig.test,
    includeTaskLocation: false,
  }
};

export default config;
