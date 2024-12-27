App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      ethereum.enable();
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      ethereum.enable();
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },


  

  initContract: function() {
    $.getJSON("Election.json", function(election) {
      // 初始化合约
      App.contracts.Election = TruffleContract(election);
      // 连接与合约进行交互
      App.contracts.Election.setProvider(App.web3Provider);

      App.listenForEvents();
    //  App.allCreated();
     // App.capacity();
      return App.render();
    });
  },

  // 监听合约事件
  listenForEvents: function() {
    App.contracts.Election.deployed().then(function(instance) {



    });
  },
  




  
  render: function() {
  
 
    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("地址: " + account);   
      

        web3.eth.getBalance( account,function(err,res){
          if(!err) {
              console.log(res);
              $("#accBalance").html("余额: " + res+'wei');   
          }else{
              console.log(err);
          }
      });


        }     
    });
 
   


         // Load contract data
         App.contracts.Election.deployed().then(function(instance) {
          electionInstance = instance;
          return electionInstance._capacity();
        }).then(function(_capacity) {
          var Powernamea = $("#allproducts");
          Powernamea.empty();
    
           
        

          for (var i = 1; i <= _capacity; i++) {
            electionInstance.productnews(i).then(function(candidate) {
    
            
              var id = candidate[0];
              var nums = candidate[1];
              var createTime = candidate[2];
              var nowhold = candidate[3];
              var createMan = candidate[4];
              var names = candidate[5];
              var ttime = candidate[6];
              var befhold = candidate[7];

              var unixTimestamp = new Date(createTime*1000);
              var createTime = unixTimestamp.toLocaleString();

              var unixTimestamp = new Date(ttime*1000);
              var ttime = unixTimestamp.toLocaleString();
              // Render candidate Result
              var candidateTemplate = "<tr><td>" +"学生序号："+ id + "</td></tr></tr><tr><td>" +"学生名称："+names + "</td></tr><tr><td>" +"首次录入时间："+createTime + "</td></tr>  <tr><td>" +"转移时间："+ttime + "</td></tr>     <tr><td>"  + "当前信息持有者地址："+ nowhold  + "</td></tr>   <tr><td>"  + "先前信息持有者地址："+ befhold  + "</td></tr>     <tr><td>" +"学生首次信息录入: "+ createMan + "</td></tr>   <tr><td>" + "学生学籍编码："+nums + "</td></tr><tr><td> <img src='../images/"+333+".jpg' height='100px' width='650px' /> </td></tr>"
              
                
              var qID=document.cookie.split(";")[0].split("=")[1]; 
           
                 if(nums==qID){
                  Powernamea.append(candidateTemplate);
              }
            
            });

          }
         
        
        
          //return electionInstance.voters(App.account);
        }).catch(function(error) {
          console.warn(error);
        });

  

 },



 quaryP: function() {
  qID= $('#qID').val();

  document.cookie="qID="+qID; 
 
 },

 sqIt: function() {
  var sqadd= $('#sqadd').val();
  var sqsta= $('#sqsta').val();

  var userAccount = web3.eth.accounts[0];
  App.contracts.Election.deployed().then(function(instance) {
   return instance.setPermission(sqadd,sqsta,{gas: 3000000, from: userAccount});

  }).then(function(cargoID) {

   
  }).catch(function(err) {
    console.error(err);
  });
},


};

$(function() {
  $(window).load(function() {
    App.init();
  });
});