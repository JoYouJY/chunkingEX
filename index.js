

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, signInWithPopup, signOut, GoogleAuthProvider, OAuthProvider  } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, collection, serverTimestamp, addDoc, setDoc, getDoc, doc    } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";




var providerNEW;
var signerNEW;
var userAccountNEW;
var AAornot;
const MasterChainID = 57054; //250 is Fantom Mainnet, 64165

const call_type = {
  CONNECT: 1,
  SEND_CONTRACT: 2,
  FULL_SCREEN: 3,
  NEW_ACCOUNT: 4,
  CONNECT_AA: 5,
  GET_BALANCE: 6,
  INSTALL_PROMPT: 7,
  GOOGLE_SIGNIN: 8 ,
  GOOGLE_SAVE_INFO: 9 ,
  GOOGLE_SIGNOUT: 10 ,
  CONNECT_PERSONAL_WALLET: 11, 
  TOGGLE_SEND_CONTRACT_AA : 12
};

const response_type = {
  ERROR   : 1,
  HASH    : 2,
  RECEIPT : 3,
  ACCOUNT_NUMBER: 4,
  READ_RESPONSE: 5,
  ROTATE: 6,
  UPDATE: 7,
  WALLET: 8,
  KEY: 9,
  RECOVERY: 10,
  BALANCE: 11,
  AA_CONNECTED: 12,

  GOOGLE_SIGNUP: 13,
  GOOGLE_DONE_SAVE_INFO: 14,

  GOOGLE_SIGNIN: 15,
  GOOGLE_CANCEL: 16,
  
  GOOGLE_SIGNOUT_DONE: 17 ,
  GOOGLE_IS_SIGNIN : 18,
  PERSONAL_WALLET_ADDRESS : 19 ,
  GET_SEND_CONTRACT_AA : 20
};

var GLOBALWALLETADDRESS;


/* ORIGINAL CONNECT WALLET WEB3*/ 
async function ConnectWallet(){
  

  if (window.ethereum == null) {
    alert('A personal wallet like MetaMask or Rabby is required to continue. Please install one to proceed.');
    // If MetaMask is not installed, we use the default provider,
    // which is backed by a variety of third-party services (such
    // as INFURA). They do not have private keys installed so are
    // only have read-only access
    
    //provider = ethers.getDefaultProvider()
    //providerNEW = new ethers.JsonRpcProvider('https://rpcapi.sonic.fantom.network/');

  } else {

    // Connect to the MetaMask EIP-1193 object. This is a standard
    // protocol that allows Ethers access to make all read-only
    // requests through MetaMask.
    providerNEW = new ethers.BrowserProvider(window.ethereum)
    
    const network = await providerNEW.getNetwork();
    var chainId = network.chainId;
    // Convert chainId to a number before comparison
    chainId = parseInt(chainId, 10);
    

    // Check if chain ID is not 250
    if (chainId !== MasterChainID) {
      switchToFantom();
      alert("Switch to Fantom Network before Connecting."); // Display alert pop-up
      return;
    }
    // It also provides an opportunity to request access to write
    // operations, which will be performed by the private key
    // that MetaMask manages for the user.
    signerNEW = await providerNEW.getSigner();
  } 

  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  } catch (error) {
    if (error.code === 4001) {
      window.location.href = 'ethereum:';
    } else {
      
    }
  }

  userAccountNEW = await signerNEW.getAddress();

  

  

  AAornot = false;
  GLOBALWALLETADDRESS = userAccountNEW;
  sendBalanceinfo();
  response(response_type.ACCOUNT_NUMBER, userAccountNEW);
  
}


