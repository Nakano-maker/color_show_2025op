document.addEventListener("DOMContentLoaded", () => {
    const socket = new WebSocket("ws://localhost:3000"); // ✅ WebSocket 接続

    socket.onopen = () => {
        console.log("✅ WebSocket 接続確立");
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.pgmColor) {
            let color = data.pgmColor;

            // ✅ `rgba(0,0,0,0)` の場合、強制的に黒 (`rgb(0,0,0)`) に変更
            if (color === "rgba(0,0,0,0)") {
                color = "rgb(0,0,0)";
            }

            // ✅ `backgroundColor` ではなく `background` を適用
            document.body.style.background = color;
            console.log("🎨 背景色更新:", color);
        }
    };
});

