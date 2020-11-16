const express = require('express')
const yahooStockAPI  = require('yahoo-stock-api');

const app = express()
const port = 3000

const DEFAULT = 'DDOG'

app.get('/api', async (req, res) => {
  const ticker = req.query.ticker ? req.query.ticker : DEFAULT 
  const endDate = new Date();
  const startDate = new Date(new Date().setFullYear(endDate.getFullYear() - 1));
  const data = await yahooStockAPI.getHistoricalPrices(startDate, endDate, ticker, '1d')
	data['ticker'] = ticker
  res.send(data)
})

app.use(express.static('docs'))

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})