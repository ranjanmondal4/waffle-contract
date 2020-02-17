import Grant from "../build/Grant.json";
import chai from "chai";
import * as waffle from "ethereum-waffle";
import {Contract, Wallet, constants} from "ethers";
import {BigNumber} from "ethers/utils/bignumber";
import {AddressZero} from "ethers/constants";
import {before} from "mocha";

chai.use(waffle.solidity);
const {expect} = chai;

describe("Grant", () => {
  describe("With multiple donors & grantee", () => {
    // const FUND_AMOUNT = 1e3;
    // const REFUND_AMOUNT = FUND_AMOUNT;
    const AMOUNTS = [1e3, 1e3];
    const TARGET_FUNDING = AMOUNTS.reduce((a, b) => a + b, 0);

    async function fixture(provider: any, wallets: Wallet[]) {
      const [
        _granteeWallet,
        _secondGranteeWallet,
        _donorWallet,
        _secondDonorWallet,
        _managerWallet
      ] = wallets;

      // const currentTime = (
      //   await provider.getBlock(await provider.getBlockNumber())
      // ).timestamp;

      const token: Contract = await waffle.deployContract(
        _managerWallet,
        Grant,
        [
          [_granteeWallet.address, _secondGranteeWallet],
          [AMOUNTS],
          TARGET_FUNDING
        ]
      );
    }
  });
});
