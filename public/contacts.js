// DOM Elements
const tabContacts = document.getElementById("tab-contacts");
const tabRequests = document.getElementById("tab-requests");
const contactsListContainer = document.getElementById("contacts-list");
const requestsListContainer = document.getElementById("requests-list");
const requestsBadge = document.getElementById("requests-badge");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search_contact");
const searchResultContainer = document.getElementById("search-result");

// Active tab state
let activeTab = "contacts";

// Tab toggles
tabContacts.addEventListener("click", () => {
    tabContacts.classList.add("active");
    tabRequests.classList.remove("active");
    contactsListContainer.style.display = "block";
    requestsListContainer.style.display = "none";
    activeTab = "contacts";
});

tabRequests.addEventListener("click", () => {
    tabRequests.classList.add("active");
    tabContacts.classList.remove("active");
    contactsListContainer.style.display = "none";
    requestsListContainer.style.display = "block";
    activeTab = "requests";
});

// Fetch and render accepted contacts
const loadContacts = async () => {
    try {
        const response = await fetch("/api/contacts/get-contacts");
        if (!response.ok) throw new Error("Failed to fetch contacts");
        const contacts = await response.json();
        
        contactsListContainer.innerHTML = "";
        
        if (contacts.length === 0) {
            contactsListContainer.innerHTML = `<div class="list-placeholder">No contacts found</div>`;
            return;
        }

        contacts.forEach((contact, idx) => {
            contactsListContainer.innerHTML += `
                <div class="friend" data-email="${contact.email}" data-username="${contact.username}">
                    <div class="avatar-wrapper">
                        <img src="https://i.pravatar.cc/100?img=${(idx % 70) + 1}" class="avatar">
                        <span class="online"></span>
                    </div>
                    <div class="friend-info">
                        <div class="friend-name">${contact.username}</div>
                        <div class="friend-email">${contact.email}</div>
                    </div>
                </div>
            `;
        });

        // Re-bind click event listeners on newly loaded friend elements for chat functionality
        if (window.initializeChatListeners) {
            window.initializeChatListeners();
        }

    } catch (error) {
        console.error("Error loading contacts:", error);
    }
};

// Fetch and render pending requests
const loadPendingRequests = async () => {
    try {
        const response = await fetch("/api/contacts/pending-requests");
        if (!response.ok) throw new Error("Failed to fetch pending requests");
        const requests = await response.json();
        
        requestsListContainer.innerHTML = "";
        
        // Update requests tab badge
        if (requests.length > 0) {
            requestsBadge.textContent = requests.length;
            requestsBadge.style.display = "inline-block";
        } else {
            requestsBadge.style.display = "none";
        }

        if (requests.length === 0) {
            requestsListContainer.innerHTML = `<div class="list-placeholder">No pending requests</div>`;
            return;
        }

        requests.forEach((reqItem) => {
            requestsListContainer.innerHTML += `
                <div class="request-item">
                    <div class="request-info">
                        <div class="request-name">${reqItem.senderUser.username}</div>
                        <div class="request-email">${reqItem.senderUser.email}</div>
                    </div>
                    <div class="request-actions">
                        <button class="accept-btn" onclick="handleAcceptRequest('${reqItem._id}')">Accept</button>
                        <button class="reject-btn" onclick="handleRejectRequest('${reqItem._id}')">Reject</button>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error loading pending requests:", error);
    }
};

// Handle Accept Contact Request
window.handleAcceptRequest = async (requestId) => {
    try {
        const response = await fetch("/api/contacts/accept-request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ requestId })
        });
        if (!response.ok) throw new Error("Failed to accept request");
        
        // Reload contacts and requests lists
        await loadContacts();
        await loadPendingRequests();
        searchResultContainer.style.display = "none";
        searchInput.value = "";
    } catch (error) {
        alert(error.message);
    }
};

// Handle Reject/Cancel Contact Request
window.handleRejectRequest = async (requestId) => {
    try {
        const response = await fetch("/api/contacts/reject-request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ requestId })
        });
        if (!response.ok) throw new Error("Failed to reject request");
        
        await loadContacts();
        await loadPendingRequests();
        searchResultContainer.style.display = "none";
        searchInput.value = "";
    } catch (error) {
        alert(error.message);
    }
};

// Handle Send Contact Request (Add Contact)
window.handleSendRequest = async (email) => {
    try {
        const response = await fetch("/api/contacts/send-request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || "Failed to send request");
        }
        
        alert("Contact request sent successfully!");
        searchResultContainer.style.display = "none";
        searchInput.value = "";
        await loadPendingRequests();
    } catch (error) {
        alert(error.message);
    }
};

// Handle Search User Form Submit
searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) {
        searchResultContainer.style.display = "none";
        return;
    }

    try {
        const response = await fetch("/api/contacts/search-contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ search_contact: query })
        });
        
        if (!response.ok) {
            searchResultContainer.innerHTML = `<div class="search-result-box" style="color:var(--danger); font-size:12px;">User not found</div>`;
            searchResultContainer.style.display = "block";
            return;
        }

        const data = await response.json();
        const { user, relationship, contactId } = data;
        
        let actionButtonHTML = "";
        if (relationship === "none") {
            actionButtonHTML = `<button class="search-result-btn" onclick="handleSendRequest('${user.email}')">Add Contact</button>`;
        } else if (relationship === "pending_sent") {
            actionButtonHTML = `<span style="font-size:12px; color:var(--muted); font-weight:500;">Request Pending</span>`;
        } else if (relationship === "pending_received") {
            actionButtonHTML = `
                <div style="display:flex; gap:6px;">
                    <button class="accept-btn" onclick="handleAcceptRequest('${contactId}')">Accept</button>
                    <button class="reject-btn" onclick="handleRejectRequest('${contactId}')">Reject</button>
                </div>
            `;
        } else if (relationship === "accepted") {
            actionButtonHTML = `<span style="font-size:12px; color:var(--success); font-weight:500;">Already Contacts</span>`;
        }

        searchResultContainer.innerHTML = `
            <div class="search-result-box">
                <div class="search-result-user">
                    <div class="search-result-info">
                        <div class="search-result-name">${user.username}</div>
                        <div class="search-result-email">${user.email}</div>
                    </div>
                    <div>
                        ${actionButtonHTML}
                    </div>
                </div>
            </div>
        `;
        searchResultContainer.style.display = "block";

    } catch (error) {
        console.error("Error searching user:", error);
    }
});

// Load everything on startup
const init = async () => {
    await loadContacts();
    await loadPendingRequests();
    // Poll requests and contacts updates periodically
    setInterval(loadPendingRequests, 10000);
};

init();