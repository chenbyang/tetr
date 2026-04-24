# 俄羅斯方塊 (Tetris) 遊戲實作計畫

本計畫旨在開發一款基於純 HTML、CSS 與 JavaScript 的現代化俄羅斯方塊網頁遊戲，具備流暢的控制、炫麗的視覺效果以及動態合成音效。

## User Review Required

> [!IMPORTANT]
> **音效實作方式確認**
> 為了實現「純 HTML」且不需要您額外下載、準備外部 MP3/WAV 音效檔案，我計畫使用瀏覽器內建的 **Web Audio API** 來動態合成 8-bit 復古風格的音效（例如：移動聲、旋轉聲、消行聲、下落聲、遊戲結束聲）。請問這個做法是否符合您的期待？

> [!TIP]
> **按鍵控制配置確認**
> 目前規劃的控制方式如下，請確認是否符合您的使用習慣：
> - **左/右方向鍵**：左右移動
> - **下方向鍵**：加速下落 (Soft Drop)
> - **空白鍵 (Space)**：直接下落到底 (Hard Drop)
> - **上方向鍵**：向右（順時針）旋轉
> - **Z 鍵**：向左（逆時針）旋轉

## Open Questions

- 針對視覺設計，我會採用深色背景搭配霓虹發光（Neon Glow）效果的現代感設計，這樣是否符合您想要的質感？

## 擬定變更與檔案結構

我們將在您的專案目錄 (`c:\Users\administrtor\Desktop\tetrio`) 中建立四個主要檔案，將結構、樣式、遊戲邏輯與音效邏輯分離，以保持程式碼乾淨且易於維護。

### 專案檔案 (Project Files)

#### [NEW] [index.html](file:///c:/Users/administrtor/Desktop/tetrio/index.html)
- 定義遊戲畫面的 HTML 結構，包含主遊戲畫布 (Canvas)、右側資訊面板（顯示分數、等級、消除行數）以及「下一個方塊」的預覽畫布。
- 引入 Google Fonts（例如 Inter 或 Roboto）來提升質感。

#### [NEW] [style.css](file:///c:/Users/administrtor/Desktop/tetrio/style.css)
- 實作深色主題（Dark Mode）與玻璃擬物化（Glassmorphism）的現代設計風格。
- 設定方塊的鮮豔色彩與發光效果（Neon colors）。
- 確保畫面在瀏覽器中置中且視覺平衡。

#### [NEW] [audio.js](file:///c:/Users/administrtor/Desktop/tetrio/audio.js)
- 使用 Web Audio API 實作一個簡單的音效合成器 (Synthesizer)。
- 封裝播放各種音效的函式（如 `playMoveSound()`, `playRotateSound()`, `playDropSound()`, `playClearSound()`, `playGameOverSound()`）。

#### [NEW] [tetris.js](file:///c:/Users/administrtor/Desktop/tetrio/tetris.js)
- 遊戲核心邏輯：
  - 定義 7 種經典的 Tetromino 方塊形狀與顏色。
  - 管理遊戲盤面（10x20 網格）的狀態。
  - 實作碰撞檢測（邊界、已固定的方塊）。
  - 處理滿行消除與計分邏輯。
  - 透過 `requestAnimationFrame` 實現順暢的遊戲迴圈（Game Loop）。
  - 監聽鍵盤事件並連接到對應的操作與音效。

## 驗證計畫 (Verification Plan)

### 本地測試
- 開啟 `index.html` 後，檢查 UI 是否正確渲染並帶有現代設計感。
- 測試方塊是否會自動下落，並能在底部或碰到其他方塊時固定。
- 測試所有按鍵綁定（左、右、下、空白鍵、上、Z）是否正常運作，特別是左右旋轉。
- 確認「預覽方塊」區域能正確顯示下一個即將出現的形狀。
- 確認在進行操作或消除行數時，會發出合成的音效。
- 測試滿一行時是否會正確消除並增加分數。
- 確保方塊堆疊到頂部時，會正確觸發 Game Over 狀態。
