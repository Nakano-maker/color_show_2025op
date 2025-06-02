document.addEventListener("DOMContentLoaded", () => {
    const socket = new WebSocket("wss://color-show-2025op.onrender.com"); // WebSocket 接続
    let socketReady = false;

    //  UI要素の取得
    const pgmBox = document.querySelector(".pgm");
    const pvwBox = document.querySelector(".pvw");
    const flashButton = document.getElementById("flashButton");
    const cutButton = document.getElementById("cutButton");
    const autoButton = document.getElementById("autoButton");
    const fadeTimeDisplay = document.getElementById("fadeTimeDisplay");
    const masterDimmer = document.getElementById("masterDimmer");
    const increaseFade = document.getElementById("increaseFade");
    const decreaseFade = document.getElementById("decreaseFade");
    const increaseBPM = document.getElementById("increaseBPM");
    const decreaseBPM = document.getElementById("decreaseBPM");
    const bpmDisplay = document.getElementById("bpmDisplay");

    let fadeTime = 1.0; // フェード時間（秒）
    let bpm = 120; //  BPM 初期値
    let pgmColor = "rgb(0,0,0)"; //  PGM 初期色（黒）
    let pvwColor = "rgb(0,0,0)"; //  PVW 初期色（黒）
    let pgmcoloroutput = pgmColor; //  サーバー送信用の最終色
    let flashEnabled = false;

    //  WebSocket 接続確立
    socket.onopen = () => {
        console.log(" WebSocket 接続確立");
        socketReady = true;
    };

    

    //  カラーピッカーの処理（PVW のみ変更）
    document.getElementById("colorPicker").addEventListener("input", (event) => {
        pvwColor = event.target.value;
        pvwBox.style.backgroundColor = pvwColor;
    });

    //  カラープリセットの処理（PVW のみ変更）
    const presetContainer = document.getElementById("presetContainer");
    const presetColors = [
        "rgb(255,0,0)", "rgb(0,255,0)", "rgb(0,0,255)", "rgb(255,255,0)",
        "rgb(128,0,128)", "rgb(0,255,255)", "rgb(255,165,0)", "rgb(255,192,203)",
        "rgb(255,255,255)", "rgb(0,0,0)"
    ];

    presetColors.forEach(color => {
        let button = document.createElement("button");
        button.className = "preset";
        button.style.backgroundColor = color;
        button.setAttribute("data-color", color);
        button.addEventListener("click", () => {
            pvwColor = color;
            pvwBox.style.backgroundColor = pvwColor;
        });
        presetContainer.appendChild(button);
    });

    //  CUT の処理（瞬時に PVW ↔ PGM）
    cutButton.addEventListener("click", () => {
        pgmBox.style.transition = "none";
        pvwBox.style.transition = "none";

        pgmColor = pvwColor;
        pvwColor = pgmBox.style.backgroundColor;

        pgmBox.style.backgroundColor = pgmColor;
        pvwBox.style.backgroundColor = pvwColor;

        pgmcoloroutput = pgmColor;
    });

    //  AUTO の処理（フェードで PVW ↔ PGM）
    autoButton.addEventListener("click", () => {
        pgmBox.style.transition = `background-color ${fadeTime}s ease-in-out`;
        pvwBox.style.transition = `background-color ${fadeTime}s ease-in-out`;

        pgmColor = pvwColor;
        pvwColor = pgmBox.style.backgroundColor;

        pgmBox.style.backgroundColor = pgmColor;
        pvwBox.style.backgroundColor = pvwColor;

        let fadeInterval = setInterval(() => {
            pgmcoloroutput = pgmBox.style.backgroundColor;
        }, 30);

        setTimeout(() => {
            clearInterval(fadeInterval);
            pgmcoloroutput = pgmColor;
        }, fadeTime * 1000);
    });

    //  FLASH の処理（PGM を黒と交互に点滅）
        flashButton.addEventListener("click", () => {
            flashEnabled = !flashEnabled;
            flashButton.style.backgroundColor = flashEnabled ? "blue" : "";

            const lockButtons = [cutButton, autoButton, increaseFade, decreaseFade, masterDimmer];
            lockButtons.forEach(button => {
                button.style.backgroundColor = flashEnabled ? "red" : "";
                button.disabled = flashEnabled;
            });

            if (flashEnabled) {
                console.log("FLASH ON: ");

                //  フェードの影響を完全に削除
                pgmBox.style.transition = "none";

                let isPGM = false;
                flashInterval = setInterval(() => {
                    pgmcoloroutput = isPGM ? pgmColor : "rgb(0,0,0)"; //  はっきりした切り替え
                    pgmBox.style.backgroundColor = pgmcoloroutput;
                    isPGM = !isPGM;
                }, Math.max(20, Math.round(60000 / bpm))); //  BPM に基づいた正確な間隔

            } else {
                console.log("FLASH OFF: ");

                clearInterval(flashInterval); //  インターバルの影響を完全に排除
                pgmBox.style.transition = `background-color ${fadeTime}s ease-in-out`; //  フェードを復元
                pgmcoloroutput = pgmColor; //  PGMカラーを確実に復元
                pgmBox.style.backgroundColor = pgmcoloroutput;
                

                lockButtons.forEach(button => {
                    button.style.backgroundColor = "";
                    button.disabled = false;
                });
            }
        });

    masterDimmer.addEventListener("input", () => {
        let dimmerFactor = masterDimmer.value; //  0.0 ～ 1.0 の値
        let [r, g, b] = pgmColor.match(/\d+/g).map(Number); //  RGB を抽出
        
        // 値が 0 に近いほど黒に寄る
        pgmcoloroutput = `rgb(${Math.round(r * dimmerFactor)}, ${Math.round(g * dimmerFactor)}, ${Math.round(b * dimmerFactor)})`;

        pgmBox.style.backgroundColor = pgmcoloroutput; //  UI に反映
    });

    //  BPM 増減処理

        let bpmInterval, bpmTimeout; //  長押し & 待機処理用

        function updateBPMDisplay() {
            bpmDisplay.textContent = `${Math.round(bpm)} BPM`; //  小数点なしで表示
        }

        function handleBPMChange(button, change, fastChange) {
            button.style.backgroundColor = "rgba(255,255,255,0.5)"; //  押している間は色を薄く
            bpm += change;
            updateBPMDisplay();

            bpmTimeout = setTimeout(() => { //  0.2秒後に高速増加開始
                bpmInterval = setInterval(() => {
                    bpm += fastChange;
                    updateBPMDisplay();
                }, 100);
            }, 200);
        }

        function stopBPMChange(button) {
            clearTimeout(bpmTimeout); //  長押し待機処理のキャンセル
            clearInterval(bpmInterval); //  高速増加のキャンセル
            button.style.backgroundColor = ""; //  色を元に戻す
        }

        //  `increaseBPM` の処理
        increaseBPM.addEventListener("mousedown", () => handleBPMChange(increaseBPM, 1, 15));
        increaseBPM.addEventListener("mouseup", () => stopBPMChange(increaseBPM));

        //  `decreaseBPM` の処理
        decreaseBPM.addEventListener("mousedown", () => handleBPMChange(decreaseBPM, -1, -15));
        decreaseBPM.addEventListener("mouseup", () => stopBPMChange(decreaseBPM));   
    
        //  increaseFade の処理

        let fadeInterval; //

        function adjustFadeTime(change) {
            fadeTime = Math.max(0.1, fadeTime + change); //  フェード時間を更新
            fadeTimeDisplay.textContent = `${fadeTime.toFixed(1)}s`; // ✅ 表示を更新
        }

        //  increaseFade の処理
        increaseFade.addEventListener("mousedown", () => {
            if (flashEnabled) return; //  FLASH ON の場合は操作不可
            increaseFade.style.backgroundColor = "rgba(255,255,255,0.5)"; //  押している間は色を薄く
            
            adjustFadeTime(0.1); //  初回適用
            fadeInterval = setInterval(() => adjustFadeTime(0.1), 100);
        });

        increaseFade.addEventListener("mouseup", () => {
            clearInterval(fadeInterval);
            increaseFade.style.backgroundColor = ""; //  色を元に戻す
        });

        // decreaseFade の処理
        decreaseFade.addEventListener("mousedown", () => {
            if (flashEnabled) return; //  FLASH ON の場合は操作不可
            decreaseFade.style.backgroundColor = "rgba(255,255,255,0.5)"; // 押している間は色を薄く
            
            adjustFadeTime(-0.1); // 初回適用
            fadeInterval = setInterval(() => adjustFadeTime(-0.1), 100);
        });

        decreaseFade.addEventListener("mouseup", () => {
            clearInterval(fadeInterval);
            decreaseFade.style.backgroundColor = ""; //  色を元に戻す
        });

//  0.2ms ごとに最新の `pgmColor` を送信
pgmBox.style.backgroundColor = "rgb(0,0,0)";

setInterval(() => {
    if (socketReady && socket.readyState === WebSocket.OPEN) {
        pgmcoloroutput = getComputedStyle(pgmBox).backgroundColor; //  毎回更新
        socket.send(JSON.stringify({ pgmColor: pgmcoloroutput })); //  必ず送信
        
    }
}, 0.2);
});

