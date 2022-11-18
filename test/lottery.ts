import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";


describe("Lottery", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployLotteryContractFixture() {
    const deadline =  356 *24 * 60 * 60; //10mins
    const lotteryPrice = await ethers.utils.parseEther("1");

    const lotteryTime = (await time.latest()) + deadline;

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    //Deploying the fleek token
    const Fleek = await ethers.getContractFactory("Fleek");
    const fleek = await Fleek.deploy(); 

    const Lottery = await ethers.getContractFactory("Lottery");
    const lottery = await Lottery.deploy(fleek.address, lotteryTime, lotteryPrice );

    return { fleek, lottery, lotteryTime, lotteryPrice, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right lotteryTime", async function () {
      const { lottery, lotteryTime } = await loadFixture(deployLotteryContractFixture);

      expect(await lottery.deadline()).to.equal(lotteryTime);
    });

    it("Should set the admin as owner", async function () {
      const { lottery, owner } = await loadFixture(deployLotteryContractFixture);

      expect(await lottery.admin()).to.equal(owner.address);
    });

    it("Should receive the right amount of ether for the lottery", async function (){
        const { lottery, lotteryPrice} = await loadFixture(deployLotteryContractFixture)

       expect (await ethers.provider.getBalance(lottery.address)).to.equal(lotteryPrice);
    });


    it("Should fail when lotteryTime is not in the future", async function () {
      // We don't use the fixture here because we want a different deployment
      
      //Deploying the fleek token
      const Fleek = await ethers.getContractFactory("Fleek");
      const fleek = await Fleek.deploy(); 

      const amount = await ethers.utils.parseEther("1");

      const latestTime = await time.latest();
      const Lottery = await ethers.getContractFactory("Lottery");
      await expect( Lottery.deploy(fleek.address, latestTime, amount)).to.be.revertedWith(
        "lottery time should be in the future"

      );
    });

    it("Should fail if the user does not hold the required fleek token", async() => {
        const {fleek,otherAccount, lottery, lotteryPrice} = await loadFixture(deployLotteryContractFixture);

        expect(otherAccount.getBalance()).to.equal(lotteryPrice);
    })
  });

//   describe("Withdrawals", function () {
//     describe("Validations", function () {
//       it("Should revert with the right error if called too soon", async function () {
//         const { lock } = await loadFixture(deployLotteryContractFixture);

//         await expect(lock.withdraw()).to.be.revertedWith(
//           "You can't withdraw yet"
//         );
//       });

//       it("Should revert with the right error if called from another account", async function () {
//         const { lock, unlockTime, otherAccount } = await loadFixture(
//             deployLotteryContractFixture
//         );

//         // We can increase the time in Hardhat Network
//         await time.increaseTo(unlockTime);

//         // We use lock.connect() to send a transaction from another account
//         await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
//           "You aren't the owner"
//         );
//       });

//       it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
//         const { lock, unlockTime } = await loadFixture(
//             deployLotteryContractFixture
//         );

//         // Transactions are sent using the first signer by default
//         await time.increaseTo(unlockTime);

//         await expect(lock.withdraw()).not.to.be.reverted;
//       });
//     });

//     describe("Events", function () {
//       it("Should emit an event on withdrawals", async function () {
//         const { lock, unlockTime, lockedAmount } = await loadFixture(
//             deployLotteryContractFixture
//         );

//         await time.increaseTo(unlockTime);

//         await expect(lock.withdraw())
//           .to.emit(lock, "Withdrawal")
//           .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
//       });
//     });

//     describe("Transfers", function () {
//       it("Should transfer the funds to the owner", async function () {
//         const { lock, unlockTime, lockedAmount, owner } = await loadFixture(
//             deployLotteryContractFixture
//         );

//         await time.increaseTo(unlockTime);

//         await expect(lock.withdraw()).to.changeEtherBalances(
//           [owner, lock],
//           [lockedAmount, -lockedAmount]
//         );
//       });
//     });
  });

