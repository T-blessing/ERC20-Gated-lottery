// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20{
    function transferFrom(address _from,address _to,uint256 _amount) external returns(bool);
    function transfer(address _to,uint256 _amount) external returns(bool);
    function balanceOf(address account) external view returns (uint256);
}

contract Lottery{
/*A contract that issues tokens to every player in each lottery round
In every round, winners should be randomly picked by the contract.
A moderator or an admin should be the one to call the function
The winner of every round should be able to claim their prize within a given period of time after which the prize is nullified
Contracts should not send the prize to the user rather the user should be able to claim the prize themselves
The prize should be in ether
Every user would pay for each round and a percentage of the total of each round would be the given to the winner. */
     address public admin; //lottery admin

     IERC20 immutable tokenAddress; //Fleek token address

     address[] participants; //array of lottery participants

     uint256 public lotteryPrice;//amount to pay to participate in the lottery

     uint public deadline; //lottery deadline

     address payable lotteryWinner;

     uint8 lotteryNumber;
    
     bool lotteryStarted;

     bool lotteryEnded;

     mapping(address => bool) played; //to keep if user has played before

     constructor(IERC20 _tokenAddress, uint256 _price, uint256 lotteryDeadline) {
         require(
            block.timestamp < lotteryDeadline,
            "lottery time should be in the future"
        );
        admin = msg.sender;
        tokenAddress = _tokenAddress;
        lotteryPrice = _price;
        deadline = lotteryDeadline + block.timestamp;
     }

     //////ERROR MESSAGE
     error NotAdmin();

     error NotSufficientEther(uint amountInputed, uint amountExpected);

     error TimeElapsed();

     error NotWinner();

     error LotteryInProgress();

     //function to claim token to participate in the lottery
     function participate() external payable{
        if(msg.value < lotteryPrice){
            revert NotSufficientEther({
                amountInputed: msg.value,
                amountExpected: lotteryPrice
            });
        }
        participants.push(msg.sender); //push participant into an array of participants
        tokenAddress.transfer(msg.sender, 10*10e18); //mint token to user
     }

     function setLotteryNum(uint8 _lotteryNum) public {
        if(msg.sender != admin){
            revert NotAdmin();
        }
        if( lotteryStarted == true ){
            revert LotteryInProgress();
        }
        lotteryNumber = _lotteryNum;
        lotteryStarted = true;
     }

     function play(uint8 num) external returns(address winner){
        require(lotteryStarted == true, "Lottery hasn't began");

        if(block.timestamp <= deadline){
            revert TimeElapsed();
        }

        require(played[msg.sender] != true, "Already played"); // or burn the token
        require( tokenAddress.balanceOf(msg.sender) == 10*10e18, "Can't play");
       // lotteryNumber = num;

       if(num == lotteryNumber){
         lotteryWinner = payable(msg.sender);
         lotteryEnded = true;
         return msg.sender;
       }
        //burn the token instead
        played[msg.sender] = true;
     }

    //  function pickWinner() external{
    //     if(msg.sender != admin){
    //         revert NotAdmin();
    //     }
    //    // uint result = play();
    //     //set lottery ended
    //  }
    //function to calculate owner's profit
    function calcProfit() private view returns(uint percentage){
        percentage = (address(this).balance * 40) /100;
    }

     function claimPrize() external payable{
        require(lotteryEnded, "can't claim yet");
        if(msg.sender != lotteryWinner){
            revert NotWinner(); 
        }
        
        uint amountTowithdraw = (address(this).balance) - calcProfit();
        payable(msg.sender).transfer(amountTowithdraw);
     }

     function showLuckyNumber() private view returns(uint8){
        return lotteryNumber;
     }

     function withdrawProfit(address to) public {
        if(msg.sender != admin){
            revert NotAdmin();
        }
        require(lotteryEnded, "lottery not ended");
        uint amount = calcProfit();
        payable(to).transfer(amount);
     }

     function getContractBal() public view returns(uint256){
        return address(this).balance;
     }

     function getParticipants() public view returns(uint256){
        return participants.length;
     }

     receive() external payable{}
     
}