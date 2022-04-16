import * as env from "env-var";
import { HardhatEthersHelpers } from "@nomiclabs/hardhat-ethers/types";
import {
  ethers as ethersLib,
  ContractReceipt,
  ContractTransaction,
  Signer,
} from "ethers";

export const wait = (tx: ContractTransaction) => tx.wait();

export const viewOnEtherScan = (tx?: ContractReceipt) =>
  tx != null &&
  console.log(
    `Check out on etherscan: https://rinkeby.etherscan.io/tx/${tx.transactionHash}`
  );

export const getContract = async (
  ethers: typeof ethersLib & HardhatEthersHelpers,
  signer?: Signer
) => {
  const contractAddress = env.get("CONTRACT_ADDRESS").required().asString();
  const Token = await ethers.getContractFactory("ERC20", signer);
  return Token.attach(contractAddress);
};
