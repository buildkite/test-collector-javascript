const assert = require('assert')

// No scope
it('1 + 2 to equal 3', () => {
  assert.equal(1 + 2, 3);
});

// In a scope
describe('sum', () => {
  it('40 + 1 equal 42', () => {
    assert.equal(40 + 1, 42);
  });  
})