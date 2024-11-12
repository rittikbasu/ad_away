document.addEventListener("DOMContentLoaded", () => {
  const apiKeyInput = document.getElementById("apiKey");
  const saveButton = document.getElementById("saveButton");
  const statusDiv = document.getElementById("status");

  // Add enter key listener
  apiKeyInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      saveButton.click();
    }
  });

  // Load existing API key
  chrome.storage.sync.get("apiKey", (data) => {
    if (data.apiKey) {
      apiKeyInput.value = data.apiKey;
    }
  });

  function showStatus(message, isError = false) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${isError ? "error" : "success"}`;
    setTimeout(() => {
      statusDiv.textContent = "";
      statusDiv.className = "status";
    }, 3000);
  }

  async function validateApiKey(apiKey) {
    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [{ role: "user", content: 'Say "valid"' }],
            max_tokens: 10,
          }),
        }
      );

      if (!response.ok) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  saveButton.addEventListener("click", async () => {
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
      showStatus("Please enter an API key", true);
      return;
    }

    if (!apiKey.startsWith("sk-")) {
      showStatus("Invalid API key format", true);
      return;
    }

    // Show loading state
    saveButton.disabled = true;
    saveButton.textContent = "Validating...";

    const isValid = await validateApiKey(apiKey);

    if (!isValid) {
      showStatus("Invalid API key. Please check and try again.", true);
      saveButton.disabled = false;
      saveButton.textContent = "Save API Key";
      return;
    }

    chrome.storage.sync.set({ apiKey }, () => {
      showStatus("API key saved successfully!");
      saveButton.disabled = false;
      saveButton.textContent = "Save API Key";

      // Close the popup after a short delay
      setTimeout(() => {
        window.close();
      }, 1500);
    });
  });
});
