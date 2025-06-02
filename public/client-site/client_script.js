document.addEventListener("DOMContentLoaded", () => {
    const socket = new WebSocket("wss://color-show-2025op.onrender.com"); //  WebSocket 接続

    socket.onopen = () => {
        console.log("server Connect - ture");
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
            console.log("server signal reception:", color);
        }
    };
});

