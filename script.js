// 全局資料儲存變數
let reactTimes = [];
let reactCount = 0;
let reactStartTime = 0;
let reactTimerTimeout = null;
let isReactTesting = false;

let aimScore = 0;
let isAimTesting = false;
let aimTimerInterval = null;

// ==========================================
// 1. 點擊式 5 次反應測試邏輯 (已修改為：每次時間完全隨機)
// ==========================================
const reactBox = document.getElementById('react-box');
const reactStatus = document.getElementById('react-status');

reactBox.onclick = function() {
    if (reactCount >= 5) {
        alert("您已完成 5 次反應測試！可以前往下一步。");
        return;
    }

    if (!isReactTesting) {
        isReactTesting = true;
        reactBox.innerText = "張大眼睛看好，等待方塊變紅...";
        reactBox.className = "test-box ready";

        // 💡 關鍵改動：使用 Math.random() 讓每一輪的等待時間完全隨機
        // 算式：隨機產生 2000ms 到 5500ms (即 2 到 5.5 秒) 之間的隨機延遲，絕無規律
        const randomDelay = Math.floor(Math.random() * 3500) + 2000;
        
        reactTimerTimeout = setTimeout(() => {
            reactBox.innerText = "快點擊！";
            reactBox.className = "test-box click-now";
            reactStartTime = window.performance.now(); // 精準記錄起點毫秒
        }, randomDelay);

    } else {
        if (reactBox.classList.contains('ready')) {
            // 防作弊機制：如果玩家想靠猜時間偷跑，提早點擊會直接沒收並重置
            clearTimeout(reactTimerTimeout);
            alert("太急了！方塊還沒變紅呢。這次不算，下一輪的時間會重新隨機分配！");
            resetReactBoxState();
        } else if (reactBox.classList.contains('click-now')) {
            // 成功在變紅後擊中
            const endTime = window.performance.now();
            const elapsed = Math.round(endTime - reactStartTime);
            reactTimes.push(elapsed);
            reactCount++;
            
            reactStatus.innerText = `進度：${reactCount} / 5 (最後一次：${elapsed}ms)`;
            
            if (reactCount >= 5) {
                reactBox.innerText = "🎉 測試完成！";
                reactBox.className = "test-box wait";
            } else {
                // 💡 每一輪結束後，下一輪點擊會重新進入上面的 !isReactTesting 重新抽取 randomDelay
                resetReactBoxState();
            }
        }
    }
};

function resetReactBoxState() {
    isReactTesting = false;
    reactBox.innerText = "點擊此處繼續下一次隨機測試";
    reactBox.className = "test-box wait";
}


// ==========================================
// 2. 網格瞄準測試邏輯 (滑鼠游標滑過碰到就閃現得分)
// ==========================================
const startAimBtn = document.getElementById('start-aim-btn');
const aimTimerText = document.getElementById('aim-timer');
const aimArea = document.getElementById('aim-area');
const aimTarget = document.getElementById('aim-target');

startAimBtn.onclick = function() {
    if (isAimTesting) return;
    
    isAimTesting = true;
    aimScore = 0;
    let timeLeft = 20; 
    startAimBtn.disabled = true;
    startAimBtn.innerText = "測試進行中...";
    aimTimerText.innerText = `剩餘時間：${timeLeft} 秒 | 目前擊中：${aimScore} 個`;
    aimTarget.style.display = 'block';
    
    moveTargetBall();

    aimTimerInterval = setInterval(() => {
        timeLeft--;
        aimTimerText.innerText = `剩餘時間：${timeLeft} 秒 | 目前擊中：${aimScore} 個`;
        
        if (timeLeft <= 0) {
            clearInterval(aimTimerInterval);
            isAimTesting = false;
            aimTarget.style.display = 'none';
            startAimBtn.disabled = false;
            startAimBtn.innerText = "重新測試瞄準";
            alert(`時間到！您在 20 秒內成功劃過了 ${aimScore} 顆瞄準球！`);
        }
    }, 1000);
};

aimTarget.onmouseenter = function(e) {
    if (!isAimTesting) return;
    e.stopPropagation();
    aimScore++;
    
    let currentSeconds = aimTimerText.innerText.match(/\d+/); 
    let secondsLeft = currentSeconds ? currentSeconds : 20;
    
    aimTimerText.innerText = `剩餘時間：${secondsLeft} 秒 | 目前擊中：${aimScore} 個`;
    moveTargetBall();
};

function moveTargetBall() {
    const maxX = aimArea.clientWidth - 24;
    const maxY = aimArea.clientHeight - 24;
    
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);
    
    aimTarget.style.left = `${randomX}px`;
    aimTarget.style.top = `${randomY}px`;
}


