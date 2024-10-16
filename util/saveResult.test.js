const fs = require('fs')
const path = require('path')
const saveResult = require('./saveResult')

describe('saveResult', () => {
  it('saves the result to the location', () => {
    const result = [{ name: 'test', result: 'passed' }]
    const location = 'result.json'

    saveResult(result, location)

    const resultPath = path.resolve(location)
    const resultString = fs.readFileSync(resultPath, 'utf8')

    expect(resultString).toBe(JSON.stringify(result, null, 2))

    fs.unlinkSync(resultPath)
  });
});
