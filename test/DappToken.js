const DappToken = artifacts.require("DappToken");

contract('DappToken' , function(accounts){
    it('sets the total Supply upon deployment' , function(){
        return DappToken.deployed().then(function(instance){
            tokenIntance = instance;
            return tokenIntance.totalSupply();
        }).then(function(totalSupply){
            assert.equal(totalSupply.toNumber(), 1000000 , 'sets total Supply to 1 million')
        })
    })
})