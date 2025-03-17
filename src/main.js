
import { getOpenAIResponse } from './api/openai.js';
import { generateImage } from './api/netmind.js';
import { 
    AnchorMode, 
    uintCV, 
    principalCV, 
    noneCV, 
    someCV,
    PostConditionMode, 
    bufferCV,
    contractPrincipalCV, 
    tupleCV 
  } from '@stacks/transactions';  
import { showConnect } from '@stacks/connect'; // Importa0Š40Š0o do showConnect
import { StacksMainnet } from '@stacks/network';
import { AppConfig, UserSession } from '@stacks/connect';

import { Buffer } from 'buffer';

import { createMap } from "./popup.js";

import "./style2.css";
 // Pegue dinamicamente depois

const network = new StacksMainnet();

import { cachedPrices, fetchTokenPrices } from "./cripto.js";

async function init() {
    await fetchTokenPrices();  // Chama a função assíncrona fetchTokenPrices // Valor padrão
        // O restante do seu código aqui
}

init(); 

let valueInUSD = "N/D";// Chama a função init para executá-la

// Fun0Š40Š0o para converter hex em bytes com valida0Š40Š0o
const hexToBytes = (hex) => {
    let hexString = hex;
    if (typeof hex === 'object' && hex.value) {
        hexString = hex.value;
    }
    
    hexString = hexString.replace(/^0x/, '');
    
    if (hexString.length % 2 !== 0) {
        throw new Error(`Hex inv¨¢lido: comprimento ¨ªmpar (${hexString.length} caracteres)`);
    }
    if (!/^[0-9a-fA-F]+$/.test(hexString)) {
        throw new Error(`Hex cont¨¦m caracteres inv¨¢lidos: ${hexString}`);
    }
    
    return Uint8Array.from(Buffer.from(hexString, 'hex'));
  };

// Configura0Š40Š0o da sess0Š0o do usu¨¢rio
const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

const chatContainer = document.getElementById('chat-container');
const chatInput = document.getElementById('chat-input');
const walletButton = document.getElementById('wallet-button');
const sendButton = document.getElementById('send-button');

// Estado do chat
let chat = [
  { from: 'Hanna', text: 'Welcome! How can I assist you today?' },
];

let walletAddress = ''; // Para armazenar o endere0Š4o da carteira

// Estilizar bot0‹1es (estilo moderno e cor laranja)
function styleButton(button) {
  button.style.backgroundColor = '#FFA500';
  button.style.color = '#FFFFFF';
  button.style.border = 'none';
  button.style.borderRadius = '8px';
  button.style.padding = '10px 20px';
  button.style.cursor = 'pointer';
  button.style.fontSize = '14px';
  button.style.fontWeight = 'bold';
  button.style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)';
  button.style.transition = 'background-color 0.3s ease';

  button.addEventListener('mouseover', () => {
    button.style.backgroundColor = '#E59400';
  });
  button.addEventListener('mouseout', () => {
    button.style.backgroundColor = '#FFA500';
  });
}

// Estilizar os bot0‹1es ao carregar
styleButton(walletButton);
styleButton(sendButton);

// Renderizar o chat
function renderChat() {
  chatContainer.innerHTML = '';
  chat.forEach((msg) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', msg.from === 'user' ? 'user' : 'bot');

    const textElement = document.createElement('div');
    textElement.classList.add('text');
    textElement.innerHTML = msg.text;

    if (msg.image) {
      const imageElement = document.createElement('img');
      imageElement.src = msg.image;
      imageElement.alt = 'Generated Image';
      textElement.appendChild(imageElement);
    }

    if (msg.button) {
      const buttonElement = document.createElement('button');
      buttonElement.textContent = msg.button.text;
      buttonElement.addEventListener('click', msg.button.action);
      styleButton(buttonElement); // Aplicar estilo moderno ao bot0Š0o
      textElement.appendChild(buttonElement);
    }

    messageElement.appendChild(textElement);
    chatContainer.appendChild(messageElement);
  });
}

