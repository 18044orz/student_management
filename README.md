环境：
安装node.js，node.js中安装truffle，web3.js;
安装ganache（或者任何eth测试链）
浏览器安装插件MetaMask（数字钱包）


启动：
打开ganache新建一条链，过程中会导入我们的truffle项目，就是导入truffle-config.js；
cmd进入根目录（代码文件夹），管理员模式，运行下列指令:
truffle compile
truffle migrate
npm run dev
智能合约没有修改过就可以跳过compile（第一遍还是都跑一下吧）
访问localhost:3000，metamask导入密钥后切换即可切换用户
ganache中也可以查看区块链的信息


说明：
build：智能合约生成的文件（忽略）
contracts：智能合约代码文件
migrations：迁移用文件（忽略）
node_modules：系统运行文件（忽略）
src：前端 index.html是封面，indexA.html是主界面
test：测试文件夹（忽略）
还有一些配置文件