

const loginFormEl = document.getElementById("login-form");

loginFormEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Login failed");
    }

    const data = await response.json();
    alert(data.message || "Login successful");
    window.location.href = "/chat-room.html";
  } catch (error) {
    console.error("Error during login:", error);
    alert(error.message || "An error occurred during login.");
  }
});


const tabs = document.querySelectorAll(".tab");
const screens = document.querySelectorAll(".screen");
const triggers = document.querySelectorAll("[data-target]");

console.log("Auth JS initialized. Found triggers:", triggers.length);

triggers.forEach((trigger) => {
  trigger.addEventListener("click", (e) => {
    const target = trigger.getAttribute("data-target");
    console.log("Trigger clicked:", trigger.textContent.trim(), "Target:", target);
    
    // Remove active from all tabs and screens
    tabs.forEach((t) => t.classList.remove("active"));
    screens.forEach((s) => s.classList.remove("active"));
    
    // Add active to matching screen
    let foundScreen = false;
    screens.forEach((s) => {
      if (s.getAttribute("data-screen") === target) {
        s.classList.add("active");
        foundScreen = true;
      }
    });
    
    // Add active to matching tab (if it is one of the main tabs)
    tabs.forEach((t) => {
      if (t.getAttribute("data-target") === target) {
        t.classList.add("active");
      }
    });
    console.log("Active screen updated. Screen found:", foundScreen);
  });
});


const signupFormEl = document.getElementById("signup-form");
signupFormEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = document.getElementById("signup-username").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value.trim();

  if (!username || !email || !password) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Registration failed");
    }

    const data = await response.json();
    alert(data.message || "Registration successful. Please check your email for the OTP.");
    tabs.forEach((t) => t.classList.remove("active"));
    screens.forEach((s) => s.classList.remove("active"));
    const verifyTab = document.querySelector(".tab[data-target='verify']");
    const verifyScreen = document.querySelector(".screen[data-screen='verify']");
    verifyScreen.classList.add("active");

  } catch (error) {
    console.error("Error during registration:", error);
    alert(error.message || "An error occurred during registration.");
  }
});


const verifyFormEl = document.getElementById("otp-form");

verifyFormEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  const otp = document.getElementById("otp-code").value.trim();

  if (!otp) {
    alert("Please enter the OTP.");
    return;
  }

  try {
    const response = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ otp }),
    }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "OTP verification failed");
    }

    const data = await response.json();

    alert(data.message || "OTP verification successful. You can now log in.");

  } catch (error) {
    console.error("Error during OTP verification:", error);

    alert(error.message || "An error occurred during OTP verification.");
  } finally {
    // Clear the OTP input field after submission
    document.getElementById("otp-code").value = "";
    window.location.href = "/chat-room.html";
  }

});