async function ConnectPersonalWallet(){
  

  if (window.ethereum == null) {
    alert('A personal wallet like MetaMask or Rabby is required to continue. Please install one to proceed.');
    // If MetaMask is not installed, we use the default provider,
    // which is backed by a variety of third-party services (such
    // as INFURA). They do not have private keys installed so are
    // only have read-only access
    
    //provider = ethers.getDefaultProvider()
    //providerNEW = new ethers.JsonRpcProvider('https://rpcapi.sonic.fantom.network/');

  } else {

    // Connect to the MetaMask EIP-1193 object. This is a standard
    // protocol that allows Ethers access to make all read-only
    // requests through MetaMask.
    providerNEW = new ethers.BrowserProvider(window.ethereum)
    
    const network = await providerNEW.getNetwork();
    var chainId = network.chainId;
    // Convert chainId to a number before comparison
    chainId = parseInt(chainId, 10);
    

    // Check if chain ID is not 250
    if (chainId !== MasterChainID) {
      switchToFantom();
      alert("Switch to Fantom Network before Connecting."); // Display alert pop-up
      return;
    }
    // It also provides an opportunity to request access to write
    // operations, which will be performed by the private key
    // that MetaMask manages for the user.
    signerNEW = await providerNEW.getSigner();
  } 

  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  } catch (error) {
    if (error.code === 4001) {
      window.location.href = 'ethereum:';
    } else {
      
    }
  }

  userAccountNEW = await signerNEW.getAddress();

  

  

  AAornot = false;//this is important, this decided how sendcontract() going to use wallet or AA
  GLOBALWALLETADDRESS = userAccountNEW;
  sendBalanceinfo();
  response(response_type.PERSONAL_WALLET_ADDRESS, userAccountNEW);
  
}

async function ToggleAAornot() { //true = using AA, false = using Metamask/Rabby
  AAornot = !AAornot;
  response(response_type.GET_SEND_CONTRACT_AA, AAornot);
}




//################################### AA ####################################
/**/


/**/
function CreateWeb2Wallet(){
  const wallet = ethers.Wallet.createRandom();
  AA_privateKey = wallet.privateKey;
  AA_recipient = wallet.address;
  
  
  
}


// Step 1: Define your RPC URL and Chain ID
const AA_rpcUrl = 'https://rpc.blaze.soniclabs.com';//'https://rpc.testnet.soniclabs.com';
const AA_chainId = 57054;//64165;

// Step 2: Define the provider with the custom RPC
const AA_provider = new ethers.JsonRpcProvider(AA_rpcUrl, {
  name: 'soniclabs-testnet',
  chainId: AA_chainId,
});



var AA_wallet;


async function getSBalance(walletAddress) {
  const balanceInWei = await AA_provider.getBalance(walletAddress);
  const balanceInEth = ethers.formatEther(balanceInWei);
  
  
  response(response_type.BALANCE, balanceInEth);
}

async function sendBalanceinfo() {
  try {
    // Check if GLOBALWALLETADDRESS is defined and not empty
    if (!GLOBALWALLETADDRESS) {
      
      return; // Exit the function if no wallet address is defined
    }

    // Fetch the balance and convert it to ETH
    const balanceInWei = await AA_provider.getBalance(GLOBALWALLETADDRESS);
    const balanceInEth = ethers.formatEther(balanceInWei);

    // Log and respond with the balance
    
    response(response_type.BALANCE, balanceInEth);
    
  } catch (error) {
    // Handle any errors
    console.error("Error fetching balance: ", error);
  }
}
// Run the function every 21 seconds (21000 ms)
setInterval(sendBalanceinfo, 21000);



