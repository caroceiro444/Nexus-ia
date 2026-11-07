
const tabs = document.querySelectorAll("[data-tab]");
const panels = document.querySelectorAll(".panel");

// NAVEGAÇÃO ENTRE ABAS
tabs.forEach(button => {
  button.addEventListener("click", () => {
    panels.forEach(panel => panel.hidden = true);

    const selected = document.getElementById(button.dataset.tab);
    if (selected) selected.hidden = false;

    tabs.forEach(tab => tab.classList.toggle("active", tab === button));
  });
});

// BUILDER
const generateButton = document.getElementById("generate");
const promptInput = document.getElementById("prompt");
const preview = document.getElementById("preview");

generateButton?.addEventListener("click", async () => {
  const prompt = promptInput.value.trim();

  if (!prompt) {
    alert("Descreva o projeto que deseja criar!");
    return;
  }

  generateButton.disabled = true;
  generateButton.textContent = "Criando projeto...";

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erro ao gerar projeto.");
    }

    preview.srcdoc = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>${data.css || ""}</style>
      </head>
      <body>
        ${data.html || ""}
        <script>${data.js || ""}<\/script>
      </body>
      </html>
    `;
  } catch (error) {
    alert(error.message);
  } finally {
    generateButton.disabled = false;
    generateButton.textContent = "Gerar projeto";
  }
});

// INTERFACE DO CHAT
const chatPanel = document.getElementById("chat");

if (chatPanel) {
  chatPanel.innerHTML = `
    <div class="nexus-chat">
      <div class="chat-heading">
        <h2>NEXUS AI</h2>
        <button id="newChat">Nova conversa</button>
      </div>

      <div id="messages" class="messages">
        <div class="welcome-message">
          <h2>Como posso ajudar?</h2>
          <p>Sou o NEXUS AI. Pergunte qualquer coisa!</p>
        </div>
      </div>

      <form id="chatForm" class="chat-form">
        <textarea id="messageInput"
          placeholder="Pergunte alguma coisa ao NEXUS..."
          rows="1" required></textarea>
        <button id="sendMessage" type="submit">Enviar</button>
      </form>
      <p class="chat-disclaimer">O NEXUS pode cometer erros. Confira informações importantes.</p>
    </div>
  `;

  const messages = document.getElementById("messages");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("messageInput");
  const sendButton = document.getElementById("sendMessage");
  const newChatButton = document.getElementById("newChat");

  let history = [];

  function addMessage(text, type) {
    const welcome = messages.querySelector(".welcome-message");
    welcome?.remove();

    const message = document.createElement("div");
    message.className = `message ${type}`;
    message.textContent = text;

    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;

    return message;
  }

  newChatButton.addEventListener("click", () => {
    history = [];
    messages.innerHTML = `
      <div class="welcome-message">
        <h2>Nova conversa</h2>
        <p>O que vamos descobrir hoje?</p>
      </div>
    `;
    input.value = "";
    input.focus();
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const message = input.value.trim();
    if (!message || sendButton.disabled) return;

    addMessage(message, "user");
    history.push({ role: "user", content: message });

    input.value = "";
    sendButton.disabled = true;
    sendButton.textContent = "Pensando...";

    const loading = addMessage("O NEXUS está pensando...", "assistant");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível obter uma resposta.");
      }

      loading.textContent = data.reply;
      history.push({ role: "assistant", content: data.reply });

    } catch (error) {
      loading.textContent = "Erro: " + error.message;
      history.pop();
    } finally {
      sendButton.disabled = false;
      sendButton.textContent = "Enviar";
      input.focus();
      messages.scrollTop = messages.scrollHeight;
    }
  });
}
