import DappToken from "../build/DappToken.json";
import chai from "chai";
import * as waffle from "ethereum-waffle";
import {Contract, Wallet, constants} from "ethers";
import {BigNumber} from "ethers/utils/bignumber";
import {AddressZero, Zero} from "ethers/constants";
import {before} from "mocha";

chai.use(waffle.solidity);
const {expect} = chai;

describe("DappToken", () => {
  let userWallet: Wallet, secondUserWallet: Wallet, adminWallet: Wallet;
  let token: Contract;
  let provider: any;

  const INITIAL_TOKEN_BALANCE = 1000;
  const TEST_OVERRIDES_FOR_REVERT = {gasLimit: 1000000};

  async function fixture(_provider: any, _wallets: Wallet[]) {
    const [_userWallet, _secondUserWallet, _adminWallet] = _wallets;

    // const currentTime = (
    //   await provider.getBlock(await provider.getBlockNumber())
    // ).timestamp;

    const _token: Contract = await waffle.deployContract(
      _adminWallet,
      DappToken,
      [INITIAL_TOKEN_BALANCE]
    );

    return {
      _userWallet,
      _secondUserWallet,
      _adminWallet,
      _token,
      _provider
    };
  }

  before(async () => {
    const {
      _userWallet,
      _secondUserWallet,
      _adminWallet,
      _token,
      _provider
    } = await waffle.loadFixture(fixture);

    userWallet = _userWallet;
    secondUserWallet = _secondUserWallet;
    adminWallet = _adminWallet;
    token = _token;
    provider = _provider;
  });

  it(`should have ${INITIAL_TOKEN_BALANCE} tokens`, async () => {
    const tokenBalance = await token.totalSupply();
    expect(tokenBalance).to.be.eq(INITIAL_TOKEN_BALANCE);
  });

  it(`should update admin and its balance`, async () => {
    const tokenBalance = await token.balanceOf(adminWallet.address);
    expect(tokenBalance).to.be.eq(INITIAL_TOKEN_BALANCE);

    const adminAddress = await token.admin();
    expect(adminAddress).to.be.eq(adminAddress);
  });

  it(`should debit admin and credit user on transfer`, async () => {
    await expect(
      token.transfer(userWallet.address, Zero, TEST_OVERRIDES_FOR_REVERT)
    ).to.be.revertedWith(
      "transfer::Amount Error, Amount should be greator than 0"
    );
  });
});
