const { Interface } = require('@ethersproject/abi');
const ERC20_ABI = require('./erc20.json');

console.log(ERC20_ABI)

const ERC20_INTERFACE = new Interface(ERC20_ABI)

// create a new interface for the erc20 abi
// const erc20Interface = new ethers.utils.Interface(ERC20_ABI);