//########THIS IS AA VERSION,  there is another web3 version of ConnectWallet
async function CreateAndConnectWeb2Wallet(fkey,pass){ 
  //After player decided to create an account/with guest login/google or apple/
  //if the logged in account has no WALLET then run this function!
  //create them a new web2 wallet (means wallet linked to web2)
  //this is connecting newly created wallet. BUT need to transfer gas to it.
  //So need to call a faucet function with faucet key.

  //Create a wallet for web3 account after they register web2
  const wallet = ethers.Wallet.createRandom();
  var AA_privateKey = wallet.privateKey;
  var AA_recipient = wallet.address;
  
  
  
  

  AA_wallet = new ethers.Wallet(AA_privateKey, AA_provider);
  
  //********UNITY have to provide they key but now i use preset one first**************************************************************
  //*******const faucet_wallet = new ethers.Wallet(fkey, AA_provider);*****************************************************************
  
  const faucet_master = new ethers.Wallet(fkey, AA_provider);
  
  const faucetContractAddress = '0xDCF9127a59169d889b1beC8e8148Dcc3DB66f994';
  const faucetABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "passcode",
          "type": "uint256"
        }
      ],
      "name": "distributeFaucet",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
  const faucetContract = new ethers.Contract(faucetContractAddress, faucetABI, faucet_master);


  try {
    // Call the distributeFaucet function
    const tx = await faucetContract.distributeFaucet(AA_recipient,pass);
    
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    
    
    
    
  } catch (error) {
      console.error('Error distributing faucet:', error.message);
  }

    
    const network = await AA_provider.getNetwork();
    
    var chainId = network.chainId;
    // Convert chainId to a number before comparison
    chainId = parseInt(chainId, 10);
    

    // Check if chain ID is not 250
    if (chainId !== MasterChainID) {
      switchToFantom();
      alert("Switch to Fantom Network before Connecting."); // Display alert pop-up
      return;
    }

    // It also provides an opportunity to request access to write
    // operations, which will be performed by the private key
    // that MetaMask manages for the user.
   // signerNEW = await providerNEW.getSigner();
 

  

  

  AAornot = true;
  GLOBALWALLETADDRESS = AA_recipient;
  sendBalanceinfo();
  //response(response_type.ACCOUNT_NUMBER, AA_recipient);
  response(response_type.WALLET, AA_recipient);
  response(response_type.KEY, AA_privateKey);
  response(response_type.RECOVERY, wallet.mnemonic.phrase);
  AAornot = true;

}

async function ConnectAAWallet(aawalletaddress, aakey){ 
  //Assume old player logging in their web2 account
  //this is connecting created wallet from cloud. 
  //the arg should be the wallet.

  //Create a wallet for web3 account after they register web2
  var AA_privateKey = aakey;
  var AA_recipient = aawalletaddress;
  
  //
  //
  

  AA_wallet = new ethers.Wallet(AA_privateKey, AA_provider);
 
  
  const network = await AA_provider.getNetwork();
  
  var chainId = network.chainId;
  // Convert chainId to a number before comparison
  chainId = parseInt(chainId, 10);
  

  // Check if chain ID is not 250
  if (chainId !== MasterChainID) {
    switchToFantom();
    alert("Switch to Fantom Network before Connecting."); // Display alert pop-up
    return;
  }

    // It also provides an opportunity to request access to write
    // operations, which will be performed by the private key
    // that MetaMask manages for the user.
   // signerNEW = await providerNEW.getSigner();
 

  

  

  AAornot = true;
  GLOBALWALLETADDRESS = AA_recipient;
  sendBalanceinfo();
  response(response_type.AA_CONNECTED, AA_recipient);
  AAornot = true;

}



//################################ AA END  #################################


var isfullscreen = false;
function EnterFullScreen(){
  if (isfullscreen){
    window.unityInstance.SetFullscreen(0);
    isfullscreen = false;
  } 
  else{
    window.unityInstance.SetFullscreen(1);
    isfullscreen = true;
  }
}

// ConnectWallet();

