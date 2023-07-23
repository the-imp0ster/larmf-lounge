// ˏˋ°•*⁀➷ imports & global variables
import "./style.css";
import { ethers } from "https://cdn-cors.ethers.io/lib/ethers-5.7.2.esm.min.js";
import larmfContractABI from "./larmfabi.json";

// ˏˋ°•*⁀➷ larva mfers: https://etherscan.io/address/0xafe2c381c385cbbcbb570d8b39b36449be6b35c4#readContract
const larmfContractAddress = "0xafe2C381C385cBBCBb570D8b39b36449BE6B35c4";
const provider = new ethers.providers.Web3Provider(window.ethereum);

let tokenUriJson;
let prefix = "http://ipfs.io/ipfs/";
let imageIpfsPath;

// ˏˋ°•*⁀➷ assign dom
let larmfBalance = document.getElementById("larmf-balance");
let larmfCards = document.getElementById("larmf-cards");
let connectButton = document.getElementById("connect");

// ˏˋ°•*⁀➷ check if the browser has a wallet installed
if (!window.ethereum) throw Error("browser wallet not detected");

// ˏˋ°•*⁀➷ event listener to connect wallet
connectButton.addEventListener("click", async () => {
  try {
    let accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    await fetchBalanceForConnectedAddress();
    checkLarmfs();
  } catch (error) {
    console.error(error);
    alert(
      "Error connecting the wallet or fetching data from the chain - check console!"
    );
  }
});


// ˏˋ°•*⁀➷ Make sure the user has connected their wallet
async function getConnectedUserAddress() {
  let accounts = await window.ethereum.request({ method: "eth_accounts" });
  if (accounts.length === 0) {
    throw new Error("No connected accounts");
  }
  connectButton.innerText = "connected";
  return accounts[0];
}

// ˏˋ°•*⁀➷ check the user's wallet for larmfs & display to the user
async function checkLarmfs() {
  try {
    let userAddress = await getConnectedUserAddress();

    let contract = new ethers.Contract(
      larmfContractAddress,
      larmfContractABI,
      provider
    );

    // ˏˋ°•*⁀➷ Get the number of tokens owned by the user
    let balance = await contract.balanceOf(userAddress);

    //ˏˋ°•*⁀➷ retrieve token ids if larmf balance > 0
    if (balance.gt(0)) {
      let larmfIds = await contract.getTokensOwnedByAddress(userAddress);
      larmfBalance.innerHTML = `${balance} larmfs found!`;
      // console.log({ larmfIds });
      for (let i = 0; i < larmfIds.length; i++) {
        let tokenURI = await contract.tokenURI(larmfIds[i]);
        let ipfsPath = tokenURI.replace("ipfs://", prefix)
        // console.log(ipfsPath);


        fetch(ipfsPath)
          .then((response) => response.json())
          .then((data) => {
            tokenUriJson = data;
            let imageUrl = tokenUriJson.image_cutout;
            imageIpfsPath = imageUrl.replace("ipfs://", prefix)
            console.log(imageIpfsPath);
            larmfCards.innerHTML +=  `<div class="larmfcard"><img src="${imageIpfsPath}"><p>#${larmfIds[i]}</p></div>`;
          
          })
          
          .catch((error) => {
            console.log(error);
          });
          
      }
    } else {
      larmf.innerText = "no larmfs found";
    }
  } catch (error) {
    console.error(error);
    alert("Error checking NFT ownership - check console!");
  }
}

async function fetchBalanceForConnectedAddress() {
  try {
    const userAddress = await getConnectedUserAddress();
    const balance = await provider.getBalance(userAddress);

    // ˏˋ°•*⁀➷ Convert balance from wei to eth, format decimal places
    let balanceInEth = parseFloat(
      ethers.utils.formatUnits(balance, "ether")
    ).toFixed(5);

    let output = `<p>your balance (eth): ${balanceInEth}</p>`;
    document.getElementById("balance").innerHTML = output;
    checkLarmfs();
  } catch (error) {
    console.error(error);
    alert("Error fetching data from the chain - check console!");
  }
}

fetchBalanceForConnectedAddress();

// connect to the blockchain and fetch the latest block number
// const provider = new ethers.providers.Web3Provider(window.ethereum);
// provider
//   .getBlockNumber()
//   .then((blockNumber) => {
//     const output = `<p>current block #: ${blockNumber}</p>`;
//     document.querySelector("main").innerHTML = output;
//   })
//   .catch((error) => {
//     console.error(error);
//     alert("error fetching data from the chain - check console!");
//   });

// connect to evm and fetch an address's balance (wei)
// const provider = new ethers.providers.Web3Provider(window.ethereum);
// provider.getBalance("imp0ster.eth")
//   .then((balance) => {
//     const output = `<p>balance (wei): ${balance}</p>`;
//     document.querySelector("main").innerHTML = output;
//   })
//   .catch((error) => {
//     console.error(error);
//     alert("error fetching data from the chain - check console!");
//   });
