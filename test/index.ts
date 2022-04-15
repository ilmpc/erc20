import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, BigNumberish, ContractTransaction } from "ethers";
import { ethers } from "hardhat";

import { ERC20 } from "../typechain";

enum Errors {
  NotAnOwner = "Caller is not an owner",
  NotEnoughTokens = "Not enough tokens",
  NotEnoughAllowed = "Not enough allowed",
}

const TOKEN_NAME = "SHIIISH";
const TOKEN_SYMBOL = "III";
const TOKEN_DECIMALS = 6;
const AMOUNT = BigNumber.from(1_000_000);

describe("ERC20", async () => {
  let owner: SignerWithAddress;
  let others: SignerWithAddress[];
  let token: ERC20;

  beforeEach(async () => {
    [owner, ...others] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("ERC20");
    token = await Token.deploy(TOKEN_NAME, TOKEN_SYMBOL, TOKEN_DECIMALS);
    await token.deployed();
  });

  // Helpers

  const wait = (tx: ContractTransaction) => tx.wait();

  const mintAndCheck = async (
    amount: BigNumberish,
    to: SignerWithAddress = owner
  ) => {
    const supply = await token.totalSupply();

    await expect(() => token.mint(to.address, amount)).to.changeTokenBalance(
      token,
      to,
      amount
    );

    expect((await token.totalSupply()).sub(supply)).is.equal(amount);
  };

  // Tests
  describe("Basic", () => {
    it("should be deployed", async () => {
      expect(token.address).to.be.properAddress;
    });
    it("should return token info", async () => {
      expect(await token.name()).to.be.equal(TOKEN_NAME);
      expect(await token.symbol()).to.be.equal(TOKEN_SYMBOL);
      expect(await token.decimals()).to.be.equal(TOKEN_DECIMALS);
    });
    it("should return 0 for totalSupply", async () => {
      expect(await token.totalSupply()).to.be.equal(0);
    });
    it("should return 0 for balance", async () => {
      expect(await token.balanceOf(owner.address)).to.be.equal(0);
    });
    it("should return 0 for allowance", async () => {
      expect(
        await token.allowance(owner.address, others[0].address)
      ).to.be.equal(0);
    });
  });

  describe("Mint", () => {
    it("should mint token to owner", async () => {
      await mintAndCheck(AMOUNT);
    });
    it("should revert if called by not owner", async () => {
      await expect(
        token.connect(others[0]).mint(others[0].address, AMOUNT)
      ).revertedWith(Errors.NotAnOwner);
    });
    it("should mint token to other by owner", async () => {
      await mintAndCheck(AMOUNT, others[0]);
    });
    it("should emit Transfer from 0x0", async () => {
      await expect(token.mint(others[0].address, AMOUNT))
        .to.emit(token, "Transfer")
        .withArgs(ethers.constants.AddressZero, others[0].address, AMOUNT);
    });
  });

  describe("Burn", async () => {
    it("should burn token from owner", async () => {
      await mintAndCheck(AMOUNT);

      await expect(() =>
        token.burn(owner.address, AMOUNT)
      ).to.changeTokenBalance(token, owner, AMOUNT.mul(-1));

      expect(await token.totalSupply()).to.be.equal(0);
    });
    it("should revert if called by not owner", async () => {
      await expect(
        token.connect(others[0]).burn(others[0].address, AMOUNT)
      ).revertedWith(Errors.NotAnOwner);
    });
    it("should revert if not enough tokens to burn", async () => {
      await expect(token.burn(owner.address, AMOUNT)).revertedWith(
        Errors.NotEnoughTokens
      );
    });
    it("should burn other's token by owner", async () => {
      await mintAndCheck(AMOUNT, others[0]);

      await expect(() =>
        token.burn(others[0].address, AMOUNT)
      ).to.changeTokenBalance(token, others[0], AMOUNT.mul(-1));

      expect(await token.totalSupply()).to.be.equal(0);
    });
    it("should emit Transfer to 0x0", async () => {
      await mintAndCheck(AMOUNT);

      await expect(token.burn(owner.address, AMOUNT))
        .to.emit(token, "Transfer")
        .withArgs(owner.address, ethers.constants.AddressZero, AMOUNT);
    });
  });

  describe("Transfer", async () => {
    it("should transfer token to another account", async () => {
      await mintAndCheck(AMOUNT);

      await expect(() =>
        token.transfer(others[0].address, AMOUNT)
      ).to.changeTokenBalances(
        token,
        [owner, others[0]],
        [AMOUNT.mul(-1), AMOUNT]
      );
    });
    it("should revert if not enough tokens", async () => {
      await expect(
        token.transfer(others[0].address, AMOUNT)
      ).to.be.revertedWith(Errors.NotEnoughTokens);
    });
  });

  describe("Approve", async () => {
    it("should approve requested amount", async () => {
      const getAllowance = async () =>
        await token.allowance(owner.address, others[0].address);
      expect(await getAllowance()).to.be.equal(0);
      await token.approve(others[0].address, AMOUNT).then(wait);
      expect(await getAllowance()).to.be.equal(AMOUNT);
    });
    it("should emit event Approval", async () => {
      await expect(token.approve(others[0].address, AMOUNT))
        .to.emit(token, "Approval")
        .withArgs(owner.address, others[0].address, AMOUNT);
    });
  });

  describe("TransferFrom", async () => {
    it("should be able to transfer what allowed", async () => {
      await mintAndCheck(AMOUNT);
      await token.approve(others[0].address, AMOUNT).then(wait);

      await expect(() =>
        token
          .connect(others[0])
          .transferFrom(owner.address, others[0].address, AMOUNT)
      ).to.changeTokenBalances(
        token,
        [owner, others[0]],
        [AMOUNT.mul(-1), AMOUNT]
      );
    });
    it("should revert if not allowed enough", async () => {
      await mintAndCheck(AMOUNT);
      await expect(
        token
          .connect(others[0])
          .transferFrom(owner.address, others[0].address, AMOUNT)
      ).to.revertedWith(Errors.NotEnoughAllowed);
    });
    it("should revert if not enough tokens", async () => {
      await token.approve(others[0].address, AMOUNT).then(wait);
      await expect(
        token
          .connect(others[0])
          .transferFrom(owner.address, others[0].address, AMOUNT)
      ).to.revertedWith(Errors.NotEnoughTokens);
    });
    it("should emit Transfer", async () => {
      await mintAndCheck(AMOUNT);
      await token.approve(others[0].address, AMOUNT).then(wait);

      await expect(
        token
          .connect(others[0])
          .transferFrom(owner.address, others[0].address, AMOUNT)
      )
        .to.emit(token, "Transfer")
        .withArgs(owner.address, others[0].address, AMOUNT);
    });
    it("should decrease allowance", async () => {
      await mintAndCheck(AMOUNT);
      await token.approve(others[0].address, AMOUNT).then(wait);

      await token
        .connect(others[0])
        .transferFrom(owner.address, others[0].address, AMOUNT)
        .then(wait);

      expect(
        await token.allowance(owner.address, others[0].address)
      ).to.be.equal(0);
    });
  });
});