function JsCallFunction(type, arg_string){
  
  
  


  if(type == call_type.CONNECT){    
    ConnectWallet();  
    //CreateAndConnectWeb2Wallet();
  }  
  else if(type == call_type.FULL_SCREEN){    
    //EnterFullScreen()  
    // Instead of calling EnterFullScreen(), send a message to the parent window
    window.parent.postMessage('toggleFullscreen', '*');
  }
  else if (type == call_type.SEND_CONTRACT){
    arg_string = arg_string.toString()
    if (arg_string.startsWith("<sendContract>") && arg_string.endsWith("</sendContract>")){
      const removeSyntax = arg_string.substring("<sendContract>".length).slice(0,arg_string.length-("<sendContract>".length+"</sendContract>".length));
      const splited_text = removeSyntax.split("_%_");
      
      if (splited_text.length == 8){

          var bridge_id   = splited_text[0];
          var address     = splited_text[1];
          var method      = splited_text[2];
          var args        = splited_text[3];
          var price       = splited_text[4];
          var gasLimit    = splited_text[5];
          var gasPrice    = splited_text[6];
          var abi         = splited_text[7];



          sendContract(bridge_id, method, abi, address, args, price, gasLimit, gasPrice) 

      }
    }

  }
  else if (type == call_type.NEW_ACCOUNT){
    if (arg_string.startsWith("<sendContract>") && arg_string.endsWith("</sendContract>")){
      // create new account for AA
      const removeSyntax = arg_string.substring("<sendContract>".length).slice(0,arg_string.length-("<sendContract>".length+"</sendContract>".length));
      const splited_text = removeSyntax.split("_%_");
      
      if (splited_text.length == 2){

          var faucetkey   = splited_text[0];
          var pass     = splited_text[1];

          CreateAndConnectWeb2Wallet(faucetkey,pass);

      }

    }
  }
  else if (type == call_type.CONNECT_AA){
    if (arg_string.startsWith("<sendContract>") && arg_string.endsWith("</sendContract>")){
      const removeSyntax = arg_string.substring("<sendContract>".length).slice(0,arg_string.length-("<sendContract>".length+"</sendContract>".length));
      const splited_text = removeSyntax.split("_%_");
      
      if (splited_text.length == 2){

        var aawalletaddress   = splited_text[0];
        var aakey     = splited_text[1];

        ConnectAAWallet(aawalletaddress,aakey)
        //get addres and key from cloud to connect AA wallet

      }

    }
  }
  else if (type == call_type.GET_BALANCE){
    if (arg_string.startsWith("<sendContract>") && arg_string.endsWith("</sendContract>")){
      const walletaddress = arg_string.substring("<sendContract>".length).slice(0,arg_string.length-("<sendContract>".length+"</sendContract>".length));
      
      getSBalance(walletaddress);
      // get S balance to display

    }
  }
  else if (type == call_type.INSTALL_PROMPT){
    
      hideCanvasAndShowPrompt();
      //install prompt
  }

  else if (type == call_type.GOOGLE_SIGNIN){
    
    SignInGoogle();
  }

  else if (type == call_type.GOOGLE_SAVE_INFO){
    console.log("type == call_type.GOOGLE_SAVE_INFO");

    const splited_text = arg_string.split("_%_");
    
    GoogleSaveInfo(splited_text);

  }
  else if (type == call_type.GOOGLE_SIGNOUT){
    
    SignOutGoogle();
  }
  
  else if (type == call_type.CONNECT_PERSONAL_WALLET){
    
    ConnectPersonalWallet();
  }
  
  else if (type == call_type.TOGGLE_SEND_CONTRACT_AA){
    
    ToggleAAornot();
  }


}
window.JsCallFunction = JsCallFunction;



async function JsGetFunction(type, arg_string){
  
  
  // 


  arg_string = arg_string.toString()
  if (arg_string.startsWith("<readContract>") && arg_string.endsWith("</readContract>")){
    const removeSyntax = arg_string.substring("<readContract>".length).slice(0,arg_string.length-("<readContract>".length+"</sendContract>".length));
    const splited_text = removeSyntax.split("_%_");
    
    if (splited_text.length == 5){

      var bridge_id   = splited_text[0];
      var address     = splited_text[1];
      var method      = splited_text[2];
      var args        = splited_text[3];
      var abi         = splited_text[4];

      
      
      
      
      // 



      var responseString = await readContract(bridge_id, method, abi, address, args, ) 

      
      

      response(response_type.READ_RESPONSE, bridge_id.toString() + "_%_" + JSON.stringify(responseString))

      return(JSON.stringify(responseString));
    }
  }


}
window.JsGetFunction = JsGetFunction;

