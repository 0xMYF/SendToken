const readline = require("readline");
const { providers, Contract, Wallet, ethers } = require("ethers");
const abi = require('./abi.json');

const chain = 'ETH'; // Pilih Jaringan ETH / MATIC / BSC / ARBITRUM / GNOSIS
const privateKey = "0x"; // Private Key

const rpcUrls = {
  ETH: 'https://eth.llamarpc.com',
  MATIC: 'https://polygon-rpc.com',
  BSC: 'https://bsc-dataseed2.binance.org',
  ARBITRUM: 'https://rpc.ankr.com/arbitrum',
  GNOSIS: 'https://rpc.gnosischain.com',
}

const rpcUrl = rpcUrls[chain];
const provider = new providers.JsonRpcProvider(rpcUrl);
const wallet = new Wallet(privateKey, provider);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log(`\x1b[34mJaringan\x1b[0m : ${chain}`);
rl.question("\x1b[34mAlamat Token\x1b[0m : ", (address) => {
  const contractAddress = address;
  const contract = new Contract(contractAddress, abi, wallet);

  rl.question("\x1b[34mAlamat Penerima\x1b[0m : ", (to) => {
    const toAddress = to;

    async function main() {
      let decimals = await contract.decimals();
      const name = await contract.functions.name();

      let balance = await contract.balanceOf(wallet.address);
      let balanceInToken = ethers.utils.formatUnits(balance, decimals);
      console.log(`\x1b[34mSaldo ${name}\x1b[0m : ${balanceInToken}`);

      rl.question(`\x1b[34mJumlah Kirim\x1b[0m : `, (amount) => {
        const amountInWei = ethers.utils.parseUnits(amount, decimals);

        rl.question(`\x1b[32mKirim ${amount} ${name}\x1b[0m \x1b[34m \ndari\x1b[0m : ${wallet.address}\x1b[34m\nke\x1b[0m : ${toAddress} \nKonfimasi (Y/n) : `, async (answer) => {
          if (answer === "y") {
          	
            let gasPrice = await provider.getGasPrice();
            let gasLimit = await contract.estimateGas.transfer(toAddress, amountInWei);
            let transaction = await contract.transfer(toAddress, amountInWei, { gasLimit, gasPrice });
            console.log("\x1b[32mMengirim Transaksi\x1b[0m...");
            const receipt = await provider.waitForTransaction(transaction.hash);
            console.log("\x1b[32mTransaksi Berhasil Dikirim\x1b[0m !!");
            console.log(`\x1b[34mTx Hash\x1b[0m : ${transaction.hash}`);
            rl.close();
          } else {
            console.log("\x1b[31mTransaksi dibatalkan\x1b[0m.");
            rl.close();
          }
        });
      });
    }

    main();
  });
});
