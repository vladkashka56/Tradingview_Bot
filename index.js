const express = require("express");
const bodyParser = require('body-parser');
const KrakenClient = require('node-kraken-rest-api')
const config = require('./config');

// Create an instance of the Express application
const app = express();
let Balances; // Account's balances

// Set up middleware to parse incoming JSON requests
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

// Set up the Kraken API client with the API key and secret from the config file
const kraken = new KrakenClient({key: config.kraken.APIKEY, secret: config.kraken.APISECRET})
let api_res = await kraken.api('Balance')
Balances = api_res['result']? api_res['result']:{}


// Set up a POST endpoint to receive webhook messages from TradingView
app.post('/webhook', (req, res) => {
    const alertData = req.body;
  
    // Log the incoming message
    console.log('Received message:', alertData);
  
    // Process the alert data based on the strategy specified in the message
    processAlertData(alertData);
  
    // Send a response to the webhook
    res.json({ status: 'success', data: alertData });
});

// Function to process alert data based on the specified strategy
function processAlertData(alertData) {
    const strategy = alertData.strategy;
  
    if (strategy === 'CE-STG') {
      // Call the function to process the USD inflation strategy
      processCestgStrategy(alertData);
    } else {
      // Log an error message if the strategy is invalid or not supported
      console.log('Invalid strategy or strategy not supported:', strategy);
    }
}

// Function to process the CE-STG strategy
const processCestgStrategy = async (alertData) => {
    // {
    //     strategy: 'CE-STG',
    //     action: 'buy' or 'sell'
    //     price: 30223
    // }
    // Extract the necessary data from the alert
    const action = alertData.action;
    const price = parseFloat(alertData.price);

    const baseToken = config.tokens.base;
    const quoteToken = config.tokens.quote;
    const tokenPair = baseToken + quoteToken; 

    if (action === 'buy') {
      // Place a market buy order
      const orderPrice = await getTokenPrice(tokenPair)
      const orderVolume = parseFloat(Balances[quoteToken] / orderPrice).toFixed(5)
      if(orderVolume != 0) {
        try {
          const trx = await kraken.api('AddOrder', {
            pair:      tokenPair,
            type:      "buy",
            ordertype: "market",
            price:     String(orderPrice),
            volume:    String(orderVolume)
          });
          console.log(`order type: buy,  token pair: ${tokenPair},  order price: ${orderPrice}, order volume: ${orderVolume}, tx id: ${trx['result']['txid']}`)
          console.log("Buy Success!\n")
        } catch (error) {
          console.log("Buy failed!\n")
        }
      }
    } else if (action === 'sell') {
      // Place a market sell order
      const orderPrice = await getTokenPrice(tokenPair)
      const orderVolume = parseFloat(Balances[baseToken]).toFixed(5)
      if(orderVolume != 0) {
        try {
          const trx = await kraken.api('AddOrder', {
            pair:      tokenPair,
            type:      "sell",
            ordertype: "market",
            price:     String(orderPrice),
            volume:    String(orderVolume)
          });
          console.log(`order type: sell,  token pair: ${tokenPair},  order price: ${orderPrice}, order volume: ${orderVolume}, tx id: ${trx['result']['txid']}`)
          console.log("Sell Success!\n")
        } catch (error) {
          console.log("Sell failed!\n")
        }
      }

    } else {
      console.log('Invalid action:', action);
    }
}

const getTokenPrice = async (tokenPair) => {
  let {result}= await kraken.api('Ticker', {pair: tokenPair});
  let price = result[tokenPair]['a'][0];
  return price;
}



const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server is running in port ${PORT}`));
