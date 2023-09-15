const key          = 'R2vPkruI9gqXX+6PFQTobQcEbNoEK5WRPA8e+ptLajFpluTZotCF3hlJ'; // API Key
const secret       = '0sry77q/4l+ZOrKhxnXDWEr/V3R1fU665iMRsivbfBoSJGsz7Jr7im10HRBmO7G0mGzbvnBGqkQ6JVPvxnYtcw=='; // API Private Key

const KrakenClient = require('node-kraken-rest-api')
const kraken = new KrakenClient(key, secret)

let Balances;

;(async () => {
  // Display user's balance
  // console.log(await kraken.api('Balance')) 
  let api_res = await kraken.api('Balance')
  Balances = api_res['result']? api_res['result']:{}
  console.log("balance:", Balances)
  // Get Ticker Info
  // console.log(await kraken.api('Ticker', {pair:'TBTCUSD'}))
  // console.log(await kraken.api('Ticker', {pair:'BTCUSD'}))
  // console.log(await kraken.api('Ticker', {pair:'USDCUSD'}))


  // Buy
  let {result}= await kraken.api('Ticker', {pair:'XXBTZUSD'})
  let price = result['XXBTZUSD']['a'][0];
  let volume = Math.floor(parseFloat(Balances['ZUSD'] / price) * 100000)/100000
 
  console.log("--Buy Price:", price, volume)

  if(volume != 0) {
    try {
      const trx = await kraken.api('AddOrder', {
        pair:      "XXBTZUSD",
        type:      "buy",
        ordertype: "market",
        price:     String(price),
        volume:    String(volume)
      });
    
      console.log("trx:", trx);
      console.log(`order type: buy,  token pair: XXBTZUSD,  order price: ${price}, order volume: ${volume}, tx id: ${trx['result']['txid']}`)
      console.log("Buy Success!\n")
    } catch (error) {
      console.log("Buy failed!\n")
    }
  }

})()