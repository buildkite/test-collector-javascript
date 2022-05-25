const axios = require('axios').default

test('google request', async () => {
  const response = await axios.get('https://www.google.com.au/')
  console.log(response.status) // If we don't query the response the request is never logged

  expect(1 + 2).toBe(3);
});


test('github request', async () => {
  const response = await axios.get('https://github.com/')
  console.log(response.status) // If we don't query the response the request is never logged

  expect(1 + 2).toBe(3);
});

test('ABC news request', async () => {
  const response = await axios.get('https://www.abc.net.au/')
  console.log(response.status) // If we don't query the response the request is never logged

  expect(1 + 2).toBe(3);
});
