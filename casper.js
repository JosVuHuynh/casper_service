const RPC_API = "http://testnet-node.make.services:7777/rpc"
const CHAIN_NAME_TESTNET = 'casper-test'
const CHAIN_NAME_MAINNET = 'casper'

const { Keys, CasperClient, CLPublicKey, DeployUtil } = require("casper-js-sdk");

class CasperService{
  
  /**
     * get Balance of address
     * @param address a string of address
  */
  async  getBalance(address){
    try{
      let publicKey = CLPublicKey.fromHex(address)
      const casperClient = new CasperClient(RPC_API) 
      const balance = await casperClient.balanceOfByPublicKey(publicKey)
      if (balance){
        return format(balance.toNumber(),9)
      }
      return 0 
    } catch (e) {
      return 0 
    }
  }

  /**
     * get Balance of address
     * @param to a string of address
     * @param publicKey a Uint8Array of sender
     * @param privateKey a Uint8Array of sender
     * @param amount 512-bitInteger
     * @param chainName Name of the chain: casper or capser-test
     * @param transferId 64-bit Integer  providing additional information about the recipient, which is necessary when transferring tokens to some recipients
     * @param ttl Time that the `Deploy` will remain valid for, in milliseconds. The default value is 1800000, which is 30 minutes
     * @param paymentAmount the number of motes paying to execution engine
     * @param gasPrice Conversion rate between the cost of Wasm opcodes and the motes sent by the payment code.
  */
  async  transfer(to, publicKey, privateKey, amount, chainName, transferId, ttl, paymentAmount, gasPrice){
    const casperClient = new CasperClient(RPC_API)     
    const signKeyPair = Keys.Ed25519.parseKeyPair(publicKey, privateKey)
    let deployParams = new DeployUtil.DeployParams(signKeyPair.publicKey, chainName, gasPrice, ttl);
    const toPublicKey = CLPublicKey.fromHex(to);
    const session = DeployUtil.ExecutableDeployItem.newTransfer(amount, toPublicKey, null, transferId);
    const payment = DeployUtil.standardPayment(paymentAmount);
    const deploy = DeployUtil.makeDeploy(deployParams, session, payment);
    const signedDeploy = DeployUtil.signDeploy(deploy, signKeyPair);

    return await casperClient.putDeploy(signedDeploy);   
  }

    /**
     * get history of account
     * @param accountHash string hash when create wallet
     * @param page
     * @param limit
     * @param order_direction
     * @param with_extended_info
  */
  async getHistory(accountHash, page, limit, order_direction, with_extended_info) {
    const API_ENPOINT = 'https://event-store-api-clarity-testnet.make.services/accounts'
    const response = await (await fetch(`${API_ENPOINT}/${accountHash}/transfers?/page=${page}&limit=${limit}&order_direction=${order_direction}&with_extended_info=${with_extended_info}`)).json()
    return response
  }

  format(balance, decimal){
      return balance/(10**decimal)
  }
} 