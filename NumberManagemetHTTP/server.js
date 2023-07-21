const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 8008;
const axiosIns = axios.create({
  timeout: 500,
});
app.get('/numbers', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'No URLs provided in query parameters.' });
  }

  try {
    const results = await Promise.all(
      Array.isArray(url) ? url.map(fetchData) : [fetchData(url)]
    );
    const mergedNums = results
      .flatMap(({ numbers }) => numbers)
      .filter((number, index, self) => self.indexOf(number) === index && number !== null) 
      .sort((a, b) => a - b); 

    console.log('Merged Numbers:', mergedNums);

    return res.json({ numbers: mergedNums });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: 'Error occurred while fetching data from the URLs.' });
  }
});

async function fetchData(url) {
  try {
    const response = await axiosIns.get(url); 
    console.log('Response:', response.data);

    if (response.data && Array.isArray(response.data.numbers)) {
      const validNumbers = response.data.numbers.filter((number) => number !== null && number !== 0);
      return { numbers: validNumbers };
    } else {
      return { error: `Invalid data from URL: ${url}` };
    }
  } catch (error) {
    console.error('Error:', error.message);
    return { error: `Error fetching data from URL: ${url}` };
  }
}
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
