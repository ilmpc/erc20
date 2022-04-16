import { task } from "hardhat/config";
import { getContract, viewOnEtherScan, wait } from "./helpers";

task("transferFrom")
  .addParam("from")
  .addParam("to")
  .addParam("amount")
  .setAction(async ({ from, to, amount }, { ethers }) => {
    const token = await getContract(ethers);
    await token
      .transfer(from, to, amount)
      .then(wait)
      .catch(console.error)
      .then(viewOnEtherScan);
  });
