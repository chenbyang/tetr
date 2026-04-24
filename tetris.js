const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-piece-canvas');
const nextCtx = nextCanvas.getContext('2d');

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30; // 每個方塊30px

// 計算畫布實際大小以確認置中
const NEXT_BLOCK_SIZE = 30;

// 定義霓虹顏色
const COLORS = [
    null,
    '#00ffff', // I - Cyan
    '#0000ff', // J - Blue
    '#ff8800', // L - Orange
    '#ffff00', // O - Yellow
    '#00ff00', // S - Green
    '#ff00ff', // T - Purple
    '#ff0000'  // Z - Red
];

// 定義方塊形狀
const PIECES = [
    [],
    // I
    [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
    // J
    [[2,0,0], [2,2,2], [0,0,0]],
    // L
    [[0,0,3], [3,3,3], [0,0,0]],
    // O
    [[4,4], [4,4]],
    // S
    [[0,5,5], [5,5,0], [0,0,0]],
    // T
    [[0,6,0], [6,6,6], [0,0,0]],
    // Z
    [[7,7,0], [0,7,7], [0,0,0]]
];

let board = [];
let score = 0;
let level = 1;
let lines = 0;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let gameStarted = false;
let gameOver = false;
let animationId;

// 目前方塊
const player = {
    pos: {x: 0, y: 0},
    matrix: null,
};

// 下一個方塊
let nextPiece = null;

// 初始化盤面
function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

// 建立隨機方塊
function createPiece() {
    const typeId = Math.floor(Math.random() * 7) + 1;
    return PIECES[typeId];
}

// 繪製單個方塊
function drawBlock(ctx, x, y, size, colorId, isGhost = false) {
    const color = COLORS[colorId];
    
    ctx.fillStyle = isGhost ? color + '40' : color; // Ghost piece 用半透明
    ctx.fillRect(x * size, y * size, size, size);
    
    if (!isGhost) {
        // 增加發光與立體感
        ctx.strokeStyle = '#ffffff80';
        ctx.lineWidth = 1;
        ctx.strokeRect(x * size, y * size, size, size);
        
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
    } else {
        ctx.shadowBlur = 0;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x * size, y * size, size, size);
    }
}

// 繪製矩陣
function drawMatrix(matrix, offset, targetCtx, size) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                drawBlock(targetCtx, x + offset.x, y + offset.y, size, value);
            }
        });
    });
}

// 取得 Ghost Piece (落下預測位置)
function getGhostPos() {
    const ghost = {
        matrix: player.matrix,
        pos: { x: player.pos.x, y: player.pos.y }
    };
    while (!collide(board, ghost)) {
        ghost.pos.y++;
    }
    ghost.pos.y--; // 退回最後一個安全位置
    return ghost;
}

// 主繪製函數
function draw() {
    // 清空背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.shadowBlur = 0;

    // 繪製已固定的盤面
    drawMatrix(board, {x: 0, y: 0}, ctx, BLOCK_SIZE);
    
    if (player.matrix) {
        // 繪製 Ghost Piece
        const ghost = getGhostPos();
        ghost.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    drawBlock(ctx, x + ghost.pos.x, y + ghost.pos.y, BLOCK_SIZE, value, true);
                }
            });
        });

        // 繪製玩家當前方塊
        drawMatrix(player.matrix, player.pos, ctx, BLOCK_SIZE);
    }
}

// 繪製下一個方塊預覽
function drawNext() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    nextCtx.shadowBlur = 0;
    
    if (nextPiece) {
        // 簡單計算使其置中
        const offset = {
            x: (4 - nextPiece[0].length) / 2 + 0.5,
            y: (4 - nextPiece.length) / 2 + 0.5
        };
        drawMatrix(nextPiece, offset, nextCtx, NEXT_BLOCK_SIZE);
    }
}