//--------------------------------------------------------------- -READ- ---------------------------------------------
async function readContract(id, method, abi, contract, args) {
  // navigator.clipboard.writeText("<ContractRead>")
  return new Promise(async (resolve, reject) => {
    try {
      //const from = (await web3.eth.getAccounts())[0];
      
      
      
      const contracts = new ethers.Contract(contract, abi, providerNEW);
      const resulttemp = await contracts[method](...JSON.parse(args));


      const unwraplog = unwrapProxy(resulttemp);
      

      
      const serializelog = convertBigIntsToStrings(unwraplog);
      
    
      
      
      //-------------------------
      resolve(serializelog); // Resolve the Promise with the result
    } catch (error) {
      console.error(error);
      reject(error); // Reject the Promise in case of an error
    }
  });
}
//---------------------------------- SEND --------------------------------------------------------------------------------
async function sendContract(id, method, abi, contract, args, value, gasLimit, gasPrice) { //conventional web3 wallet send
  //////////////// NO AA //////////////////////////////////////////////////////////////
  if (AAornot == false) {
    
    // Get network object
    providerNEW = new ethers.BrowserProvider(window.ethereum);
    const network = await providerNEW.getNetwork();
    var chainId = network.chainId;
    // Convert chainId to a number before comparison
    chainId = parseInt(chainId, 10);
    

    // Check if chain ID is not 250
    if (chainId !== MasterChainID) {
      switchToFantom();
      response(response_type.ERROR, method + "_%%_" + "wrong RPC, switch to Fantom Network and Retry.");
    } else {
      //const from = (await web3.eth.getAccounts())[0];
      const contracts = new ethers.Contract(contract, abi, providerNEW);
      const contractWithSigner = contracts.connect(signerNEW);
      
      var options = {};
      if (gasLimit != "") { options.gasLimit = gasLimit; }
      if (gasPrice != "") { options.gasPrice = gasPrice; }
      if (value    != "") { options.value    = value; }

           
      try {
        
        
        const transaction = await contractWithSigner[method](...JSON.parse(args), options);
        
        const startTime = new Date();
        // Wait for the transaction to be mined and get receipt
        
        response(response_type.HASH, method);
        const receipt = await getTransactionReceiptWithRetry(transaction.hash, 120);
        
        const endTime2 = new Date();
        const timeTaken2 = endTime2 - startTime;
        
        //----------------------------------------
        
        const parsedLogs = [];
        for (const log of receipt.logs) {
          const parsedLog = contracts.interface.parseLog(log);
          
          if (parsedLog) {
            parsedLogs.push(parsedLog);
          } else {
            parsedLogs.push(log);
          }
        }
        
        // Now parsedLogs contains the parsed logs and raw logs if they didn't match the ABI
        

        const unwraplog = unwrapProxy(parsedLogs);
        

        
        const serializelog = convertBigIntsToStrings(unwraplog);
        

        const jsonlog = JSON.stringify(serializelog);
        
        response(response_type.RECEIPT, method + "_%%_" + JSON.stringify(serializelog));
        return receipt;
      } catch (error) {
        console.error('Error sending transaction:', error);
        response(response_type.ERROR, method + "_%%_" + error.message);
        //throw error; // rethrow the error to handle it at a higher level
      }
    }  
    sendBalanceinfo();
  } else { //////////////  AA is TRUE   ///////////////////////////////////////////////
    
    // Get network object
    providerNEW = AA_provider ;
    const network = await providerNEW.getNetwork();
    var chainId = network.chainId;
    // Convert chainId to a number before comparison
    chainId = parseInt(chainId, 10);
    

    // Check if chain ID is not 250
    if (chainId !== MasterChainID) {
      switchToFantom();
      response(response_type.ERROR, method + "_%%_" + "wrong RPC, switch to Fantom Network and Retry.");
    } else { 
      //const from = (await web3.eth.getAccounts())[0];
      const contracts = new ethers.Contract(contract, abi, providerNEW);
      const contractWithSigner = contracts.connect(AA_wallet);
      
      var options = {};
      if (gasLimit != "") { options.gasLimit = gasLimit; }
      if (gasPrice != "") { options.gasPrice = gasPrice; }
      if (value    != "") { options.value    = value; }

      
      
      //
      
      
      
      
      
      
      
      
      
      try {
        
        
        const transaction = await contractWithSigner[method](...JSON.parse(args), options);
        
        const startTime = new Date();
        // Wait for the transaction to be mined and get receipt
        
        response(response_type.HASH, method);
        const receipt = await getTransactionReceiptWithRetry(transaction.hash, 120);
        
        const endTime2 = new Date();
        const timeTaken2 = endTime2 - startTime;
        
        //----------------------------------------
        
        const parsedLogs = [];
        for (const log of receipt.logs) {
          const parsedLog = contracts.interface.parseLog(log);
          
          if (parsedLog) {
            parsedLogs.push(parsedLog);
          } else {
            parsedLogs.push(log);
          }
        }
        
        // Now parsedLogs contains the parsed logs and raw logs if they didn't match the ABI
        

        const unwraplog = unwrapProxy(parsedLogs);
        

        
        const serializelog = convertBigIntsToStrings(unwraplog);
        

        const jsonlog = JSON.stringify(serializelog);
        
        response(response_type.RECEIPT, method + "_%%_" + JSON.stringify(serializelog));
        return receipt;
      } catch (error) {
        console.error('Error sending transaction:', error);
        response(response_type.ERROR, method + "_%%_" + error.message);
        //throw error; // rethrow the error to handle it at a higher level
      }
      sendBalanceinfo();
    }  
  }
}
//############## AA SEND CONTRACT ###################
async function sendContractAA(id, method, abi, contract, args, value, gasLimit, gasPrice) { //for going with AA way, call this instead.
  
  // Get network object
  providerNEW = AA_provider ;
  const network = await providerNEW.getNetwork();
  var chainId = network.chainId;
  // Convert chainId to a number before comparison
  chainId = parseInt(chainId, 10);
  

  // Check if chain ID is not 250
  if (chainId !== MasterChainID) {
    switchToFantom();
    response(response_type.ERROR, method + "_%%_" + "wrong RPC, switch to Fantom Network and Retry.");
  } else { 
    //const from = (await web3.eth.getAccounts())[0];
    const contracts = new ethers.Contract(contract, abi, providerNEW);
    const contractWithSigner = contracts.connect(AA_wallet);
    
    var options = {};
    if (gasLimit != "") { options.gasLimit = gasLimit; }
    if (gasPrice != "") { options.gasPrice = gasPrice; }
    if (value    != "") { options.value    = value; }

    
    
    //
    
    
    try {
      
      
      const transaction = await contractWithSigner[method](...JSON.parse(args), options);
      
      const startTime = new Date();
      // Wait for the transaction to be mined and get receipt
      
      response(response_type.HASH, method);
      const receipt = await getTransactionReceiptWithRetry(transaction.hash, 120);
      
      const endTime2 = new Date();
      const timeTaken2 = endTime2 - startTime;
      
      //----------------------------------------
      
      const parsedLogs = [];
      for (const log of receipt.logs) {
        const parsedLog = contracts.interface.parseLog(log);
        
        if (parsedLog) {
          parsedLogs.push(parsedLog);
        } else {
          parsedLogs.push(log);
        }
      }
      
      // Now parsedLogs contains the parsed logs and raw logs if they didn't match the ABI
      

      const unwraplog = unwrapProxy(parsedLogs);
      

      
      const serializelog = convertBigIntsToStrings(unwraplog);
      

      const jsonlog = JSON.stringify(serializelog);
      
      response(response_type.RECEIPT, method + "_%%_" + JSON.stringify(serializelog));
      return receipt;
    } catch (error) {
      console.error('Error sending transaction:', error);
      response(response_type.ERROR, method + "_%%_" + error.message);
      //throw error; // rethrow the error to handle it at a higher level
    }
  }  
}
	  

