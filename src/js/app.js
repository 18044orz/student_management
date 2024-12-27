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
      App.capacity();
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

              var unixTimestamp = new Date(createTime*1000);
              var createTime = unixTimestamp.toLocaleString()

              // Render candidate Result
              var candidateTemplate = "<tr><td>" +"学生序号："+ id + "</td></tr><tr><td>" +"学生名称："+names + "</td></tr></tr><tr><td>" +"创建区块："+createTime + "</td></tr><tr><td>"  + "当前信息持有者地址："+ nowhold  + "</td></tr><tr><td>" +"学生首次信息录入: "+ createMan + "</td></tr>   <tr><td>" + "学生学籍编码："+nums + "</td></tr><tr><td> <img src='../images/"+333+".jpg' height='100px' width='650px' /> </td></tr>"


              var qID=document.cookie.split(";")[0].split("=")[1];

                 if(id==qID){
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
     event.preventDefault();
     console.log("Form submitted");
     var cargoID = $('#qID').val();
     console.log("Cargo ID:", cargoID);
     var userAccount = web3.eth.accounts[0];
     var s;
     console.log("User account:", userAccount);
     App.contracts.Election.deployed().then(function(instance) {
         console.log("Contract instance:", instance);
         return instance.stuinfo(cargoID, { gas:3000000,from: userAccount });
     }).then(function(result) {
         console.log("Query result:", result);
             for (var i = 0; i < result.logs.length; i++) {
                 var log = result.logs[i];
                 // 如果日志事件为 NewCargo
                 if (log.event === "DebugLog") {
                     // 获取事件参数 _cargoID 的值
                     var cargoID = log.args.value;
                     console.log("cargoID:", cargoID);
                     $('#studentDetails').text("学生名字为: " + cargoID);
                     $('#studentInfo').show();
                     break;
                 }
             }
             //$('#studentDetails').text("No student found with the given ID.");
             //$('#studentInfo').show();
     }).catch(function(err) {
         console.error(err);
     });
 },



  sendTransaction:function () {
    var fromAccount = $('#fromAccount').val();
    var toAccount = $('#toAccount').val();
    var amount = $('#amount').val();

    if (web3.isAddress(fromAccount) &&
        web3.isAddress(toAccount) &&
        amount != null && amount.length > 0
    ) {
        // Example 1: 使用Metamask 给的gas Limit 及 gas 价
         var message = {from: fromAccount, to:toAccount, value: web3.toWei(amount, 'ether')};


        web3.eth.sendTransaction(message, (err, res) => {
        var output = "";
        if (!err) {
            output += res;
        } else {
            output = "Error";
        }
        document.getElementById('transactionResponse').innerHTML = "Transaction response= " + output + "<br />";
        })
    } else {
        console.log("input error");
    }
},



 



capacity: function() {
  var adoptionInstance;
  var Powernames = $("#cargoNames");


 

  App.contracts.Election.deployed().then(function(instance) {
    adoptionInstance = instance;
    // 调用合约的getAdopters(), 用call读取信息不用消耗gas
    return adoptionInstance.capacity.call();
  }).then(function(_capacity) {

    var candidateTemplate = "<tr><td>" +"当前学生总数目："+ _capacity + "</td></tr>"
    Powernames.append(candidateTemplate);
      
  //  qID= $('#qID').val();

    document.cookie="qID="+_capacity; 
 
  }).catch(function(err) {
    console.log(err.message);
  });
},


 


createProduct: function() {
  var productName= $('#productName').val();

  var userAccount = web3.eth.accounts[0];
  App.contracts.Election.deployed().then(function(instance) {
   return instance.createNewCargo(productName,{gas: 3000000, from: userAccount});

  }).then(function(result) {
      for (var i = 0; i < result.logs.length; i++) {
          var log = result.logs[i];
          // 如果日志事件为 NewCargo
          if (log.event === "NewCargo") {
              // 获取事件参数 _cargoID 的值
              var cargoID = log.args._cargoID;
              $('#cargoNew').text("Product created successfully with ID: " + cargoID);
              $('#cargoNew').show();
              break;
          }
      }
  }).catch(function(err) {
    console.error(err);
  });
},


transferProduct: function() {
  var productId= $('#productId').val();
  var toAdd= $('#toAdd').val();
  
  var userAccount = web3.eth.accounts[0];
  App.contracts.Election.deployed().then(function(instance) {
   return cargoID=instance.transfer(productId,toAdd,{gas: 3000000, from: userAccount});
 
  }).then(function(cargoID) {
    // Wait for to update
   
  }).catch(function(err) {
    console.error(err);
  });
},

crelbj: function() {
    var lbjD= $('#lbjD').val();
    var lbjName= $('#lbjName').val();
    var lbjdd= $('#lbjdd').val();
    var userAccount = web3.eth.accounts[0];
    App.contracts.Election.deployed().then(function(instance) {
        return instance.creatNewperformance(lbjName,lbjD,lbjdd,{gas: 3000000, from: userAccount});

    }).then(function(result) {
        // Wait for to update
        console.log(result);
    }).catch(function(err) {
        console.error(err);
    });
},

searchPerformance: function(){
    var id=$('#qIDsy').val();
    console.log("id is:",id);
    var userAccount = web3.eth.accounts[0];
    console.log("userAccount is:",userAccount);
    App.contracts.Election.deployed().then(function(instance) {
        return instance.performanceOf(id,{gas: 3000000, from: userAccount});

    }).then(function(result) {
        // Wait for to update
        console.log("Query result:",result);
    }).catch(function(err) {
        console.error(err);
    });
}



};

$(function() {
  $(window).load(function() {
    App.init();
  });
});