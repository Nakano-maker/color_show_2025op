const express = require("express");
const path = require("path");
const WebSocket = require("ws");

const app = express();
const PORT = 3000;

// CORSの設定（必要なら）
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

// 静的ファイルの提供（MIMEタイプの適正化）
app.use("/host", express.static(path.join(__dirname, "public/host-site"), {
    setHeaders: (res, path) => {
        if (path.endsWith(".css")) res.setHeader("Content-Type", "text/css");
        if (path.endsWith(".js")) res.setHeader("Content-Type", "application/javascript");
    }
}));

app.use("/client", express.static(path.join(__dirname, "public/client-site"), {
    setHeaders: (res, path) => {
        if (path.endsWith(".css")) res.setHeader("Content-Type", "text/css");
        if (path.endsWith(".js")) res.setHeader("Content-Type", "application/javascript");
    }
}));

// WebSocketの設定（Expressと統合）
const server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

const wss = new WebSocket.Server({ server });

let pgmColor = "rgb(0,0,0)"; // 初期値（黒）

// HTMLファイルを提供
app.get("/host", (req, res) => {
    res.sendFile(path.join(__dirname, "public/host-site/host_index.html"));
});

app.get("/client", (req, res) => {
    res.sendFile(path.join(__dirname, "public/client-site/client_index.html"));
});


// エラーハンドリング（ファイルが見つからない場合）
app.use((req, res) => {
    res.status(404).send("404 - Not Found");
});

wss.on("connection", (ws) => {
    console.log(">>> Client Connected");
    ws.send(JSON.stringify({ pgmColor }));

    ws.on("message", (message) => {
        const data = JSON.parse(message);
        if (data.pgmColor !== undefined) {
            pgmColor = data.pgmColor;
        }
    });

    ws.on("close", () => {
        console.log("<<< Client Disconnected");
    });
});

// 200msごとに全クライアントへ `pgmColor` を送信
setInterval(() => {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ pgmColor }));
            console.log("PGMcolor sent:", pgmColor);
        }
    });
}, 200);

// 別のAPI用サーバー（ポート4000）
const apiServer = express();
apiServer.get("/status", (req, res) => {
    res.json({ message: "API Server is running", pgmColor });
});

apiServer.listen(4000, () => {
    console.log("API Server running at http://localhost:4000");
});