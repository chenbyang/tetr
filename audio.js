// 簡易的 Web Audio API 聲音合成器
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;
let soundEnabled = true;

// 初始化音訊內容 (需要在使用者的第一次互動後調用)
function initAudio() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playTone(freq, type, duration, vol) {
    if (!soundEnabled || !audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

const SoundPlayer = {
    move: () => {
        playTone(300, 'square', 0.1, 0.05);
    },
    rotate: () => {
        playTone(400, 'square', 0.1, 0.05);
    },
    drop: () => {
        playTone(150, 'square', 0.1, 0.05);
    },
    hardDrop: () => {
        playTone(100, 'square', 0.15, 0.1);
    },
    clear: () => {
        if (!soundEnabled || !audioCtx) return;
        // 播放一段輕快的阿佩吉歐 (Arpeggio)
        const notes = [400, 500, 600, 800];
        notes.forEach((freq, i) => {
            setTimeout(() => playTone(freq, 'sine', 0.2, 0.1), i * 50);
        });
    },
    gameOver: () => {
        if (!soundEnabled || !audioCtx) return;
        // 播放低沉的下降音效
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 1);
        
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 1);
    }
};

// 綁定音效開關按鈕
document.addEventListener('DOMContentLoaded', () => {
    const soundBtn = document.getElementById('sound-toggle-btn');
    soundBtn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundBtn.textContent = soundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
        if (soundEnabled) initAudio();
    });
});
