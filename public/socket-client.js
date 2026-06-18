let currentUserEmail = null;
let activeChatUserEmail = null;
let activeChatUsername = null;

// DOM elements
const messagesEl = document.getElementById("messages");
const formEl = document.getElementById("chat-form");
const inputEl = document.getElementById("message-input");
const sendBtn = document.getElementById("send-button");
const chatHeader = document.getElementById("chat-header");
const chatPlaceholder = document.getElementById("chat-placeholder");
const chatUsernameEl = document.getElementById("chat-username");
const chatAvatarEl = document.getElementById("chat-avatar");

window.onload = async () => { 
  const response = await fetch("/api/auth/session");
  const data = await response.json();

  if (!data.success) {
    window.location.href = "/";
  } else {
    currentUserEmail = data.user.email;
    console.log("Logged in user:", currentUserEmail);
  }
};

const socket = io();

// Format message timestamp
function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Append a message bubble to messages window
function appendMessageBubble(senderEmail, text, createdAt) {
  const isSent = senderEmail === currentUserEmail;
  
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${isSent ? 'sent' : 'received'}`;
  
  msgDiv.innerHTML = `
    ${text}
    <span class="time">${formatTime(createdAt)}</span>
  `;
  
  messagesEl.appendChild(msgDiv);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// Load message history from DB
async function loadMessageHistory(email) {
  try {
    const response = await fetch(`/api/messages/history?email=${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error("Failed to load history");
    const messages = await response.json();
    
    messagesEl.innerHTML = "";
    messages.forEach((msg) => {
      appendMessageBubble(msg.senderEmail, msg.content, msg.createdAt);
    });
  } catch (error) {
    console.error("Error loading chat history:", error);
  }
}

// Initialize click listeners for contacts sidebar
window.initializeChatListeners = () => {
  const friends = document.querySelectorAll(".friend");
  
  friends.forEach((friend, idx) => {
    if (friend.getAttribute("data-listener-bound") === "true") return;
    friend.setAttribute("data-listener-bound", "true");
    
    friend.addEventListener("click", () => {
      friends.forEach((f) => f.classList.remove("active"));
      friend.classList.add("active");
      
      activeChatUserEmail = friend.getAttribute("data-email");
      activeChatUsername = friend.getAttribute("data-username");
      
      chatUsernameEl.textContent = activeChatUsername;
      chatAvatarEl.src = `https://i.pravatar.cc/100?img=${(idx % 70) + 1}`;
      
      chatHeader.style.display = "flex";
      messagesEl.style.display = "flex";
      chatPlaceholder.style.display = "none";
      
      inputEl.disabled = false;
      inputEl.placeholder = "Type your message...";
      sendBtn.disabled = false;
      
      loadMessageHistory(activeChatUserEmail);
    });
  });
};

socket.on("connect", () => {
  console.log("Socket connected as", socket.id);
});

socket.on("disconnect", () => {
  console.log("Socket disconnected");
});

// Receive incoming private message
socket.on("private message", (data) => {
  const { senderEmail, receiverEmail, content, createdAt } = data;
  
  if (
    (senderEmail === activeChatUserEmail && receiverEmail === currentUserEmail) ||
    (senderEmail === currentUserEmail && receiverEmail === activeChatUserEmail)
  ) {
    appendMessageBubble(senderEmail, content, createdAt);
  }
});

socket.on("error", (err) => {
  alert(err.message || "An error occurred");
});

// Submit/Send message form
formEl.addEventListener("submit", (event) => {
  event.preventDefault();

  const message = inputEl.value.trim();
  if (!message || !activeChatUserEmail) {
    return;
  }

  socket.emit("private message", { 
    to: activeChatUserEmail, 
    text: message 
  });
  
  inputEl.value = "";
  inputEl.focus();
});
