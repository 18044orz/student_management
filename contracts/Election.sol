pragma solidity ^0.5.0;

contract Election{
    string public constant name = "anDAPP";
    string public constant symbol = "";
    //学生数目
    uint256 public _capacity = 0;
    //成绩数目
    uint256 public _perforcout = 0;
    //管理员地址
    address private _founder;

    //权限状态位、用户学生-学生创建、用户持有学生、学生交易记录等数据
    mapping (address => uint8) public _authorization;
    mapping (uint256 => string) public _cargoesName;
    mapping (address => mapping (uint256 => uint256)) public _cargoes;
    mapping (address => uint256) public _cargoesCount;
    mapping (address => mapping (uint256 => uint256)) public _holdCargoes;
    mapping (uint256 => uint256) public _holdCargoIndex;
    mapping (address => uint256) public _holdCargoesCount;
    mapping (uint256 => mapping (uint256 => Log)) public _logs;
    mapping (uint256 => uint256) public _transferTimes;
    mapping (uint256 => uint256) public _cargotoperformance;

    //相应事件
    event NewCargo(address indexed _creater, uint256 _cargoID);
    event Transfer(uint256 indexed _cargoID, address indexed _from, address _to);
    event Newperformance(address indexed _creater, uint256 _cargoID);
   

    //日志结构体
    struct Log {
        uint256 time;
        address holder;
    }
    
   mapping (uint => productnew) public productnews;//学生索引

    //学生结构体
    struct productnew{
         uint id;
         
         uint num;//学生序号- 学籍编码
         uint createTime;//首次录入时间
         address  nowhold;//当前信息持有者地址地址
         address  createMan;//创建者地址
         string cargoName;//名称
       
         uint tranTIME;//转移时间
         address  befhold;//前一个持有者地址
          
    }

    mapping (uint => performance) public performances;//学生索引
    //成绩结构体
    struct performance{
         uint id;
         uint iden; //成绩唯一编号
         
         uint num;//学生序号- 学籍编码
         uint createTime;//录入时间
         address  createMan;//创建者地址
         string className;//名称
         uint score;//学分

    }

    //构造函数，合约创建时候调用
    constructor () public {
        _founder = msg.sender;
        _authorization[msg.sender] = 3;
    }

    //总学生数量
    function capacity () public view returns (uint256) { return _capacity; }
   //当前地址下学生数
    function capacityOf (address _owner) public view returns (uint256) { return _cargoesCount[_owner]; }
    //ID查询学生名称
    function cargoNameOf (uint256 _cargoID) public view returns (string memory) { return _cargoesName[_cargoID]; }
    //查询该账户地址的权限
    function permissionOf (address _user) public view returns (uint8) { return _authorization[_user]; }
    //根据学生ID查询学生流转次数
    function transferTimesOf (uint256 _cargoID) public view returns (uint256) {
        return _transferTimes[_cargoID];
    }


     
    //当前学生ID的持有者地址
      
    function holderOf (uint256 _cargoID) public view returns (address) {
        return _logs[_cargoID][_transferTimes[_cargoID]].holder;
    }
    
    event DebugLog(string message, string value);
    function stuinfo(uint256 _cargoID) public returns (string memory cargoname){
        uint8 authorization1 = _authorization[msg.sender];    
        uint littleID=0;
        address authorization2;
        productnew storage productTemp=productnews[0];
        for(uint i=0;i<=_capacity;i++){
            productTemp = productnews[i];
            if(productTemp.num== _cargoID){
                authorization2=productTemp.nowhold;
                littleID=i;
                emit DebugLog("cargoName", productTemp.cargoName);
                break;
            }
        }
        
        require(authorization1 > 0||authorization2==msg.sender, "未授权");
        require(littleID!=0);
        productnew storage productnewa = productnews[littleID];
        return productnewa.cargoName;
    }
     
    //该学生ID转移记录 返回持有时间与账户地址  
    function tracesOf (uint256 _cargoID) public view returns ( address[] memory holders) {
        uint256 transferTime = _transferTimes[_cargoID];
        holders = new address[](transferTime + 1);
        uint256[] memory times;
        times = new uint256[](transferTime + 1);
        for (uint256 i = 0; i <= transferTime; i++) {
            Log memory log = _logs[_cargoID][i];
            holders[i] = log.holder;
            times[i] = log.time;
        }
        return holders;
    }


     
    //当前该地址创建的学生（包括以及转移走的）
     
    function allCreated () public view returns (uint256[] memory cargoes) {

         address _creater= msg.sender;
        uint256 count = _cargoesCount[_creater];
        cargoes = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            cargoes[i] = _cargoes[_creater][i];
        }
    }


     
    //当前地址持有的学生
     
    function allHolding (address _owner) public view returns (uint256[] memory cargoes) {
        uint256 count = _holdCargoesCount[_owner];
        cargoes = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            cargoes[i] = _holdCargoes[_owner][i + 1];
        }
    }



     
    //新货物创建-输入货物名字，返回学生创建好的ID
     
    function createNewCargo (string memory _cargoName) public returns (uint256 cargoID) {
        uint8 authorization = _authorization[msg.sender];
        require(authorization > 1, "未授权");
        uint256 count = _cargoesCount[msg.sender];
     
        //新建生成一个唯一学生ID
        cargoID = uint(keccak256(abi.encodePacked(msg.sender, count, _capacity)))%10000000000;
   
         _cargoes[msg.sender][count] = cargoID;
        //学生名称存储
        _cargoesName[cargoID] = _cargoName;
        //返回学生-学生创建日志
        _logs[cargoID][0] = Log({
            time: block.timestamp,
            holder: msg.sender
        });
        _addToHolder(msg.sender, cargoID);
        emit NewCargo(msg.sender, cargoID);
        _cargoesCount[msg.sender]++;
 
       _capacity++;
          // 学生-学生创建，并赋予索引
        productnews[_capacity] = productnew( _capacity,cargoID, now, msg.sender, msg.sender,_cargoName,0,msg.sender);   
    }

    function creatNewperformance (string memory _className,uint256 _cargoID,uint _score) public returns (uint256 performanceID) {
        uint8 authorization = _authorization[msg.sender];
        require(authorization > 0, "未授权");
        performanceID = uint(keccak256(abi.encodePacked(msg.sender, _perforcout)))%10000000000;
        _perforcout++;
        _cargotoperformance[performanceID]=_cargoID;
        emit Newperformance(msg.sender, _cargoID);
        performances[_perforcout] = performance( _perforcout,performanceID,_cargoID, now,msg.sender, _className,_score);
    }

    event persearch(string message, uint value);
    function performanceOf (uint256 _cargoID) public returns (uint num) {
        uint8 authorization1 = _authorization[msg.sender];
        address authorization2;
        for(uint i=0;i<=_capacity;i++){
            productnew storage productTemp = productnews[i];
            if(productTemp.num== _cargoID){
                authorization2=productTemp.nowhold;
            }
        }
        require(authorization1 > 0||authorization2==msg.sender, "未授权");
        performance storage pertemp = performances[0];
        for(uint i=0;i<=_perforcout;i++){
            if(performances[i].num==_cargoID){
                pertemp = performances[i];
                emit persearch(pertemp.className, pertemp.score);
            }
        }
        return (pertemp.num);   
        
    }



    //设置权限
    function setPermission (address _address, uint8 _state) public {
           uint8 authorization = _authorization[msg.sender];
           require(authorization > 1, "未授权");
            _authorization[_address] = _state;//0学生；1老师；2管理员
     }




    //转移学生。学生持有者调用-物流转移认证老师才可以转移

    function transfer (uint256 _cargoID, address _to) public returns (bool success) {
        uint8 authorization = _authorization[msg.sender];
        require(authorization > 0, "非合法认证老师！");
        uint256 transferTime = _transferTimes[_cargoID];
        address holder = _logs[_cargoID][transferTime].holder;
        //  学生拥有者不为零地址 
        require(holder != address(0), "无效地址！");
        //  学生拥有者必须是交易的发送者，即有该学生当前的转移权，这是最关键的条件
        require(holder == msg.sender, "非当前学生拥有者！");
        //  目标地址不能为交易的发送者
        require(holder != _to, "不能转移给自己！");
        // 目标地址不能为零地址
        require(_to != address(0), "无效地址！");

        // 当条件都符合的时候，学生的转移记录会增加：
        _transferTimes[_cargoID]++;
        _logs[_cargoID][transferTime + 1] = Log({
            time: block.timestamp,
            holder: _to
        });
       // 合约内的私有方法，先后移除原拥有者的持有权，并且将其移动给目标用户
        _removeFromHolder(msg.sender, _cargoID);
        _addToHolder(_to, _cargoID);
        //（emit）一个相应的事件（Event），这样可以在区块链上对应的`transactionReceipt`记录中找到相应的事件信息，
        emit Transfer(_cargoID, holder, _to);

        //新建转移学生方法
        uint littleID=0;
        for(uint i=0;i<=_capacity;i++){
            productnew storage productTemp = productnews[i];
            if(productTemp.num== _cargoID){
                 littleID=i;
            }
        }
        require(littleID!=0);
         productnew storage productnewa = productnews[littleID];
         productnewa.befhold= productnewa.nowhold ;//前一个持有者地址
         
         productnewa.nowhold=_to;
         productnewa.tranTIME=now;
        
        
        return true;
    }


     
    //合约内私有方法，将目标_cargoID学生--》从原持有ID地址移除
     
    function _removeFromHolder (address _oriHolder, uint256 _cargoID) private {
        uint256 count = _holdCargoesCount[_oriHolder];
        uint256 index = _holdCargoIndex[_cargoID];
        _holdCargoes[_oriHolder][index] = _holdCargoes[_oriHolder][count];
        _holdCargoesCount[_oriHolder]--;
    }



     
    //合约内私有方法，将目标_cargoID学生--》转移给新地址_newHolder
     
    function _addToHolder (address _newHolder, uint256 _cargoID) private {
        uint256 count = _holdCargoesCount[_newHolder];
        _holdCargoIndex[_cargoID] = count + 1;
        _holdCargoes[_newHolder][count + 1] = _cargoID;
        _holdCargoesCount[_newHolder]++;
    }

}