//------------------------------------------------------Assisting Decoding function--------------------
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
////////////////////
async function getTransactionReceiptWithRetry(txHash, maxRetries) {
  let retries = 0;
  let txReceipt = null;
  await delay(800); // Wait for 0.5 seconds before retrying
  while (retries < maxRetries) {
    await delay(450); // Wait for 0.5 seconds before retrying
    txReceipt = await providerNEW.getTransactionReceipt(txHash);

    if (txReceipt) {
      
      return txReceipt;
    }

    retries++;
    
  }
  
  return null;
}
////////////////////
function unwrapProxy(proxy) {
  if (typeof proxy !== 'object' || proxy === null) {
    return proxy;
  }
  if (Array.isArray(proxy)) {
    return proxy.map(unwrapProxy);
  }
  // Check if the object being unwrapped is a private function
  if (proxy.stateMutability === 'private') {
    // Decode the private function's ABI and extract its arguments
    const args = abi.decode(proxy.signature, proxy.args);

    // Return the private function's arguments
    return args;
  }
  const result = {};
  for (let key in proxy) {
    result[key] = unwrapProxy(proxy[key]);
  }

  return result;
}
//////////////////
function convertBigIntsToStrings(obj) {
  if (typeof obj === 'bigint') {
      return obj.toString();
  } else if (Array.isArray(obj)) {
      return obj.map(item => convertBigIntsToStrings(item));
  } else if (typeof obj === 'object' && obj !== null) {
      const result = {};
      for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
              result[key] = convertBigIntsToStrings(obj[key]);
          }
      }
      return result;
  } else {
      return obj;
  }
}