document.addEventListener("DOMContentLoaded", () => {
    const pgmBox = document.querySelector(".pgm");
    const logList = document.getElementById("logList"); //  ログ表示リスト

    //  0.2s ごとに PGM の色を取得してログに追加（先頭に追加）
    setInterval(() => {
        if (pgmBox) {
            const currentColor = getComputedStyle(pgmBox).backgroundColor;

            //  ログアイテムを作成（テキスト色を緑に）
            const logItem = document.createElement("li");
            logItem.textContent = `PGM Color: ${currentColor}`;
            logItem.style.color = "green"; //  テキスト色を緑に変更

            //  先頭に追加
            logList.prepend(logItem);

            //  ログが 150 件を超えたら最も古いものを削除
            if (logList.children.length > 150) {
                logList.removeChild(logList.lastChild);
            }

            console.log(" PGM Color 更新:", currentColor);
        }
    }, 200);
});


const pingURL = "https://color-show-2025op.onrender.com/"; // Ping を送信する URL
const logList = document.getElementById("logList");

function sendPing() {
    const startTime = Date.now();

    fetch(pingURL, { method: "GET", mode: "no-cors" }) //  サーバーへ Ping を送信
        .then(() => {
            const responseTime = Date.now() - startTime;
            let statusText = `server Ping ${responseTime}ms - true`;
            let color = "blue" ;

            if (responseTime > 4000) { //  4 秒以上なら caution
                statusText = `server Ping ${responseTime}ms - caution`;
                color = "yellow";
            }

            addLog(statusText, color);
        })
        .catch(() => {
            addLog("server Ping - false", "red"); //  到達しなかったら false (赤)
        });
}

