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

  // Sell
  let {result}= await kraken.api('Ticker', {pair:'XXBTZUSD'})
  let price = result['XXBTZUSD']['a'][0];
  let volume = Balances['XXBT']


  let DM = await kraken.api('DepositMethods', {asset:'USDC'})

  console.log("dm:",)


  console.log("price:", price, volume)

})()