// ==========================================
// 3. 獨立運算版：槍械種類計算與準星形狀生成
// ==========================================
document.getElementById('generateBtn').onclick = function() {
    if (reactTimes.length < 5) {
        alert("請先完成 5 次反應測試再查看結果喔！");
        return;
    }

    const sum = reactTimes.reduce((a, b) => a + b, 0);
    const reactionText = Math.round(sum / reactTimes.length);

    let aimText = "";
    if (aimScore >= 55) { aimText = "神經刀爆頭機器人 (極致精準)"; }
    else if (aimScore >= 35) { aimText = "穩定聯賽控槍大師 (沉穩控槍)"; }
    else { aimText = "穩健型大局觀玩家 (建議靠預瞄補足)"; }

    const weaponType = document.getElementById('weaponType').value;
    const crossStyle = document.getElementById('crossStyle').value;
    const crossColor = document.getElementById('crossColor').value;
    const isSniper = document.getElementById('isSniper').checked;
    
    let userDPI = parseInt(document.getElementById('mouseDPI').value) || 800;
    if (userDPI <= 0) userDPI = 800;

    let baseEDPI = 280; 
    if (weaponType === 'smg') { baseEDPI = 330; } 
    else if (weaponType === 'heavy') { baseEDPI = 250; } 
    else if (weaponType === 'pistol') { baseEDPI = 290; }

    const reactFactor = 220 / reactionText; 
    const aimFactor = aimScore > 0 ? (aimScore / 45) : 0.8;
    let targetEDPI = Math.round(baseEDPI * reactFactor * aimFactor);
    
    if (targetEDPI < 160) targetEDPI = 160;
    if (targetEDPI > 550) targetEDPI = 550;

    const gameSens = targetEDPI / userDPI;

    let sniperSens = (reactionText / 200) * (aimScore > 0 ? (48 / aimScore) : 1) * 0.85;
    if (sniperSens < 0.5) sniperSens = 0.5;
    if (sniperSens > 1.2) sniperSens = 1.2;

    document.getElementById('result-display').style.display = 'block';
    document.getElementById('res-react-avg').innerText = reactionText;
    document.getElementById('res-aim-style').innerText = aimText;
    document.getElementById('res-game-sens').innerText = gameSens.toFixed(3);
    document.getElementById('res-edpi').innerText = targetEDPI;

    if (isSniper) {
        document.getElementById('sniper-sens-wrapper').style.display = 'block';
        document.getElementById('res-sniper').innerText = sniperSens.toFixed(3);
    } else {
        document.getElementById('sniper-sens-wrapper').style.display = 'none';
    }

    let colorSegment = "c;0"; 
    let colorName = "炫綠";

    if (crossColor === 'cyan') { 
        colorSegment = "c;4"; 
        colorName = "冷冽青"; 
    } else if (crossColor === 'red') { 
        colorSegment = "c;8;u;FF0000FF"; 
        colorName = "經典紅"; 
    } else if (crossColor === 'yellow') { 
        colorSegment = "c;2"; 
        colorName = "亮眼黃"; 
    } else if (crossColor === 'white') { 
        colorSegment = "c;8;u;FFFFFFFF"; 
        colorName = "純淨白"; 
    } else if (crossColor === 'pink') { 
        colorSegment = "c;8;u;FFC0CBFF"; 
        colorName = "戀愛粉"; 
    }

    let crosshairCode = ""; 
    let crossNameText = ""; 
    let crossDescText = "";

    if (crossStyle === 'dotCross') {
        crossNameText = `客製【${colorName}】極簡核心點`;
        crossDescText = `完全不擋視野，將視覺焦點最大化凝聚於中心。首發爆頭率與點射的極致選擇。`;
        crosshairCode = `0;P;${colorSegment};h;0;d;1;z;4;0b;0;1b;0`;
    } else if (crossStyle === 'boxCross') {
        crossNameText = `客製【${colorName}】大師精準小方塊`;
        crossDescText = `中空緊湊結構，遠距離能死死把敵人的頭部框在核心中央，頂級鎖頭觀感。`;
        crosshairCode = `0;P;${colorSegment};h;0;0b;0;1t;2;1l;1;1o;0;1a;1;1m;0;1f;0`;
    } else if (crossStyle === 'bigCross') {
        crossNameText = `客製【${colorName}】全能防震大十字`;
        crossDescText = `長延伸線設計，大幅輔助橫向拉槍軌跡，極度適合需要連續壓槍與視覺焦點穩定的玩家。`;
        crosshairCode = `0;P;${colorSegment};h;0;b;0;0l;6;0v;6;0g;1;0o;3;0a;1;0e;0.2;1b;0`;
    } else if (crossStyle === 'circleCross') {
        crossNameText = `客製【${colorName}】鎖頭散彈轟炸圈`;
        crossDescText = `圓心輔助框架，能直接對應近戰或非步槍武器的子彈彈丸擴散範圍，極具壓迫感。`;
        crosshairCode = `0;P;${colorSegment};h;0;0l;2;0o;8;0a;1;0f;0;1t;3;1l;2;1o;5;1a;0.5;1m;0;1f;0`;
    } else {
        crossNameText = `客製【${colorName}】職業萬用十字架`;
        crossDescText = `聯賽最經典的 1-4-2-2 規格，各路頂尖職業選手最常用的點射與潑水全能焦點平衡。`;
        crosshairCode = `0;P;${colorSegment};h;0;0l;4;0o;2;0a;1;0f;0;1b;0`;
    }

    document.getElementById('cross-name').innerText = crossNameText;
    document.getElementById('cross-desc').innerText = crossDescText;
    document.getElementById('crossCode').value = crosshairCode;

    document.getElementById('copyBtn').onclick = function() {
        const codeInput = document.getElementById('crossCode');
        if (!codeInput.value) return;
        codeInput.select();
        navigator.clipboard.writeText(codeInput.value);
        alert("專屬客製準星代碼已成功複製！快去特戰英豪遊戲內直接匯入吧！");
    };
};
