const { execute } = require('./.graphclient')

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
   
    let swappeds = await response['data']['swappeds'];
    let depositeds = await response;
    
    // print out the response
    console.log(response)
    console.log(swappeds)

    if (response['data'] != null && response['data']['swappeds'] != null && response['data']['depositeds'] != null) {
        console.log("Eligible")
        return 1
        
    }
    console.log("Not Eligible")
    return 0 
    
    
}

eligibility().catch((e) => console.error(`Failed to run example:`, e))

