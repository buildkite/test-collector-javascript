const fs = require('fs');
const path = require('path');

const saveResult = (result, location) => {
  const resultPath = path.resolve(location)
  const resultString = JSON.stringify(result, null, 2)

  fs.writeFileSync(resultPath, resultString)
};

module.exports = saveResult;
