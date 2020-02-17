import DappToken from "../build/DappToken.json";
import chai from "chai";
import * as waffle from "ethereum-waffle";
import {Contract, Wallet, constants} from "ethers";
import {BigNumber} from "ethers/utils/bignumber";
import {AddressZero, Zero, NegativeOne, One} from "ethers/constants";
import {before} from "mocha";

chai.use(waffle.solidity);
const {expect} = chai;

describe("DappToken", () => {
  let userWallet: Wallet, secondUserWallet: Wallet, adminWallet: Wallet;
  let tokenWithAdmin: Contract, tokenWithUser: Contract;
  let provider: any;

  const INITIAL_TOKEN_BALANCE = 1e3;
  const GAS_LIMIT = {gasLimit: 1000000};

  async function fixture(_provider: any, _wallets: Wallet[]) {
    const [_userWallet, _secondUserWallet, _adminWallet] = _wallets;

    // const currentTime = (
    //   await provider.getBlock(await provider.getBlockNumber())
    // ).timestamp;

    const _tokenWithAdmin: Contract = await waffle.deployContract(
      _adminWallet,
      DappToken,
      [INITIAL_TOKEN_BALANCE]
    );

    const _tokenWithUser: Contract = new Contract(
      _tokenWithAdmin.address,
      DappToken.abi,
      _userWallet
    );

    return {
      _userWallet,
      _secondUserWallet,
      _adminWallet,
      _tokenWithAdmin,
      _tokenWithUser,
      _provider
    };
  }

  before(async () => {
    const {
      _userWallet,
      _secondUserWallet,
      _adminWallet,
      _tokenWithAdmin,
      _tokenWithUser,
      _provider
    } = await waffle.loadFixture(fixture);

    userWallet = _userWallet;
    secondUserWallet = _secondUserWallet;
    adminWallet = _adminWallet;
    tokenWithAdmin = _tokenWithAdmin;
    tokenWithUser = _tokenWithUser;
    provider = _provider;
  });

  it(`should have ${INITIAL_TOKEN_BALANCE} tokens`, async () => {
    const tokenBalance = await tokenWithAdmin.totalSupply();
    expect(tokenBalance).to.be.eq(INITIAL_TOKEN_BALANCE);
  });

  it(`should update admin and its balance`, async () => {
    const tokenBalance = await tokenWithAdmin.balanceOf(adminWallet.address);
    expect(tokenBalance).to.be.eq(INITIAL_TOKEN_BALANCE);

    const adminAddress = await tokenWithAdmin.admin();
    expect(adminAddress).to.be.eq(adminAddress);
  });

  it(`should revert on zero transfer`, async () => {
    await expect(
      tokenWithAdmin.transfer(userWallet.address, Zero, GAS_LIMIT)
    ).to.be.revertedWith(
      "transfer::Amount Error, Amount should be greator than 0"
    );
  });

  it(`should revert when transfer amount > sender's balance`, async () => {
    // Admin transfer tokens to user
    const tokenBalance = await tokenWithAdmin.balanceOf(adminWallet.address);
    await expect(
      tokenWithAdmin.transfer(userWallet.address, tokenBalance + 1, GAS_LIMIT)
    ).to.be.revertedWith(
      "transfer::Balance Error, Insufficient balance of sender"
    );
  });

  it(`should update the amount of sender and receiver on Transfer`, async () => {
    const AMOUNT = 100;
    // Admin transfer tokens to user
    await tokenWithAdmin.transfer(userWallet.address, AMOUNT, GAS_LIMIT);

    // Checking admin balances
    const adminTokenBalance = await tokenWithAdmin.balanceOf(
      adminWallet.address
    );
    expect(INITIAL_TOKEN_BALANCE - AMOUNT).to.be.eq(adminTokenBalance);

    // Checking user balances
    const userTokenBalance = await tokenWithAdmin.balanceOf(userWallet.address);
    expect(userTokenBalance).to.be.eq(AMOUNT);
  });

  it(`should emit event on Transfer`, async () => {
    const AMOUNT = 100;
    // Admin transfer tokens to user
    await expect(tokenWithAdmin.transfer(userWallet.address, AMOUNT, GAS_LIMIT))
      .to.be.emit(tokenWithAdmin, "Transfer")
      .withArgs(adminWallet.address, userWallet.address, AMOUNT);
  });

  it(`should update allowance on Approve`, async () => {
    const AMOUNT = 50;
    // Approving amount for user
    await tokenWithAdmin.approve(userWallet.address, AMOUNT);

    const userAllowance = await tokenWithAdmin.allowance(
      adminWallet.address,
      userWallet.address
    );
    expect(userAllowance).to.be.eq(AMOUNT);
  });

  it(`should update new allowance on again Approve`, async () => {
    const AMOUNT = 70;
    // Approving amount for user
    await tokenWithAdmin.approve(userWallet.address, AMOUNT);

    const userAllowance = await tokenWithAdmin.allowance(
      adminWallet.address,
      userWallet.address
    );
    expect(userAllowance).to.be.eq(AMOUNT);
  });

  it(`should emit event on Approve`, async () => {
    const AMOUNT = 100;
    // Approving amount for user
    await expect(tokenWithAdmin.approve(userWallet.address, AMOUNT))
      .to.be.emit(tokenWithAdmin, "Approval")
      .withArgs(adminWallet.address, userWallet.address, AMOUNT);
  });

  it(`should revert on amount zero on TransferFrom`, async () => {
    const AMOUNT = 0;
    // Transfer amount user to second user via admin
    await expect(
      tokenWithUser.transferFrom(
        adminWallet.address,
        secondUserWallet.address,
        AMOUNT,
        GAS_LIMIT
      )
    ).to.be.revertedWith(
      "transferFrom::Amount Error, Amount should be greator than 0"
    );
  });

  it(`should revert when amount > balance of sender on TransferFrom`, async () => {
    const AMOUNT = (await tokenWithAdmin.balanceOf(adminWallet.address)).add(
      One
    );
    // Transfer amount user to second user via admin
    await expect(
      tokenWithUser.transferFrom(
        adminWallet.address,
        secondUserWallet.address,
        AMOUNT,
        GAS_LIMIT
      )
    ).to.be.revertedWith(
      "transferFrom::Balance Error, Insufficient balance to transfer"
    );
  });

  it(`should revert when amount > allowance for user on TransferFrom`, async () => {
    const AMOUNT = (
      await tokenWithAdmin.allowance(adminWallet.address, userWallet.address)
    ).add(One);

    // Transfer amount user to second user via admin
    await expect(
      tokenWithUser.transferFrom(
        adminWallet.address,
        secondUserWallet.address,
        AMOUNT,
        GAS_LIMIT
      )
    ).to.be.revertedWith(
      "transferFrom::Allowance Error, Insufficient balance of owner"
    );
  });

  it(`should update balaces of admin and second user, and allowance for user on TransferFrom`, async () => {
    const AMOUNT = 10;

    // Token balances before transfer
    const tokenBalanceOfAdminBeforeTransfer = await tokenWithAdmin.balanceOf(
      adminWallet.address
    );
    const tokenBalanceOfSecondUserBeforeTransfer = await tokenWithAdmin.balanceOf(
      secondUserWallet.address
    );

    // Allowance before transfer
    const allowanceBeforeTransfer = await tokenWithAdmin.allowance(
      adminWallet.address,
      userWallet.address
    );

    // Transfer amount user to second user via admin
    await tokenWithUser.transferFrom(
      adminWallet.address,
      secondUserWallet.address,
      AMOUNT
    );

    // Token balances after transfer
    const tokenBalanceOfAdminAfterTransfer = await tokenWithAdmin.balanceOf(
      adminWallet.address
    );
    const tokenBalanceOfSecondUserAfterTransfer = await tokenWithAdmin.balanceOf(
      secondUserWallet.address
    );

    expect(tokenBalanceOfAdminBeforeTransfer.sub(AMOUNT)).to.be.eq(
      tokenBalanceOfAdminAfterTransfer
    );
    expect(tokenBalanceOfSecondUserBeforeTransfer.add(AMOUNT)).to.be.eq(
      tokenBalanceOfSecondUserAfterTransfer
    );

    // Allowance after transfer
    const allowanceAfterTransfer = await tokenWithAdmin.allowance(
      adminWallet.address,
      userWallet.address
    );

    expect(allowanceBeforeTransfer.sub(AMOUNT)).to.be.eq(
      allowanceAfterTransfer
    );
  });

  it(`should update balaces of admin and second user, and allowance for user on TransferFrom`, async () => {
    const AMOUNT = 20;
    // Transfer amount user to second user via admin
    await expect(
      tokenWithUser.transferFrom(
        adminWallet.address,
        secondUserWallet.address,
        AMOUNT
      )
    )
      .to.be.emit(tokenWithAdmin, "Transfer")
      .withArgs(adminWallet.address, secondUserWallet.address, AMOUNT);
  });

  it(`should revert when user tries to minting token`, async () => {
    const AMOUNT = 20;
    // Minting of token by user
    await expect(
      tokenWithUser.mint(AMOUNT, userWallet.address, GAS_LIMIT)
    ).to.be.revertedWith("onlyAdmin::Status Error, Only admin is allowed");
  });

  it(`should revert when amount is zero on Minting`, async () => {
    const AMOUNT = 0;
    // Minting of token
    await expect(
      tokenWithAdmin.mint(AMOUNT, userWallet.address, GAS_LIMIT)
    ).to.be.revertedWith(
      "mint::Amount Error, Amount should be greator than 0"
    );
  });

  it(`should update balances on Minting`, async () => {
    // Token balance of user and total supply before Minting
    const tokenSupplyBeforeMinting = await tokenWithAdmin.totalSupply();
    const tokenBalanceOfUserBeforeMinting = await tokenWithAdmin.balanceOf(
      userWallet.address
    );

    // Minting of token
    const AMOUNT = 30;
    await tokenWithAdmin.mint(AMOUNT, userWallet.address);

    // Token balance of user and total supply after Minting
    const tokenSupplyAfterMinting = await tokenWithAdmin.totalSupply();
    const tokenBalanceOfUserAfterMinting = await tokenWithAdmin.balanceOf(
      userWallet.address
    );

    expect(tokenSupplyBeforeMinting.add(AMOUNT)).to.be.eq(
      tokenSupplyAfterMinting
    );
    expect(tokenBalanceOfUserBeforeMinting.add(AMOUNT)).to.be.eq(
      tokenBalanceOfUserAfterMinting
    );
  });

  it(`should emit event on Minting`, async () => {
    // Minting of token
    const AMOUNT = 30;
    await expect(tokenWithAdmin.mint(AMOUNT, userWallet.address))
      .to.be.emit(tokenWithAdmin, "Transfer")
      .withArgs(AddressZero, userWallet.address, AMOUNT);
  });
});
