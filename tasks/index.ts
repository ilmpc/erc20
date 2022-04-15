import * as env from "env-var";
import {
  ethers as ethersLib,
  ContractTransaction,
  ContractReceipt,
  Signer,
} from "ethers";
import { HardhatEthersHelpers } from "@nomiclabs/hardhat-ethers/types";
import { task } from "hardhat/config";

const wait = (tx: ContractTransaction) => tx.wait();

const viewOnEtherScan = (tx?: ContractReceipt) =>
  tx != null &&
  console.log(
    `Check out on etherscan: https://rinkeby.etherscan.io/tx/${tx.transactionHash}`
  );

const getContract = async (
  ethers: typeof ethersLib & HardhatEthersHelpers,
  signer?: Signer
) => {
  const contractAddress = env.get("CONTRACT_ADDRESS").required().asString();
  const Token = await ethers.getContractFactory("ERC20", signer);
  return Token.attach(contractAddress);
};

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

task("aprove")
  .addParam("to")
  .addParam("amount")
  .setAction(async ({ to, amount }, { ethers }) => {
    const token = await getContract(ethers);
    await token
      .approve(to, amount)
      .then(wait)
      .catch(console.error)
      .then(viewOnEtherScan);
  });
