# -----------Blogs material

Create a folder, let it be DappToken
add contracts folder and create a file DappToken.sol inside it.
Add following code in it.

In main folder - DappToken

To create package.json, run following command and answer the question which will be asked.
npm init

Run following commands to add dependencies.

1. npm install --save-dev ethereum-waffle

2. npm install --save-dev ts-node typescript

3. npm install --save-dev chai @types/node @types/mocha @types/chai

4. npm i ts-mocha

Add tsconfig.json file and paste following code.

Add Waffle.js and paste following code.

5. npm i openzeppelin-solidity

To compile Solidity code in contracts folder, run following command
./node_modules/ethereum-waffle/bin/waffle waffle.js

Create a folder test, create a file DappToken.spec.ts and add following code.

To run test cases, you can run following command
./node_modules/ts-mocha/bin/ts-mocha test/\*.spec.ts

To run particular test case, run following command
./node_modules/ts-mocha/bin/ts-mocha test/<name-of-testcase>

Reading stuffs

1. https://medium.com/blockchannel/the-use-of-revert-assert-and-require-in-solidity-and-the-new-revert-opcode-in-the-evm-1a3a7990e06e
2. https://media.consensys.net/ethereum-gas-fuel-and-fees-3333e17fe1dc
3. https://github.com/ethereum/solidity/releases
4. https://medium.com/coinmonks/solidity-import-in-vs-code-the-right-way-82baa1cc5a71

# truffle commands

Compile: truffle compile
Migrate: truffle migrate
or
truffle migrate -network development
or
truffle migrate --reset
or
truffle migrate --reset --all

truffle create migration 1_hello_world

to start truffle(development)
truffle develop

to test contracts
truffle test
