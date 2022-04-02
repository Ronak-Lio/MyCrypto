App = {
  web3Provider: null,
  contracts: {},
  account: "0x0",
  loading : false,
  tokenPrice : 1000000000000000,
  tokensAvaiable : 750000,
  tokensSold : 0,
  init: function () {
    console.log("App initialized...");
    return App.initWeb3();
  },

  initWeb3: function () {
    if (typeof web3 !== "undefined") {
      //If a web3 instance is already provided to Metamask
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      //Specify default instance if no web3 Instance provided
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:7545"
      );
      web3 = new Web3(App.web3Provider);
    }
    return App.initContracts();
  },

  initContracts: function () {
    $.getJSON("DappTokenSale.json", function (dappTokenSale) {
      App.contracts.DappTokenSale = TruffleContract(dappTokenSale);
      App.contracts.DappTokenSale.setProvider(App.web3Provider);
      App.contracts.DappTokenSale.deployed().then(function (dappTokenSale) {
        console.log("DappTokenSale address", dappTokenSale.address);
      });
    })
      .done(function () {
        $.getJSON("DappToken.json", function (dappToken) {
          App.contracts.DappToken = TruffleContract(dappToken);
          App.contracts.DappToken.setProvider(App.web3Provider);
          App.contracts.DappToken.deployed().then(function (dappToken) {
            console.log("DappToken address", dappToken.address);
          });
          App.listenForEvents()
          return App.render();
        });

      });
  },

  listenForEvents:function () {
    App.contracts.DappTokenSale.deployed().then(function (tokenSaleInstance) {
        tokenSaleInstance.Sell({} , {
          fromBlock : '0',
          toBlock : 'latest'
        }).watch(function(error , event) {
           console.log("Event trigerred" , event);
           App.render();
        })
    })
  },

  render: function(){

  },




  buyTokens: function(){

    var loader = $('#loader');
    var content = $('#content');

    loader.show();
    content.hide();

    var numberOfTokens = $('#numberOfTokens').val();
    
    App.contracts.DappTokenSale.deployed().then(function(instance){
      dappTokenSaleInstance = instance;
      return dappTokenSaleInstance.buyTokens(numberOfTokens , {
        from : App.account,
        value : numberOfTokens*App.tokenPrice,
        gas : 500000
      })
  }).then(function(result){
    console.log('Tokens transferred');
    $('form').trigger('reset');
    //Wait for sell event

  })
    
    
  },

  render:function(){
      if(App.loading){
          return;
      }

      App.loading = true;
      var loader = $('#loader');
      var content = $('#content');

      loader.show();
      content.hide();
      //Load account data 
      web3.eth.getCoinbase(function(err,account){
         if(err == null){
             App.account = account;
             console.log("account is " , account);
             $('#accountAddress').html("Your account " + account)
         }else{
             console.log("Err is " , err);
         }
      })

      console.log("DAPPTOKEN SALE HMMM IS " , App.contracts);

      App.contracts.DappTokenSale.deployed().then(function(instance){
         tokenSaleInstance = instance;
         return App.contracts.DappToken.deployed()
      }).then(function(instance1){
          tokenInstance = instance1;
          return tokenInstance.transfer(tokenSaleInstance.address , 750000)
      })

      App.contracts.DappTokenSale.deployed().then(function(instance){
          dappTokenSaleInstance = instance;
          return dappTokenSaleInstance.tokenPrice()
      }).then(function(price){
        console.log("token Price is " , price);
        App.tokenPrice = price;
        $('.token-price').html(web3.fromWei(App.tokenPrice , "ether").toNumber())
        return dappTokenSaleInstance.tokensSold()
      }).then(function(tokensSold){
        App.tokensSold = tokensSold.toNumber();
        $('.tokens-sold').html(App.tokensSold);
        $('.tokens-available').html(App.tokensAvaiable);

        var progressPercent = (App.tokensSold/App.tokensAvaiable)*100;
        console.log("Percent is " , progressPercent);
        $('#progress').css('width',progressPercent + '%');
      })
    
    //Load token Contract
    App.contracts.DappToken.deployed().then(function(instance){
        dappTokenInstance = instance;
        return dappTokenInstance.balanceOf(App.account)
    }).then(function(balance){
      $('.dapp-balance').html(balance.toNumber())

      App.loading = false;
      loader.hide();
      content.show();
    })

  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
