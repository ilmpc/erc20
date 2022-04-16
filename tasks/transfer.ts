import { task } from "hardhat/config";
import { getContract, viewOnEtherScan, wait } from "./helpers";

task("transfer")
  .addParam("to")
  .addParam("amount")
  .setAction(async ({ to, amount }, { ethers }) => {
    const token = await getContract(ethers);
    await token
      .transfer(to, amount)
      .then(wait)
      .catch(console.error)
      .then(viewOnEtherScan);
  });
