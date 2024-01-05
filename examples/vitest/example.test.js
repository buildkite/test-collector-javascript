import { expect, test, describe } from 'vitest'

// No scope
test('1 + 2 to equal 3', () => {
  expect(1 + 2).toBe(3);
});

// In a scope
describe('sum', () => {
  test('40 + 1 equal 42', () => {
    expect(40 + 1).toBe(42);
  });
})