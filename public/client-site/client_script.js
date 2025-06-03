document.addEventListener("DOMContentLoaded", () => {
    const socket = new WebSocket("wss://color-show-2025op.onrender.com"); // WebSocket 接続

    socket.onopen = () => {
        console.log("server Connect - true");
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.pgmColor) {
            let color = data.pgmColor;

            //  `rgba(0,0,0,0)` の場合、強制的に黒 (`rgb(0,0,0)`) に変更
            if (color === "rgba(0,0,0,0)") {
                color = "rgb(0,0,0)";
            }

            //  `backgroundColor` ではなく `background` を適用
            document.body.style.background = color;
            console.log("server signal reception:", color);
        }
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

    // メッセージを削除
    document.getElementById("fullscreen-message").style.display = "none";
}

//  iPhoneのツールバーを非表示にする処理
function hideIOSBars() {
    setTimeout(() => {
        document.documentElement.style.height = "100vh"; 
        document.body.style.height = "100vh"; 
        window.scrollTo(0, 1); // 1pxスクロールしてツールバーを隠す
    }, 100);
}

//  タップ時にフルスクリーン & iPhoneツールバーを非表示
document.addEventListener("click", () => {
    enterFullscreen();
    hideIOSBars();
});

document.addEventListener("touchend", () => {
    enterFullscreen();
    hideIOSBars();
});