//----------------------------------------------------------


async function response(respondType, message){

  var responseString = "<response>" + respondType + "_%_" + message + "</response>"

  window.unityInstance.SendMessage("JavascriptBridgeManager", "ResponseToUnity", responseString);

}



window.getAggressiveGasPrice = async function() {
  try {
  
      const feeData = await providerNEW.getFeeData();
      const bignumgas = feeData.gasPrice * BigInt(15) / BigInt(10);
      //const gasPrice = numbergas.toString();
      

      return bignumgas;

  } catch (error) {
    console.error('Error:', error);
    throw error; // Throw the error
  }
};



async function switchToFantom() {
  const hexValue = "0x" + MasterChainID.toString(16);
  try{
    await window.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: hexValue }],    // sonic testnet is 0xFAA5 mainnet 0xFA
    });
  }catch (error) {
    // Handle errors appropriately:
    if (error.code === 4902) { // Check for "User rejected the request" error code
      console.error("User rejected the network switch request.");
      // Optionally display a user-friendly message explaining the situation
    } else if (error.code === 4901) { // Check for "Chain not found" error code
      console.error("Fantom Chain not found in your wallet.");
      // Provide clear instructions on how to add the Fantom Chain (e.g., link to a guide)
    } else {
      console.error("Error switching to Fantom Chain:", error);
      // Optionally display a generic error message for other unexpected errors
    }
  }
 }

// Expose the function globally since index.js becomes the module
window.switchToFantom = switchToFantom;

var isHorizontal = true;
function rotateCanvas() {
  
  isHorizontal = ! isHorizontal;
  
  var canvas = document.getElementById('unity-canvas');
  var temp = canvas.style.width;
  canvas.style.width = canvas.style.height;
  canvas.style.height = temp;
  
  response(response_type.ROTATE, isHorizontal);
}


// Function to hide the canvas and show the modal with install prompt
function hideCanvasAndShowPrompt() {
  //const canvas = document.getElementById('yourCanvasId'); // Replace with your canvas ID
  canvas.style.display = 'block'; // Hide the canvas

  // Create a modal div
  const modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.top = '50%';
  modal.style.left = '50%';
  modal.style.transform = 'translate(-50%, -50%)';
  modal.style.padding = '20px';
  modal.style.backgroundColor = '#fff';
  modal.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
  modal.style.zIndex = '1000';

  // Create text message
  const message = document.createElement('p');
  message.innerText = 'Do you want to install the Fate Adventure WebAPP?';
  modal.appendChild(message);

  // Create Yes button
  const yesButton = document.createElement('button');
  yesButton.innerText = 'Yes';
  yesButton.onclick = () => {
      // Call the install prompt function here
      showInstallPrompt();
      document.body.removeChild(modal); // Remove the modal
  };
  modal.appendChild(yesButton);

  // Create No button
  const noButton = document.createElement('button');
  noButton.innerText = 'No';
  noButton.onclick = () => {
      document.body.removeChild(modal); // Remove the modal
      canvas.style.display = 'block';
  };
  modal.appendChild(noButton);

  // Append the modal to the body
  document.body.appendChild(modal);
}

// ----------- Firebase -----------

