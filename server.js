const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 3000 });

let pgmColor = "rgb(0,0,0)"; //  初期値（黒）

wss.on("connection", (ws) => {
        console.log(">>>client Connected");

        //  初回データ送信
        ws.send(JSON.stringify({ pgmColor }));

        ws.on("message", (message) => {
                const data = JSON.parse(message);

                if (data.pgmColor !== undefined) {
                        pgmColor = data.pgmColor; // ✅ PGM の背景色を更新
                        
                }
        });

        ws.on("close", () => {
                console.log("<<<client disConnected");
        });
});

//  0.2ms ごとに全クライアントへ `pgmColor` を送信
// ✅ 0.2ms ごとに全クライアントへ `pgmColor` を送信
setInterval(() => {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ pgmColor }));
            console.log("PGMcolor 0.2ms:", pgmColor);
        }
    });
}, 0.3); // ✅ 修正: 閉じ括弧を適切に配置


console.log("Server starts running on port 3000");