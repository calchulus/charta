module.exports = (deployer, network, accounts) => {
    const CreditorProxy = artifacts.require("CreditorProxy");
    const ContractRegistry = artifacts.require("ContractRegistry");
    const TokenTransferProxy = artifacts.require("TokenTransferProxy");
    const DharmaMultiSigWallet = artifacts.require("DharmaMultiSigWallet");

    const TX_DEFAULTS = { from: accounts[0], gas: 4000000 };

    return deployer.then(async () => {
        const registry = await ContractRegistry.deployed();
        const proxy = await TokenTransferProxy.deployed();
        const wallet = await DharmaMultiSigWallet.deployed();

        await deployer.deploy(CreditorProxy, registry.address);
        const creditorProxy = await CreditorProxy.deployed();

        // Authorize creditor proxy to make `transferFrom` calls on the token transfer proxy.
        let data = web3.sha3('addAuthorizedTransferAgent(address)').substring(0,10);
        data += web3.padLeft(creditorProxy.address.substring(2), 64);

        let receipt = await wallet.submitTransaction(proxy.address, 0, data);
        const txId = receipt.logs[0].args.transactionId;

        await wallet.confirmTransaction(txId, { from: accounts[1] });
        await wallet.confirmTransaction(txId, { from: accounts[2] });
        await wallet.executeTransaction(txId);

    });
}
