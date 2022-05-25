const axios = require('axios').default

test('bing request', async () => {
  const response = await axios.get('https://www.bing.com/')
  console.log(response.status) // If we don't query the response the request is never logged

  expect(1 + 2).toBe(3);
});
