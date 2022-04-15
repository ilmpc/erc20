// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { appendFileSync } from "fs";
import { ethers } from "hardhat";
import { join } from "path";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const ERC20 = await ethers.getContractFactory("ERC20");
  const token = await ERC20.deploy("SHIIISH", "III", 6);

  await token.deployed();

  console.log("Token deployed to:", token.address);
  appendFileSync(
    join(__dirname, "..", ".env"),
    `CONTRACT_ADDRESS=${token.address}\n`
  );
  console.log("Contract address was saved into .env file");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