// 合併方塊到盤面
function merge(board, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                board[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

// 碰撞偵測
function collide(board, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (board[y + o.y] && board[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

// 重置方塊
function playerReset() {
    if (!nextPiece) {
        nextPiece = createPiece();
    }
    player.matrix = nextPiece;
    nextPiece = createPiece();
    drawNext();
    
    player.pos.y = 0;
    player.pos.x = Math.floor(COLS / 2) - Math.floor(player.matrix[0].length / 2);

    if (collide(board, player)) {
        gameOver = true;
        SoundPlayer.gameOver();
        document.getElementById('game-over-screen').classList.remove('hidden');
        document.getElementById('final-score').innerText = score;
    }
}

// 方塊落下
function playerDrop() {
    player.pos.y++;
    if (collide(board, player)) {
        player.pos.y--;
        merge(board, player);
        playerReset();
        arenaSweep();
        SoundPlayer.drop();
    }
    dropCounter = 0;
}

// Hard Drop
function playerHardDrop() {
    while (!collide(board, player)) {
        player.pos.y++;
    }
    player.pos.y--;
    merge(board, player);
    playerReset();
    arenaSweep();
    SoundPlayer.hardDrop();
    dropCounter = 0;
}

// 左右移動
function playerMove(dir) {
    player.pos.x += dir;
    if (collide(board, player)) {
        player.pos.x -= dir;
    } else {
        SoundPlayer.move();
    }
}

// 旋轉矩陣
function rotate(matrix, dir) {
    // 轉置
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    // 反轉
    if (dir > 0) { // 順時針
        matrix.forEach(row => row.reverse());
    } else { // 逆時針
        matrix.reverse();
    }
}

// 玩家旋轉與防撞牆判斷 (Wall Kick)
function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    
    while (collide(board, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir); // 轉不過去就轉回來
            player.pos.x = pos;
            return;
        }
    }
    SoundPlayer.rotate();
}

// 消除行數
function arenaSweep() {
    let rowCount = 0;
    outer: for (let y = board.length - 1; y >= 0; --y) {
        for (let x = 0; x < board[y].length; ++x) {
            if (board[y][x] === 0) {
                continue outer;
            }
        }

        const row = board.splice(y, 1)[0].fill(0);
        board.unshift(row);
        ++y;
        rowCount++;
    }

    if (rowCount > 0) {
        SoundPlayer.clear();
        lines += rowCount;
        
        // 計分：1行=10, 2行=30, 3行=50, 4行=80，再乘以 level
        const lineScores = [0, 10, 30, 50, 80];
        score += lineScores[rowCount] * level;
        
        // 每消除 10 行升級
        level = Math.floor(lines / 10) + 1;
        dropInterval = Math.max(100, 1000 - (level - 1) * 100);
        
        updateScore();
    }
}

// 更新UI
function updateScore() {
    document.getElementById('score').innerText = score;
    document.getElementById('level').innerText = level;
    document.getElementById('lines').innerText = lines;
}

// 遊戲主迴圈
function update(time = 0) {
    if (gameOver) return;

    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    animationId = requestAnimationFrame(update);
}

// 重新開始遊戲
function resetGame() {
    board = createMatrix(COLS, ROWS);
    score = 0;
    level = 1;
    lines = 0;
    dropInterval = 1000;
    gameOver = false;
    updateScore();
    document.getElementById('game-over-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.add('hidden');
    playerReset();
    gameStarted = true;
    lastTime = performance.now();
    cancelAnimationFrame(animationId);
    update();
}

// 鍵盤監聽
document.addEventListener('keydown', event => {
    // 如果遊戲還沒開始，按空白鍵開始
    if (!gameStarted && event.code === 'Space') {
        initAudio(); // 初始化音訊
        resetGame();
        return;
    }
    
    // 遊戲結束時防止操作
    if (gameOver) return;

    switch(event.code) {
        case 'ArrowLeft':
            playerMove(-1);
            break;
        case 'ArrowRight':
            playerMove(1);
            break;
        case 'ArrowDown':
            playerDrop();
            break;
        case 'ArrowUp':
            playerRotate(1); // 順時針
            break;
        case 'KeyZ':
            playerRotate(-1); // 逆時針
            break;
        case 'Space':
            playerHardDrop();
            break;
    }
});

// 重開按鈕
document.getElementById('restart-btn').addEventListener('click', resetGame);

// 初始畫布繪製
ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
ctx.fillRect(0, 0, canvas.width, canvas.height);
