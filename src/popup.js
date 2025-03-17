
// apenas pop up para criaçao do agente bluesck nao e nescesario caso nao queira


import { openContractCall } from "@stacks/connect";
import { StacksMainnet } from "@stacks/network";
import { uintCV, principalCV, noneCV, AnchorMode, PostConditionMode } from "@stacks/transactions";

export function createMap(walletAddress) {
  if (!walletAddress) {
    console.error("Wallet not defined.");
    return;
  }

  const floatingButton = document.createElement("div");
  floatingButton.classList.add("floating-image");
  floatingButton.addEventListener("click", toggleMap);
  document.body.appendChild(floatingButton);

  const cosmicMap = document.createElement("div");
  cosmicMap.classList.add("cosmic-map");
  document.body.appendChild(cosmicMap);

  let agents = [];

  fetch(`https://hannalabs.xyz/api/retorno.php?wallet_address=${walletAddress}`)
    .then(response => response.json())
    .then(data => {
      if (Array.isArray(data) && data.length > 0) {
        agents = data.map(agent => ({
          id: agent.id,
          name: agent.name,
          image: agent.image
        }));
      }
      renderMap();
    })
    .catch(error => console.error("Error fetching agents:", error));

  function renderMap() {
    cosmicMap.innerHTML = "";

    const createAgentButton = document.createElement("div");
    createAgentButton.classList.add("agent-bubble", "create-agent");
    createAgentButton.style.backgroundImage = "url('https://hannalabs.xyz/uploads/mais.png')";

    createAgentButton.onclick = function () {
      openPopup("create");
    };

    cosmicMap.appendChild(createAgentButton);

    if (agents.length > 0) {
      const editAgentButton = document.createElement("div");
      editAgentButton.classList.add("agent-bubble", "edit-agent");
      editAgentButton.style.backgroundImage = "url('https://hannalabs.xyz/uploads/robo.png')";

      editAgentButton.onclick = function () {
        openPopup("edit", agents);
      };

      cosmicMap.appendChild(editAgentButton);
    }

    positionBubbles();
  }

  function positionBubbles() {
    const floatingButton = document.querySelector(".floating-image");
    const createAgentButton = document.querySelector(".create-agent");
    const editAgentButton = document.querySelector(".edit-agent");

    if (floatingButton && createAgentButton && editAgentButton) {
      createAgentButton.style.position = "absolute";
      createAgentButton.style.top = "50%";
      createAgentButton.style.left = "calc(100% + 1px)"; // Posiciona à direita do Hanna5

      editAgentButton.style.position = "absolute";
      editAgentButton.style.top = "50%";
      editAgentButton.style.left = "calc(100% + 50px)"; // Mais à direita ainda
    }
  }

  function toggleMap() {
    cosmicMap.classList.toggle("visible");
  }

  function openPopup(type, agentsList = []) {
    let existingPopup = document.querySelector(".popup");
    if (existingPopup) existingPopup.remove();

    const popup = document.createElement("div");
    popup.classList.add("popup");
    popup.style.display = "block";

    if (type === "create") {
      popup.innerHTML = `
        <div class="popup-header">Create Agent <span class="popup-close">&times;</span></div>
        <input type="text" placeholder="Agent Name" id="agentName">
        <input type="file" id="agentImage">
        <button class="popup-button">Create ($0.50)</button>
      `;

      popup.querySelector(".popup-button").addEventListener("click", async () => {
        const agentName = document.getElementById("agentName").value.trim();
        const agentImage = document.getElementById("agentImage").files[0];

        if (!agentName || !agentImage) {
          alert("Fill in all required fields!");
          return;
        }

        try {
          const transferResponse = await fetch("");
          const transferData = await transferResponse.json();

          if (!transferData.contractAddress || !transferData.amount || !transferData.recipient || !transferData.contractName) {
            throw new Error("Invalid transfer API data.");
          }

          const { contractAddress, contractName, amount, recipient } = transferData;

          console.log(`Starting transfer: ${amount} STX to ${recipient}`);

          openContractCall({
            network: new StacksMainnet(),
            anchorMode: AnchorMode.Any,
            contractAddress,
            contractName,
            functionName: "transfer",
            functionArgs: [
              uintCV(parseInt(amount)),
              principalCV(walletAddress),
              principalCV(recipient),
              noneCV(),
            ],
            postConditionMode: PostConditionMode.Allow,
            postConditions: [],
            onFinish: async (response) => {
              console.log("✅ Transaction successfully sent:", response.txId);
              alert(`Payment sent! TXID: ${response.txId}`);

              const formData = new FormData();
              formData.append("name", agentName);
              formData.append("wallet_address", walletAddress);
              formData.append("agentImage", agentImage);

              const apiResponse = await fetch(" url processa a transferencia ", {
                method: "POST",
                body: formData,
              });

              const data = await apiResponse.json();
              if (data.status === "success") {
                alert("Agent successfully created!");
                popup.remove();
              } else {
                alert("Error creating agent: " + data.message);
              }
            },
            onCancel: () => {
              alert("Transaction canceled by the user.");
            },
          });

        } catch (error) {
          console.error("Error processing transfer:", error);
          alert("Error processing payment.");
        }
      });

    } else if (type === "edit") {
      let agentOptions = agentsList.map(agent => `<option value="${agent.id}">${agent.name}</option>`).join("");

      popup.innerHTML = `
        <div class="popup-header">Configure Agent <span class="popup-close">&times;</span></div>
        <select id="agentSelector">${agentOptions}</select>
        <input type="text" id="telegramPrompt" placeholder="Telegram Prompt">
        <input type="text" id="telegramKey" placeholder="Telegram Key">
        <input type="text" id="blueskyPrompt" placeholder="Bluesky Prompt">
        <input type="text" id="blueskyName" placeholder="Bluesky Name">
        <input type="password" id="blueskyPassword" placeholder="Bluesky Password">
        <button class="popup-button">Save</button>
      `;

      popup.querySelector(".popup-button").addEventListener("click", () => {
        const formData = new FormData();
        formData.append("id", document.getElementById("agentSelector").value);
        formData.append("telegramPrompt", document.getElementById("telegramPrompt").value);
        formData.append("telegramKey", document.getElementById("telegramKey").value);
        formData.append("blueskyPrompt", document.getElementById("blueskyPrompt").value);
        formData.append("blueskyName", document.getElementById("blueskyName").value);
        formData.append("blueskyPassword", document.getElementById("blueskyPassword").value);

        fetch("https://hannalabs.xyz/api/atuagente.php", { method: "POST", body: formData })
          .then(response => response.json())
          .then(() => popup.remove())
          .catch(error => console.error("Error updating agent:", error));
      });
    }

    popup.querySelector(".popup-close").addEventListener("click", () => popup.remove());
    document.body.appendChild(popup);
  }
}
