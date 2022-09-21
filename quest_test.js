const { execute } = require('./.graphclient');

async function query() {
    const response = await execute (
    `
    {
        swaps(where : {recipient: "0x95b84eafd873bb3ab3fd585cd25feae92a59f85d", inputAssetUsdValue_gte : 20, timestamp_gte : 0}) {
            recipient
            inputAssetUsdValue
        }
        deposits(where: {depositor: "0xbf57f59d35124f071001fc9185e5169a7c44da1b", usdValue_gte : 20, timestamp_gte : 0}) {
            depositor
            usdValue
        }
    }`,
    {},
    )

    console.log(response)

    return response
} // 1663646400

async function eligible() {
    
    // call the query function
    const response = await query()

    // if either array is empty return false
    if (response.data.swaps.length == 0 || response.data.deposits.length == 0) {
        console.log("false")
        return 0
    } else {
        console.log("true")
        return 1
    }
}

eligible().catch((e) => console.error(`Failed to run example:`, e))