// Conectar ¨¤ carteira usando showConnect
async function connectWallet() {
  try {
    if (!userSession.isUserSignedIn()) {
      showConnect({
        appDetails: {
          name: 'Hanna labs',
          icon: window.location.origin + '/logo512.png',
        },
        redirectTo: '/',
        onFinish: () => {
          walletAddress = userSession.loadUserData().profile.stxAddress.mainnet; // Troque para mainnet se necess¨¢rio
          walletButton.textContent = `${walletAddress.slice(0, 4)}...`;
        },
        userSession,
      });
    } else {
      walletAddress = userSession.loadUserData().profile.stxAddress.mainnet;
      walletButton.textContent = `${walletAddress.slice(0, 4)}...`;
     createMap(walletAddress);
   
    }
  } catch (error) {
    console.error('Wallet connection failed:', error);
  }
}

// Enviar carteira para a API
async function sendWalletToAPI() {
  if (!walletAddress) {
    console.error('Wallet address is empty.');
    return;
  }

  try {
    const response = await fetch('', {  //soma cada interaçao no app para pagamentos de token
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ wallet: walletAddress }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send wallet to API: ${response.statusText}`);
    }

    console.log('Wallet successfully sent to API.');
  } catch (error) {
    console.error('Error sending wallet to API:', error);
  }
}

// Lidar com o envio de mensagens
async function handleSendMessage() {
  const message = chatInput.value.trim();
  if (!message) return;

  chat.push({ from: 'user', text: message });
  renderChat();
  chatInput.value = '';

  let response = await getOpenAIResponse(message);

  if (
    response.startsWith('/imagem') || 
    response.startsWith('/imagen') || 
    response.startsWith('/imagens')
  ) {
    const prompt = response.replace(/^\/imagem?s?/, '').trim();
    const imagePath = await generateImage(prompt);
    
    chat.push({ from: 'Hanna', text: ' 🖼️ Generating image...' });

await new Promise(resolve => setTimeout(resolve, 0));



    if (imagePath) {
      chat.push({ from: 'Hanna', text: 'image:', image: imagePath });
    } else {
      chat.push({ from: 'Hanna', text: 'Error generating the image. Try again later.' });
    }
  
    
// sempre apagar daqui

} else if (response.startsWith('/swap')) {
  try {
    // Parsear os detalhes do swap da resposta
    const swapDetails = response.replace('/swap', '').trim();
    const assetAMatch = swapDetails.match(/assetA:\s*"([^"]+)"/);
    const assetBMatch = swapDetails.match(/assetB:\s*"([^"]+)"/);
    const amountMatch = swapDetails.match(/amount:\s*(\d+)/);
    const assetANameMatch = swapDetails.match(/assetAName:\s*"([^"]+)"/);
    const assetBNameMatch = swapDetails.match(/assetBName:\s*"([^"]+)"/);

    if (!assetAMatch || !assetBMatch || !amountMatch || !assetANameMatch || !assetBNameMatch) {
      throw new Error('Missing required fields: assetA, assetB, amount, assetAName, or assetBName.');
    }

    const assetA = assetAMatch[1];
    const assetB = assetBMatch[1];
    const amount = parseInt(amountMatch[1], 10);
    const assetAName = assetANameMatch[1];
    const assetBName = assetBNameMatch[1];

// Adiciona a mensagem de "Construindo transação" e spinner
chat.push({ 
  from: 'Hanna', 
  text: '⬇️ Building transaction....', 
 // Substitua com o caminho para o gif do spinner
});
renderChat();
    

    // Chamada ¨¤ API para obter cota0Š40Š0o
    const apiResponse = await fetch(`por api dexterit aqui`);
    const data = await apiResponse.json();  //dexterity-sdk e preciso configurar sua propria api

    if (data.success && data.transaction) {
      const transaction = data.transaction;
      // Encontrar a linha do log que contém "Valor cotação:"
  const quotationLog = data.logs.find(log => log.startsWith("Valor cotação:"));

  // Extrair os valores da cotação
  const quotationMatch = quotationLog ? quotationLog.match(/Valor cotação: (\d+) .* -> (\d+) .*/) : null;

  // Definir a cotação com o valor extraído
  const quotation = quotationMatch ? quotationMatch[2] : null;


      console.log("Iniciando transa0Š40Š0o com os seguintes dados:");
      console.log("Dados completos da transa0Š40Š0o:", transaction);

          // Processamento de argumentos com logs detalhados
    const functionArgs = transaction.functionArgs.map(arg => {
        if (arg.type === 'uint') {
            const uintValue = uintCV(parseInt(arg.value));
            console.log(`”9æ4 Argumento Uint - Valor: ${arg.value}`, uintValue);
            return uintValue;
        } else if (arg.type === 'tuple') {
            const poolValue = arg.value.pool.value;
            
            // Processando opcode
            const opcodeEntry = arg.value.opcode;
            let opcodeCV = noneCV();
            
            if (opcodeEntry?.type === 'some' && opcodeEntry.value?.type === 'buffer') {
                try {
                    const bytes = hexToBytes(opcodeEntry.value.value);
                    opcodeCV = someCV(bufferCV(bytes));
                    console.log(`”9ß5 Opcode convertido:`, opcodeCV);
                } catch (error) {
                    console.error('Erro na convers0Š0o do opcode:', error);
                }
            }
            
            const tupleValue = tupleCV({
                pool: contractPrincipalCV(
                    poolValue.split('.')[0],
                    poolValue.split('.')[1]
                ),
                opcode: opcodeCV
            });

            console.log(`”9à4 Argumento Tuple - Pool: ${poolValue}`, tupleValue);
            return tupleValue;
        }
    });

    // define novos valores inteiros para o usuário 
    const formattedAmount = parseFloat((amount / 1_000_000).toFixed(6)).toString();
const formattedQuotation = parseFloat((quotation / 1_000_000).toFixed(6)).toString();

// Obtém o preço do token B em USD diretamente do objeto
const assetBPrice = cachedPrices[assetB];
console.log("🔍 Preço do token B:", cachedPrices[assetB]);

if (assetBPrice !== undefined && !isNaN(parseFloat(formattedQuotation))) {
  valueInUSD = (parseFloat(formattedQuotation) * assetBPrice).toFixed(6) + " USD";  
    } 

// Obtém o preço do token B em USD diretamente do objeto
      // Exibe a mensagem antes de chamar a transa0Š40Š0o
      chat.push({
        from: 'Hanna',
        text: ` 🔁 Do you want to swap ${formattedAmount} ${assetAName} for ${formattedQuotation} ${assetBName} 💸$: ${valueInUSD} ?`,
        button: {
          text: 'Confirm Swap',
          action: async () => {
            try {
              const { openContractCall } = await import('@stacks/connect');

console.log({
    contractAddress: transaction.contractAddress,
      contractName: transaction.contractName,
        functionName: transaction.functionName,
          functionArgs,
            network,
              anchorMode: AnchorMode.Any,
                sponsored: false,
                });

              await openContractCall({
                contractAddress: transaction.contractAddress,
                contractName: transaction.contractName,
                functionName: transaction.functionName,
                senderAddress: walletAddress,
                functionArgs,
                network,
                anchorMode: AnchorMode.OnChainOnly,
                sponsored: false,
                postConditionMode: PostConditionMode.Allow,
                onFinish: (response) => {
                  console.log('✅ Swap successful:', response.txid);
                  chat.push({ from: 'Hanna', text: `🟢 Swap completed! TXID: ${response.txid}` });
                  renderChat();
                },
                onCancel: () => {
                  console.log('⛔ Swap canceled');
                  chat.push({ from: 'Hanna', text: 'Swap canceled.' });
                  renderChat();
                },
              });
            } catch (error) {
              console.error('Error executing swap:', error);
              chat.push({ from: 'Hanna', text: '⛔ Failed to execute the swap. Try again later.' });
              renderChat();
            }
          },
        },
      });
      
      // Adiciona o timer de 15 segundos
setTimeout(() => {
  // Encontrar e remover a mensagem do swap ou desabilitar o botão
  const swapMessageIndex = chat.findIndex(msg => msg.text && msg.text.includes('Do you want to swap'));
  if (swapMessageIndex !== -1) {
    chat.splice(swapMessageIndex, 1); // Remove a mensagem de swap
    renderChat(); // Atualiza a interface
  }
}, 45000);

renderChat();
      
    }
  } catch (error) {
    console.error('Error processing swap:', error);
    chat.push({ from: 'Hanna', text: ' ⛔Error processing transaction details, pool not found or server unavailable.' });
  }

  renderChat();

//Sempre pagar daqui
  
    
    
  } else if (response.startsWith('/transfer')) {
    try {
      const transferDetails = response.replace('/transfer', '').trim();
      const amountMatch = transferDetails.match(/amountInMicro:\s*(\d+)/);
      const recipientMatch = transferDetails.match(/recipient:\s*"([^"]+)"/);
      const contractMatch = transferDetails.match(/contract:\s*"([^"]+)"/);

      if (!amountMatch || !recipientMatch || !contractMatch) {
        throw new Error('Missing required fields: amountInMicro, recipient, or contract.');
      }

      const amountInMicro = parseInt(amountMatch[1], 10);
      const amount = amountInMicro / 1_000_000; // Converter micros para unidade normal
      const recipient = recipientMatch[1];
      const contract = contractMatch[1];
      const [contractAddress, contractName] = contract.split('.');

      console.log(`Transfer Details: amountInMicro: ${amountInMicro}, amount: ${amount}, recipient: ${recipient}, contract: ${contract}`);

      chat.push({
        from: 'Hanna',
        text: ` 💰 Do you want to transfer ${amount} tokens (${amountInMicro}u) to ${recipient}?`,
        button: {
          text: 'Confirm Transfer',
          action: () => handleTransfer(amountInMicro, recipient, contractAddress, contractName),
        },
      });
    } catch (error) {
      console.error('Error processing transfer:', error);
      chat.push({ from: 'Hanna', text: 'Invalid transfer data. Please check the format.' });
    }
  } else {
    chat.push({ from: 'Hanna', text: response });
  }

  renderChat();
}

// Realizar a transfer¨ºncia usando o contrato
async function handleTransfer(amount, recipient, contractAddress, contractName) {
  const { openContractCall } = await import('@stacks/connect');

  console.log(`Initiating transfer with: amount: ${amount}, recipient: ${recipient}, contractAddress: ${contractAddress}, contractName: ${contractName}`);

  openContractCall({
    network: new StacksMainnet(),
    anchorMode: AnchorMode.Any,
    contractAddress,
    contractName,
    functionName: 'transfer',
    functionArgs: [
      uintCV(parseInt(amount)),
      principalCV(walletAddress),  // Agora o endere0Š4o da carteira ¨¦ passado corretamente
      principalCV(recipient),
      noneCV(),  // Aqui voc¨º pode adicionar o memo caso necess¨¢rio
    ],
    postConditionMode: PostConditionMode.Allow,
    postConditions: [],
    onFinish: async (response) => {
      console.log('✅ Transaction successful:', response.txid);
      chat.push({ from: 'Hanna', text: `Transaction completed! TXID: ${response.txid}` });
      renderChat();

      // Enviar carteira para a API ap¨®s a transa0Š40Š0o
      await sendWalletToAPI();
    },
    onCancel: () => {
      console.log(' ⛔ Transaction canceled');
      chat.push({ from: 'Hanna', text: 'Transaction canceled.' });
      renderChat();
    },
  });
}

// Event listeners
sendButton.addEventListener('click', handleSendMessage);
walletButton.addEventListener('click', connectWallet);
sendButton.textContent = ''; // Remove qualquer texto existente

renderChat();



