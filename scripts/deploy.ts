import { ethers } from "hardhat";

async function main() {

  const [owner, otherAccount] = await ethers.getSigners();

  const Fleek = await ethers.getContractFactory("Fleek");
  const fleek = await Fleek.deploy();

  await fleek.deployed();

  console.log(`Fleek token is deployed to ${fleek.address}`);

  const lotteryPrice = await ethers.utils.parseEther("1");

  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const deadline = 5 * 60; // 5 mins

  const lockTime = currentTimestampInSeconds + deadline;

  const Lottery = await ethers.getContractFactory("Lottery");
  const lottery = await Lottery.deploy(fleek.address, lotteryPrice, lockTime );

  await lottery.deployed();

  console.log(`Lottery is deployed to ${lottery.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
