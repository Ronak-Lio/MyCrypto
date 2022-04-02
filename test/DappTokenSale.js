var DappTokenSale = artifacts.require("./DappTokenSale.sol");
var DappToken = artifacts.require("./DappToken.sol");

contract("DappTokenSale", function (accounts) {
  var tokenSaleInstance;
  var tokenInstance;
  var admin = accounts[0];
  var buyer = accounts[1];
  var tokenPrice = 1000000000000000;
  var numberOfTokens;
  var tokensAvaiable = 750000;

  it("initializes the contract with the correct values", function () {
    return DappTokenSale.deployed()
      .then(function (instance) {
        tokenSaleInstance = instance;
        return tokenSaleInstance.address;
      })
      .then(function (address) {
        assert.notEqual(address, 0x0, "has the correct address");
        return tokenSaleInstance.tokenContract();
      })
      .then(function (address) {
        assert.notEqual(address, 0x0, "has the correct address");
        return tokenSaleInstance.tokenPrice();
      })
      .then(function (price) {
        assert.equal(price, 1000000000000000, "token price");
      });
  });

  it("buyTokens", function () {
    return DappToken.deployed()
      .then(function (instance) {
        tokenInstance = instance;
        return DappTokenSale.deployed();
      })
      .then(function (instance) {
        tokenSaleInstance = instance;
        return tokenInstance.transfer(tokenSaleInstance.address , tokensAvaiable)
      }).then(function (receipt) {
        numberOfTokens = 10;
        return tokenSaleInstance.buyTokens(numberOfTokens, {
            from: buyer,
            value: tokenPrice * numberOfTokens,
          });
      })
      .then(function (receipt) {
        assert.equal(receipt.logs.length, 1, "triggers one event");
        assert.equal(receipt.logs[0].event, "Sell", "should be sell event");
        assert.equal(
          receipt.logs[0].args._buyer,
          buyer,
          "logs the account who purchased the tokens"
        );
        assert.equal(receipt.logs[0].args._amount, numberOfTokens, "amount");
        return tokenSaleInstance.tokensSold();
      })
      .then(function (amount) {
        assert.equal(
          amount.toNumber(),
          numberOfTokens,
          "increment number Of tokens sold"
        );
        return tokenInstance.balanceOf(buyer);
      }).then(function (balance) {
        assert.equal(balance.toNumber(), numberOfTokens)
        return tokenInstance.balanceOf(tokenSaleInstance.address);
      }).then(function (balance) {
        assert.equal(balance.toNumber(), tokensAvaiable - numberOfTokens)
        return tokenSaleInstance.buyTokens(numberOfTokens, {
          from: buyer,
          value: 1,
        });
      })
      .then(assert.fail)
      .catch(function (error) {
        assert.equal(
          error.message.indexOf("revert") >= 0,
          "msg.value must be equal to number of Tokens"
        );
        return tokenSaleInstance.buyTokens(800000, {
            from: buyer,
            value: tokenPrice* numberOfTokens,
          });
      }).then(assert.fail).catch(function (error){
        assert.equal(
            error.message.indexOf("revert") >= 0,
            "value must be less than balance OF TokenSale Instance"
          );
      })
  });
});

it('endSale', function(){
    return DappToken.deployed()
      .then(function (instance) {
        tokenInstance = instance;
        return DappTokenSale.deployed();
      })
      .then(function (instance) {
        tokenSaleInstance = instance;
    //     return tokenSaleInstance.endSale({from : buyer});
    //   }).then(assert.fail).catch(function(error) {
    //      assert(error.message.indexOf("revert") >= 0, "endSale must be from admin")
         return tokenSaleInstance.endSale({from : accounts[0]});
      }).then(function(receipt) {
         return tokenInstance.balanceOf(accounts[0]);
      }).then(function(balance){
         assert.equal(balance.toNumber() , 999990 , 'returns all Dapp Tokens to admin')
         return tokenSaleInstance.tokenPrice();
      }).then(function(price){
          assert.equal(price.toNumber() ,0)
      })
})
