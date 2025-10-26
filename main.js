(async () => {
  const sendBtn = document.getElementById("send-btn");
  const messageInput = document.getElementById("message-input");
  const logsContainer = document.getElementById("logs");
  const targetInput = document.getElementById("target-id-input");

  const server = "https://api.fbaio.xyz";

  sendBtn.addEventListener("click", async () => {
    const targetId = targetInput.value.trim();
    if (!targetId) return alert("Chưa nhập tên client để kết nối");

    const message = messageInput.value.trim();
    if (!message) return alert("Chưa nhập kết quả");

    addMessage("Đang gửi kết quả tới client: " + targetId);

    try {
      const res = await fetch(server + "/call", {
        method: "POST",
        body: JSON.stringify({
          id: "fbaio-duckrace-remote" + targetId,
          apiname: "fbaio-duckrace-remote",
          apiparams: message,
        }),
      });
      const data = await res.json();
      console.log(data);
      addMessage("Response: " + JSON.stringify(data));
    } catch (error) {
      addMessage("Error: " + error.message);
    }
  });

  function addMessage(message) {
    const messageDiv = document.createElement("div");
    messageDiv.textContent = new Date().toLocaleTimeString() + " - " + message;
    logsContainer.prepend(messageDiv);
    logsContainer.scrollTop = logsContainer.scrollHeight;
  }

  // Allow Enter key to send messages
  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendBtn.click();
    }
  });
})();
