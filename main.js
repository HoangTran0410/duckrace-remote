(async () => {
  let peer;
  let connection;

  const connectBtn = document.getElementById("connect-btn");
  const sendBtn = document.getElementById("send-btn");
  const peerIdInput = document.getElementById("peer-id-input");
  const messageInput = document.getElementById("message-input");
  const statusDiv = document.getElementById("status");
  const messagesContainer = document.getElementById("messages-container");

  // Initialize peer
  updateStatus("loading-server");
  addMessage("Đang kết nối tới server PeerJS...");

  const res = await fetch(
    "https://fbaio.metered.live/api/v1/turn/credentials?apiKey=2c2bfedb45faccd1bb6cdc04ca2bbe18e66e"
  );
  const iceServers = await res.json();

  console.log(iceServers);

  peer = new Peer({
    // host: "api.fbaio.xyz",
    // port: 443,
    // path: "/peerjs",
    // secure: true,
    // debug: 3,
    // config: {
    //   iceServers: [
    //     { urls: "stun:stun.l.google.com:19302" }, // STUN fallback
    //     {
    //       urls: "turn:10.104.0.2:3478",
    //       username: "peerjsuser",
    //       credential: "peerjspass",
    //     },
    //   ],
    // },
    config: {
      iceServers: iceServers,
    },
  });

  peer.on("open", (id) => {
    console.log("Web client peer ID:", id);
    addMessage("Server peerjs đã sẵn sàng với ID: " + id);
    updateStatus("idle");
  });

  peer.on("error", (err) => {
    console.error("Peer error:", err);
    addMessage("Error: " + err.message);
    updateStatus(false);
  });

  connectBtn.addEventListener("click", () => {
    const targetPeerId = peerIdInput.value.trim();
    if (!targetPeerId) {
      alert("Vui lòng nhập tên client để kết nối");
      return;
    }

    connectToPeer("fbaio-duckrace-remote-extension" + targetPeerId);
  });

  sendBtn.addEventListener("click", () => {
    const message = messageInput.value.trim();

    if (connection && connection.open) {
      connection.send(message);
      addMessage("Sent: " + message);
      messageInput.value = "";
    } else {
      alert("Not connected to popup");
    }
  });

  function connectToPeer(targetPeerId) {
    updateStatus("loading-peer");
    addMessage("Đang kết nối tới client: " + targetPeerId + "...");

    connection = peer.connect(targetPeerId);

    connection.on("open", () => {
      addMessage("Đã kết nối tới duckrace!");
      updateStatus(true);
    });

    connection.on("data", (data) => {
      addMessage("Received: " + data);
    });

    connection.on("close", () => {
      addMessage("Kết nối bị đóng");
      updateStatus(false);
    });

    connection.on("error", (err) => {
      console.error("Connection error:", err);
      addMessage("Lỗi kết nối: " + err.message);
      updateStatus(false);
    });
  }

  function updateStatus(state) {
    if (state === "loading-server") {
      statusDiv.innerHTML =
        '<span class="spinner"></span>Trạng thái: Đang kết nối tới server...';
      statusDiv.className = "status loading";
      sendBtn.disabled = true;
      connectBtn.disabled = true;
    } else if (state === "loading-peer") {
      statusDiv.innerHTML =
        '<span class="spinner"></span>Trạng thái: Đang kết nối tới client...';
      statusDiv.className = "status loading";
      sendBtn.disabled = true;
      connectBtn.disabled = true;
    } else if (state === "idle") {
      statusDiv.textContent =
        "Trạng thái: Server sẵn sàng - Chưa kết nối client";
      statusDiv.className = "status disconnected";
      sendBtn.disabled = true;
      connectBtn.disabled = false;
    } else if (state === true) {
      statusDiv.textContent = "Trạng thái: Đã kết nối";
      statusDiv.className = "status connected";
      sendBtn.disabled = false;
      connectBtn.disabled = false;
    } else {
      statusDiv.textContent = "Trạng thái: Chưa kết nối";
      statusDiv.className = "status disconnected";
      sendBtn.disabled = true;
      connectBtn.disabled = false;
    }
  }

  function addMessage(message) {
    const messageDiv = document.createElement("div");
    messageDiv.textContent = new Date().toLocaleTimeString() + " - " + message;
    messagesContainer.prepend(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Allow Enter key to send messages
  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendBtn.click();
    }
  });
})();