const firebaseConfig = {
  apiKey: "AIzaSyBCCqusdD1xeeLqddNMnKvNMfI5RaM3A-c",
  authDomain: "fa-rpg-test.firebaseapp.com",
  projectId: "fa-rpg-test",
  storageBucket: "fa-rpg-test.firebasestorage.app",
  messagingSenderId: "292599592100",
  appId: "1:292599592100:web:17834e0bfd3c7a3f9fa231",
  measurementId: "G-RYENS3GYDQ"
};

const app = initializeApp(firebaseConfig); 
const auth = getAuth(app); 
const user = auth.currentUser;
const db = getFirestore(app);
const google_provider = new GoogleAuthProvider();

async function SignInGoogle(){
  console.log("[____] SignInGoogle()");

  if (auth.currentUser)
  {
    console.log("[____] Had ald Login():", auth.currentUser.uid);
    GetUserInfo(auth.currentUser);
  }
  else{
    try {

      await signInWithPopup(auth, google_provider);
  
      console.log("[____] signInWithPopup() done");
      
      console.log("[____] user:", auth.currentUser);
      console.log("[____] user.uid:", auth.currentUser.uid);
      if (auth.currentUser) {
        GetUserInfo(auth.currentUser);
      } 
      else{
        response(response_type.GOOGLE_CANCEL);
      }
    } catch (error) {
      response(response_type.GOOGLE_CANCEL);
    }
    
  }
}

async function SignOutGoogle() {
  console.log("[____] SignOutGoogle()")
  signOut(auth);
  console.log("[____] Signed Out")
  response(response_type.GOOGLE_SIGNOUT_DONE)
  
  console.log("[____] Signed Out Done")
}

async function GoogleSaveInfo(splited_text){

  console.log("[____] GoogleSaveInfo() splited_text=", splited_text);

  try {
    const user = auth.currentUser;
    const docRef = await doc(db, "users", user.uid)
    const user_data = 
      {
        version          : splited_text[0],
        randomKey        : splited_text[1],
        encodeAddress1   : splited_text[2],
        encodeAddress2   : splited_text[3],
        encodeKey1       : splited_text[4],
        encodeKey2       : splited_text[5],
        encoded_mnemonic : splited_text[6],
      }

    await setDoc(docRef, user_data );

    console.log("[____] Document written");

    response(response_type.GOOGLE_DONE_SAVE_INFO);
  } catch (error) {
    console.error("[____] Error adding document: ", error);
  }
}

async function GetUserInfo(user) {
  console.log("[____] GetUserInfo()");
  try {
    const docRef = await doc(db, "users", user.uid)
    const userInfo = await getDoc(docRef );

    console.log("[____] Document Data exists:", userInfo.exists());

    if (userInfo.exists()){
      console.log("[____] Logging in Document Data:", userInfo.data());


      const data = userInfo.data();
      const combinedRespond = data['version'] + "_%%_" +
                              data['randomKey'] + "_%%_" +
                              data['encodeAddress1'] + "_%%_" +
                              data['encodeAddress2'] + "_%%_" +
                              data['encodeKey1'] + "_%%_" + 
                              data['encodeKey2'] + "_%%_" + 
                              data['encoded_mnemonic']; 
      
      console.log("[____] Login with info:", combinedRespond);
     
      response(response_type.GOOGLE_SIGNIN, combinedRespond)
    }
    else{
      console.log("[____] Creating a new account...")
      response(response_type.GOOGLE_SIGNUP, "GetUserInfo");
    }

  } catch (error) {
    console.error("[____] Error Reading User Info: ", error);
  }
}



auth.onAuthStateChanged(user => {
  
  if (user){
    response(response_type.GOOGLE_IS_SIGNIN);
    console.log("[____] GOOGLE_IS_SIGNIN")
  }
  

});
document.body.style.backgroundColor = "black";



//--------------------------TRY
// Function to handle key presses
function handleKeyPress(event) {
  // Check if the 'p' key was pressed
  // event.key is case-sensitive ('p' vs 'P'), so we convert it to lowercase for uniformity
  if (event.key.toLowerCase() === 'p') {
    // Optionally, prevent default behavior if 'p' has any in your context
    // event.preventDefault();

    // Call the ConnectPersonalWallet function
    ConnectPersonalWallet();
  }
}

// Attach the event listener to the document
document.addEventListener('keydown', handleKeyPress);

