const { execute } = require('./.graphclient');
const CoinGecko = require('coingecko-api');
const ethers = require('ethers');
const ERC20_INTERFACE = require('./abis/erc20.js');
const ERC20_ABI = require('./abis/erc20.json');

async function query() {
    const response = await execute (
    `
    {
        swappeds(where: {recipient: "0x68e8d1b6454de1ca04e90c60dc79101af6bf07e0"}) {
            txn
            timestamp
            recipient
            inputAsset
            targetAsset
            inputAmount
            realizedFill
        }
        depositeds(where: {depositor: "0x68e8d1b6454de1ca04e90c60dc79101af6bf07e0"}) {
            txn
            timestamp
            depositor
            asset
            depositAmount
        }
    }`,
    {},
    )

    //console.log(response)

    return response
}

async function eligibility() {

    const response = await query()
    const CoinGeckoClient = new CoinGecko();

   
    let swappeds = await response['data']['swappeds'];
    let depositeds = await response['data']['depositeds'];
    
    // print out the response
    console.log(depositeds)

    // connect to an ethers provider 
    let nodeUrl = 'TODO: ENTER YOUR OPTIMISM NODE URL HERE';
    const provider = new ethers.providers.JsonRpcProvider(nodeUrl);

    if (response['data'] != null && response['data']['swappeds'] != null && response['data']['depositeds'] != null) {
        console.log('swappeds and depositeds are not null')

        // set variables for swap and deposit eligibility
        let swapEligibility = false;
        let depositEligibility = false;

        // iterate through the swappeds and convert the inputAmount from an integer to a float
        // get the decimal value of the inputAsset and divide the inputAmount by 10^decimal
        for (let i = 0; i < swappeds.length; i++) {

            // check the input asset and get the decimal value from ethers
            let inputAsset = swappeds[i]['inputAsset'];
            let inputAssetContract = new ethers.Contract(inputAsset, ERC20_ABI, provider);

            // get the decimal value of the input asset
            let inputAssetDecimal = await inputAssetContract.decimals();

            // get the symbol of the input asset
            let inputAssetSymbol = await inputAssetContract.symbol();

            // convert the inputAmount to a float
            let inputAmount = swappeds[i]['inputAmount'];
            let inputAmountFloat = inputAmount / Math.pow(10, inputAssetDecimal);
                
            // get the price of the inputAsset from CoinGecko at the timestamp of the swap
            let timestamp = swappeds[i]['timestamp'];

            // get the price during the timestamp
            let price = await CoinGeckoClient.coins.fetchCoinContractMarketChartRange(inputAsset, 'optimistic-ethereum', {
                from: timestamp-1,
                to: timestamp+1,
            });

            // now get the average of the values in data.prices
            let prices = price['data']['prices'];
            let sum = 0;
            for (let j = 0; j < prices.length; j++) {
                sum += prices[j][1];
            }   
            let average = sum / prices.length;

            // log the average price of the input asset
            console.log('price of', inputAssetSymbol, ': ', average.toFixed(2));

            // create a variable for the USD amount and log rounded value
            let usdAmount = average * inputAmountFloat;
            console.log('usd amount of', inputAssetSymbol, ': ', usdAmount.toFixed(2));

            // if the swap amount is greater than 20 USD, set swapEligibility to true
            if (inputAmountFloat * average > 20) {
                swapEligibility = true;
            }

            // log the swap eligibility
            console.log('swap eligibility: ', swapEligibility);

        // iterate through the depositeds and convert the depositAmount from an integer to a float
        // get the decimal value of the asset and divide the depositAmount by 10^decimal
        // get the price of the asset from CoinGecko at the timestamp of the deposit
        // if the deposit amount is greater than 20 USD, set depositEligibility to true
        for (let i = 0; i < depositeds.length; i++) {

            // check the asset and get the decimal value from ethers
            let asset = depositeds[i]['asset'];
            let assetContract = new ethers.Contract(asset, ERC20_ABI, provider);

            // get the decimal value of the asset
            let assetDecimal = await assetContract.decimals();

            // get the symbol of the asset
            let assetSymbol = await assetContract.symbol();

            // convert the depositAmount to a float
            let depositAmount = depositeds[i]['depositAmount'];
            let depositAmountFloat = depositAmount / Math.pow(10, assetDecimal);

            // get the price of the asset from CoinGecko at the timestamp of the deposit
            let timestamp = depositeds[i]['timestamp'];

            // get the price during the timestamp
            let price = await CoinGeckoClient.coins.fetchCoinContractMarketChartRange(asset, 'optimistic-ethereum', {
                from: timestamp-1,
                to: timestamp+1,
            });
            
            // now get the average of the values in data.prices
            let prices = price['data']['prices'];
            let sum = 0;
            for (let j = 0; j < prices.length; j++) {
                sum += prices[j][1];
            }
            let average = sum / prices.length;

            // log the average price of the asset
            console.log('price of', assetSymbol, ': ', average.toFixed(2));

            // create a variable for the USD amount and log rounded value
            let usdAmount = average * depositAmountFloat;
            console.log('usd amount of', assetSymbol, ': ', usdAmount.toFixed(2));

            // if the deposit amount is greater than 20 USD, set depositEligibility to true
            if (depositAmountFloat * average > 20) {
                depositEligibility = true;
            }

            // log the deposit eligibility
            console.log('deposit eligibility: ', depositEligibility);
        }
            
        // if both swapEligibility and depositEligibility are true, return 1
        if (swapEligibility && depositEligibility) {
            console.log('both swap and deposit eligibility are true')
            return 1;
        }
        
    }
    console.log("Not Eligible")
    return 0 
    }
}

eligibility().catch((e) => console.error(`Failed to run example:`, e))