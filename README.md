# traesury
Træsury is a Club Investment platform to manage funds (treasury) in æternity blockchain.

## URL and information
----
Project URL: https://nescampos.github.io/traesury/
Blockchain: Aeternity Testnet
Smart Contract ID: [ct_yDEFosoW9EsrXDTGs2rq7WwaxvR2XXB8hw1tZgkEaDZyUGaNY](https://explorer.testnet.aeternity.io/contracts/transactions/ct_yDEFosoW9EsrXDTGs2rq7WwaxvR2XXB8hw1tZgkEaDZyUGaNY)
Wallet: For now it uses the keys within the platform with local storage in the browser, but the next version will include the connection to Superhero Wallet.

## License
----
MIT License

## Contributors
----
- [Néstor Nicolás Campos Rojas](https://www.linkedin.com/in/nescampos/)

## Available options

What you can currently do in this version is:
- **Create investment clubs**: Just define a name and the club will be associated with the account of the user who creates it (owner).
- **Join or leave clubs**: Anyone with an aeternity blockchain account can join the available investment clubs, as well as leave one, with just a couple of clicks.
- **Contribute to the club**: Any member of a club can contribute to the common fund (pool), depositing AE coins that can be used in proposals.
- **Create and Vote on Proposals**: Any member who has contributed funds to the club pool can create proposals, giving a description, amount (not to exceed the pool amount), and recipient, with a view to investing in any business/person in a project. Also, all members can approve or reject the proposal (only one vote per member is allowed on each proposal).
- **Run Proposals**: A proposal owner can execute a proposal (if approval is greater than rejection), which will cause the proposal amount to be sent to the specified recipient. The owner can also close a proposal, in case of not continuing with it, either as a cancellation, publication error or to avoid sending funds.

## Technologies
This project use:
- HTML y Javascript
- [Aeternity Blockchain Javascript SDK](https://github.com/aeternity/aepp-sdk-js)
- [Sophia Smart Contract](https://docs.aeternity.com/aesophia/)

## Use this project

To consume this project, just download this code and run the index.html. 
You just need an Internet connection, but this web app works without a web server (even in a local environment).

### Change the project
If you want to adjust the project, you have the following options:

#### Smart contract
- To change the smart contract, you can use [the current one as a reference in the contracts folder](./contracts/InvestmentClub.aes) and then publish it on the network.
- After you publish it, you must copy the source code of the contract in the [constants.js](./js/constants.js) file, in the _investmentContractCode_ variable, and also, in the _investmentContractAddress_ variable, the address of your contract in the network.

#### Network
This versions is enabled in the testnet. 
If you want to enable the mainnet, modify the [main.js file](./js/main.js), lines 5-8, adding the mainnet URL.

#### Methods and design
To adjust the interaction logic in the app, you must make the changes in the [main.js file](./js/main.js) file.

While if you want to adjust the layout, you have to adjust the various .html files and style sheets, available in the [css folder](./css).

## Contributions

If you want to colaborate, just fork this repository and build new things. Thanks!!
