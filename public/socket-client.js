window.onload = async () => { 
  const response = await fetch("/api/auth/session");
  const data = await response.json();

  if (!data.success) {
    window.location.href = "/";
  }


}
const socket = io();

const messagesEl = document.getElementById("messages");
const formEl = document.getElementById("chat-form");
const inputEl = document.getElementById("message-input");

function addMessage(text) {
  const item = document.createElement("li");
  item.textContent = text;
  messagesEl.appendChild(item);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

socket.on("connect", () => {
  // statusEl.textContent = `Connected as ${socket.id}`;
});

socket.on("disconnect", () => {
  // statusEl.textContent = "Disconnected";
});

socket.on("chat message", (data) => {
  addMessage(data.text ?? String(data));
});

formEl.addEventListener("submit", (event) => {
  event.preventDefault();

  const message = inputEl.value.trim();
  if (!message) {
    return;
  }


  socket.emit("chat message", { text: message });
  inputEl.value = "";
  inputEl.focus();
});

