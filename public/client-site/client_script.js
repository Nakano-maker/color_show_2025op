document.addEventListener("DOMContentLoaded", () => {
    const socket = new WebSocket("wss://color-show-2025op.onrender.com"); // WebSocket 接続

    socket.onopen = () => {
        console.log("Server Connected");
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.pgmColor) {
            let color = data.pgmColor;

            // `rgba(0,0,0,0)` の場合、強制的に黒 (`rgb(0,0,0)`) に変更
            if (color === "rgba(0,0,0,0)") {
                color = "rgb(0,0,0)";
            }

            // 背景色変更を `requestAnimationFrame` で最適化
            requestAnimationFrame(() => {
                document.body.style.background = color;
                console.log("Color updated:", color);
            });
        }
    };

    // サーバーとの接続が切れた場合の再接続
    socket.onclose = () => {
        console.warn("🔄 WebSocket disconnected, retrying...");
        setTimeout(() => {
            location.reload();
        }, 3000);
    };
});

function enterFullscreen() {
    const elem = document.documentElement;

    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {  
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {  
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {  
        elem.msRequestFullscreen();
    }

    //  フルスクリーン切り替え時にメッセージを削除
    const fullscreenMessage = document.getElementById("fullscreen-message");
    if (fullscreenMessage) {
        fullscreenMessage.style.display = "none";
    }

    // ツールバーを非表示にするスクロール処理
    setTimeout(() => {
        window.scrollTo(0, 1);
    }, 100);
}

//  タップ時にフルスクリーン＆ツールバーを非表示
document.addEventListener("click", enterFullscreen);
document.addEventListener("touchend", enterFullscreen);