//  ログをリストの先頭に追加し、150 件以上なら削除
function addLog(text, color) {
    const logItem = document.createElement("li");
    logItem.textContent = text;
    logItem.style.color = color;
    logList.prepend(logItem);

    if (logList.children.length > 150) {
        logList.removeChild(logList.lastChild);
    }
}

//  5 秒おきに Ping を送信
setInterval(sendPing, 5000);

const cutButton = document.getElementById("cutButton");
const autoButton = document.getElementById("autoButton");

function addLog(text, color) {
    const logItem = document.createElement("li");
    logItem.textContent = text;
    logItem.style.color = color;
    logList.prepend(logItem);

    if (logList.children.length > 150) {
        logList.removeChild(logList.lastChild);
    }
}

// CUT ボタンのログ (オレンジ)
cutButton.addEventListener("click", () => {
    addLog(" Cut Collect", "white");
});

//  AUTO ボタンのログ (オレンジ)
autoButton.addEventListener("click", () => {
    addLog(" Auto Collect", "white");
});


const masterDimmer = document.getElementById("masterDimmer");

masterDimmer.addEventListener("input", () => {
    const dimmerValue = Math.round(masterDimmer.value * 100); //  0～1 の値を 0%～100% に変換
    addLog(` Master Dimmer: ${dimmerValue}%`, "orange"); //  ログに記録
});



const flashButton = document.getElementById("flashButton");

flashButton.addEventListener("click", () => {
    addLog(" <<Flash PUT>>", "orange"); //  FLASH 操作をオレンジ色でログに記録
});
