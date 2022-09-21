async function eligible(response) {

    // if either array is empty return false
    if (response.data.swaps.length == 0 || response.data.deposits.length == 0) {
        console.log("false")
        return 0
    } else {
        console.log("true")
        return 1
    }
}