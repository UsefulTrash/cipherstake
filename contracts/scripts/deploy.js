const hre = require('hardhat');
async function main() {
  const C = await hre.ethers.getContractFactory('CipherStake');
  const c = await C.deploy();
  await c.waitForDeployment();
  const addr = await c.getAddress();
  console.log('VITE_CONTRACT_ADDRESS=' + addr);
}
main().catch(e => { console.error(e); process.exit(1); });